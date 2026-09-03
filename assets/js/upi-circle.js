/**
 * EasyCoin UPI Circle Engine (Delegated Payments for Minors)
 * Enables senior grandparents and parents to provide secure, limited UPI access
 * to minor family members under NPCI / RBI guidelines with Terms & Conditions.
 */
class EasyUPICircleEngine {
  constructor() {
    this.storageKey = 'easycoin_upi_circle_data';
    this.loadState();
  }

  loadState() {
    var saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        var parsed = JSON.parse(saved);
        this.members = parsed.members || [];
        this.pendingRequests = parsed.pendingRequests || [];
        return;
      } catch (e) {
        console.warn('Could not parse saved UPI Circle data, resetting to defaults.', e);
      }
    }

    // Default senior family circle members
    this.members = [
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
        delegationMode: 'PRE_APPROVED', // 'PRE_APPROVED' or 'APPROVAL_REQUIRED'
        isFrozen: false,
        spends: [
          { merchant: 'School Canteen Lunch', amount: 80, time: 'Today, 1:15 PM', category: 'Food' },
          { merchant: 'Vidya Book Depot (Math Notebook)', amount: 120, time: 'Yesterday', category: 'Education' },
          { merchant: 'DTC Student Bus Pass Recharge', amount: 150, time: '1 Mar 2026', category: 'Transport' }
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
          { merchant: 'Science Project Stationery', amount: 350, time: '28 Feb 2026', category: 'Education' },
          { merchant: 'Drawing Art Supplies', amount: 250, time: '25 Feb 2026', category: 'Art' }
        ]
      }
    ];

    this.pendingRequests = [
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

    this.saveState();
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        members: this.members,
        pendingRequests: this.pendingRequests
      }));
    } catch (e) {
      console.warn('Failed to save UPI Circle data', e);
    }
  }

  // --- Voice Narration for Seniors ---
  speakCircleSummary() {
    var activeMembers = this.members.filter(m => !m.isFrozen);
    var pending = this.pendingRequests.length;

    var speech = `Family UPI Circle status: You have ${this.members.length} minor children linked. `;

    this.members.forEach(m => {
      var rem = m.monthlyLimit - m.spentThisMonth;
      if (m.isFrozen) {
        speech += `${m.relation} ${m.name}'s UPI card is currently frozen. `;
      } else {
        speech += `${m.relation} ${m.name} has ${rem} Rupees remaining of their ${m.monthlyLimit} Rupees allowance. `;
      }
    });

    if (pending > 0) {
      speech += `Attention: You have ${pending} pending payment request waiting for your approval. `;
    }

    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak(speech);
    }
  }

  // Spoken voice reading of Terms and Conditions for non-readers
  speakTermsAndConditions() {
    var tcSpoken = `Here is the audio summary of NPCI UPI Circle Terms and Conditions for minor family members. 
    Point 1: Eligible Minors: Only family members under 18 years of age can be added. 
    Point 2: Guardian Responsibility: You as the primary account holder hold ultimate responsibility for all delegated spends. 
    Point 3: Monthly Limit: As per NPCI guidelines, monthly spending is capped at 15,000 Rupees maximum, with your personal lower limit applied. 
    Point 4: 1-Tap Freeze: You can pause or freeze any minor's UPI access instantly at any time. 
    Point 5: Category Safety: Gambling, gaming, and age-restricted purchases are permanently blocked by EasyCoin. 
    Point 6: Real-time Alerts: You will hear a spoken alert and receive an SMS whenever money is spent.`;

    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak(tcSpoken);
    }
  }

  // --- Simulate Minor Spend (Demo Interaction) ---
  simulateMinorSpend(memberId) {
    var member = this.members.find(m => m.id === memberId);
    if (!member) return;

    if (member.isFrozen) {
      var frozenMsg = `Cannot process: ${member.name}'s UPI Circle card is frozen. Tap Unfreeze to restore access.`;
      alert(frozenMsg);
      if (window.EasyAudio) window.EasyAudio.speak(frozenMsg);
      return;
    }

    var sampleSpends = [
      { merchant: 'School Book Stall', amount: 120, category: 'Books' },
      { merchant: 'School Canteen', amount: 65, category: 'Food' },
      { merchant: 'Bus Ticket Transit', amount: 40, category: 'Travel' },
      { merchant: 'Geometry Box & Pens', amount: 95, category: 'Stationery' },
      { merchant: 'Badminton Shuttlecocks', amount: 180, category: 'Sports' }
    ];

    var randomSpend = sampleSpends[Math.floor(Math.random() * sampleSpends.length)];
    var rem = member.monthlyLimit - member.spentThisMonth;

    if (randomSpend.amount > rem) {
      var limitExceededMsg = `Monthly allowance limit reached for ${member.name}. Remaining allowance is only ₹${rem}.`;
      alert(limitExceededMsg);
      if (window.EasyAudio) window.EasyAudio.speak(limitExceededMsg);
      return;
    }

    // If member requires approval for transactions above limit
    if (member.delegationMode === 'APPROVAL_REQUIRED' && randomSpend.amount > member.perTxLimit) {
      this.pendingRequests.unshift({
        id: 'req-' + Date.now(),
        memberId: member.id,
        name: member.name,
        avatar: member.avatar,
        amount: randomSpend.amount,
        merchant: randomSpend.merchant,
        category: randomSpend.category,
        timestamp: 'Just now'
      });
      this.saveState();
      this.renderAll();

      var reqMsg = `Payment request received: ${member.name} wants to spend ₹${randomSpend.amount} at ${randomSpend.merchant}. Please review and approve.`;
      alert('🔔 ' + reqMsg);
      if (window.EasyAudio) {
        window.EasyAudio.playAlert();
        window.EasyAudio.speak(reqMsg);
      }
      return;
    }

    // Auto-approve within allowance
    member.spentThisMonth += randomSpend.amount;
    member.spends.unshift({
      merchant: randomSpend.merchant,
      amount: randomSpend.amount,
      time: 'Just now',
      category: randomSpend.category
    });

    this.saveState();
    this.renderAll();

    // Deduct from primary balance in banking engine if present
    if (window.EasyBanking) {
      var currentBal = window.EasyBanking.getBalance();
      if (currentBal >= randomSpend.amount) {
        window.EasyBanking.updateBalance(currentBal - randomSpend.amount);
        window.EasyBanking.addPassbookEntry(
          `UPI Circle · ${member.name}`,
          'out',
          randomSpend.amount,
          member.avatar,
          randomSpend.merchant
        );
      }
    }

    // Spoken voice notification
    var successSpeech = `UPI Circle Alert: ${member.relation} ${member.name} paid ${randomSpend.amount} Rupees for ${randomSpend.merchant}. Remaining monthly allowance is ${member.monthlyLimit - member.spentThisMonth} Rupees.`;
    
    if (window.EasyAudio) {
      window.EasyAudio.playCoinSound();
      window.EasyAudio.speak(successSpeech);
    }

    // Also display notification toast
    alert(`💳 Minor Payment Verified:\n${member.name} spent ₹${randomSpend.amount} at ${randomSpend.merchant}.\nRemaining Allowance: ₹${member.monthlyLimit - member.spentThisMonth}`);
  }

  // --- 1-Tap Freeze / Unfreeze Minor ---
  toggleFreeze(memberId) {
    var member = this.members.find(m => m.id === memberId);
    if (!member) return;

    member.isFrozen = !member.isFrozen;
    this.saveState();
    this.renderAll();

    var statusMsg = member.isFrozen
      ? `UPI access for ${member.relation} ${member.name} has been frozen. They cannot make any purchases until you unfreeze.`
      : `UPI access for ${member.relation} ${member.name} has been restored and unfreezed.`;

    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak(statusMsg);
    }
    alert(member.isFrozen ? `❄️ Frozen: ${member.name}'s UPI Circle is locked.` : `🔓 Unfrozen: ${member.name}'s UPI Circle is active.`);
  }

  // --- Approve / Reject Pending Request ---
  approveRequest(requestId) {
    var idx = this.pendingRequests.findIndex(r => r.id === requestId);
    if (idx === -1) return;

    var req = this.pendingRequests[idx];
    var member = this.members.find(m => m.id === req.memberId);

    if (member) {
      member.spentThisMonth += req.amount;
      member.spends.unshift({
        merchant: req.merchant,
        amount: req.amount,
        time: 'Approved just now',
        category: req.category
      });

      if (window.EasyBanking) {
        var currentBal = window.EasyBanking.getBalance();
        if (currentBal >= req.amount) {
          window.EasyBanking.updateBalance(currentBal - req.amount);
          window.EasyBanking.addPassbookEntry(
            `UPI Circle Approved · ${member.name}`,
            'out',
            req.amount,
            member.avatar,
            req.merchant
          );
        }
      }
    }

    this.pendingRequests.splice(idx, 1);
    this.saveState();
    this.renderAll();

    var speech = `Approved payment of ${req.amount} Rupees for ${req.name} at ${req.merchant}.`;
    if (window.EasyAudio) {
      window.EasyAudio.playCoinSound();
      window.EasyAudio.speak(speech);
    }
    alert(`✅ Request Approved: ₹${req.amount} sent for ${req.name}`);
  }

  rejectRequest(requestId) {
    var idx = this.pendingRequests.findIndex(r => r.id === requestId);
    if (idx === -1) return;

    var req = this.pendingRequests[idx];
    this.pendingRequests.splice(idx, 1);
    this.saveState();
    this.renderAll();

    var speech = `Declined payment request from ${req.name}.`;
    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak(speech);
    }
    alert(`❌ Request Declined: ${req.name}'s request for ₹${req.amount} was rejected.`);
  }

  // --- Add New Minor Member ---
  addMinorMember(name, relation, age, monthlyLimit, delegationMode) {
    if (!name || !relation) {
      alert('Please enter minor name and family relationship.');
      return false;
    }

    age = parseInt(age, 10);
    if (isNaN(age) || age >= 18 || age < 5) {
      alert('Invalid Age: In accordance with NPCI & RBI guidelines, UPI Circle minor delegation is only for children between 5 and 17 years of age.');
      return false;
    }

    monthlyLimit = parseInt(monthlyLimit, 10) || 1500;
    if (monthlyLimit > 15000) {
      alert('NPCI Regulatory Ceiling: Maximum allowable monthly limit per UPI Circle member cannot exceed ₹15,000.');
      return false;
    }

    var avatars = age < 12 ? ['🧒', '👦', '👧'] : ['🧑', '👦', '👧'];
    var avatar = avatars[Math.floor(Math.random() * avatars.length)];

    var newMember = {
      id: 'minor-' + Date.now(),
      name: name.trim(),
      relation: relation.trim(),
      age: age,
      avatar: avatar,
      vpa: name.toLowerCase().replace(/\s+/g, '.') + '.minor@easycoin',
      monthlyLimit: monthlyLimit,
      spentThisMonth: 0,
      perTxLimit: Math.min(500, monthlyLimit),
      delegationMode: delegationMode || 'PRE_APPROVED',
      isFrozen: false,
      spends: []
    };

    this.members.push(newMember);
    this.saveState();
    this.renderAll();

    var welcomeSpeech = `Added ${newMember.relation} ${newMember.name} to your Family UPI Circle with a monthly allowance of ${newMember.monthlyLimit} Rupees.`;
    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak(welcomeSpeech);
    }

    return true;
  }

  // --- Adjust Allowance Limit ---
  updateLimit(memberId, newLimit) {
    var member = this.members.find(m => m.id === memberId);
    if (!member) return;

    newLimit = parseInt(newLimit, 10);
    if (isNaN(newLimit) || newLimit < 100 || newLimit > 15000) {
      alert('Limit must be between ₹100 and ₹15,000 (NPCI limit).');
      return;
    }

    member.monthlyLimit = newLimit;
    this.saveState();
    this.renderAll();

    var speech = `Updated ${member.name}'s monthly allowance to ${newLimit} Rupees.`;
    if (window.EasyAudio) window.EasyAudio.speak(speech);
  }

  // --- Modals Management ---
  openTermsModal() {
    var m = document.getElementById('circleTermsModal');
    if (m) {
      m.classList.add('active');
      if (window.EasyAudio) window.EasyAudio.playClick();
    }
  }

  closeTermsModal() {
    var m = document.getElementById('circleTermsModal');
    if (m) {
      m.classList.remove('active');
      if (window.EasyAudio) window.EasyAudio.playClick();
    }
  }

  openAddMinorModal() {
    var m = document.getElementById('circleAddMinorModal');
    if (m) {
      m.classList.add('active');
      if (window.EasyAudio) window.EasyAudio.playClick();
    }
  }

  closeAddMinorModal() {
    var m = document.getElementById('circleAddMinorModal');
    if (m) {
      m.classList.remove('active');
      if (window.EasyAudio) window.EasyAudio.playClick();
    }
  }

  // --- Rendering UI on Standalone Web App and Phone Simulator ---
  renderAll() {
    this.renderStandaloneApp();
    this.renderPhoneSimulator();
  }

  renderStandaloneApp() {
    var gridEl = document.getElementById('appCircleGrid');
    var approvalBox = document.getElementById('appCircleApprovalBox');

    // 1. Pending Approvals
    if (approvalBox) {
      if (this.pendingRequests.length === 0) {
        approvalBox.style.display = 'none';
      } else {
        approvalBox.style.display = 'flex';
        var firstReq = this.pendingRequests[0];
        approvalBox.innerHTML = `
          <div class="circle-approval-left">
            <div class="circle-approval-avatar">${firstReq.avatar}</div>
            <div>
              <div class="circle-approval-title">🔔 Payment Request: ₹${firstReq.amount} from ${firstReq.name}</div>
              <div class="circle-approval-sub">${firstReq.merchant} · ${firstReq.category} (${firstReq.timestamp})</div>
            </div>
          </div>
          <div class="circle-approval-actions">
            <button class="btn-approve-req" onclick="window.EasyCircle.approveRequest('${firstReq.id}')">
              ✓ Approve & Pay
            </button>
            <button class="btn-reject-req" onclick="window.EasyCircle.rejectRequest('${firstReq.id}')">
              ✕ Decline
            </button>
          </div>
        `;
      }
    }

    // 2. Member Cards in Standalone App
    if (gridEl) {
      gridEl.innerHTML = '';

      this.members.forEach(m => {
        var pct = Math.min(100, Math.round((m.spentThisMonth / m.monthlyLimit) * 100));
        var rem = Math.max(0, m.monthlyLimit - m.spentThisMonth);
        var isNearLimit = pct >= 80;

        var card = document.createElement('div');
        card.className = `circle-member-card ${m.isFrozen ? 'frozen' : ''}`;
        card.innerHTML = `
          <div class="circle-card-top">
            <div class="circle-member-profile">
              <div class="circle-member-avatar">${m.avatar}</div>
              <div>
                <div class="circle-member-name">${m.name}</div>
                <div class="circle-member-meta">
                  <span>${m.relation}</span>
                  <span>•</span>
                  <span class="circle-age-pill">${m.age} Years (Minor)</span>
                </div>
              </div>
            </div>
            <span class="circle-mode-badge ${m.delegationMode === 'PRE_APPROVED' ? 'auto' : 'approval'}">
              ${m.delegationMode === 'PRE_APPROVED' ? '⚡ Pre-Approved &lt; ₹' + m.perTxLimit : '🛡️ Elder Approval'}
            </span>
          </div>

          <!-- Spending Allowance Gauge -->
          <div class="circle-gauge-box">
            <div class="circle-gauge-labels">
              <span>Monthly Allowance Spent</span>
              <span>${pct}% Used</span>
            </div>
            <div class="circle-gauge-bar-track">
              <div class="circle-gauge-bar-fill ${isNearLimit ? 'warning' : ''}" style="width: ${pct}%;"></div>
            </div>
            <div class="circle-gauge-footer">
              <div>
                <span class="circle-spent-amt">₹ ${m.spentThisMonth.toLocaleString('en-IN')}</span>
                <span class="circle-limit-cap"> / ₹ ${m.monthlyLimit.toLocaleString('en-IN')}</span>
              </div>
              <div style="font-size:12.5px; font-weight:700; color:var(--circle-accent);">
                ₹ ${rem.toLocaleString('en-IN')} Remaining
              </div>
            </div>
          </div>

          <!-- Recent Minor Spends snippet -->
          <div style="font-size:12px; font-weight:700; color:var(--text-muted); margin-bottom:6px;">
            Recent Spends:
          </div>
          <div class="circle-history-list">
            ${m.spends.length > 0 ? m.spends.slice(0, 2).map(s => `
              <div class="circle-history-item">
                <span>${s.merchant}</span>
                <span style="font-weight:800; color:var(--text-main);">₹ ${s.amount}</span>
              </div>
            `).join('') : '<div style="font-size:12px; color:var(--text-muted); font-style:italic;">No transactions yet this month.</div>'}
          </div>

          <!-- Action Buttons -->
          <div class="circle-card-actions">
            <button class="circle-btn-sub circle-btn-sim" onclick="window.EasyCircle.simulateMinorSpend('${m.id}')" title="Test minor purchasing lunch or book">
              ⚡ Test Spend
            </button>
            <button class="circle-btn-sub" onclick="window.EasyCircle.promptChangeLimit('${m.id}')">
              ✏️ Limit: ₹${m.monthlyLimit}
            </button>
            <button class="circle-btn-sub circle-btn-freeze" onclick="window.EasyCircle.toggleFreeze('${m.id}')" title="${m.isFrozen ? 'Unfreeze' : 'Freeze'} minor UPI">
              ${m.isFrozen ? '🔓 Unfreeze' : '❄️ Freeze'}
            </button>
          </div>
        `;
        gridEl.appendChild(card);
      });

      // Append "Add Minor to Circle" button card
      var addCard = document.createElement('div');
      addCard.className = 'circle-add-card';
      addCard.onclick = () => this.openAddMinorModal();
      addCard.innerHTML = `
        <div class="circle-add-icon-box">+</div>
        <div class="circle-add-title">Add Minor Family Member</div>
        <div class="circle-add-desc">Link grandson or daughter under 18 with delegated spending allowance</div>
      `;
      gridEl.appendChild(addCard);
    }
  }

  promptChangeLimit(memberId) {
    var member = this.members.find(m => m.id === memberId);
    if (!member) return;

    var newLimit = prompt(`Enter new monthly allowance limit for ${member.name} (Max ₹15,000 as per NPCI guidelines):`, member.monthlyLimit);
    if (newLimit !== null) {
      this.updateLimit(memberId, newLimit);
    }
  }

  renderPhoneSimulator() {
    var phoneListEl = document.getElementById('phoneCircleList');
    if (!phoneListEl) return;

    phoneListEl.innerHTML = '';

    this.members.forEach(m => {
      var pct = Math.min(100, Math.round((m.spentThisMonth / m.monthlyLimit) * 100));
      var rem = Math.max(0, m.monthlyLimit - m.spentThisMonth);

      var card = document.createElement('div');
      card.className = `phone-circle-card ${m.isFrozen ? 'frozen' : ''}`;
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:24px;">${m.avatar}</span>
            <div>
              <div style="font-size:14px; font-weight:800; color:var(--dlr900);">${m.name}</div>
              <div style="font-size:11px; color:var(--text2);">${m.relation} · Age ${m.age}</div>
            </div>
          </div>
          <span style="font-size:11px; font-weight:700; background:#EFF6FF; color:#1D4ED8; padding:2px 6px; border-radius:6px;">
            ${m.delegationMode === 'PRE_APPROVED' ? 'Pre-Approved' : 'Ask Elder'}
          </span>
        </div>

        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:8px 10px; margin-bottom:8px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; color:var(--text2); margin-bottom:4px;">
            <span>Spent ₹${m.spentThisMonth}</span>
            <span style="color:#059669;">₹${rem} Left</span>
          </div>
          <div style="height:8px; background:#E2E8F0; border-radius:4px; overflow:hidden;">
            <div style="height:100%; width:${pct}%; background:#0047E0; border-radius:4px;"></div>
          </div>
        </div>

        <button class="phone-circle-sim-btn" onclick="window.EasyCircle.simulateMinorSpend('${m.id}')">
          ⚡ Simulate Minor Spend (₹120)
        </button>
      `;
      phoneListEl.appendChild(card);
    });
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', function () {
  window.EasyCircle = new EasyUPICircleEngine();
  window.EasyCircle.renderAll();
});
