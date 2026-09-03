/**
 * Module 3: Payments & Voice Engine Routes
 * Assigned to: FRIEND 3
 */
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// POST /api/payments/transfer
router.post('/transfer', paymentController.sendPayment);

// POST /api/payments/voice-pay
router.post('/voice-pay', paymentController.processVoicePay);

// POST /api/payments/qr-scan
router.post('/qr-scan', paymentController.scanQRCode);

// POST /api/payments/bills/pay
router.post('/bills/pay', paymentController.payUtilityBill);

module.exports = router;
