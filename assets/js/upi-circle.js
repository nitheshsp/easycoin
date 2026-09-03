/**
 * EasyCoin UPI Circle Engine (Delegated Payments for Minors)
 * Enables senior grandparents and parents to provide secure, limited UPI access
 * to minor family members under NPCI / RBI guidelines with Terms & Conditions.
 */
class EasyUPICircleEngine {
  constructor() {
    this.storageKey = 'easycoin_upi_circle_data';
    this.loadState();
    this.initToastElement();
  }

  loadState() {
    var saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        var parsed = JSON.parse(saved);
        if (parsed.members && parsed.members.length > 0) {
          this.members = parsed.members;
          this.pendingRequests = parsed.pendingRequests || [];
          return;
        }
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
        phone: '9811223344',
        avatar: '👦',
        vpa: 'aarav.3344@easycoin',
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
        phone: '9822334455',
        avatar: '👧',
        vpa: 'diya.4455@easycoin',
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

  // --- Accessible In-App Toast Notification ---
  initToastElement() {
    if (document.getElementById('circleToastNotice')) return;
    var toast = document.createElement('div');
    toast.id = 'circleToastNotice';
    toast.className = 'circle-toast';
    toast.innerHTML = `
      <span class="circle-toast-icon" id="circleToastIcon">🔔</span>
      <span id="circleToastMsg">Notification</span>
    `;
    document.body.appendChild(toast);
  }

  showToast(msg, icon) {
    this.initToastElement();
    var toast = document.getElementById('circleToastNotice');
    var msgEl = document.getElementById('circleToastMsg');
    var iconEl = document.getElementById('circleToastIcon');

    if (!toast || !msgEl) return;

    msgEl.textContent = msg;
    if (iconEl && icon) iconEl.textContent = icon;

    toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 3800);
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
      this.showToast(frozenMsg, '❄️');
      if (window.EasyAudio) window.EasyAudio.speak(frozenMsg);
      return;
    }

    var sampleSpends = [
      { merchant: 'School Book Stall', amount: 120, category: 'Books' },
      { merchant: 'School Canteen Lunch', amount: 65, category: 'Food' },
      { merchant: 'Bus Ticket Transit', amount: 40, category: 'Travel' },
      { merchant: 'Geometry Box & Pens', amount: 95, category: 'Stationery' },
      { merchant: 'Badminton Shuttlecocks', amount: 180, category: 'Sports' }
    ];

    var rem = member.monthlyLimit - member.spentThisMonth;

    if (rem <= 0) {
      var limitExceededMsg = `Monthly allowance limit reached for ${member.name}. Remaining allowance is ₹0.`;
      this.showToast(limitExceededMsg, '⚠️');
      if (window.EasyAudio) window.EasyAudio.speak(limitExceededMsg);
      return;
    }

    // Filter spends that fit or use smaller amount
    var eligibleSpends = sampleSpends.filter(s => s.amount <= rem);
    var spendToExecute = eligibleSpends.length > 0
      ? eligibleSpends[Math.floor(Math.random() * eligibleSpends.length)]
      : { merchant: 'Stationery Supplies', amount: rem, category: 'Stationery' };

    // If member requires approval for transactions above single tx limit
    if (member.delegationMode === 'APPROVAL_REQUIRED' && spendToExecute.amount > member.perTxLimit) {
      this.pendingRequests.unshift({
        id: 'req-' + Date.now(),
        memberId: member.id,
        name: member.name,
        avatar: member.avatar,
        amount: spendToExecute.amount,
        merchant: spendToExecute.merchant,
        category: spendToExecute.category,
        timestamp: 'Just now'
      });
      this.saveState();
      this.renderAll();

      var reqMsg = `Payment request received: ${member.name} requested ₹${spendToExecute.amount} for ${spendToExecute.merchant}.`;
      this.showToast('🔔 ' + reqMsg, '🔔');
      if (window.EasyAudio) {
        window.EasyAudio.playAlert();
        window.EasyAudio.speak(reqMsg + ' Please tap Approve to authorize.');
      }
      return;
    }

    // Auto-approve within allowance
    member.spentThisMonth += spendToExecute.amount;
    member.spends.unshift({
      merchant: spendToExecute.merchant,
      amount: spendToExecute.amount,
      time: 'Just now',
      category: spendToExecute.category
    });

    this.saveState();
    this.renderAll();

    // 1. Deduct from Standalone Banking Engine if on app.html
    if (window.EasyBanking) {
      var currentBal = window.EasyBanking.getBalance();
      window.EasyBanking.updateBalance(currentBal - spendToExecute.amount);
      window.EasyBanking.addPassbookEntry(
        `UPI Circle · ${member.name}`,
        'out',
        spendToExecute.amount,
        member.avatar,
        spendToExecute.merchant
      );
    }

    // 2. Deduct from Phone Simulator if on index.html
    if (window.EasyPhone) {
      window.EasyPhone.deductBalance(
        spendToExecute.amount,
        member.name + ' (Minor)',
        member.avatar,
        spendToExecute.merchant
      );
    }

    // 3. Add to Unified Transaction History with To Who, When, and Purpose
    if (window.EasyTransactions) {
      window.EasyTransactions.addTransaction(
        `${spendToExecute.merchant} (${member.name})`,
        'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        `${spendToExecute.category} · Minor Allowance Spend`,
        spendToExecute.amount,
        'out',
        'circle',
        member.avatar,
        member.name
      );
    }

    // Show non-blocking toast and trigger smooth spoken alert
    var remainingNow = member.monthlyLimit - member.spentThisMonth;
    var toastText = `Verified: ${member.name} paid ₹${spendToExecute.amount} at ${spendToExecute.merchant} (₹${remainingNow} left)`;
    this.showToast(toastText, '💳');

    var successSpeech = `UPI Circle Alert: ${member.relation} ${member.name} paid ${spendToExecute.amount} Rupees for ${spendToExecute.merchant}. Remaining monthly allowance is ${remainingNow} Rupees.`;
    
    if (window.EasyAudio) {
      window.EasyAudio.playCoinSound();
      window.EasyAudio.speak(successSpeech);
    }
  }

  // --- 1-Tap Freeze / Unfreeze Minor ---
  toggleFreeze(memberId) {
    var member = this.members.find(m => m.id === memberId);
    if (!member) return;

    member.isFrozen = !member.isFrozen;
    this.saveState();
    this.renderAll();

    var statusMsg = member.isFrozen
      ? `UPI access for ${member.relation} ${member.name} has been frozen. They cannot make purchases until you unfreeze.`
      : `UPI access for ${member.relation} ${member.name} has been restored and unfreezed.`;

    this.showToast(member.isFrozen ? `❄️ Frozen: ${member.name}'s card is locked` : `🔓 Unfrozen: ${member.name}'s card is active`, member.isFrozen ? '❄️' : '🔓');

    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak(statusMsg);
    }
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
        window.EasyBanking.updateBalance(currentBal - req.amount);
        window.EasyBanking.addPassbookEntry(
          `UPI Circle Approved · ${member.name}`,
          'out',
          req.amount,
          member.avatar,
          req.merchant
        );
      }

      if (window.EasyPhone) {
        window.EasyPhone.deductBalance(
          req.amount,
          member.name + ' (Approved)',
          member.avatar,
          req.merchant
        );
      }

      if (window.EasyTransactions) {
        window.EasyTransactions.addTransaction(
          `${req.merchant} (${member.name})`,
          'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          `${req.category} · Minor Request Approved`,
          req.amount,
          'out',
          'circle',
          member.avatar,
          member.name
        );
      }
    }

    this.pendingRequests.splice(idx, 1);
    this.saveState();
    this.renderAll();

    this.showToast(`Approved ₹${req.amount} for ${req.name}`, '✅');
    var speech = `Approved payment of ${req.amount} Rupees for ${req.name} at ${req.merchant}.`;
    if (window.EasyAudio) {
      window.EasyAudio.playCoinSound();
      window.EasyAudio.speak(speech);
    }
  }

  rejectRequest(requestId) {
    var idx = this.pendingRequests.findIndex(r => r.id === requestId);
    if (idx === -1) return;

    var req = this.pendingRequests[idx];
    this.pendingRequests.splice(idx, 1);
    this.saveState();
    this.renderAll();

    this.showToast(`Declined request of ₹${req.amount} from ${req.name}`, '✕');
    var speech = `Declined payment request from ${req.name}.`;
    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak(speech);
    }
  }

  // --- Add New Minor Member with Detailed Validation ---
  addMinorMember(name, relation, age, phone, monthlyLimit, perTxLimit, delegationMode, customAvatar) {
    if (!name || name.trim().length < 2) {
      alert('Please enter a valid minor full name.');
      return null;
    }

    if (!relation) {
      alert('Please select family relationship.');
      return null;
    }

    age = parseInt(age, 10);
    if (isNaN(age) || age < 5 || age >= 18) {
      alert('Age Requirement: In compliance with RBI & NPCI guidelines, UPI Circle minor delegation is exclusively for children between 5 and 17 years old. Individuals 18 or older must open an independent bank account.');
      return null;
    }

    monthlyLimit = parseInt(monthlyLimit, 10) || 2000;
    if (monthlyLimit < 100 || monthlyLimit > 15000) {
      alert('Limit Error: Monthly spending allowance must be between ₹100 and ₹15,000 (NPCI regulatory maximum).');
      return null;
    }

    perTxLimit = parseInt(perTxLimit, 10) || Math.min(500, monthlyLimit);
    if (perTxLimit < 50 || perTxLimit > monthlyLimit || perTxLimit > 5000) {
      alert(`Per-Transaction Limit: Must be between ₹50 and ₹${Math.min(5000, monthlyLimit)}.`);
      return null;
    }

    // Clean phone number
    var cleanPhone = (phone || '').replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length !== 10) {
      alert('Please enter a valid 10-digit mobile number for the minor or leave blank.');
      return null;
    }
    if (!cleanPhone) {
      cleanPhone = '98' + Math.floor(10000000 + Math.random() * 90000000);
    }

    var last4 = cleanPhone.slice(-4);
    var cleanVpa = name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.' + last4 + '@easycoin';

    var avatar = customAvatar;
    if (!avatar) {
      if (relation.toLowerCase().includes('daughter') || relation.toLowerCase().includes('granddaughter') || relation.toLowerCase().includes('niece')) {
        avatar = age < 12 ? '👧' : '🧑';
      } else {
        avatar = age < 12 ? '👦' : '🧑';
      }
    }

    var newMember = {
      id: 'minor-' + Date.now(),
      name: name.trim(),
      relation: relation.trim(),
      age: age,
      phone: cleanPhone,
      avatar: avatar,
      vpa: cleanVpa,
      monthlyLimit: monthlyLimit,
      spentThisMonth: 0,
      perTxLimit: perTxLimit,
      delegationMode: delegationMode || 'PRE_APPROVED',
      isFrozen: false,
      spends: []
    };

    this.members.push(newMember);
    this.saveState();
    this.renderAll();

    return newMember;
  }

  // --- Show In-Modal Success Screen with Done Button ---
  showSuccessConfirmation(member) {
    // Find all modal bodies (in app.html and index.html)
    var modalBodies = document.querySelectorAll('#circleAddMinorModal .circle-modal-body');
    modalBodies.forEach(body => {
      body.innerHTML = `
        <div class="circle-success-screen">
          <div class="circle-success-badge">✓</div>
          <div class="circle-success-title">Minor Linked Successfully!</div>
          <div class="circle-success-sub">
            ${member.relation} <b>${member.name}</b> is now connected to your Family UPI Circle with safe parental oversight.
          </div>

          <!-- Summary Grid -->
          <div class="circle-summary-grid">
            <div class="circle-summary-row">
              <span class="circle-summary-lbl">Member Profile:</span>
              <span class="circle-summary-val">${member.avatar} ${member.name} (${member.relation} · Age ${member.age})</span>
            </div>
            <div class="circle-summary-row">
              <span class="circle-summary-lbl">UPI ID (VPA):</span>
              <span class="circle-summary-val" style="font-family:monospace; color:#0047E0;">${member.vpa}</span>
            </div>
            <div class="circle-summary-row">
              <span class="circle-summary-lbl">Monthly Allowance:</span>
              <span class="circle-summary-val" style="color:#059669;">₹ ${member.monthlyLimit.toLocaleString('en-IN')} / month</span>
            </div>
            <div class="circle-summary-row">
              <span class="circle-summary-lbl">Per-Spend Cap:</span>
              <span class="circle-summary-val">₹ ${member.perTxLimit.toLocaleString('en-IN')} per transaction</span>
            </div>
            <div class="circle-summary-row">
              <span class="circle-summary-lbl">Delegation Mode:</span>
              <span class="circle-summary-val">${member.delegationMode === 'PRE_APPROVED' ? '⚡ Pre-Approved (< ₹' + member.perTxLimit + ')' : '🛡️ Elder 1-Tap Approval'}</span>
            </div>
            <div class="circle-summary-row">
              <span class="circle-summary-lbl">Safety Filter:</span>
              <span class="circle-summary-val" style="color:#059669;">🛡️ Anti-Gambling & Adult Merchant Block Active</span>
            </div>
          </div>

          <!-- Large Accessible Done Button -->
          <button class="btn-circle-done" onclick="window.EasyCircle.completeAddMinorFlow('${member.id}')">
            <span>✓ Done &amp; View Circle</span>
          </button>
        </div>
      `;
    });

    if (window.EasyAudio) {
      window.EasyAudio.playCoinSound();
      window.EasyAudio.speak(`Done! ${member.relation} ${member.name} has been added with a monthly allowance of ${member.monthlyLimit} Rupees.`);
    }
  }

  // Completes the flow upon clicking Done button
  completeAddMinorFlow(newMemberId) {
    this.closeAddMinorModal();
    this.renderAll();

    // Reset form HTML in modal so it is fresh next time
    this.resetAddMinorModalForm();

    // Smoothly scroll and highlight new card if on app.html
    var cards = document.querySelectorAll('.circle-member-card');
    if (cards.length > 0) {
      var lastCard = cards[cards.length - 1];
      lastCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      lastCard.classList.add('just-added');
      setTimeout(() => lastCard.classList.remove('just-added'), 2500);
    }

    this.showToast('✓ Family Circle updated with new minor', '👨‍👩‍👧‍👦');
  }

  resetAddMinorModalForm() {
    var modalBodies = document.querySelectorAll('#circleAddMinorModal .circle-modal-body');
    modalBodies.forEach(body => {
      body.innerHTML = this.getAddMinorFormHTML();
    });
  }

  getAddMinorFormHTML() {
    return `
      <form id="addMinorForm" onsubmit="window.EasyCircle.handleFormSubmit(event)">
        <div class="circle-form-group">
          <label class="circle-form-label">Minor's Full Name</label>
          <input type="text" id="mName" class="circle-form-input" placeholder="e.g. Aarav Chandra" required autocomplete="off">
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="circle-form-group">
            <label class="circle-form-label">Relationship</label>
            <select id="mRel" class="circle-form-select" required>
              <option value="Grandson">Grandson</option>
              <option value="Granddaughter">Granddaughter</option>
              <option value="Son">Son</option>
              <option value="Daughter">Daughter</option>
              <option value="Ward">Ward / Nephew / Niece</option>
            </select>
          </div>

          <div class="circle-form-group">
            <label class="circle-form-label">Age (5 - 17 Years)</label>
            <input type="number" id="mAge" class="circle-form-input" min="5" max="17" placeholder="e.g. 14" required>
          </div>
        </div>

        <div class="circle-form-group">
          <label class="circle-form-label">Minor's Mobile Number (Optional)</label>
          <input type="tel" id="mPhone" class="circle-form-input" maxlength="10" placeholder="e.g. 9811223344">
          <span style="font-size:11.5px; color:var(--text-muted); display:block; margin-top:3px;">
            Used to assign a delegated UPI ID (e.g. name.last4@easycoin)
          </span>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="circle-form-group">
            <label class="circle-form-label">Monthly Limit (₹)</label>
            <input type="number" id="mLimit" class="circle-form-input" min="100" max="15000" placeholder="e.g. 2000" value="2000" required>
          </div>

          <div class="circle-form-group">
            <label class="circle-form-label">Per-Spend Cap (₹)</label>
            <input type="number" id="mPerTx" class="circle-form-input" min="50" max="5000" placeholder="e.g. 500" value="500" required>
          </div>
        </div>

        <div class="circle-form-group">
          <label class="circle-form-label">Delegation Control Mode</label>
          <select id="mMode" class="circle-form-select">
            <option value="PRE_APPROVED">⚡ Pre-Approved Allowance (Auto-approve up to spend cap)</option>
            <option value="APPROVAL_REQUIRED">🛡️ Ask Elder (Require my 1-tap approval for each spend)</option>
          </select>
        </div>

        <div class="circle-form-checkbox-row">
          <input type="checkbox" id="mTcCheck" required checked>
          <label for="mTcCheck" style="font-size:13px; color:var(--text-main); cursor:pointer;">
            I certify this minor is under 18 years and accept the <a href="javascript:void(0)" onclick="window.EasyCircle.openTermsModal()" style="color:var(--circle-primary); font-weight:700;">NPCI UPI Circle Terms &amp; Conditions</a>.
          </label>
        </div>

        <!-- Submit & Done Button Row -->
        <div style="margin-top:20px; display:flex; justify-content:flex-end; gap:10px;">
          <button type="button" class="ctrl-btn" onclick="window.EasyCircle.closeAddMinorModal()">Cancel</button>
          <button type="submit" class="btn-circle-done" style="width:auto; padding:11px 24px;">
            <span>✓ Done · Add Minor to Circle</span>
          </button>
        </div>
      </form>
    `;
  }

  handleFormSubmit(event) {
    event.preventDefault();

    var name = document.getElementById('mName') ? document.getElementById('mName').value : '';
    var rel = document.getElementById('mRel') ? document.getElementById('mRel').value : '';
    var age = document.getElementById('mAge') ? document.getElementById('mAge').value : '';
    var phone = document.getElementById('mPhone') ? document.getElementById('mPhone').value : '';
    var limit = document.getElementById('mLimit') ? document.getElementById('mLimit').value : '';
    var perTx = document.getElementById('mPerTx') ? document.getElementById('mPerTx').value : '';
    var mode = document.getElementById('mMode') ? document.getElementById('mMode').value : 'PRE_APPROVED';
    var tcCheck = document.getElementById('mTcCheck');

    if (!tcCheck || !tcCheck.checked) {
      alert('Please agree to the NPCI Terms & Conditions to enable delegated access.');
      return;
    }

    var member = this.addMinorMember(name, rel, age, phone, limit, perTx, mode);
    if (member) {
      this.showSuccessConfirmation(member);
    }
  }

  // --- Adjust Allowance Limit Sanitized ---
  updateLimit(memberId, newLimit) {
    var member = this.members.find(m => m.id === memberId);
    if (!member) return;

    if (typeof newLimit === 'string') {
      newLimit = newLimit.replace(/[^0-9]/g, '');
    }

    newLimit = parseInt(newLimit, 10);
    if (isNaN(newLimit) || newLimit < 100 || newLimit > 15000) {
      alert('Allowance Limit must be between ₹100 and ₹15,000 as per NPCI rules.');
      return;
    }

    member.monthlyLimit = newLimit;
    if (member.perTxLimit > newLimit) {
      member.perTxLimit = newLimit;
    }

    this.saveState();
    this.renderAll();

    this.showToast(`Updated limit for ${member.name}: ₹${newLimit}`, '✏️');
    var speech = `Updated ${member.name}'s monthly allowance to ${newLimit} Rupees.`;
    if (window.EasyAudio) window.EasyAudio.speak(speech);
  }

  promptChangeLimit(memberId) {
    var member = this.members.find(m => m.id === memberId);
    if (!member) return;

    var input = prompt(`Enter new monthly allowance limit for ${member.name} (Max ₹15,000 as per NPCI guidelines):`, member.monthlyLimit);
    if (input !== null) {
      this.updateLimit(memberId, input);
    }
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
    this.resetAddMinorModalForm();
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
        card.id = `card-${m.id}`;
        card.innerHTML = `
          <div class="circle-card-top">
            <div class="circle-member-profile">
              <div class="circle-member-avatar">${m.avatar}</div>
              <div>
                <div class="circle-member-name">${m.name}</div>
                <div class="circle-member-meta">
                  <span>${m.relation}</span>
                  <span>•</span>
                  <span class="circle-age-pill">${m.age} Yrs (Minor)</span>
                  <span>•</span>
                  <span style="font-family:monospace; font-size:11px; color:var(--text-muted);">${m.vpa}</span>
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
        <div class="circle-add-desc">Link child or grandchild under 18 with delegated spending allowance</div>
      `;
      gridEl.appendChild(addCard);
    }
  }

  renderPhoneSimulator() {
    var phoneListEl = document.getElementById('phoneCircleList');
    if (!phoneListEl) return;

    phoneListEl.innerHTML = '';

    this.members.forEach(m => {
      var pct = Math.min(100, Math.round((m.spentThisMonth / m.monthlyLimit) * 100));
      var rem = Math.max(0, m.monthlyLimit - m.spentThisMonth);
      var simAmt = Math.min(120, rem > 0 ? rem : 0);

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

        <div style="display:flex; gap:6px;">
          <button class="phone-circle-sim-btn" style="flex:1;" onclick="window.EasyCircle.simulateMinorSpend('${m.id}')">
            ${rem > 0 ? `⚡ Test Spend (₹${simAmt})` : '⚠️ Cap Reached (₹0)'}
          </button>
          <button class="phone-circle-sim-btn" style="width:auto; padding:10px 12px; background:${m.isFrozen ? '#059669' : '#EF4444'};" onclick="window.EasyCircle.toggleFreeze('${m.id}')" title="${m.isFrozen ? 'Unfreeze' : 'Freeze'}">
            ${m.isFrozen ? '🔓' : '❄️'}
          </button>
        </div>
      `;
      phoneListEl.appendChild(card);
    });

    // Add Minor button inside Phone Simulator
    var phoneAddBtn = document.createElement('button');
    phoneAddBtn.className = 'phone-circle-sim-btn';
    phoneAddBtn.style.background = 'rgba(0, 71, 224, 0.08)';
    phoneAddBtn.style.color = '#0047E0';
    phoneAddBtn.style.border = '1.5px dashed rgba(0, 71, 224, 0.3)';
    phoneAddBtn.style.marginTop = '10px';
    phoneAddBtn.innerHTML = '➕ Add Minor to Circle';
    phoneAddBtn.onclick = () => this.openAddMinorModal();
    phoneListEl.appendChild(phoneAddBtn);
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', function () {
  window.EasyCircle = new EasyUPICircleEngine();
  window.EasyCircle.renderAll();
});
