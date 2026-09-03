/**
 * EasyCoin Mock Database & State Store
 * Provides persistent in-memory models for development with easy hooks for PostgreSQL/MongoDB/SQLite.
 */
class DatabaseStore {
  constructor() {
    this.user = {
      id: 'usr_senior_01',
      name: 'Harish Chandra',
      age: 78,
      phone: '+919876543210',
      language: 'en-IN',
      isFrozen: false,
      biometricEnabled: true,
      balance: 14250,
      pensionMonthly: 8000,
      guardian: {
        id: 'grd_01',
        name: 'Daughter Ananya',
        relation: 'Daughter',
        phone: '+919811223344',
        email: 'ananya.roy@example.com',
        approvalRequiredAbove: 2000
      }
    };

    this.contacts = [
      { id: 'c_01', name: 'Son Rahul', relation: 'Family · Son', avatar: '👨‍🦱', phone: '+919812345678', vpa: 'rahul@upi' },
      { id: 'c_02', name: 'Lakshmi Grocery', relation: 'Merchant · Ration', avatar: '🏪', phone: '+919823456789', vpa: 'lakshmigrocery@upi' },
      { id: 'c_03', name: 'Dr. Sharma', relation: 'Doctor · Clinic', avatar: '👨‍⚕️', phone: '+919834567890', vpa: 'drsharma@upi' },
      { id: 'c_04', name: 'Landlord Verma', relation: 'Rent · Verma Ji', avatar: '👴', phone: '+919845678901', vpa: 'verma.rent@upi' }
    ];

    this.transactions = [
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
        status: 'SUCCESS'
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
        status: 'SUCCESS'
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
        status: 'SUCCESS'
      }
    ];

    this.guardianPings = [];
  }

  getUser() { return this.user; }
  getBalance() { return this.user.balance; }
  setBalance(newBal) { this.user.balance = newBal; }
  
  getContacts() { return this.contacts; }
  
  getTransactions() { return this.transactions; }
  addTransaction(tx) {
    this.transactions.unshift(tx);
    return tx;
  }

  freezeAccount() {
    this.user.isFrozen = true;
    return true;
  }

  unfreezeAccount() {
    this.user.isFrozen = false;
    return false;
  }

  addGuardianPing(ping) {
    this.guardianPings.unshift(ping);
    return ping;
  }

  getGuardianPings() {
    return this.guardianPings;
  }
}

module.exports = new DatabaseStore();
