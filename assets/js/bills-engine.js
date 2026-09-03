/**
 * EasyCoin Monthly Bill Reminder & 1-Tap Pay Engine
 * Handles senior-accessible recurring bill reminders, audio overviews, and 1-tap utility payments.
 */
class EasyBillsEngine {
  constructor() {
    this.bills = [
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
        recurring: 'Every 7th'
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
        recurring: 'Every 10th'
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
        recurring: 'Every 15th'
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
        recurring: 'Monthly'
      }
    ];

    this.voiceReminderEnabled = true;
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
      const allPaidText = "Great news! All your monthly bills for electricity, network, and water have been paid.";
      if (window.EasyAudio) window.EasyAudio.speak(allPaidText);
      return;
    }

    const total = this.getTotalPending();
    let speech = `You have ${pending.length} pending monthly bills totaling ${total} Rupees. `;
    
    pending.forEach(b => {
      speech += `Your ${b.title} of ${b.amount} Rupees is due on ${b.dueDate}. `;
    });
    speech += `Tap Pay on any bill to pay instantly.`;

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
      window.EasyAPI.sendTransfer(bill.provider, bill.amount, `${bill.title} Auto-Receipt`, bill.icon);
    }

    bill.status = 'PAID';

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
    
    // Play celebratory coin drop chime
    if (window.EasyAudio) {
      window.EasyAudio.playCoinSound();
      window.EasyAudio.speak(`Success! Your ${bill.title} of ${bill.amount} Rupees has been paid.`);
    }

    // Refresh UI lists
    this.renderAll();

    alert(`✅ Payment Successful!\n\n${bill.title} of ₹ ${bill.amount} paid to ${bill.provider}.\nOfficial digital receipt saved to your Passbook.`);
  }

  // Toggle Voice Phone Reminders
  toggleVoiceReminders(enabled) {
    this.voiceReminderEnabled = enabled;
    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      if (enabled) {
        window.EasyAudio.speak('Voice bill reminders enabled. EasyCoin will call you 24 hours before your electricity and network bills are due.');
      } else {
        window.EasyAudio.speak('Bill reminders disabled.');
      }
    }
  }

  // Render HTML template for bill items
  createBillItemHTML(bill) {
    const isPaid = bill.status === 'PAID';
    const badgeClass = isPaid ? 'paid-badge' : (bill.status === 'DUE' ? 'urgent' : 'upcoming');
    const badgeText = isPaid ? '✅ Paid' : (bill.status === 'DUE' ? `⏰ Due in ${bill.daysLeft} days` : `📅 Due ${bill.dueDate}`);

    return `
      <div class="bill-card-item ${isPaid ? 'paid' : ''}" id="card-${bill.id}">
        <div class="bill-icon-box ${bill.iconClass}">${bill.icon}</div>
        <div class="bill-info">
          <div class="bill-title-row">
            <span class="bill-title">${bill.title}</span>
            <span class="bill-due-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="bill-subtext">${bill.provider} · ${bill.recurring}</div>
        </div>
        <div class="bill-action-col">
          <span class="bill-amount-txt">₹ ${bill.amount}</span>
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

    // Update Phone Simulator List
    const phoneList = document.getElementById('phoneBillsList');
    const phonePendingAmt = document.getElementById('phonePendingBillsAmt');
    const phonePendingCount = document.getElementById('phonePendingBillsCount');

    if (phoneList) {
      phoneList.innerHTML = this.bills.map(b => this.createBillItemHTML(b)).join('');
    }
    if (phonePendingAmt) phonePendingAmt.textContent = `₹ ${total.toLocaleString('en-IN')}`;
    if (phonePendingCount) phonePendingCount.textContent = `${count} Due`;

    // Update Standalone App List
    const appList = document.getElementById('standaloneBillsList');
    const appPendingAmt = document.getElementById('appPendingBillsAmt');
    const appPendingCount = document.getElementById('appPendingBillsCount');

    if (appList) {
      appList.innerHTML = this.bills.map(b => this.createBillItemHTML(b)).join('');
    }
    if (appPendingAmt) appPendingAmt.textContent = `₹ ${total.toLocaleString('en-IN')}`;
    if (appPendingCount) appPendingCount.textContent = `${count} Bills Pending`;
  }
}

window.EasyBills = new EasyBillsEngine();

document.addEventListener('DOMContentLoaded', () => {
  window.EasyBills.renderAll();
});
