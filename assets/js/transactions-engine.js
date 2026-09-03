/**
 * EasyCoin Unified Transaction History Engine
 * Provides comprehensive transaction tracking with To Who, When, and Purpose fields,
 * interactive category filters, and senior-accessible voice narration.
 */
class EasyTransactionsEngine {
  constructor() {
    this.storageKey = 'easycoin_transactions_ledger';
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.loadTransactions();
  }

  loadTransactions() {
    var saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        var parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.transactions = parsed;
          return;
        }
      } catch (e) {
        console.warn('Could not parse stored transactions, loading default ledger.', e);
      }
    }

    // Default rich transaction ledger with To Who, When, and Purpose
    this.transactions = [
      {
        id: 'tx-101',
        toWho: 'Son Rahul (Family Support)',
        recipient: 'Son Rahul',
        minorName: null,
        when: 'Today, 2:15 PM',
        timestamp: Date.now() - 3600000 * 2,
        purpose: 'Monthly Family Living & Household Expense',
        amount: 500,
        type: 'out',
        category: 'family',
        avatar: '👨‍🦱',
        method: 'UPI Direct Transfer',
        status: 'Completed · Verified'
      },
      {
        id: 'tx-102',
        toWho: 'School Book Store (Grandson Aarav)',
        recipient: 'School Book Store',
        minorName: 'Aarav Chandra',
        when: 'Today, 1:15 PM',
        timestamp: Date.now() - 3600000 * 3,
        purpose: 'School Textbooks & Geometry Box (UPI Circle)',
        amount: 120,
        type: 'out',
        category: 'circle',
        avatar: '👦',
        method: 'UPI Circle Pre-Approved',
        status: 'Completed · Verified'
      },
      {
        id: 'tx-103',
        toWho: 'State Electricity Board',
        recipient: 'Electricity Board',
        minorName: null,
        when: 'Yesterday, 5:30 PM',
        timestamp: Date.now() - 3600000 * 24,
        purpose: 'Home Power Consumption Bill for March (Utility)',
        amount: 450,
        type: 'out',
        category: 'bills',
        avatar: '⚡',
        method: 'BBPS 1-Tap Pay',
        status: 'Completed · Verified'
      },
      {
        id: 'tx-104',
        toWho: 'Government Senior Pension Dept',
        recipient: 'Ministry of Social Justice',
        minorName: null,
        when: 'Yesterday, 10:00 AM',
        timestamp: Date.now() - 3600000 * 30,
        purpose: 'Monthly Senior Citizen Welfare Pension Credit',
        amount: 8000,
        type: 'in',
        category: 'pension',
        avatar: '🏛️',
        method: 'Direct Benefit Transfer (DBT)',
        status: 'Credited to Savings'
      },
      {
        id: 'tx-105',
        toWho: 'NCERT Lab Kit (Granddaughter Diya)',
        recipient: 'NCERT Science & Math Kits',
        minorName: 'Diya Chandra',
        when: '28 Feb 2026, 4:20 PM',
        timestamp: Date.now() - 3600000 * 72,
        purpose: 'Physics & Chemistry Practical Lab Equipment (UPI Circle)',
        amount: 450,
        type: 'out',
        category: 'circle',
        avatar: '👧',
        method: 'UPI Circle Elder Approved',
        status: 'Completed · Verified'
      },
      {
        id: 'tx-106',
        toWho: 'Lakshmi Grocery & Ration Store',
        recipient: 'Lakshmi Grocery Store',
        minorName: null,
        when: '2 Mar 2026, 6:45 PM',
        timestamp: Date.now() - 3600000 * 48,
        purpose: 'Daily Essentials, Milk, Atta & Cooking Oil',
        amount: 340,
        type: 'out',
        category: 'merchant',
        avatar: '🏪',
        method: 'QR Scan & Pay',
        status: 'Completed · Verified'
      },
      {
        id: 'tx-107',
        toWho: 'Dr. Sharma Health Clinic & Pharmacy',
        recipient: 'Dr. Sharma Clinic',
        minorName: null,
        when: '27 Feb 2026, 11:30 AM',
        timestamp: Date.now() - 3600000 * 96,
        purpose: 'Doctor Consultation & Monthly Blood Pressure Medicines',
        amount: 350,
        type: 'out',
        category: 'merchant',
        avatar: '👨‍⚕️',
        method: 'QR Scan & Pay',
        status: 'Completed · Verified'
      }
    ];

    this.saveTransactions();
  }

  saveTransactions() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.transactions));
    } catch (e) {
      console.warn('Failed to save transactions ledger', e);
    }
  }

  // --- Add Transaction Method ---
  addTransaction(toWho, when, purpose, amount, type = 'out', category = 'family', avatar = '👤', minorName = null) {
    var newTx = {
      id: 'tx-' + Date.now(),
      toWho: toWho,
      recipient: toWho,
      minorName: minorName,
      when: when || 'Just now',
      timestamp: Date.now(),
      purpose: purpose || 'Payment',
      amount: Math.abs(parseInt(amount, 10) || 0),
      type: type,
      category: category,
      avatar: avatar || (type === 'in' ? '💰' : '💸'),
      method: category === 'circle' ? 'UPI Circle' : 'UPI Payment',
      status: type === 'in' ? 'Credited to Savings' : 'Completed · Verified'
    };

    this.transactions.unshift(newTx);
    this.saveTransactions();
    this.render();

    return newTx;
  }

  // --- Voice Narration for Seniors ---
  speakTransaction(txId) {
    var tx = this.transactions.find(t => t.id === txId);
    if (!tx) return;

    var isOut = tx.type === 'out';
    var action = isOut ? 'Paid' : 'Received';
    var speech = `Transaction details: ${action} ${tx.amount} Rupees. `
      + (isOut ? `To: ${tx.toWho}. ` : `From: ${tx.toWho}. `)
      + `When: ${tx.when}. `
      + `Purpose: ${tx.purpose}. `
      + `Status: ${tx.status}.`;

    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak(speech);
    }
  }

  speakRecentSummary() {
    var recent = this.transactions.slice(0, 4);
    if (recent.length === 0) {
      if (window.EasyAudio) window.EasyAudio.speak('You have no recorded transactions yet.');
      return;
    }

    var speech = `Here is your recent transaction history. `;
    recent.forEach(t => {
      var act = t.type === 'out' ? 'paid' : 'received';
      speech += `On ${t.when}, you ${act} ${t.amount} Rupees with ${t.toWho} for ${t.purpose}. `;
    });

    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak(speech);
    }
  }

  // --- Filtering & Search ---
  setFilter(category) {
    this.currentFilter = category;

    // Update pill UI active class
    var pills = document.querySelectorAll('.tx-pill');
    pills.forEach(p => {
      if (p.getAttribute('data-cat') === category) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    this.renderList();
  }

  setSearch(query) {
    this.searchQuery = (query || '').toLowerCase().trim();
    this.renderList();
  }

  getFilteredTransactions() {
    var list = this.transactions;

    // Category filter
    if (this.currentFilter !== 'all') {
      list = list.filter(t => t.category === this.currentFilter);
    }

    // Search query filter
    if (this.searchQuery) {
      var q = this.searchQuery;
      list = list.filter(t => {
        return (t.toWho && t.toWho.toLowerCase().includes(q))
          || (t.purpose && t.purpose.toLowerCase().includes(q))
          || (t.when && t.when.toLowerCase().includes(q))
          || (t.minorName && t.minorName.toLowerCase().includes(q))
          || String(t.amount).includes(q);
      });
    }

    return list;
  }

  // --- Stats Calculation ---
  getStats() {
    var totalSpent = 0;
    var minorSpent = 0;
    var billsPaid = 0;
    var pensionIncome = 0;

    this.transactions.forEach(t => {
      if (t.type === 'out') {
        totalSpent += t.amount;
        if (t.category === 'circle') minorSpent += t.amount;
        if (t.category === 'bills') billsPaid += t.amount;
      } else if (t.type === 'in') {
        pensionIncome += t.amount;
      }
    });

    return { totalSpent, minorSpent, billsPaid, pensionIncome };
  }

  // --- Render All Surfaces ---
  render() {
    this.renderStats();
    this.renderList();
    this.syncWithPassbookLists();
  }

  renderStats() {
    var stats = this.getStats();

    var elTotal = document.getElementById('txStatTotalSpent');
    var elMinor = document.getElementById('txStatMinorSpent');
    var elBills = document.getElementById('txStatBillsPaid');
    var elPension = document.getElementById('txStatPension');

    if (elTotal) elTotal.textContent = '₹ ' + stats.totalSpent.toLocaleString('en-IN');
    if (elMinor) elMinor.textContent = '₹ ' + stats.minorSpent.toLocaleString('en-IN');
    if (elBills) elBills.textContent = '₹ ' + stats.billsPaid.toLocaleString('en-IN');
    if (elPension) elPension.textContent = '+ ₹ ' + stats.pensionIncome.toLocaleString('en-IN');
  }

  renderList() {
    var listContainer = document.getElementById('txHistoryList');
    if (!listContainer) return;

    var filtered = this.getFilteredTransactions();

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align:center; padding:36px 16px; background:var(--tx-item-bg); border:1.5px dashed var(--tx-item-border); border-radius:18px;">
          <div style="font-size:36px; margin-bottom:8px;">🔍</div>
          <div style="font-size:16px; font-weight:800; color:var(--text-main);">No transactions found</div>
          <div style="font-size:13px; color:var(--text-muted); margin-top:4px;">Try selecting 'All Transactions' or clear search keyword.</div>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = '';

    filtered.forEach(t => {
      var isOut = t.type === 'out';
      var card = document.createElement('div');
      card.className = 'tx-card-item';
      card.onclick = () => this.speakTransaction(t.id);

      var catBadgeClass = t.category || 'family';

      card.innerHTML = `
        <!-- Avatar Column -->
        <div class="tx-avatar-box ${isOut ? t.category : 'in'}">
          ${t.avatar}
        </div>

        <!-- Details Column: To Who, When, Purpose -->
        <div class="tx-details">
          <div class="tx-towho-row">
            <span class="tx-towho-name">${t.toWho}</span>
            <span class="tx-category-badge ${catBadgeClass}">
              ${t.category === 'circle' ? '👨‍👩‍👧‍👦 UPI Circle Minor' : t.category === 'bills' ? '💡 Utility Bill' : t.category === 'pension' ? '🏛️ Pension' : '💸 Family Transfer'}
            </span>
          </div>

          <!-- Purpose Memo Banner -->
          <div class="tx-purpose-row">
            <span class="tx-purpose-lbl">Purpose</span>
            <span class="tx-purpose-badge">${t.purpose}</span>
          </div>

          <!-- When / Timestamp -->
          <div class="tx-when-row">
            <span>📅 ${t.when}</span>
            <span>•</span>
            <span style="color:#059669; font-weight:700;">${t.status}</span>
          </div>
        </div>

        <!-- Amount Column -->
        <div class="tx-amount-col">
          <div class="tx-amount-val ${isOut ? 'debit' : 'credit'}">
            ${isOut ? '-' : '+'} ₹ ${t.amount.toLocaleString('en-IN')}
          </div>
          <div class="tx-status-pill">
            <span>✓</span>
            <span>${t.method}</span>
          </div>
        </div>

        <!-- 1-Tap Audio Readout Button -->
        <div>
          <button class="tx-speak-action-btn" onclick="event.stopPropagation(); window.EasyTransactions.speakTransaction('${t.id}')" title="Listen to this transaction">
            🔊 Hear
          </button>
        </div>
      `;

      listContainer.appendChild(card);
    });
  }

  // Keep older passbook list containers synced so there is zero broken state
  syncWithPassbookLists() {
    var standalonePb = document.getElementById('standalonePassbookList');
    if (standalonePb) {
      standalonePb.innerHTML = '';
      this.transactions.slice(0, 5).forEach(tx => {
        var isOut = tx.type === 'out';
        var row = document.createElement('div');
        row.className = 'passbook-item';
        row.onclick = () => this.speakTransaction(tx.id);
        row.innerHTML = `
          <div class="pb-icon ${isOut ? 'out' : 'in'}">${tx.avatar}</div>
          <div class="pb-info">
            <div class="pb-title">${tx.toWho}</div>
            <div class="pb-time">${tx.when} · <b>Purpose:</b> ${tx.purpose}</div>
          </div>
          <div class="pb-amount ${isOut ? 'out' : 'in'}">
            ${isOut ? '-' : '+'} ₹ ${tx.amount.toLocaleString('en-IN')}
          </div>
        `;
        standalonePb.appendChild(row);
      });
    }

    var phonePb = document.getElementById('passbookList');
    if (phonePb) {
      phonePb.innerHTML = '';
      this.transactions.slice(0, 6).forEach(tx => {
        var isOut = tx.type === 'out';
        var row = document.createElement('div');
        row.className = 'passbook-item';
        row.onclick = () => this.speakTransaction(tx.id);
        row.innerHTML = `
          <div class="pb-icon ${isOut ? 'out' : 'in'}">${tx.avatar}</div>
          <div class="pb-info">
            <div class="pb-title">${tx.toWho}</div>
            <div class="pb-time">${tx.when} · ${tx.purpose}</div>
          </div>
          <div class="pb-amount ${isOut ? 'out' : 'in'}">
            ${isOut ? '-' : '+'} ₹ ${tx.amount.toLocaleString('en-IN')}
          </div>
        `;
        phonePb.appendChild(row);
      });
    }
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', function () {
  window.EasyTransactions = new EasyTransactionsEngine();
  window.EasyTransactions.render();
});
