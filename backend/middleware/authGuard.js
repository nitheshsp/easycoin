/**
 * EasyCoin Native Cryptographic Auth Guard
 * Uses Node.js built-in node:crypto for zero-dependency HMAC-SHA256 session token generation and verification.
 */
const crypto = require('node:crypto');
const db = require('../config/database');

const SECRET_KEY = process.env.EASYCOIN_AUTH_SECRET || 'easycoin-senior-priority-secure-secret-salt-2026';

class AuthGuard {
  // Base64URL encoder/decoder
  static base64UrlEncode(str) {
    return Buffer.from(str)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  static base64UrlDecode(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return Buffer.from(base64, 'base64').toString('utf8');
  }

  // Generate tamper-evident HMAC-SHA256 Token
  generateToken(payload, expiresInSeconds = 86400 * 7) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
      ...payload,
      iat: now,
      exp: now + expiresInSeconds
    };

    const headerEncoded = AuthGuard.base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = AuthGuard.base64UrlEncode(JSON.stringify(fullPayload));
    const dataToSign = `${headerEncoded}.${payloadEncoded}`;

    const signature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(dataToSign)
      .digest('base64url');

    return `${dataToSign}.${signature}`;
  }

  // Verify HMAC-SHA256 Signature
  verifyToken(token) {
    if (!token || typeof token !== 'string') return null;

    // Graceful backward-compatibility with established mock tokens
    if (token.startsWith('jwt_mock_') || token.startsWith('jwt_session_')) {
      const user = db.getUser();
      return {
        userId: user ? user.id : 'usr_senior_01',
        name: user ? user.name : 'Harish Chandra',
        role: 'senior',
        isMock: true
      };
    }

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerEncoded, payloadEncoded, signature] = parts;
    const dataToSign = `${headerEncoded}.${payloadEncoded}`;

    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(dataToSign)
      .digest('base64url');

    // Constant-time comparison to prevent timing attacks
    if (signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    try {
      const payload = JSON.parse(AuthGuard.base64UrlDecode(payloadEncoded));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return null; // Expired token
      }
      return payload;
    } catch (e) {
      return null;
    }
  }

  // Express middleware for bearer token authentication
  middleware(strict = false) {
    return (req, res, next) => {
      const authHeader = req.headers['authorization'];
      let token = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      }

      const decoded = this.verifyToken(token);

      if (decoded) {
        req.user = decoded;
        return next();
      }

      if (strict) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Invalid or missing authorization token.'
        });
      }

      // Non-strict fallback for senior UI dev mode
      req.user = {
        userId: 'usr_senior_01',
        role: 'senior'
      };
      next();
    };
  }
}

module.exports = new AuthGuard();
