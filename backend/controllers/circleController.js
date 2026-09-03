/**
 * UPI Circle Controller (Delegated Payments for Minors)
 * Enforces NPCI / RBI guidelines on delegated minor spending.
 */

let circleMembers = [
  {
    id: 'minor-aarav',
    name: 'Aarav Chandra',
    relation: 'Grandson',
    age: 14,
    avatar: '👦',
    vpa: 'aarav.minor@easycoin',
    monthlyLimit: 2000,
    spentThisMonth: 850,
    perTxLimit: 500,
    delegationMode: 'PRE_APPROVED',
    isFrozen: false,
    spends: [
      { merchant: 'School Canteen Lunch', amount: 80, time: 'Today, 1:15 PM', category: 'Food' },
      { merchant: 'Vidya Book Depot (Math Notebook)', amount: 120, time: 'Yesterday', category: 'Education' }
    ]
  },
  {
    id: 'minor-diya',
    name: 'Diya Chandra',
    relation: 'Granddaughter',
    age: 16,
    avatar: '👧',
    vpa: 'diya.minor@easycoin',
    monthlyLimit: 3000,
    spentThisMonth: 1200,
    perTxLimit: 1000,
    delegationMode: 'APPROVAL_REQUIRED',
    isFrozen: false,
    spends: [
      { merchant: 'Science Project Stationery', amount: 350, time: '28 Feb 2026', category: 'Education' }
    ]
  }
];

let pendingRequests = [
  {
    id: 'req-diya-101',
    memberId: 'minor-diya',
    name: 'Diya Chandra',
    avatar: '👧',
    amount: 450,
    merchant: 'NCERT Science & Math Lab Kit',
    category: 'Education Supplies',
    timestamp: '15 mins ago'
  }
];

// Get all circle members and pending approvals
exports.getCircleData = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      members: circleMembers,
      pendingRequests: pendingRequests
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
    isFrozen: false,
    spends: []
  };

  circleMembers.push(newMember);

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

  const member = circleMembers.find(m => m.id === id);
  if (!member) {
    return res.status(404).json({ success: false, error: 'Minor member not found.' });
  }

  const limit = parseInt(newLimit, 10);
  if (isNaN(limit) || limit < 100 || limit > 15000) {
    return res.status(400).json({ success: false, error: 'Limit must be between ₹100 and ₹15,000.' });
  }

  member.monthlyLimit = limit;

  res.status(200).json({
    success: true,
    message: `Updated limit to ₹${limit} for ${member.name}.`,
    data: member
  });
};

// Toggle freeze state
exports.toggleFreeze = (req, res) => {
  const { id } = req.params;
  const member = circleMembers.find(m => m.id === id);

  if (!member) {
    return res.status(404).json({ success: false, error: 'Minor member not found.' });
  }

  member.isFrozen = !member.isFrozen;

  res.status(200).json({
    success: true,
    message: member.isFrozen ? `${member.name}'s UPI card frozen.` : `${member.name}'s UPI card unfreezed.`,
    data: member
  });
};

// Simulate spend
exports.simulateSpend = (req, res) => {
  const { id, amount, merchant, category } = req.body;
  const member = circleMembers.find(m => m.id === id);

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

  member.spentThisMonth += amt;
  const spendRecord = {
    merchant: merchant || 'School Book Store',
    amount: amt,
    time: 'Just now',
    category: category || 'Education'
  };
  member.spends.unshift(spendRecord);

  res.status(200).json({
    success: true,
    message: `${member.name} spent ₹${amt} at ${spendRecord.merchant}.`,
    data: { member, spendRecord }
  });
};
