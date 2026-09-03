/**
 * Module 4: Guardian Shield & Safety Routes
 * Assigned to: FRIEND 4
 */
const express = require('express');
const router = express.Router();
const guardianController = require('../controllers/guardianController');

// POST /api/guardian/freeze
router.post('/freeze', guardianController.freezeAccount);

// POST /api/guardian/unfreeze
router.post('/unfreeze', guardianController.unfreezeAccount);

// GET /api/guardian/status
router.get('/status', guardianController.getGuardianStatus);

// POST /api/guardian/approve
router.post('/approve', guardianController.approveTransfer);

// POST /api/guardian/sos
router.post('/sos', guardianController.triggerSOS);

module.exports = router;
