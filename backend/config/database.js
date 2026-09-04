/**
 * EasyCoin Persistent SQLite Database Engine
 * Uses Node.js native DatabaseSync (node:sqlite) for ACID-compliant, zero-dependency persistence.
 */
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

class DatabaseStore {
  constructor(dbPath) {
    const dataDir = path.dirname(dbPath || path.join(__dirname, '..', 'data', 'easycoin.sqlite'));
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const targetDbPath = dbPath || path.join(dataDir, 'easycoin.sqlite');
    this.db = new DatabaseSync(targetDbPath);

    // Enable foreign keys and WAL mode for maximum performance and reliability
    this.db.exec('PRAGMA foreign_keys = ON;');

    this.initTables();
    this.seedDefaultsIfEmpty();
  }

  initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        phone TEXT NOT NULL,
        language TEXT DEFAULT 'en-IN',
        is_frozen INTEGER DEFAULT 0,
        biometric_enabled INTEGER DEFAULT 1,
        balance INTEGER DEFAULT 14250,
        pension_monthly INTEGER DEFAULT 8000,
        guardian_json TEXT NOT NULL,
        secret_symbols_json TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        relation TEXT NOT NULL,
        avatar TEXT NOT NULL,
        phone TEXT NOT NULL,
        vpa TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        recipient_id TEXT,
        type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        formatted_time TEXT NOT NULL,
        icon TEXT NOT NULL,
        note TEXT,
        purpose TEXT,
        category TEXT DEFAULT 'general',
        status TEXT DEFAULT 'SUCCESS',
        utr TEXT
      );

      CREATE TABLE IF NOT EXISTS bills (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        provider TEXT NOT NULL,
        icon TEXT NOT NULL,
        icon_class TEXT DEFAULT 'other',
        amount INTEGER NOT NULL,
        due_date TEXT NOT NULL,
        days_left INTEGER DEFAULT 7,
        status TEXT DEFAULT 'DUE',
        recurring TEXT DEFAULT 'Monthly',
        is_custom INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS circle_members (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        relation TEXT NOT NULL,
        age INTEGER NOT NULL,
        phone TEXT NOT NULL,
        avatar TEXT NOT NULL,
        vpa TEXT NOT NULL,
        monthly_limit INTEGER NOT NULL,
        spent_this_month INTEGER DEFAULT 0,
        per_tx_limit INTEGER NOT NULL,
        delegation_mode TEXT NOT NULL,
        is_frozen INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS circle_spends (
        id TEXT PRIMARY KEY,
        member_id TEXT NOT NULL,
        merchant TEXT NOT NULL,
        amount INTEGER NOT NULL,
        time TEXT NOT NULL,
        category TEXT DEFAULT 'General',
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS circle_requests (
        id TEXT PRIMARY KEY,
        member_id TEXT NOT NULL,
        name TEXT NOT NULL,
        avatar TEXT NOT NULL,
        amount INTEGER NOT NULL,
        merchant TEXT NOT NULL,
        category TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING'
      );

      CREATE TABLE IF NOT EXISTS guardian_pings (
        ping_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount INTEGER NOT NULL,
        recipient_name TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        status TEXT NOT NULL
      );
    `);
  }

  seedDefaultsIfEmpty() {
    const userStmt = this.db.prepare('SELECT COUNT(*) as count FROM users');
    const userRow = userStmt.get();
    if (userRow && userRow.count > 0) {
      return; // Database already seeded
    }

    // Seed Senior User
    const defaultGuardian = {
      id: 'grd_01',
      name: 'Daughter Ananya',
      relation: 'Daughter',
      phone: '+919811223344',
      email: 'ananya.roy@example.com',
      approvalRequiredAbove: 2000
    };

    const defaultSymbols = ['☀️', '🐄', '🪔'];

    const insertUser = this.db.prepare(`
      INSERT INTO users (
        id, name, age, phone, language, is_frozen, biometric_enabled,
        balance, pension_monthly, guardian_json, secret_symbols_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      'usr_senior_01',
      'Harish Chandra',
      78,
      '+919876543210',
      'en-IN',
      0,
      1,
      14250,
      8000,
      JSON.stringify(defaultGuardian),
      JSON.stringify(defaultSymbols)
    );

    // Seed Contacts
    const insertContact = this.db.prepare(`
      INSERT INTO contacts (id, user_id, name, relation, avatar, phone, vpa)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultContacts = [
      { id: 'c_01', name: 'Son Rahul', relation: 'Family · Son', avatar: '👨‍🦱', phone: '+919812345678', vpa: 'rahul@upi' },
      { id: 'c_02', name: 'Lakshmi Grocery', relation: 'Merchant · Ration', avatar: '🏪', phone: '+919823456789', vpa: 'lakshmigrocery@upi' },
      { id: 'c_03', name: 'Dr. Sharma', relation: 'Doctor · Clinic', avatar: '👨‍⚕️', phone: '+919834567890', vpa: 'drsharma@upi' },
      { id: 'c_04', name: 'Landlord Verma', relation: 'Rent · Verma Ji', avatar: '👴', phone: '+919845678901', vpa: 'verma.rent@upi' }
    ];

    for (const c of defaultContacts) {
      insertContact.run(c.id, 'usr_senior_01', c.name, c.relation, c.avatar, c.phone, c.vpa);
    }

    // Seed Transactions
    const insertTx = this.db.prepare(`
      INSERT INTO transactions (
        id, user_id, title, recipient_id, type, amount, timestamp,
        formatted_time, icon, note, purpose, category, status, utr
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultTxs = [
      {
        id: 'tx_101',
        title: 'Son Rahul',
        recipientId: 'c_01',
        type: 'out',
        amount: 500,
        timestamp: new Date().toISOString(),
        formattedTime: 'Today, 2:15 PM',
        icon: '👨‍🦱',
        note: 'Monthly Pocket Allowance',
        purpose: 'Monthly Family Living & Household Expense',
        category: 'family',
        status: 'SUCCESS',
        utr: 'UTR-EC-2026-881902'
      },
      {
        id: 'tx_102',
        title: 'Senior Pension Deposit',
        recipientId: null,
        type: 'in',
        amount: 8000,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        formattedTime: 'Yesterday, 10:00 AM',
        icon: '🏛️',
        note: 'Govt. Central Pension',
        purpose: 'Ministry of Social Justice Senior Welfare Deposit',
        category: 'pension',
        status: 'SUCCESS',
        utr: 'UTR-EC-2026-773419'
      },
      {
        id: 'tx_103',
        title: 'Lakshmi Grocery',
        recipientId: 'c_02',
        type: 'out',
        amount: 340,
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        formattedTime: '2 Mar 2026, 4:30 PM',
        icon: '🏪',
        note: 'Rice, Milk & Lentils',
        purpose: 'Daily Essentials & Grocery Ration',
        category: 'groceries',
        status: 'SUCCESS',
        utr: 'UTR-EC-2026-664182'
      }
    ];

    for (const t of defaultTxs) {
      insertTx.run(
        t.id, 'usr_senior_01', t.title, t.recipientId, t.type, t.amount,
        t.timestamp, t.formattedTime, t.icon, t.note, t.purpose, t.category, t.status, t.utr
      );
    }

    // Seed Bills
    const insertBill = this.db.prepare(`
      INSERT INTO bills (
        id, user_id, title, provider, icon, icon_class, amount,
        due_date, days_left, status, recurring, is_custom
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultBills = [
      {
        id: 'bill-elec',
        title: 'Electricity Bill',
        provider: 'State Electricity Board',
        icon: '⚡',
        iconClass: 'electricity',
        amount: 450,
        dueDate: '7th March',
        daysLeft: 3,
        status: 'DUE',
        recurring: 'Every 7th',
        custom: 0
      },
      {
        id: 'bill-net',
        title: 'Mobile 5G & Fiber',
        provider: 'Jio Prepaid Monthly Recharge',
        icon: '📶',
        iconClass: 'network',
        amount: 299,
        dueDate: '10th March',
        daysLeft: 6,
        status: 'DUE',
        recurring: 'Every 10th',
        custom: 0
      },
      {
        id: 'bill-water',
        title: 'Water Supply',
        provider: 'City Water Works Department',
        icon: '💧',
        iconClass: 'water',
        amount: 180,
        dueDate: '15th March',
        daysLeft: 11,
        status: 'UPCOMING',
        recurring: 'Every 15th',
        custom: 0
      },
      {
        id: 'bill-gas',
        title: 'LPG Gas Cylinder',
        provider: 'Indane Gas Refill Booking',
        icon: '🔥',
        iconClass: 'gas',
        amount: 850,
        dueDate: '22nd March',
        daysLeft: 18,
        status: 'UPCOMING',
        recurring: 'Monthly',
        custom: 0
      }
    ];

    for (const b of defaultBills) {
      insertBill.run(
        b.id, 'usr_senior_01', b.title, b.provider, b.icon, b.iconClass,
        b.amount, b.dueDate, b.daysLeft, b.status, b.recurring, b.custom
      );
    }

    // Seed Circle Members
    const insertCircleMember = this.db.prepare(`
      INSERT INTO circle_members (
        id, user_id, name, relation, age, phone, avatar, vpa,
        monthly_limit, spent_this_month, per_tx_limit, delegation_mode, is_frozen
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCircleMember.run(
      'minor-aarav', 'usr_senior_01', 'Aarav Chandra', 'Grandson', 14,
      '9811223344', '👦', 'aarav.3344@easycoin', 2000, 850, 500, 'PRE_APPROVED', 0
    );

    insertCircleMember.run(
      'minor-diya', 'usr_senior_01', 'Diya Chandra', 'Granddaughter', 16,
      '9822334455', '👧', 'diya.4455@easycoin', 3000, 1200, 1000, 'APPROVAL_REQUIRED', 0
    );

    // Seed Circle Spends
    const insertCircleSpend = this.db.prepare(`
      INSERT INTO circle_spends (id, member_id, merchant, amount, time, category, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertCircleSpend.run('sp_01', 'minor-aarav', 'School Canteen Lunch', 80, 'Today, 1:15 PM', 'Food', Date.now() - 3600000 * 2);
    insertCircleSpend.run('sp_02', 'minor-aarav', 'Vidya Book Depot (Math Notebook)', 120, 'Yesterday', 'Education', Date.now() - 3600000 * 24);
    insertCircleSpend.run('sp_03', 'minor-aarav', 'DTC Student Bus Pass Recharge', 150, '1 Mar 2026', 'Transport', Date.now() - 3600000 * 72);
    insertCircleSpend.run('sp_04', 'minor-diya', 'Science Project Stationery', 350, '28 Feb 2026', 'Education', Date.now() - 3600000 * 96);

    // Seed Circle Requests
    const insertCircleReq = this.db.prepare(`
      INSERT INTO circle_requests (id, member_id, name, avatar, amount, merchant, category, timestamp, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCircleReq.run('req-diya-101', 'minor-diya', 'Diya Chandra', '👧', 450, 'NCERT Science & Math Lab Kit', 'Education Supplies', '15 mins ago', 'PENDING');
  }

  // User & Account Operations
  getUser() {
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get('usr_senior_01');
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      age: row.age,
      phone: row.phone,
      language: row.language,
      isFrozen: Boolean(row.is_frozen),
      biometricEnabled: Boolean(row.biometric_enabled),
      balance: row.balance,
      pensionMonthly: row.pension_monthly,
      guardian: JSON.parse(row.guardian_json),
      secretSymbols: JSON.parse(row.secret_symbols_json)
    };
  }

  getUserById(userId) {
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!row) return this.getUser();
    return {
      id: row.id,
      name: row.name,
      age: row.age,
      phone: row.phone,
      language: row.language,
      isFrozen: Boolean(row.is_frozen),
      biometricEnabled: Boolean(row.biometric_enabled),
      balance: row.balance,
      pensionMonthly: row.pension_monthly,
      guardian: JSON.parse(row.guardian_json),
      secretSymbols: JSON.parse(row.secret_symbols_json)
    };
  }

  registerUser(u) {
    const userId = u.id || `usr_senior_${Date.now()}`;
    const guardian = {
      name: u.guardianName || 'Family Guardian',
      phone: u.guardianPhone || '+919811223344',
      relation: 'Guardian',
      approvalRequiredAbove: 2000
    };
    const symbols = u.symbols || ['☀️', '🐄', '🪔'];

    const insert = this.db.prepare(`
      INSERT OR REPLACE INTO users (
        id, name, age, phone, language, is_frozen, biometric_enabled,
        balance, pension_monthly, guardian_json, secret_symbols_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      userId,
      u.name || 'Senior User',
      parseInt(u.age, 10) || 70,
      u.phone || '+919876543210',
      'en-IN',
      0,
      1,
      parseInt(u.balance, 10) || 10000,
      8000,
      JSON.stringify(guardian),
      JSON.stringify(symbols)
    );

    return this.getUserById(userId);
  }


  getBalance() {
    const row = this.db.prepare('SELECT balance FROM users WHERE id = ?').get('usr_senior_01');
    return row ? row.balance : 0;
  }

  setBalance(newBal) {
    this.db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBal, 'usr_senior_01');
    return newBal;
  }

  freezeAccount() {
    this.db.prepare('UPDATE users SET is_frozen = 1 WHERE id = ?').run('usr_senior_01');
    return true;
  }

  unfreezeAccount() {
    this.db.prepare('UPDATE users SET is_frozen = 0 WHERE id = ?').run('usr_senior_01');
    return false;
  }

  verifySymbolPin(symbols) {
    if (!Array.isArray(symbols) || symbols.length !== 3) return false;
    const user = this.getUser();
    if (!user || !user.secretSymbols) return false;
    return (
      symbols[0] === user.secretSymbols[0] &&
      symbols[1] === user.secretSymbols[1] &&
      symbols[2] === user.secretSymbols[2]
    );
  }

  // Contacts
  getContacts() {
    const rows = this.db.prepare('SELECT * FROM contacts WHERE user_id = ?').all('usr_senior_01');
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      relation: r.relation,
      avatar: r.avatar,
      phone: r.phone,
      vpa: r.vpa
    }));
  }

  // Transactions Ledger
  getTransactions() {
    const rows = this.db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY rowid DESC').all('usr_senior_01');
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      recipientId: r.recipient_id,
      type: r.type,
      amount: r.amount,
      timestamp: r.timestamp,
      formattedTime: r.formatted_time,
      icon: r.icon,
      note: r.note,
      purpose: r.purpose,
      category: r.category,
      status: r.status,
      utr: r.utr
    }));
  }

  addTransaction(tx) {
    const insert = this.db.prepare(`
      INSERT INTO transactions (
        id, user_id, title, recipient_id, type, amount, timestamp,
        formatted_time, icon, note, purpose, category, status, utr
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const newTx = {
      id: tx.id || `tx_${Date.now()}`,
      userId: 'usr_senior_01',
      title: tx.title || 'Payment',
      recipientId: tx.recipientId || null,
      type: tx.type || 'out',
      amount: tx.amount || 0,
      timestamp: tx.timestamp || new Date().toISOString(),
      formattedTime: tx.formattedTime || 'Just now',
      icon: tx.icon || '🪙',
      note: tx.note || '',
      purpose: tx.purpose || tx.note || 'Direct Payment',
      category: tx.category || (tx.type === 'in' ? 'pension' : 'general'),
      status: tx.status || 'SUCCESS',
      utr: tx.utr || `UTR-EC-2026-${Math.floor(100000 + Math.random() * 900000)}`
    };

    insert.run(
      newTx.id, newTx.userId, newTx.title, newTx.recipientId, newTx.type,
      newTx.amount, newTx.timestamp, newTx.formattedTime, newTx.icon,
      newTx.note, newTx.purpose, newTx.category, newTx.status, newTx.utr
    );

    return newTx;
  }

  // Bills
  getBills() {
    const rows = this.db.prepare('SELECT * FROM bills WHERE user_id = ? ORDER BY rowid ASC').all('usr_senior_01');
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      provider: r.provider,
      icon: r.icon,
      iconClass: r.icon_class,
      amount: r.amount,
      dueDate: r.due_date,
      daysLeft: r.days_left,
      status: r.status,
      recurring: r.recurring,
      custom: Boolean(r.is_custom)
    }));
  }

  addBill(bill) {
    const insert = this.db.prepare(`
      INSERT INTO bills (
        id, user_id, title, provider, icon, icon_class, amount,
        due_date, days_left, status, recurring, is_custom
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const newBill = {
      id: bill.id || `bill_custom_${Date.now()}`,
      userId: 'usr_senior_01',
      title: bill.title || 'Custom Bill',
      provider: bill.provider || 'Service Provider',
      icon: bill.icon || '📄',
      iconClass: bill.iconClass || 'other',
      amount: parseInt(bill.amount, 10) || 100,
      dueDate: bill.dueDate || 'End of Month',
      daysLeft: bill.daysLeft !== undefined ? bill.daysLeft : 7,
      status: 'DUE',
      recurring: bill.recurring || 'Monthly',
      custom: 1
    };

    insert.run(
      newBill.id, newBill.userId, newBill.title, newBill.provider,
      newBill.icon, newBill.iconClass, newBill.amount, newBill.dueDate,
      newBill.daysLeft, newBill.status, newBill.recurring, newBill.custom
    );

    return {
      ...newBill,
      custom: true
    };
  }

  deleteBill(billId) {
    const bill = this.db.prepare('SELECT * FROM bills WHERE id = ?').get(billId);
    if (!bill) return null;
    this.db.prepare('DELETE FROM bills WHERE id = ?').run(billId);
    return {
      id: bill.id,
      title: bill.title
    };
  }

  payBill(billId) {
    this.db.prepare('UPDATE bills SET status = ? WHERE id = ?').run('PAID', billId);
    return this.db.prepare('SELECT * FROM bills WHERE id = ?').get(billId);
  }

  // UPI Circle (Delegated Minor Spends)
  getCircleMembers() {
    const memberRows = this.db.prepare('SELECT * FROM circle_members WHERE user_id = ?').all('usr_senior_01');
    const spendsStmt = this.db.prepare('SELECT * FROM circle_spends WHERE member_id = ? ORDER BY created_at DESC');

    return memberRows.map(m => {
      const spends = spendsStmt.all(m.id).map(s => ({
        id: s.id,
        merchant: s.merchant,
        amount: s.amount,
        time: s.time,
        category: s.category
      }));

      return {
        id: m.id,
        name: m.name,
        relation: m.relation,
        age: m.age,
        phone: m.phone,
        avatar: m.avatar,
        vpa: m.vpa,
        monthlyLimit: m.monthly_limit,
        spentThisMonth: m.spent_this_month,
        perTxLimit: m.per_tx_limit,
        delegationMode: m.delegation_mode,
        isFrozen: Boolean(m.is_frozen),
        spends
      };
    });
  }

  getCircleMemberById(id) {
    const m = this.db.prepare('SELECT * FROM circle_members WHERE id = ?').get(id);
    if (!m) return null;

    const spends = this.db.prepare('SELECT * FROM circle_spends WHERE member_id = ? ORDER BY created_at DESC').all(id).map(s => ({
      id: s.id,
      merchant: s.merchant,
      amount: s.amount,
      time: s.time,
      category: s.category
    }));

    return {
      id: m.id,
      name: m.name,
      relation: m.relation,
      age: m.age,
      phone: m.phone,
      avatar: m.avatar,
      vpa: m.vpa,
      monthlyLimit: m.monthly_limit,
      spentThisMonth: m.spent_this_month,
      perTxLimit: m.per_tx_limit,
      delegationMode: m.delegation_mode,
      isFrozen: Boolean(m.is_frozen),
      spends
    };
  }

  addCircleMember(member) {
    const insert = this.db.prepare(`
      INSERT INTO circle_members (
        id, user_id, name, relation, age, phone, avatar, vpa,
        monthly_limit, spent_this_month, per_tx_limit, delegation_mode, is_frozen
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      member.id, 'usr_senior_01', member.name, member.relation, member.age,
      member.phone, member.avatar, member.vpa, member.monthlyLimit,
      member.spentThisMonth || 0, member.perTxLimit, member.delegationMode,
      member.isFrozen ? 1 : 0
    );

    return member;
  }

  updateCircleLimit(memberId, newLimit) {
    this.db.prepare('UPDATE circle_members SET monthly_limit = ? WHERE id = ?').run(newLimit, memberId);
    return this.getCircleMemberById(memberId);
  }

  toggleCircleFreeze(memberId) {
    const member = this.db.prepare('SELECT is_frozen FROM circle_members WHERE id = ?').get(memberId);
    if (!member) return null;
    const newFreeze = member.is_frozen ? 0 : 1;
    this.db.prepare('UPDATE circle_members SET is_frozen = ? WHERE id = ?').run(newFreeze, memberId);
    return this.getCircleMemberById(memberId);
  }

  addCircleSpend(memberId, spend) {
    const insert = this.db.prepare(`
      INSERT INTO circle_spends (id, member_id, merchant, amount, time, category, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const spendId = spend.id || `sp_${Date.now()}`;
    insert.run(
      spendId, memberId, spend.merchant, spend.amount,
      spend.time || 'Just now', spend.category || 'General', Date.now()
    );

    this.db.prepare('UPDATE circle_members SET spent_this_month = spent_this_month + ? WHERE id = ?').run(spend.amount, memberId);
    return this.getCircleMemberById(memberId);
  }

  getCircleRequests() {
    const rows = this.db.prepare('SELECT * FROM circle_requests WHERE status = ?').all('PENDING');
    return rows.map(r => ({
      id: r.id,
      memberId: r.member_id,
      name: r.name,
      avatar: r.avatar,
      amount: r.amount,
      merchant: r.merchant,
      category: r.category,
      timestamp: r.timestamp,
      status: r.status
    }));
  }

  addCircleRequest(req) {
    this.db.prepare(`
      INSERT INTO circle_requests (id, member_id, name, avatar, amount, merchant, category, timestamp, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.id || `req_${Date.now()}`, req.memberId, req.name, req.avatar,
      req.amount, req.merchant, req.category, req.timestamp || 'Just now', 'PENDING'
    );
  }

  resolveCircleRequest(reqId, approved) {
    const req = this.db.prepare('SELECT * FROM circle_requests WHERE id = ?').get(reqId);
    if (!req) return null;

    const newStatus = approved ? 'APPROVED' : 'REJECTED';
    this.db.prepare('UPDATE circle_requests SET status = ? WHERE id = ?').run(newStatus, reqId);

    if (approved) {
      this.addCircleSpend(req.member_id, {
        merchant: req.merchant,
        amount: req.amount,
        time: 'Just now',
        category: req.category
      });

      // Also deduct from senior balance
      const currentBal = this.getBalance();
      const newBal = currentBal - req.amount;
      this.setBalance(newBal);

      this.addTransaction({
        id: `tx_circle_${Date.now()}`,
        title: `${req.name} (${req.merchant})`,
        type: 'out',
        amount: req.amount,
        timestamp: new Date().toISOString(),
        formattedTime: 'Just now',
        icon: req.avatar || '👦',
        note: `UPI Circle Approved: ${req.merchant}`,
        purpose: `${req.category} for ${req.name}`,
        category: 'circle',
        status: 'SUCCESS'
      });
    }

    return {
      ...req,
      status: newStatus
    };
  }

  // Guardian Pings
  addGuardianPing(ping) {
    this.db.prepare(`
      INSERT INTO guardian_pings (ping_id, user_id, amount, recipient_name, timestamp, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      ping.pingId, 'usr_senior_01', ping.amount, ping.recipientName,
      ping.timestamp || new Date().toISOString(), ping.status || 'PENDING_GUARDIAN'
    );
    return ping;
  }

  getGuardianPings() {
    const rows = this.db.prepare('SELECT * FROM guardian_pings WHERE user_id = ? ORDER BY rowid DESC').all('usr_senior_01');
    return rows.map(r => ({
      pingId: r.ping_id,
      amount: r.amount,
      recipientName: r.recipient_name,
      timestamp: r.timestamp,
      status: r.status
    }));
  }
}

module.exports = new DatabaseStore();
