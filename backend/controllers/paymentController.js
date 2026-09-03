/**
 * Module 3: Payments & Voice Engine Controller
 * Assigned to: FRIEND 3
 * Responsibilities: 1-Tap transfers, Voice-to-Intent NLP parser, QR audio decoder, Bill payments
 */
const db = require('../config/database');
const { HIGH_VALUE_THRESHOLD } = require('../config/constants');

exports.sendPayment = (req, res) => {
  const { recipientName, amount, note, avatar } = req.body;
  const user = db.getUser();
  const currentBalance = db.getBalance();

  if (user.isFrozen) {
    return res.status(403).json({
      success: false,
      message: 'Account is FROZEN. Payments are disabled for safety.',
      isFrozen: true
    });
  }

  const numAmount = parseInt(amount, 10);
  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid transfer amount.'
    });
  }

  if (numAmount > currentBalance) {
    return res.status(400).json({
      success: false,
      message: `Insufficient balance. Available balance is ₹${currentBalance}.`,
      availableBalance: currentBalance
    });
  }

  // Check if High-Value Threshold is triggered (Guardian ping)
  const requiresGuardianApproval = numAmount >= (user.guardian.approvalRequiredAbove || HIGH_VALUE_THRESHOLD);
  
  if (requiresGuardianApproval) {
    const ping = {
      pingId: 'png_' + Date.now(),
      amount: numAmount,
      recipientName: recipientName || 'Beneficiary',
      timestamp: new Date().toISOString(),
      status: 'PENDING_GUARDIAN'
    };
    db.addGuardianPing(ping);

    return res.status(202).json({
      success: true,
      pendingApproval: true,
      message: `Transfer of ₹${numAmount} exceeds security limit. Approval sent to ${user.guardian.name}.`,
      spokenResponse: `Because ₹${numAmount} is a large amount, a quick confirmation has been sent to your guardian, ${user.guardian.name}.`,
      guardianPing: ping
    });
  }

  // Process transfer immediately
  const newBalance = currentBalance - numAmount;
  db.setBalance(newBalance);

  const tx = {
    id: 'tx_' + Date.now(),
    title: recipientName || 'Beneficiary',
    type: 'out',
    amount: numAmount,
    timestamp: new Date().toISOString(),
    formattedTime: 'Just now',
    icon: avatar || '👤',
    note: note || 'Direct Transfer',
    status: 'SUCCESS'
  };
  db.addTransaction(tx);

  const spokenSuccess = `Success! ${numAmount} Rupees has been sent to ${tx.title}. Your remaining balance is ${newBalance.toLocaleString('en-IN')} Rupees.`;

  return res.status(200).json({
    success: true,
    message: 'Payment completed successfully',
    data: {
      transaction: tx,
      remainingBalance: newBalance,
      spokenResponse: spokenSuccess
    }
  });
};

exports.processVoicePay = (req, res) => {
  const { voiceText } = req.body;
  if (!voiceText) {
    return res.status(400).json({
      success: false,
      message: 'No voice command received.'
    });
  }

  const text = voiceText.toLowerCase();
  
  // Extract number from speech
  const numberMatch = text.match(/\d+/);
  const amount = numberMatch ? parseInt(numberMatch[0], 10) : 500;

  // Match contact name
  let matchedRecipient = { name: 'Son Rahul', avatar: '👨‍🦱' };
  if (text.includes('grocery') || text.includes('lakshmi') || text.includes('ration')) {
    matchedRecipient = { name: 'Lakshmi Grocery', avatar: '🏪' };
  } else if (text.includes('doctor') || text.includes('sharma')) {
    matchedRecipient = { name: 'Dr. Sharma', avatar: '👨‍⚕️' };
  } else if (text.includes('rent') || text.includes('landlord') || text.includes('verma')) {
    matchedRecipient = { name: 'Landlord Verma', avatar: '👴' };
  }

  const spokenClarification = `Understood: Send ${amount} Rupees to ${matchedRecipient.name}. Please tap Confirm to send.`;

  return res.status(200).json({
    success: true,
    intent: 'TRANSFER_CONFIRMATION',
    data: {
      recipientName: matchedRecipient.name,
      avatar: matchedRecipient.avatar,
      amount,
      rawVoiceInput: voiceText,
      spokenPrompt: spokenClarification
    }
  });
};

exports.scanQRCode = (req, res) => {
  const { qrPayload } = req.body;
  
  // Simulated QR Code parsing
  const merchant = {
    storeName: 'Lakshmi Daily Essentials & Dairy',
    merchantVpa: 'lakshmigrocery@upi',
    suggestedAmount: 120,
    category: 'Groceries'
  };

  const spokenDescription = `QR Code detected for ${merchant.storeName}. Suggested amount is 120 Rupees.`;

  return res.status(200).json({
    success: true,
    data: {
      ...merchant,
      spokenDescription
    }
  });
};

exports.payUtilityBill = (req, res) => {
  const { billType, amount } = req.body;
  const numAmount = parseInt(amount, 10) || 450;
  const currentBalance = db.getBalance();

  if (numAmount > currentBalance) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient balance to pay bill.'
    });
  }

  const newBalance = currentBalance - numAmount;
  db.setBalance(newBalance);

  const tx = {
    id: 'tx_bill_' + Date.now(),
    title: `${billType || 'Electricity'} Bill Paid`,
    type: 'out',
    amount: numAmount,
    timestamp: new Date().toISOString(),
    formattedTime: 'Just now',
    icon: billType === 'Water' ? '💧' : (billType === 'Gas' ? '🔥' : '⚡'),
    note: 'Utility Auto-Receipt Generated',
    status: 'SUCCESS'
  };
  db.addTransaction(tx);

  return res.status(200).json({
    success: true,
    message: `${billType || 'Electricity'} Bill Paid`,
    data: {
      transaction: tx,
      remainingBalance: newBalance,
      spokenResponse: `Your ${billType || 'Electricity'} bill of ${numAmount} Rupees has been successfully paid.`
    }
  });
};
