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
  const { qrPayload } = req.body || {};
  
  let storeName = 'Lakshmi Daily Essentials & Dairy';
  let merchantVpa = 'lakshmigrocery@upi';
  let suggestedAmount = 120;
  let category = 'Groceries';

  if (qrPayload && typeof qrPayload === 'string') {
    try {
      if (qrPayload.startsWith('upi://pay')) {
        const url = new URL(qrPayload);
        const pn = url.searchParams.get('pn');
        const pa = url.searchParams.get('pa');
        const am = url.searchParams.get('am');
        if (pn) storeName = decodeURIComponent(pn);
        if (pa) merchantVpa = pa;
        if (am) suggestedAmount = parseFloat(am) || 120;
      } else if (qrPayload.toLowerCase().includes('sharma')) {
        storeName = 'Dr. Sharma Health Clinic';
        merchantVpa = 'drsharma@upi';
        suggestedAmount = 350;
        category = 'Healthcare';
      } else if (qrPayload.toLowerCase().includes('apollo')) {
        storeName = 'Apollo Pharmacy & Meds';
        merchantVpa = 'apollopharmacy@upi';
        suggestedAmount = 480;
        category = 'Pharmacy';
      } else if (qrPayload.trim().length > 0) {
        storeName = qrPayload.trim();
      }
    } catch (e) {
      if (qrPayload.trim().length > 0) storeName = qrPayload.trim();
    }
  }

  const spokenDescription = `QR Code detected for ${storeName}. Suggested amount is ${suggestedAmount} Rupees.`;

  return res.status(200).json({
    success: true,
    data: {
      storeName,
      merchantVpa,
      suggestedAmount,
      category,
      spokenDescription
    }
  });
};

exports.getBills = (req, res) => {
  const bills = db.getBills();
  const totalPending = bills
    .filter(b => b.status !== 'PAID')
    .reduce((sum, b) => sum + b.amount, 0);

  return res.status(200).json({
    success: true,
    data: {
      bills,
      totalPending,
      pendingCount: bills.filter(b => b.status !== 'PAID').length
    }
  });
};

exports.addBill = (req, res) => {
  const { title, provider, amount, dueDate, daysLeft, icon, iconClass, recurring } = req.body;

  if (!title || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Bill title and amount are required.'
    });
  }

  const numAmount = parseInt(amount, 10);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid positive bill amount.'
    });
  }

  const newBill = db.addBill({
    title,
    provider: provider || 'Custom Biller',
    amount: numAmount,
    dueDate: dueDate || 'End of Month',
    daysLeft: daysLeft !== undefined ? parseInt(daysLeft, 10) : 7,
    icon: icon || '📄',
    iconClass: iconClass || 'other',
    recurring: recurring || 'Monthly'
  });

  return res.status(201).json({
    success: true,
    message: 'New bill added successfully.',
    data: {
      bill: newBill,
      spokenResponse: `New ${newBill.title} of ${newBill.amount} Rupees has been added to your payment list.`
    }
  });
};

exports.payBillById = (req, res) => {
  const { id } = req.params;
  const bills = db.getBills();
  const bill = bills.find(b => b.id === id);

  if (!bill) {
    return res.status(404).json({
      success: false,
      message: 'Bill not found.'
    });
  }

  if (bill.status === 'PAID') {
    return res.status(400).json({
      success: false,
      message: 'This bill is already paid.'
    });
  }

  const currentBalance = db.getBalance();
  if (bill.amount > currentBalance) {
    return res.status(400).json({
      success: false,
      message: `Insufficient balance (₹ ${currentBalance}) to pay bill of ₹ ${bill.amount}.`
    });
  }

  const newBalance = currentBalance - bill.amount;
  db.setBalance(newBalance);
  const updatedBill = db.payBill(id);

  const tx = {
    id: 'tx_bill_' + Date.now(),
    title: `${bill.title} Paid`,
    type: 'out',
    amount: bill.amount,
    timestamp: new Date().toISOString(),
    formattedTime: 'Just now',
    icon: bill.icon || '⚡',
    note: `${bill.provider} Bill Payment`,
    status: 'SUCCESS'
  };
  db.addTransaction(tx);

  return res.status(200).json({
    success: true,
    message: `${bill.title} paid successfully.`,
    data: {
      bill: updatedBill || bill,
      transaction: tx,
      remainingBalance: newBalance,
      spokenResponse: `Success! Your ${bill.title} of ${bill.amount} Rupees has been paid.`
    }
  });
};


exports.deleteBill = (req, res) => {
  const { id } = req.params;
  const removed = db.deleteBill(id);

  if (!removed) {
    return res.status(404).json({
      success: false,
      message: 'Bill not found or cannot be removed.'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Bill removed successfully.',
    data: {
      removedBill: removed,
      spokenResponse: `${removed.title} has been removed from your bills list.`
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
