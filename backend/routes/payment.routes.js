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

// Bills & Utility Payments
// GET /api/payments/bills
router.get('/bills', paymentController.getBills);

// POST /api/payments/bills
router.post('/bills', paymentController.addBill);

// POST /api/payments/bills/:id/pay
router.post('/bills/:id/pay', paymentController.payBillById);

// DELETE /api/payments/bills/:id
router.delete('/bills/:id', paymentController.deleteBill);

// POST /api/payments/bills/pay (legacy)
router.post('/bills/pay', paymentController.payUtilityBill);

module.exports = router;
