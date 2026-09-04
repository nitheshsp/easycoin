/**
 * Module 4: Guardian Shield & Safety Controller
 * Assigned to: FRIEND 4
 * Responsibilities: 1-Tap Emergency Freeze, Guardian Approval Gateway, SOS Dispatch
 */
const db = require('../config/database');
const eventStream = require('../services/eventStream');

exports.freezeAccount = (req, res) => {
  db.freezeAccount();
  const user = db.getUser();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // Broadcast real-time lock across SSE stream
  eventStream.notifyAccountStateChanged(true);

  // Log in RBI-compliant audit trail
  db.addAuditLog('ACCOUNT_FROZEN', {
    triggeredBy: 'Emergency Freeze',
    guardianName: user.guardian.name,
    guardianPhone: user.guardian.phone
  }, clientIp, user.id);

  const spokenAlert = `Emergency Lock Activated. All payment withdrawals are now frozen. Your guardian, ${user.guardian.name}, has been alerted.`;

  return res.status(200).json({
    success: true,
    message: 'Account successfully FROZEN for security.',
    isFrozen: true,
    spokenResponse: spokenAlert,
    guardianNotified: {
      name: user.guardian.name,
      phone: user.guardian.phone,
      notifiedAt: new Date().toISOString()
    }
  });
};

exports.unfreezeAccount = (req, res) => {
  const { guardianPasscode } = req.body;
  db.unfreezeAccount();
  const user = db.getUser();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // Broadcast real-time unlock across SSE stream
  eventStream.notifyAccountStateChanged(false);

  // Log in audit trail
  db.addAuditLog('ACCOUNT_UNFROZEN', {
    action: 'Account restored to normal state',
    guardianName: user.guardian.name
  }, clientIp, user.id);

  return res.status(200).json({
    success: true,
    message: 'Account successfully UNLOCKED.',
    isFrozen: false,
    spokenResponse: 'Your EasyCoin account has been safely restored to normal mode.'
  });
};

exports.getGuardianStatus = (req, res) => {
  const user = db.getUser();
  const pings = db.getGuardianPings();

  return res.status(200).json({
    success: true,
    data: {
      isFrozen: user.isFrozen,
      guardian: user.guardian,
      pendingPings: pings,
      safetyScore: '99.8% Protected'
    }
  });
};

exports.approveTransfer = (req, res) => {
  const { pingId, approved } = req.body;
  const pings = db.getGuardianPings();
  const ping = pings.find(p => p.pingId === pingId);
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  if (!ping) {
    return res.status(404).json({
      success: false,
      message: 'Pending approval request not found.'
    });
  }

  ping.status = approved ? 'APPROVED_BY_GUARDIAN' : 'REJECTED_BY_GUARDIAN';
  
  if (approved) {
    const currentBalance = db.getBalance();
    const newBal = currentBalance - ping.amount;
    db.setBalance(newBal);

    db.addTransaction({
      id: 'tx_grd_' + Date.now(),
      title: ping.recipientName,
      type: 'out',
      amount: ping.amount,
      timestamp: new Date().toISOString(),
      formattedTime: 'Just now',
      icon: '👨‍🦱',
      note: 'Guardian Approved Transfer',
      status: 'SUCCESS'
    });

    // Notify real-time stream of approval and new balance
    eventStream.notifyTransferResolved(ping, true);
    eventStream.notifyBalanceUpdated(newBal);
  } else {
    // Notify real-time stream of rejection
    eventStream.notifyTransferResolved(ping, false);
  }

  db.addAuditLog('GUARDIAN_TRANSFER_RESOLVED', {
    pingId,
    amount: ping.amount,
    recipientName: ping.recipientName,
    approved: Boolean(approved)
  }, clientIp, 'usr_senior_01');

  return res.status(200).json({
    success: true,
    message: approved ? 'Transfer approved and executed.' : 'Transfer rejected by guardian.',
    data: ping
  });
};

exports.triggerSOS = (req, res) => {
  const user = db.getUser();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  const sosPayload = {
    seniorName: user.name,
    seniorPhone: user.phone,
    guardianContacted: user.guardian.name,
    guardianPhone: user.guardian.phone,
    timestamp: new Date().toISOString()
  };

  // Broadcast high-priority emergency siren to Guardian SSE stream
  eventStream.notifySOSAlert(sosPayload);

  // Record critical emergency event in audit trail
  db.addAuditLog('EMERGENCY_SOS_TRIGGERED', sosPayload, clientIp, user.id);
  
  return res.status(200).json({
    success: true,
    message: 'SOS Alert dispatched.',
    data: {
      guardianContacted: user.guardian.name,
      supportPhone: '1800-EASY-COIN',
      spokenPrompt: `Connecting you to EasyCoin Senior Support and calling ${user.guardian.name}.`
    }
  });
};

exports.getAuditLogs = (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  const logs = db.getAuditLogs(limit);

  return res.status(200).json({
    success: true,
    count: logs.length,
    data: logs
  });
};

exports.updateSettings = (req, res) => {
  const { approvalRequiredAbove, phone, name, relation } = req.body;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  const updatedSettings = db.updateGuardianSettings({
    ...(approvalRequiredAbove !== undefined && { approvalRequiredAbove: parseInt(approvalRequiredAbove, 10) }),
    ...(phone && { phone }),
    ...(name && { name }),
    ...(relation && { relation })
  });

  // Record audit log
  db.addAuditLog('GUARDIAN_SETTINGS_UPDATED', {
    updatedSettings
  }, clientIp, 'usr_senior_01');

  return res.status(200).json({
    success: true,
    message: 'Guardian security settings updated successfully.',
    data: updatedSettings
  });
};


