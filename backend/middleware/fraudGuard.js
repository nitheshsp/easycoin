/**
 * EasyCoin Senior Fraud Guard & Double-Tap Idempotency Engine
 * Specially designed for seniors to prevent accidental double taps,
 * rapid account drainage, and maintain an RBI-compliant audit trail.
 */
const db = require('../config/database');

class FraudGuard {
  constructor() {
    // Map to store recent requests for double-tap deduplication: key -> { timestamp, responseData, inFlightPromise }
    this.recentRequests = new Map();
    // Map to store user transfer timestamps for velocity checks: userId -> [timestamp1, timestamp2, ...]
    this.userTransferHistory = new Map();
    
    // Idempotency window: 5 seconds (5000 ms)
    this.DEDUP_WINDOW_MS = 5000;
    // Velocity window: 5 minutes (300,000 ms)
    this.VELOCITY_WINDOW_MS = 5 * 60 * 1000;
    // Max transfers per velocity window
    this.MAX_TRANSFERS_PER_WINDOW = 3;

    // Periodic cleanup of stale in-memory entries every 60 seconds
    setInterval(() => this.cleanupStaleEntries(), 60000);
  }

  cleanupStaleEntries() {
    const now = Date.now();
    for (const [key, item] of this.recentRequests.entries()) {
      if (now - item.timestamp > this.DEDUP_WINDOW_MS * 2) {
        this.recentRequests.delete(key);
      }
    }
    for (const [userId, timestamps] of this.userTransferHistory.entries()) {
      const active = timestamps.filter(t => now - t < this.VELOCITY_WINDOW_MS);
      if (active.length === 0) {
        this.userTransferHistory.delete(userId);
      } else {
        this.userTransferHistory.set(userId, active);
      }
    }
  }

  // Middleware interceptor for POST /api/payments/transfer
  middleware() {
    return async (req, res, next) => {
      const userId = req.body.userId || 'usr_senior_01';
      const recipientName = (req.body.recipientName || '').trim().toLowerCase();
      const amount = parseInt(req.body.amount, 10) || 0;
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

      if (!recipientName || !amount) {
        return next();
      }

      const now = Date.now();
      const idempotencyKey = `${userId}:${recipientName}:${amount}`;

      // 1. Check for Accidental Double-Tap (within 5 seconds)
      if (this.recentRequests.has(idempotencyKey)) {
        const cached = this.recentRequests.get(idempotencyKey);
        if (now - cached.timestamp < this.DEDUP_WINDOW_MS) {
          db.addAuditLog('FRAUD_GUARD_DOUBLE_TAP_PREVENTED', {
            userId,
            recipientName,
            amount,
            reason: 'Duplicate payment request within 5s window'
          }, clientIp, userId);

          // If the original request has already finished, return the cached output
          if (cached.responseData) {
            return res.status(200).json({
              ...cached.responseData,
              deduplicated: true,
              message: 'Deduplicated: Duplicate payment prevented by Senior Fraud Guard.'
            });
          }

          // If still processing, wait for completion
          if (cached.inFlightPromise) {
            try {
              const result = await cached.inFlightPromise;
              return res.status(200).json({
                ...result,
                deduplicated: true,
                message: 'Deduplicated: Duplicate payment prevented by Senior Fraud Guard.'
              });
            } catch (err) {
              return res.status(500).json({ success: false, message: 'Transfer failed' });
            }
          }
        }
      }

      // 2. Velocity Check (> 3 transfers in 5 minutes)
      const userHistory = this.userTransferHistory.get(userId) || [];
      const recentTransfers = userHistory.filter(t => now - t < this.VELOCITY_WINDOW_MS);

      if (recentTransfers.length >= this.MAX_TRANSFERS_PER_WINDOW) {
        db.addAuditLog('FRAUD_GUARD_HIGH_VELOCITY_TRIGGERED', {
          userId,
          transfersInWindow: recentTransfers.length,
          attemptedAmount: amount,
          recipientName
        }, clientIp, userId);

        return res.status(429).json({
          success: false,
          securityAlert: true,
          message: 'Senior Fraud Guard Alert: You have initiated multiple transfers in the last few minutes. As a safety precaution against fraud, please pause or ask your guardian for verification.',
          transfersInWindow: recentTransfers.length,
          cooldownSeconds: Math.ceil((this.VELOCITY_WINDOW_MS - (now - recentTransfers[0])) / 1000)
        });
      }

      // 3. Register in-flight tracking
      let resolveInFlight;
      const inFlightPromise = new Promise((resolve) => {
        resolveInFlight = resolve;
      });

      this.recentRequests.set(idempotencyKey, {
        timestamp: now,
        responseData: null,
        inFlightPromise
      });

      // Hook response.json to capture output and record successful transfer in velocity history
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300 && body && body.success) {
          // Record successful transfer in velocity history
          const activeHistory = this.userTransferHistory.get(userId) || [];
          activeHistory.push(Date.now());
          this.userTransferHistory.set(userId, activeHistory);

          // Update cached response for duplicate prevention
          const entry = this.recentRequests.get(idempotencyKey);
          if (entry) {
            entry.responseData = body;
          }

          // Audit log payment success
          db.addAuditLog('PAYMENT_TRANSFER_COMPLETED', {
            userId,
            recipientName,
            amount,
            status: body.data && body.data.transaction ? body.data.transaction.status : 'SUCCESS',
            txId: body.data && body.data.transaction ? body.data.transaction.id : null
          }, clientIp, userId);
        }

        if (resolveInFlight) {
          resolveInFlight(body);
        }

        return originalJson(body);
      };

      next();
    };
  }

  // Clear tracking (useful for unit tests)
  reset() {
    this.recentRequests.clear();
    this.userTransferHistory.clear();
  }
}

module.exports = new FraudGuard();
