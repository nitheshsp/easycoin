/**
 * EasyCoin Monthly Bill Reminder & 1-Tap Pay Engine
 * Handles senior-accessible recurring bill reminders, audio overviews, 1-tap utility payments,
 * and dynamic addition/management of extra bills to be paid.
 */

const BILL_PRESETS = {
  electricity: {
    key: 'electricity',
    title: 'Electricity Bill',
    provider: 'State Electricity Board',
    icon: '⚡',
    iconClass: 'electricity',
    defaultAmt: 450,
    recurring: 'Every 7th'
  },
  network: {
    key: 'network',
    title: 'Mobile 5G & Fiber',
    provider: 'Jio / Airtel Monthly Recharge',
    icon: '📶',
    iconClass: 'network',
    defaultAmt: 299,
    recurring: 'Every 10th'
  },
  water: {
    key: 'water',
    title: 'Water Supply',
    provider: 'City Water Works Department',
    icon: '💧',
    iconClass: 'water',
    defaultAmt: 180,
    recurring: 'Every 15th'
  },
  gas: {
    key: 'gas',
    title: 'LPG Gas Cylinder',
    provider: 'Indane / Bharat Gas Refill',
    icon: '🔥',
    iconClass: 'gas',
    defaultAmt: 850,
    recurring: 'Monthly'
  },
  rent: {
    key: 'rent',
    title: 'House Rent',
    provider: 'Landlord / Property Owner',
    icon: '🏠',
    iconClass: 'rent',
    defaultAmt: 5000,
    recurring: '1st of Month'
  },
  medical: {
    key: 'medical',
    title: 'Medicine & Health',
    provider: 'Apollo / Jan Aushadhi Store',
    icon: '🏥',
    iconClass: 'medical',
    defaultAmt: 1200,
    recurring: 'Monthly Prescription'
  },
  tv: {
    key: 'tv',
    title: 'Cable & DTH TV',
    provider: 'Tata Play / Dish TV Recharge',
    icon: '📺',
    iconClass: 'tv',
    defaultAmt: 350,
    recurring: 'Every 20th'
  },
  credit: {
    key: 'credit',
    title: 'Loan EMI / Credit',
    provider: 'Bank Monthly Installment',
    icon: '💳',
    iconClass: 'credit',
    defaultAmt: 2500,
    recurring: '5th of Month'
  },
  other: {
    key: 'other',
    title: 'Custom Monthly Bill',
    provider: 'Service Provider',
    icon: '📄',
    iconClass: 'other',
    defaultAmt: 500,
    recurring: 'Monthly'
  }
};

class EasyBillsEngine {
  constructor() {
    this.defaultBills = [
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
        custom: false
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
        custom: false
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
        custom: false
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
        custom: false
      }
    ];

    this.bills = [];
    this.voiceReminderEnabled = true;
    this.activeCategory = 'electricity';
    this.currentContext = 'standalone';

    this.initBills();
  }

  // Load and merge default, stored custom, and backend bills
  initBills() {
    let combined = JSON.parse(JSON.stringify(this.defaultBills));

    // Load custom bills from localStorage
    const savedCustom = localStorage.getItem('easycoin_custom_bills');
    if (savedCustom) {
      try {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed)) {
          combined = combined.concat(parsed);
        }
      } catch (e) {
        console.warn('Failed to parse custom bills from storage', e);
      }
    }

    // Load paid status overrides
    const savedPaid = localStorage.getItem('easycoin_paid_bill_ids');
    if (savedPaid) {
      try {
        const paidIds = JSON.parse(savedPaid);
        combined.forEach(b => {
          if (paidIds.includes(b.id)) b.status = 'PAID';
        });
      } catch (e) {}
    }

    this.bills = combined;

    // Asynchronously sync with backend API if available
    if (window.EasyAPI) {
      window.EasyAPI.getBills().then(backendBills => {
        if (backendBills && Array.isArray(backendBills) && backendBills.length > 0) {
          backendBills.forEach(bb => {
            if (!this.bills.some(b => b.id === bb.id)) {
              this.bills.push(bb);
            }
          });
          this.renderAll();
        }
      }).catch(() => {});
    }
  }

  saveCustomBillsToStorage() {
    const customOnly = this.bills.filter(b => b.custom);
    localStorage.setItem('easycoin_custom_bills', JSON.stringify(customOnly));
  }

  savePaidStatusToStorage() {
    const paidIds = this.bills.filter(b => b.status === 'PAID').map(b => b.id);
    localStorage.setItem('easycoin_paid_bill_ids', JSON.stringify(paidIds));
  }

  // Calculate total unpaid amount
  getTotalPending() {
    return this.bills
      .filter(b => b.status !== 'PAID')
      .reduce((sum, b) => sum + b.amount, 0);
  }

  getPendingCount() {
    return this.bills.filter(b => b.status !== 'PAID').length;
  }

  // Voice Narration of all monthly bills for non-readers
  speakBillSummary() {
    const pending = this.bills.filter(b => b.status !== 'PAID');
    if (pending.length === 0) {
      const allPaidText = "Great news! All your monthly bills have been paid. You have zero pending payments.";
      if (window.EasyAudio) window.EasyAudio.speak(allPaidText);
      return;
    }

    const total = this.getTotalPending();
    let speech = `You have ${pending.length} pending monthly bills totaling ${total} Rupees. `;
    
    pending.forEach(b => {
      speech += `Your ${b.title} of ${b.amount} Rupees is due on ${b.dueDate}. `;
    });
    speech += `Tap Pay on any bill to pay instantly, or tap Add Bill to add another payment.`;

    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak(speech);
    }
  }

  // 1-Tap Pay Bill
  payBill(billId) {
    const bill = this.bills.find(b => b.id === billId);
    if (!bill || bill.status === 'PAID') return;

    // Call backend API if available
    if (window.EasyAPI) {
      window.EasyAPI.payBillById(billId);
      window.EasyAPI.sendTransfer(bill.provider, bill.amount, `${bill.title} Auto-Receipt`, bill.icon);
    }

    bill.status = 'PAID';
    this.savePaidStatusToStorage();

    // Add to Unified Transaction History with To Who, When, and Purpose
    if (window.EasyTransactions) {
      window.EasyTransactions.addTransaction(
        `${bill.title} (${bill.provider})`,
        'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        `Monthly Recurring Utility Bill (${bill.recurring})`,
        bill.amount,
        'out',
        'bills',
        bill.icon
      );
    }
    
    // Play celebratory coin drop chime & spoken voice
    if (window.EasyAudio) {
      window.EasyAudio.playCoinSound();
      window.EasyAudio.speak(`Success! Your ${bill.title} of ${bill.amount} Rupees has been paid.`);
    }

    // Refresh UI lists
    this.renderAll();

    if (window.showEasyToast) {
      window.showEasyToast(`✅ ${bill.title} of ₹ ${bill.amount.toLocaleString('en-IN')} paid to ${bill.provider}.`, 'success', '⚡');
    }
  }

  // Add a new custom bill
  addNewBill(billData) {
    const preset = BILL_PRESETS[billData.category || 'other'] || BILL_PRESETS.other;
    const amount = parseInt(billData.amount, 10) || preset.defaultAmt;
    const title = billData.title && billData.title.trim() ? billData.title.trim() : preset.title;
    const provider = billData.provider && billData.provider.trim() ? billData.provider.trim() : preset.provider;
    const dueDate = billData.dueDate && billData.dueDate.trim() ? billData.dueDate.trim() : 'End of Month';
    const recurring = billData.recurring || 'Monthly';
    const daysLeft = billData.daysLeft !== undefined ? parseInt(billData.daysLeft, 10) : 7;

    const newBill = {
      id: `bill_custom_${Date.now()}`,
      title,
      provider,
      icon: preset.icon,
      iconClass: preset.iconClass,
      amount,
      dueDate,
      daysLeft,
      status: 'DUE',
      recurring,
      custom: true
    };

    this.bills.push(newBill);
    this.saveCustomBillsToStorage();

    // Notify backend API
    if (window.EasyAPI) {
      window.EasyAPI.addBill(newBill);
    }

    // Audio voice confirmation
    if (window.EasyAudio) {
      window.EasyAudio.playCoinSound();
      window.EasyAudio.speak(`New ${newBill.title} of ${newBill.amount} Rupees has been added to your payment list.`);
    }

    this.renderAll();
    this.closeAddBillModal();
    return newBill;
  }

  // Delete / remove a bill
  deleteBill(billId, event) {
    if (event) event.stopPropagation();
    const bill = this.bills.find(b => b.id === billId);
    if (!bill) return;

    if (!confirm(`Are you sure you want to remove "${bill.title}" (₹ ${bill.amount.toLocaleString('en-IN')}) from your bills?`)) {
      return;
    }

    this.bills = this.bills.filter(b => b.id !== billId);
    this.saveCustomBillsToStorage();

    if (window.EasyAPI) {
      window.EasyAPI.deleteBill(billId);
    }

    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak(`${bill.title} removed.`);
    }

    this.renderAll();
  }

  // Toggle Voice Phone Reminders
  toggleVoiceReminders(enabled) {
    this.voiceReminderEnabled = enabled;
    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      if (enabled) {
        window.EasyAudio.speak('Voice bill reminders enabled. EasyCoin will call you 24 hours before your bills are due.');
      } else {
        window.EasyAudio.speak('Bill reminders disabled.');
      }
    }
  }

  // Modal open/close and interactive controls
  openAddBillModal(context = 'standalone') {
    this.currentContext = context;
    const modal = document.getElementById('easyAddBillModal');
    if (!modal) {
      this.injectModalHTML();
    }
    const modalEl = document.getElementById('easyAddBillModal');
    if (modalEl) {
      modalEl.classList.add('active');
      this.selectCategory(this.activeCategory || 'electricity');
      if (window.EasyAudio) {
        window.EasyAudio.playClick();
        window.EasyAudio.speak('Add a new bill. Choose category, enter amount, and tap Save Bill.');
      }
    }
  }

  closeAddBillModal() {
    const modal = document.getElementById('easyAddBillModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  selectCategory(categoryKey) {
    this.activeCategory = categoryKey;
    const preset = BILL_PRESETS[categoryKey] || BILL_PRESETS.other;

    // Update active UI chips
    const chips = document.querySelectorAll('.category-chip-item');
    chips.forEach(chip => {
      if (chip.getAttribute('data-cat') === categoryKey) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    // Auto-fill form inputs if present
    const titleInput = document.getElementById('billInputTitle');
    const providerInput = document.getElementById('billInputProvider');
    const amountInput = document.getElementById('billInputAmount');

    if (titleInput) {
      titleInput.value = preset.title;
    }
    if (providerInput) {
      providerInput.value = preset.provider;
    }
    if (amountInput && (!amountInput.value || amountInput.dataset.presetSet === 'true')) {
      amountInput.value = preset.defaultAmt;
      amountInput.dataset.presetSet = 'true';
    }

    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak(`Selected ${preset.title}. Default amount ${preset.defaultAmt} Rupees.`);
    }
  }

  setAmount(amount) {
    const amountInput = document.getElementById('billInputAmount');
    if (amountInput) {
      amountInput.value = amount;
      amountInput.dataset.presetSet = 'false';
      if (window.EasyAudio) {
        window.EasyAudio.playClick();
        window.EasyAudio.speak(`${amount} Rupees.`);
      }
    }
  }

  speakFormHelp() {
    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak(
        'To add an extra bill: Step 1, tap a picture category such as Electricity, Rent, or Mobile. ' +
        'Step 2, type the amount or tap a quick rupee button. ' +
        'Step 3, tap the blue Save Bill button.'
      );
    }
  }

  submitBillForm(e) {
    if (e) e.preventDefault();
    const titleInput = document.getElementById('billInputTitle');
    const providerInput = document.getElementById('billInputProvider');
    const amountInput = document.getElementById('billInputAmount');
    const dueSelect = document.getElementById('billInputDueDate');
    const recurringSelect = document.getElementById('billInputRecurring');

    const title = titleInput ? titleInput.value : '';
    const provider = providerInput ? providerInput.value : '';
    const amount = amountInput ? parseInt(amountInput.value, 10) : 0;
    const dueDate = dueSelect ? dueSelect.value : 'End of Month';
    const recurring = recurringSelect ? recurringSelect.value : 'Monthly';

    if (!amount || isNaN(amount) || amount <= 0) {
      if (window.showEasyToast) {
        window.showEasyToast('Please enter a valid bill amount greater than ₹0.', 'error', '⚠️');
      }
      if (window.EasyAudio) window.EasyAudio.speak('Please enter a valid bill amount.');
      return;
    }

    let daysLeft = 7;
    if (dueDate.includes('3')) daysLeft = 3;
    else if (dueDate.includes('5')) daysLeft = 5;
    else if (dueDate.includes('15')) daysLeft = 15;

    this.addNewBill({
      category: this.activeCategory,
      title,
      provider,
      amount,
      dueDate,
      daysLeft,
      recurring
    });
  }

  // Inject Modal into DOM if not present
  injectModalHTML() {
    if (document.getElementById('easyAddBillModal')) return;

    const modalHTML = `
      <div class="bill-modal-backdrop" id="easyAddBillModal" role="dialog" aria-modal="true" aria-labelledby="addBillModalTitle">
        <div class="bill-modal-card">
          <!-- Modal Header -->
          <div class="bill-modal-header">
            <div class="bill-modal-title-wrap">
              <div style="font-size:26px;">➕</div>
              <div>
                <h3 class="bill-modal-title" id="addBillModalTitle">Add Extra Bill to Pay</h3>
                <div class="bill-modal-sub">Electricity, Rent, Mobile, Medical & Custom</div>
              </div>
            </div>
            <button class="bill-modal-close-btn" onclick="window.EasyBills.closeAddBillModal()" title="Close" aria-label="Close dialog">✕</button>
          </div>

          <!-- Modal Body Form -->
          <form class="bill-modal-body" onsubmit="window.EasyBills.submitBillForm(event)">
            <!-- Voice Guide Banner -->
            <div style="display:flex; align-items:center; justify-content:space-between; background:#EFF6FF; border:1px solid #BFDBFE; border-radius:14px; padding:10px 14px;">
              <span style="font-size:13px; font-weight:700; color:#1E40AF;">🔊 Need voice guidance?</span>
              <button type="button" class="bills-readout-btn" style="background:#003DD1; color:#fff; border:none; padding:6px 12px;" onclick="window.EasyBills.speakFormHelp()">
                Explain Steps
              </button>
            </div>

            <!-- 1. Category Selector -->
            <div>
              <div class="category-select-header">
                <span class="category-select-title">1. Select Bill Category:</span>
              </div>
              <div class="category-chips-grid">
                <div class="category-chip-item active" data-cat="electricity" onclick="window.EasyBills.selectCategory('electricity')">
                  <span class="category-chip-icon">⚡</span>
                  <span class="category-chip-label">Electricity</span>
                </div>
                <div class="category-chip-item" data-cat="water" onclick="window.EasyBills.selectCategory('water')">
                  <span class="category-chip-icon">💧</span>
                  <span class="category-chip-label">Water</span>
                </div>
                <div class="category-chip-item" data-cat="network" onclick="window.EasyBills.selectCategory('network')">
                  <span class="category-chip-icon">📶</span>
                  <span class="category-chip-label">Mobile 5G</span>
                </div>
                <div class="category-chip-item" data-cat="gas" onclick="window.EasyBills.selectCategory('gas')">
                  <span class="category-chip-icon">🔥</span>
                  <span class="category-chip-label">LPG Gas</span>
                </div>
                <div class="category-chip-item" data-cat="rent" onclick="window.EasyBills.selectCategory('rent')">
                  <span class="category-chip-icon">🏠</span>
                  <span class="category-chip-label">House Rent</span>
                </div>
                <div class="category-chip-item" data-cat="medical" onclick="window.EasyBills.selectCategory('medical')">
                  <span class="category-chip-icon">🏥</span>
                  <span class="category-chip-label">Medical</span>
                </div>
                <div class="category-chip-item" data-cat="tv" onclick="window.EasyBills.selectCategory('tv')">
                  <span class="category-chip-icon">📺</span>
                  <span class="category-chip-label">Cable TV</span>
                </div>
                <div class="category-chip-item" data-cat="credit" onclick="window.EasyBills.selectCategory('credit')">
                  <span class="category-chip-icon">💳</span>
                  <span class="category-chip-label">Loan EMI</span>
                </div>
                <div class="category-chip-item" data-cat="other" onclick="window.EasyBills.selectCategory('other')">
                  <span class="category-chip-icon">📄</span>
                  <span class="category-chip-label">Other Bill</span>
                </div>
              </div>
            </div>

            <!-- 2. Bill Name & Provider Fields -->
            <div class="bill-field-group">
              <label class="bill-field-label" for="billInputTitle">
                <span>Bill Name / Description:</span>
              </label>
              <input type="text" id="billInputTitle" class="bill-input" placeholder="e.g. Electricity Bill" required>
            </div>

            <div class="bill-field-group">
              <label class="bill-field-label" for="billInputProvider">
                <span>Service Provider / Biller:</span>
              </label>
              <input type="text" id="billInputProvider" class="bill-input" placeholder="e.g. State Electricity Board" required>
            </div>

            <!-- 3. Amount Field with Tactile Chips -->
            <div class="bill-field-group">
              <label class="bill-field-label" for="billInputAmount">
                <span>Amount to Pay:</span>
              </label>
              <div class="bill-amount-input-wrap">
                <span class="bill-currency-symbol">₹</span>
                <input type="number" id="billInputAmount" class="bill-input amount-input" placeholder="450" min="1" required>
              </div>
              <div class="quick-amount-chips">
                <button type="button" class="quick-amt-chip" onclick="window.EasyBills.setAmount(200)">+ ₹ 200</button>
                <button type="button" class="quick-amt-chip" onclick="window.EasyBills.setAmount(450)">₹ 450</button>
                <button type="button" class="quick-amt-chip" onclick="window.EasyBills.setAmount(1000)">₹ 1,000</button>
                <button type="button" class="quick-amt-chip" onclick="window.EasyBills.setAmount(2500)">₹ 2,500</button>
                <button type="button" class="quick-amt-chip" onclick="window.EasyBills.setAmount(5000)">₹ 5,000</button>
              </div>
            </div>

            <!-- 4. Due Date & Frequency -->
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
              <div class="bill-field-group">
                <label class="bill-field-label" for="billInputDueDate">
                  <span>Due Date:</span>
                </label>
                <select id="billInputDueDate" class="bill-input" style="padding:10px 12px;">
                  <option value="Due in 3 days">Due in 3 days (Urgent)</option>
                  <option value="7th of Month" selected>7th of Month</option>
                  <option value="15th of Month">15th of Month</option>
                  <option value="End of Month">End of Month</option>
                </select>
              </div>
              <div class="bill-field-group">
                <label class="bill-field-label" for="billInputRecurring">
                  <span>Frequency:</span>
                </label>
                <select id="billInputRecurring" class="bill-input" style="padding:10px 12px;">
                  <option value="Monthly" selected>Monthly Recurring</option>
                  <option value="One-Time">One-Time Bill</option>
                  <option value="Quarterly">Quarterly</option>
                </select>
              </div>
            </div>

            <!-- Modal Action Buttons -->
            <div class="bill-modal-actions">
              <button type="button" class="btn-cancel-bill" onclick="window.EasyBills.closeAddBillModal()">
                Cancel
              </button>
              <button type="submit" class="btn-save-bill">
                <span>💾 Save & Add Bill</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // Render HTML template for individual bill items
  createBillItemHTML(bill) {
    const isPaid = bill.status === 'PAID';
    const badgeClass = isPaid ? 'paid-badge' : (bill.status === 'DUE' ? 'urgent' : 'upcoming');
    const badgeText = isPaid ? '✅ Paid' : (bill.status === 'DUE' ? `⏰ Due in ${bill.daysLeft} days` : `📅 Due ${bill.dueDate}`);
    const deleteBtn = bill.custom
      ? `<button class="bill-delete-btn" onclick="window.EasyBills.deleteBill('${bill.id}', event)" title="Remove bill" aria-label="Remove bill">🗑️</button>`
      : '';

    return `
      <div class="bill-card-item ${isPaid ? 'paid' : ''} ${bill.custom ? 'custom-bill' : ''}" id="card-${bill.id}">
        <div class="bill-icon-box ${bill.iconClass || 'other'}">${bill.icon || '📄'}</div>
        <div class="bill-info">
          <div class="bill-title-row">
            <span class="bill-title">${bill.title}</span>
            ${deleteBtn}
            <span class="bill-due-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="bill-subtext">${bill.provider} · ${bill.recurring}</div>
        </div>
        <div class="bill-action-col">
          <span class="bill-amount-txt">₹ ${bill.amount.toLocaleString('en-IN')}</span>
          <button class="bill-pay-btn ${isPaid ? 'paid-btn' : ''}" onclick="window.EasyBills.payBill('${bill.id}')" ${isPaid ? 'disabled' : ''}>
            ${isPaid ? 'Paid' : 'Pay Now'}
          </button>
        </div>
      </div>
    `;
  }

  renderAll() {
    const total = this.getTotalPending();
    const count = this.getPendingCount();

    // 1. Update Phone Simulator List in index.html
    const phoneList = document.getElementById('phoneBillsList');
    const phonePendingAmt = document.getElementById('phonePendingBillsAmt');
    const phonePendingCount = document.getElementById('phonePendingBillsCount');

    if (phoneList) {
      const billsHTML = this.bills.map(b => this.createBillItemHTML(b)).join('');
      const addBtnHTML = `
        <button class="bill-add-trigger-btn phone-mode" onclick="window.EasyBills.openAddBillModal('phone')">
          <span>➕ Add Extra Bill to Pay</span>
        </button>
      `;
      phoneList.innerHTML = billsHTML + addBtnHTML;
    }
    if (phonePendingAmt) phonePendingAmt.textContent = `₹ ${total.toLocaleString('en-IN')}`;
    if (phonePendingCount) phonePendingCount.textContent = `${count} Due`;

    // 2. Update Standalone App List in app.html
    const appList = document.getElementById('standaloneBillsList');
    const appPendingAmt = document.getElementById('appPendingBillsAmt');
    const appPendingCount = document.getElementById('appPendingBillsCount');

    if (appList) {
      const billsHTML = this.bills.map(b => this.createBillItemHTML(b)).join('');
      const addBtnHTML = `
        <button class="bill-add-trigger-btn" onclick="window.EasyBills.openAddBillModal('standalone')">
          <span style="font-size:18px;">➕</span>
          <span>Add Extra Bill to Pay (Electricity, Rent, Mobile, Medical...)</span>
        </button>
      `;
      appList.innerHTML = billsHTML + addBtnHTML;
    }
    if (appPendingAmt) appPendingAmt.textContent = `₹ ${total.toLocaleString('en-IN')}`;
    if (appPendingCount) appPendingCount.textContent = `${count} Bills Pending`;
  }
}

window.EasyBills = new EasyBillsEngine();

document.addEventListener('DOMContentLoaded', () => {
  window.EasyBills.renderAll();
  window.EasyBills.injectModalHTML();
});
