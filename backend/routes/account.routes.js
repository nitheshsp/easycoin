/**
 * Module 2: Accounts & Spoken Passbook Routes
 * Assigned to: FRIEND 2
 */
const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

const eventStream = require('../services/eventStream');

// GET /api/account/stream (Real-Time SSE Stream for Senior App)
router.get('/stream', (req, res) => {
  eventStream.registerClient(req, res, 'senior');
});

// GET /api/account/balance
router.get('/balance', accountController.getBalance);

// GET /api/account/coins
router.get('/coins', accountController.getCoinBreakdown);

// GET /api/account/passbook
router.get('/passbook', accountController.getPassbook);

// GET /api/account/contacts
router.get('/contacts', accountController.getContacts);

module.exports = router;

