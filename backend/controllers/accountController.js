/**
 * Module 2: Accounts & Spoken Passbook Controller
 * Assigned to: FRIEND 2
 * Responsibilities: Balance calculations, visual coin stack breakdown, audio ledger narration
 */
const db = require('../config/database');

exports.getBalance = (req, res) => {
  const user = db.getUser();
  const balance = db.getBalance();

  // Spoken narrative tailored for seniors
  const spokenBalance = `Your EasyCoin balance is ${balance.toLocaleString('en-IN')} Rupees. Your pension of ${user.pensionMonthly.toLocaleString('en-IN')} Rupees is scheduled for the first of next month.`;

  return res.status(200).json({
    success: true,
    data: {
      balance,
      formatted: `₹ ${balance.toLocaleString('en-IN')}`,
      currency: 'INR',
      spokenText: spokenBalance,
      isFrozen: user.isFrozen
    }
  });
};

exports.getCoinBreakdown = (req, res) => {
  const balance = db.getBalance();
  
  // Convert abstract numbers into concrete visual coins for non-readers
  const goldCoins = Math.floor(balance / 1000); // 1 Gold Coin = ₹1,000
  const silverCoins = Math.floor((balance % 1000) / 10); // 1 Silver Coin = ₹10
  const copperCoins = (balance % 10); // 1 Copper Coin = ₹1

  const coinSpokenText = `You have ${goldCoins} gold coins and ${silverCoins} silver coins in your digital vault.`;

  return res.status(200).json({
    success: true,
    data: {
      totalBalance: balance,
      goldCoins: { count: goldCoins, unitValue: 1000, label: 'Gold Coins' },
      silverCoins: { count: silverCoins, unitValue: 10, label: 'Silver Coins' },
      copperCoins: { count: copperCoins, unitValue: 1, label: 'Copper Coins' },
      spokenText: coinSpokenText
    }
  });
};

const crypto = require('node:crypto');
const eventStream = require('../services/eventStream');

exports.getPassbook = (req, res) => {
  const { category, search, limit } = req.query;
  const txs = db.getTransactions({ category, search, limit });

  // Attach spoken text for each entry
  const enrichedTxs = txs.map(tx => {
    const actionWord = tx.type === 'out' ? 'Paid' : 'Received';
    const spokenEntry = `${actionWord} ${tx.amount} Rupees with ${tx.title} on ${tx.formattedTime}.`;
    return {
      ...tx,
      spokenEntry
    };
  });

  return res.status(200).json({
    success: true,
    data: {
      count: enrichedTxs.length,
      transactions: enrichedTxs
    }
  });
};

exports.deposit = (req, res) => {
  const { amount, source, note, category } = req.body;
  const numAmount = parseInt(amount, 10);
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid positive deposit amount.'
    });
  }

  const result = db.deposit(
    numAmount,
    source || 'Pension Deposit',
    note || 'Govt. Central Senior Pension Deposit',
    category || 'pension'
  );

  // Broadcast real-time balance update over SSE
  eventStream.notifyBalanceUpdated(result.newBalance);

  // Log in RBI audit trail
  db.addAuditLog('ACCOUNT_DEPOSIT_COMPLETED', {
    amount: numAmount,
    source: result.transaction.title,
    txId: result.transaction.id,
    newBalance: result.newBalance
  }, clientIp, 'usr_senior_01');

  const spokenResponse = `Deposit successful! ${numAmount.toLocaleString('en-IN')} Rupees has been safely added to your EasyCoin vault. Your new balance is ${result.newBalance.toLocaleString('en-IN')} Rupees.`;

  return res.status(200).json({
    success: true,
    message: 'Deposit completed successfully.',
    data: {
      transaction: result.transaction,
      newBalance: result.newBalance,
      spokenResponse
    }
  });
};

exports.getCertifiedStatement = (req, res) => {
  const user = db.getUser();
  const currentBal = db.getBalance();
  const txs = db.getTransactions();

  let totalCredits = 0;
  let totalDebits = 0;
  let creditCount = 0;
  let debitCount = 0;

  for (const t of txs) {
    if (t.type === 'in') {
      totalCredits += t.amount;
      creditCount++;
    } else {
      totalDebits += t.amount;
      debitCount++;
    }
  }

  const openingBalance = Math.max(0, currentBal - totalCredits + totalDebits);

  // Calculate chronological running balance (oldest to newest)
  const chronological = [...txs].reverse();
  let rollingBal = openingBalance;
  const itemizedLedger = chronological.map(t => {
    if (t.type === 'in') {
      rollingBal += t.amount;
    } else {
      rollingBal -= t.amount;
    }
    return {
      id: t.id,
      date: t.formattedTime,
      rawTimestamp: t.timestamp,
      party: t.title,
      type: t.type,
      category: t.category,
      debit: t.type === 'out' ? t.amount : 0,
      credit: t.type === 'in' ? t.amount : 0,
      runningBalance: rollingBal,
      utr: t.utr || `UTR-EC-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'VERIFIED'
    };
  }).reverse(); // Present newest first

  // Cryptographic statement seal
  const statementPayload = `${user.id}:${currentBal}:${totalCredits}:${totalDebits}:${txs.length}`;
  const verificationHash = crypto.createHash('sha256').update(statementPayload).digest('hex').substring(0, 16).toUpperCase();

  const certifiedStatement = {
    statementId: `STM-EC-2026-${verificationHash.substring(0, 6)}`,
    generatedAt: new Date().toISOString(),
    accountHolder: {
      name: user.name,
      age: user.age,
      phone: user.phone,
      accountNo: '1092-8834-8921',
      ifsc: 'EASY0008921',
      branch: 'Senior Citizen Priority Banking Hub',
      guardian: user.guardian
    },
    summary: {
      openingBalance,
      totalCredits,
      totalDebits,
      closingBalance: currentBal,
      creditTransactions: creditCount,
      debitTransactions: debitCount,
      totalTransactions: txs.length
    },
    verificationSeal: {
      sealCode: `CERT-RBI-2026-${verificationHash}`,
      checksum: verificationHash,
      status: 'OFFICIALLY_VERIFIED',
      ombudsmanSignature: 'EasyCoin Senior Ombudsman Office'
    },
    ledger: itemizedLedger
  };

  return res.status(200).json({
    success: true,
    data: certifiedStatement
  });
};

exports.getContacts = (req, res) => {
  return res.status(200).json({
    success: true,
    data: db.getContacts()
  });
};

