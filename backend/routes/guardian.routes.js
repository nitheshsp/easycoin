/**
 * Module 4: Guardian Shield & Safety Routes
 * Assigned to: FRIEND 4
 */
const express = require('express');
const router = express.Router();
const guardianController = require('../controllers/guardianController');

const eventStream = require('../services/eventStream');

// GET /api/guardian/stream (Real-Time SSE Stream for Guardian)
router.get('/stream', (req, res) => {
  eventStream.registerClient(req, res, 'guardian');
});

// GET /api/guardian/audit-logs (RBI-Compliant Security Audit Trail)
router.get('/audit-logs', guardianController.getAuditLogs);

// POST /api/guardian/freeze
router.post('/freeze', guardianController.freezeAccount);

// POST /api/guardian/unfreeze
router.post('/unfreeze', guardianController.unfreezeAccount);

// GET /api/guardian/status
router.get('/status', guardianController.getGuardianStatus);

// PATCH /api/guardian/settings (Customize Approval Threshold & Contact)
router.patch('/settings', guardianController.updateSettings);
router.post('/settings', guardianController.updateSettings);

// POST /api/guardian/approve
router.post('/approve', guardianController.approveTransfer);

// POST /api/guardian/sos
router.post('/sos', guardianController.triggerSOS);

module.exports = router;

