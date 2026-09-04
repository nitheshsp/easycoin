/**
 * UPI Circle Controller (Delegated Payments for Minors)
 * Enforces NPCI / RBI guidelines on delegated minor spending.
 * Persists to SQLite via DatabaseStore.
 */
const db = require('../config/database');

// Get all circle members and pending approvals
exports.getCircleData = (req, res) => {
  const members = db.getCircleMembers();
  const pendingRequests = db.getCircleRequests();

  res.status(200).json({
    success: true,
    data: {
      members,
      pendingRequests
    }
  });
};

// Add minor member to circle
exports.addMinorMember = (req, res) => {
  const { name, relation, age, phone, monthlyLimit, perTxLimit, delegationMode } = req.body;

  if (!name || !relation) {
    return res.status(400).json({ success: false, error: 'Name and relation are required.' });
  }

  const ageNum = parseInt(age, 10);
  if (isNaN(ageNum) || ageNum >= 18 || ageNum < 5) {
    return res.status(400).json({
      success: false,
      error: 'NPCI Compliance Error: Minor member must be between 5 and 17 years of age.'
    });
  }

  const limitNum = parseInt(monthlyLimit, 10) || 2000;
  if (limitNum < 100 || limitNum > 15000) {
    return res.status(400).json({
      success: false,
      error: 'NPCI Regulatory Limit: Monthly limit must be between ₹100 and ₹15,000.'
    });
  }

  const perTx = parseInt(perTxLimit, 10) || Math.min(500, limitNum);
  const cleanPhone = (phone || '').replace(/\D/g, '') || '98' + Math.floor(10000000 + Math.random() * 90000000);
  const last4 = cleanPhone.slice(-4);
  const cleanVpa = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${last4}@easycoin`;

  const newMember = {
    id: 'minor-' + Date.now(),
    name: name.trim(),
    relation: relation.trim(),
    age: ageNum,
    phone: cleanPhone,
    avatar: ageNum < 12 ? '🧒' : '👦',
    vpa: cleanVpa,
    monthlyLimit: limitNum,
    spentThisMonth: 0,
    perTxLimit: perTx,
    delegationMode: delegationMode || 'PRE_APPROVED',
    isFrozen: false
  };

  db.addCircleMember(newMember);

  res.status(201).json({
    success: true,
    message: `Added ${newMember.relation} ${newMember.name} to Family UPI Circle.`,
    data: newMember
  });
};

// Update monthly allowance limit
exports.updateLimit = (req, res) => {
  const { id } = req.params;
  const { newLimit } = req.body;

  const member = db.getCircleMemberById(id);
  if (!member) {
    return res.status(404).json({ success: false, error: 'Minor member not found.' });
  }

  const limit = parseInt(newLimit, 10);
  if (isNaN(limit) || limit < 100 || limit > 15000) {
    return res.status(400).json({ success: false, error: 'Limit must be between ₹100 and ₹15,000.' });
  }

  const updated = db.updateCircleLimit(id, limit);

  res.status(200).json({
    success: true,
    message: `Updated limit to ₹${limit} for ${updated.name}.`,
    data: updated
  });
};

// Toggle freeze state
exports.toggleFreeze = (req, res) => {
  const { id } = req.params;
  const member = db.getCircleMemberById(id);

  if (!member) {
    return res.status(404).json({ success: false, error: 'Minor member not found.' });
  }

  const updated = db.toggleCircleFreeze(id);

  res.status(200).json({
    success: true,
    message: updated.isFrozen ? `${updated.name}'s UPI card frozen.` : `${updated.name}'s UPI card unfreezed.`,
    data: updated
  });
};

// Simulate spend
exports.simulateSpend = (req, res) => {
  const { id, amount, merchant, category } = req.body;
  const member = db.getCircleMemberById(id);

  if (!member) {
    return res.status(404).json({ success: false, error: 'Minor member not found.' });
  }

  if (member.isFrozen) {
    return res.status(403).json({ success: false, error: 'UPI Circle card is frozen.' });
  }

  const amt = parseInt(amount, 10) || 120;
  const rem = member.monthlyLimit - member.spentThisMonth;

  if (amt > rem) {
    return res.status(400).json({ success: false, error: 'Monthly allowance exceeded.' });
  }

  const spendRecord = {
    merchant: merchant || 'School Book Store',
    amount: amt,
    time: 'Just now',
    category: category || 'Education'
  };

  const updatedMember = db.addCircleSpend(id, spendRecord);

  // If pre-approved, deduct from senior balance and record transaction in main ledger
  if (member.delegationMode === 'PRE_APPROVED') {
    const currentBal = db.getBalance();
    const newBal = Math.max(0, currentBal - amt);
    db.setBalance(newBal);

    db.addTransaction({
      id: `tx_circle_${Date.now()}`,
      title: `${member.name} (${spendRecord.merchant})`,
      type: 'out',
      amount: amt,
      timestamp: new Date().toISOString(),
      formattedTime: 'Just now',
      icon: member.avatar || '👦',
      note: `UPI Circle: ${spendRecord.merchant}`,
      purpose: `${spendRecord.category} for ${member.name}`,
      category: 'circle',
      status: 'SUCCESS'
    });
  }

  res.status(200).json({
    success: true,
    message: `${member.name} spent ₹${amt} at ${spendRecord.merchant}.`,
    data: { member: updatedMember, spendRecord }
  });
};

// Resolve (Approve / Reject) pending allowance request
exports.resolveRequest = (req, res) => {
  const { id } = req.params;
  const { approved } = req.body;

  const result = db.resolveCircleRequest(id, Boolean(approved));
  if (!result) {
    return res.status(404).json({
      success: false,
      error: 'Pending approval request not found.'
    });
  }

  res.status(200).json({
    success: true,
    message: approved ? `Approved request for ₹${result.amount}.` : `Declined request for ₹${result.amount}.`,
    data: result
  });
};
