const express = require('express');
const router = express.Router();
const circleController = require('../controllers/circleController');

router.get('/members', circleController.getCircleData);
router.post('/members', circleController.addMinorMember);
router.patch('/members/:id/limit', circleController.updateLimit);
router.post('/members/:id/freeze', circleController.toggleFreeze);
router.post('/simulate-spend', circleController.simulateSpend);

module.exports = router;
