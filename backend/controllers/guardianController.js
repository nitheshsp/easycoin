/**
 * Module 4: Guardian Shield & Safety Controller
 * Assigned to: FRIEND 4
 * Responsibilities: 1-Tap Emergency Freeze, Guardian Approval Gateway, SOS Dispatch
 */
const db = require('../config/database');

exports.freezeAccount = (req, res) => {
  db.freezeAccount();
  const user = db.getUser();

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
  }

  return res.status(200).json({
    success: true,
    message: approved ? 'Transfer approved and executed.' : 'Transfer rejected by guardian.',
    data: ping
  });
};

exports.triggerSOS = (req, res) => {
  const user = db.getUser();
  
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
