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

exports.getPassbook = (req, res) => {
  const txs = db.getTransactions();

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

exports.getContacts = (req, res) => {
  return res.status(200).json({
    success: true,
    data: db.getContacts()
  });
};
