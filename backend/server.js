/**
 * EasyCoin Central API Gateway & Server
 * Combines all 4 backend modules developed by your team.
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT } = require('./config/constants');

// Import Module Routes
const authRoutes = require('./routes/auth.routes');
const accountRoutes = require('./routes/account.routes');
const paymentRoutes = require('./routes/payment.routes');
const guardianRoutes = require('./routes/guardian.routes');
const circleRoutes = require('./routes/circle.routes');

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..')));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'EasyCoin Accessible Banking Backend Gateway',
    version: '2.0.0',
    modules: {
      auth: 'Module 1: Biometric & Voice OTP Auth',
      account: 'Module 2: Accounts, Passbook & Certified Statements',
      payments: 'Module 3: Payments, Voice NLP, Offline Sync & Bills',
      guardian: 'Module 4: Guardian Shield, SOS Siren & Audit Trail',
      circle: 'Module 5: UPI Circle Minor Delegation',
      stream: 'Module 6: Server-Sent Events (SSE) Real-Time Push'
    },
    timestamp: new Date().toISOString()
  });
});

// Interactive API Explorer & Documentation
app.get(['/api/docs', '/api'], (req, res) => {
  const apiCatalog = {
    title: 'EasyCoin Senior-Priority Banking API Gateway',
    version: '2.0.0',
    documentation: 'Complete RBI & NPCI Compliant Senior Accessible Banking Suite',
    endpoints: {
      'Module 1: Authentication & Biometrics': [
        { method: 'POST', path: '/api/auth/voice-otp', desc: 'Generate spoken Voice OTP for seniors' },
        { method: 'POST', path: '/api/auth/verify-otp', desc: 'Verify 4-digit Voice OTP' },
        { method: 'POST', path: '/api/auth/biometric-login', desc: 'Authenticate via WebAuthn / Touch ID' },
        { method: 'POST', path: '/api/auth/symbol-login', desc: 'Authenticate using 3 Secret Pictures' },
        { method: 'POST', path: '/api/auth/register', desc: 'Register new Senior user with Guardian in SQLite' },
        { method: 'GET', path: '/api/auth/me', desc: 'Fetch authenticated user profile' }
      ],
      'Module 2: Accounts, Passbook & Statements': [
        { method: 'GET', path: '/api/account/stream', desc: 'Real-Time SSE Stream for Senior App' },
        { method: 'GET', path: '/api/account/balance', desc: 'Fetch current balance & spoken text' },
        { method: 'GET', path: '/api/account/coins', desc: 'Concrete gold/silver/copper coin breakdown' },
        { method: 'GET', path: '/api/account/passbook', desc: 'Full itemized ledger (?category, ?search, ?limit)' },
        { method: 'POST', path: '/api/account/deposit', desc: 'Pension credit / Bank recharge top-up' },
        { method: 'GET', path: '/api/account/statement', desc: 'Certified Statement with running balance & SHA-256 seal' },
        { method: 'GET', path: '/api/account/contacts', desc: 'Pre-registered family & merchant contacts' }
      ],
      'Module 3: Payments & Voice Engine': [
        { method: 'POST', path: '/api/payments/transfer', desc: '1-Tap transfer with Fraud Guard & Idempotency' },
        { method: 'POST', path: '/api/payments/voice-pay', desc: 'Multi-lingual NLP parser (Hindi, Tamil, English)' },
        { method: 'POST', path: '/api/payments/sync-offline', desc: 'Atomic batch sync for offline store queues' },
        { method: 'POST', path: '/api/payments/qr-scan', desc: 'Decode merchant QR payload & speech' },
        { method: 'GET', path: '/api/payments/bills', desc: 'List active and recurring bills' },
        { method: 'POST', path: '/api/payments/bills', desc: 'Add new utility or medical bill' },
        { method: 'POST', path: '/api/payments/bills/:id/pay', desc: 'Pay bill by ID with automatic receipt' },
        { method: 'DELETE', path: '/api/payments/bills/:id', desc: 'Remove bill' }
      ],
      'Module 4: Guardian Shield & Safety': [
        { method: 'GET', path: '/api/guardian/stream', desc: 'Real-Time SSE Stream for Guardian Portal' },
        { method: 'GET', path: '/api/guardian/status', desc: 'Account lock status & pending pings' },
        { method: 'GET', path: '/api/guardian/audit-logs', desc: 'RBI-compliant tamper-evident audit trail' },
        { method: 'PATCH', path: '/api/guardian/settings', desc: 'Customize approval limit & emergency contact' },
        { method: 'POST', path: '/api/guardian/freeze', desc: '1-Tap Emergency lock (freezes withdrawals)' },
        { method: 'POST', path: '/api/guardian/unfreeze', desc: 'Unlock account with guardian authorization' },
        { method: 'POST', path: '/api/guardian/approve', desc: 'Approve/reject high-value transfer (> ₹2,000)' },
        { method: 'POST', path: '/api/guardian/sos', desc: 'Dispatch emergency SOS siren & GPS alert' }
      ],
      'Module 5: UPI Circle (Minor Delegation)': [
        { method: 'GET', path: '/api/circle/members', desc: 'List family circle members & spend history' },
        { method: 'POST', path: '/api/circle/members', desc: 'Add grandchild/minor to circle' },
        { method: 'POST', path: '/api/circle/members/:id/freeze', desc: 'Toggle emergency freeze on minor' },
        { method: 'PATCH', path: '/api/circle/members/:id/limit', desc: 'Update minor monthly allowance limit' },
        { method: 'POST', path: '/api/circle/simulate-spend', desc: 'Simulate minor merchant spend' },
        { method: 'POST', path: '/api/circle/requests/:id/resolve', desc: 'Approve/reject minor spend request' }
      ]
    }
  };

  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>EasyCoin API Explorer</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0c1017; color: #e6edf3; padding: 30px; margin: 0; }
          h1 { color: #f59e0b; margin-bottom: 5px; }
          .badge { background: #22c55e; color: #000; font-weight: bold; padding: 3px 8px; border-radius: 6px; font-size: 12px; }
          .module-card { background: #161b22; border: 1px solid #30363d; border-radius: 10px; padding: 20px; margin-bottom: 25px; }
          .module-title { font-size: 18px; color: #60a5fa; font-weight: 700; margin-bottom: 15px; border-bottom: 1px solid #21262d; padding-bottom: 8px; }
          .endpoint-row { display: flex; align-items: center; gap: 15px; padding: 10px 0; border-bottom: 1px solid #21262d; }
          .endpoint-row:last-child { border-bottom: none; }
          .method { font-weight: bold; padding: 4px 10px; border-radius: 6px; font-size: 12px; min-width: 60px; text-align: center; }
          .get { background: #1e3a8a; color: #93c5fd; }
          .post { background: #065f46; color: #6ee7b7; }
          .patch { background: #78350f; color: #fde68a; }
          .delete { background: #7f1d1d; color: #fca5a5; }
          .path { font-family: monospace; font-size: 14px; color: #f1f5f9; min-width: 250px; }
          .desc { font-size: 14px; color: #94a3b8; }
          a { color: #38bdf8; text-decoration: none; }
        </style>
      </head>
      <body>
        <h1>🪙 EasyCoin Backend API Gateway <span class="badge">v2.0 ONLINE</span></h1>
        <p style="color: #94a3b8; margin-bottom: 30px;">Complete REST & Real-Time SSE Architecture for Senior Citizen Accessible Digital Banking.</p>
        ${Object.entries(apiCatalog.endpoints).map(([modName, eps]) => `
          <div class="module-card">
            <div class="module-title">${modName}</div>
            ${eps.map(ep => `
              <div class="endpoint-row">
                <span class="method ${ep.method.toLowerCase()}">${ep.method}</span>
                <span class="path">${ep.path}</span>
                <span class="desc">${ep.desc}</span>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </body>
      </html>
    `);
  }

  return res.status(200).json(apiCatalog);
});


// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/guardian', guardianRoutes);
app.use('/api/circle', circleRoutes);

// 404 Handler for undefined API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Start Server with resilient fallback (e.g. if macOS AirPlay uses port 5000)
if (require.main === module) {
  const startServer = (port) => {
    const server = app.listen(port, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 EasyCoin Backend Gateway running on port ${port}`);
      console.log(`🔗 Health Check: http://localhost:${port}/api/health`);
      console.log(`🌐 Website Frontend: http://localhost:${port}/`);
      console.log(`==================================================\n`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${port} is occupied (macOS AirPlay / ControlCenter). Automatically switching to port ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  };

  startServer(Number(PORT));
}

module.exports = app;
