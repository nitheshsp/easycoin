/**
 * Module 1: Authentication & Biometrics Routes
 * Assigned to: FRIEND 1
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/voice-otp
router.post('/voice-otp', authController.requestVoiceOTP);

// POST /api/auth/verify-otp
router.post('/verify-otp', authController.verifyOTP);

// POST /api/auth/biometric-login
router.post('/biometric-login', authController.biometricLogin);

// POST /api/auth/symbol-login
router.post('/symbol-login', authController.symbolLogin);

// POST /api/auth/register
router.post('/register', authController.registerUser);

// GET /api/auth/me
router.get('/me', authController.getCurrentUser);

module.exports = router;


