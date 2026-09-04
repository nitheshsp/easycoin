/**
 * EasyCoin Standalone Web App Banking Engine
 * Powers full-screen accessible digital payments, voice assistance, and tactile keypad interactions.
 */
(function () {
  'use strict';

  var currentUser = null;
  try {
    var sessionRaw = localStorage.getItem('easycoin_user_session');
    if (sessionRaw) currentUser = JSON.parse(sessionRaw);
  } catch (e) {}

  if (!currentUser) {
    currentUser = {
      name: 'Harish Chandra',
      age: 78,
      phone: '9876543210',
      avatar: '👴',
      balance: 14250,
      guardianName: 'Daughter Ananya',
      guardianPhone: '+91 98765 43210'
    };
  }

  var appBalance = (typeof currentUser.balance === 'number') ? currentUser.balance : 14250;
  var enteredAmount = '';
  var activeRecipient = { name: 'Son Rahul', avatar: '👨‍🦱', rel: 'Son' };

  var transactions = [
    { id: 1, name: 'Son Rahul', type: 'out', amount: 500, time: 'Today, 2:15 PM', icon: '👨‍🦱', desc: 'Family Allowance' },
    { id: 2, name: 'Pension Deposit', type: 'in', amount: 8000, time: 'Yesterday, 10:00 AM', icon: '🏛️', desc: 'Senior Citizen Pension' },
    { id: 3, name: 'Lakshmi Grocery', type: 'out', amount: 340, time: '2 Mar 2026', icon: '🏪', desc: 'Daily Essentials' },
    { id: 4, name: 'Daughter Ananya', type: 'in', amount: 2000, time: '28 Feb 2026', icon: '👩‍⚕️', desc: 'Gift' }
  ];

  function initStandaloneApp() {
    var balEl = document.getElementById('standaloneBal');
    var speakBalBtn = document.getElementById('speakBalBtn');
    var payModal = document.getElementById('payModal');
    var closeModalBtn = document.getElementById('closeModalBtn');
    var dockMicBtn = document.getElementById('dockMicBtn');
    var dockStatus = document.getElementById('dockStatus');

    function syncBalanceUI() {
      if (balEl) balEl.textContent = '₹ ' + appBalance.toLocaleString('en-IN');
      var sideBal = document.getElementById('sidebarBalVal');
      if (sideBal) sideBal.textContent = '₹ ' + appBalance.toLocaleString('en-IN');
      var pbBal = document.getElementById('pbStatBalance');
      if (pbBal) pbBal.textContent = '₹ ' + appBalance.toLocaleString('en-IN');

      // Persist balance changes to user session
      currentUser.balance = appBalance;
      localStorage.setItem('easycoin_user_session', JSON.stringify(currentUser));
      if (window.EasyGuard && window.EasyGuard.setCurrentUser) {
        window.EasyGuard.setCurrentUser(currentUser);
      }
    }
    syncBalanceUI();

    function syncPersonalizedUI() {
      var sideAv = document.getElementById('sidebarUserAvatar');
      var sideName = document.getElementById('sidebarUserName');
      var sideStatus = document.getElementById('sidebarUserStatus');
      if (sideAv) sideAv.textContent = currentUser.avatar || '👴';
      if (sideName) sideName.textContent = currentUser.name;
      if (sideStatus) sideStatus.textContent = '● Age ' + (currentUser.age || 70) + ' · ' + (currentUser.phone || '');

      var sosDesc = document.getElementById('sosGuardianDesc');
      var sosTitle = document.getElementById('sosGuardianTileTitle');
      var sosSub = document.getElementById('sosGuardianTileSub');
      if (sosDesc && currentUser.guardianName) {
        sosDesc.textContent = 'Received a suspicious call or suspect fraud? 1-Tap instantly locks your account and alerts ' + currentUser.guardianName + ' with live GPS coordinates.';
      }
      if (sosTitle && currentUser.guardianName) {
        sosTitle.textContent = 'Call ' + currentUser.guardianName;
      }
      if (sosSub && currentUser.guardianPhone) {
        sosSub.textContent = 'Primary Guardian (' + currentUser.guardianPhone + ')';
      }
    }
    syncPersonalizedUI();

    // Balance voice readout
    if (speakBalBtn) {
      speakBalBtn.addEventListener('click', function () {
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Your current balance is ' + appBalance.toLocaleString('en-IN') + ' Rupees. Your money is completely safe with EasyCoin.');
        }
      });
    }

    // Action Tiles
    var tileSend = document.getElementById('tileSend');
    var tileReceive = document.getElementById('tileReceive');
    var tileBills = document.getElementById('tileBills');
    var tilePassbook = document.getElementById('tilePassbook');

    if (tileSend) {
      tileSend.addEventListener('click', function () {
        openPayModal('Son Rahul', '👨‍🦱', 'Son');
      });
    }

    var qrModal = document.getElementById('qrModal');
    var closeQrModalBtn = document.getElementById('closeQrModalBtn');

    function startAppCamera() {
      var videoEl = document.getElementById('appCameraVideo');
      var badgeEl = document.getElementById('appCameraBadgeText');
      var fallbackMsg = document.getElementById('appCameraFallbackMsg');
      if (videoEl && window.EasyQR) {
        if (fallbackMsg) fallbackMsg.style.display = 'none';
        window.EasyQR.startCamera(videoEl, badgeEl, onAppQrDetected).then(function (stream) {
          if (!stream && fallbackMsg) {
            fallbackMsg.style.display = 'flex';
          }
        });
      }
    }

    function stopAppCamera() {
      if (window.EasyQR) {
        window.EasyQR.stopCamera();
      }
    }

    function onAppQrDetected(payload) {
      if (!payload) return;
      var parsed = window.EasyQR ? window.EasyQR.parseQRPayload(payload) : { name: 'Lakshmi Grocery Store', amt: 120, avatar: '🏪' };
      stopAppCamera();
      if (qrModal) qrModal.classList.remove('active');

      if (window.EasyAudio) {
        window.EasyAudio.playCoinSound();
        window.EasyAudio.speak('QR scanned for ' + parsed.name + '. Amount is ' + parsed.amt + ' Rupees. Tap Confirm to pay.');
      }
      if (window.showEasyToast) {
        window.showEasyToast('📷 Scanned: ' + parsed.name + ' (₹' + parsed.amt + ')', 'success', '📷');
      }

      openPayModal(parsed.name, parsed.avatar, 'Merchant QR');
      enteredAmount = String(parsed.amt);
      updateModalAmount();
    }

    if (tileReceive) {
      tileReceive.addEventListener('click', function () {
        renderAppQR();
        if (qrModal) qrModal.classList.add('active');
        if (appQrTabScanBtn && appQrTabScanBtn.classList.contains('active')) {
          startAppCamera();
        }
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Scan merchant QR code with camera, or show your receive QR.');
        }
      });
    }

    if (closeQrModalBtn && qrModal) {
      closeQrModalBtn.addEventListener('click', function () {
        stopAppCamera();
        qrModal.classList.remove('active');
        if (window.EasyAudio) window.EasyAudio.playClick();
      });
      qrModal.addEventListener('click', function (e) {
        if (e.target === qrModal) {
          stopAppCamera();
          qrModal.classList.remove('active');
          if (window.EasyAudio) window.EasyAudio.playClick();
        }
      });
    }

    function renderAppQR() {
      var appQrBox = document.getElementById('appQrCodeContainer');
      if (appQrBox && window.EasyQR) {
        appQrBox.innerHTML = window.EasyQR.generateQRCodeSVG('upi://pay?pa=harish.chandra@easycoin&pn=Harish%20Chandra', 200);
      }
    }
    renderAppQR();

    // Standalone QR Tabs (Defined Tabs)
    var appQrTabScanBtn = document.getElementById('appQrTabScanBtn');
    var appQrTabReceiveBtn = document.getElementById('appQrTabReceiveBtn');
    var appQrScanView = document.getElementById('appQrScanView');
    var appQrReceiveView = document.getElementById('appQrReceiveView');

    if (appQrTabScanBtn && appQrTabReceiveBtn) {
      appQrTabScanBtn.addEventListener('click', function () {
        appQrTabScanBtn.classList.add('active');
        appQrTabScanBtn.setAttribute('aria-selected', 'true');
        appQrTabReceiveBtn.classList.remove('active');
        appQrTabReceiveBtn.setAttribute('aria-selected', 'false');
        if (appQrScanView) appQrScanView.style.display = 'block';
        if (appQrReceiveView) appQrReceiveView.style.display = 'none';
        startAppCamera();
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Camera scanner active.');
        }
      });

      appQrTabReceiveBtn.addEventListener('click', function () {
        appQrTabReceiveBtn.classList.add('active');
        appQrTabReceiveBtn.setAttribute('aria-selected', 'true');
        appQrTabScanBtn.classList.remove('active');
        appQrTabScanBtn.setAttribute('aria-selected', 'false');
        if (appQrScanView) appQrScanView.style.display = 'none';
        if (appQrReceiveView) appQrReceiveView.style.display = 'block';
        stopAppCamera();
        renderAppQR();
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Your personal receive QR code is ready on screen.');
        }
      });
    }

    // Camera toolbar controls
    var appSnapScanBtn = document.getElementById('appSnapScanBtn');
    if (appSnapScanBtn) {
      appSnapScanBtn.addEventListener('click', async function () {
        var videoEl = document.getElementById('appCameraVideo');
        if (window.EasyAudio) window.EasyAudio.playClick();
        if (window.EasyQR) {
          var found = await window.EasyQR.scanVideoFrame(videoEl, onAppQrDetected);
          if (!found) {
            onAppQrDetected('upi://pay?pa=lakshmigrocery@upi&pn=Lakshmi%20Grocery%20Store&am=120');
          }
        }
      });
    }

    var appFlipCameraBtn = document.getElementById('appFlipCameraBtn');
    if (appFlipCameraBtn) {
      appFlipCameraBtn.addEventListener('click', function () {
        var videoEl = document.getElementById('appCameraVideo');
        var badgeEl = document.getElementById('appCameraBadgeText');
        if (window.EasyAudio) window.EasyAudio.playClick();
        if (window.EasyQR) {
          window.EasyQR.flipCamera(videoEl, badgeEl, onAppQrDetected);
        }
      });
    }

    var appTorchBtn = document.getElementById('appTorchBtn');
    if (appTorchBtn) {
      appTorchBtn.addEventListener('click', async function () {
        if (window.EasyAudio) window.EasyAudio.playClick();
        if (window.EasyQR) {
          var on = await window.EasyQR.toggleTorch();
          if (window.showEasyToast) {
            window.showEasyToast(on ? '💡 Light turned ON' : '💡 Light turned OFF', 'info', '💡');
          }
        }
      });
    }

    var appUploadQrBtn = document.getElementById('appUploadQrBtn');
    var appQrFileInput = document.getElementById('appQrFileInput');
    if (appUploadQrBtn && appQrFileInput) {
      appUploadQrBtn.addEventListener('click', function () {
        appQrFileInput.click();
      });
      appQrFileInput.addEventListener('change', function (e) {
        var file = e.target.files && e.target.files[0];
        if (file && window.EasyQR) {
          window.EasyQR.scanImageFile(file, onAppQrDetected);
        }
      });
    }

    // Standalone sample scan clicks
    var scanSamples = document.querySelectorAll('.app-scan-sample');
    scanSamples.forEach(function (sample) {
      sample.addEventListener('click', function () {
        var name = this.getAttribute('data-name');
        var amt = this.getAttribute('data-amt');
        var av = this.getAttribute('data-avatar') || '🏪';

        stopAppCamera();
        if (qrModal) qrModal.classList.remove('active');
        openPayModal(name, av, 'Merchant QR');
        enteredAmount = amt;
        updateModalAmount();

        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('QR scanned for ' + name + '. Amount is ' + amt + ' Rupees. Tap Confirm to pay.');
        }
        if (window.showEasyToast) {
          window.showEasyToast('📷 Scanned: ' + name + ' (₹' + amt + ')', 'success', '📷');
        }
      });
    });

    if (tileBills) {
      tileBills.addEventListener('click', function () {
        var billsSec = document.getElementById('billsSection');
        if (billsSec) {
          billsSec.scrollIntoView({ behavior: 'smooth' });
        }
        if (window.EasyBills) {
          window.EasyBills.renderAll();
          window.EasyBills.speakBillSummary();
        }
      });
    }

    if (tilePassbook) {
      tilePassbook.addEventListener('click', function () {
        var pbSection = document.getElementById('passbookSection');
        if (pbSection) {
          pbSection.scrollIntoView({ behavior: 'smooth' });
          if (window.EasyAudio) {
            window.EasyAudio.playClick();
            window.EasyAudio.speak('Here are your recent transactions.');
          }
        }
      });
    }

    // Contact avatar clicks
    var contactItems = document.querySelectorAll('.app-contact-item');
    contactItems.forEach(function (item) {
      item.addEventListener('click', function () {
        var name = this.getAttribute('data-name');
        var rel = this.getAttribute('data-rel');
        var av = this.querySelector('.app-contact-avatar').textContent.trim();
        openPayModal(name, av, rel);
      });
    });

    var activePurpose = 'Family Allowance';

    function openPayModal(name, avatar, rel) {
      activeRecipient = { name: name, avatar: avatar, rel: rel };
      var modalName = document.getElementById('modalRecName');
      var modalAv = document.getElementById('modalRecAv');
      var modalRel = document.getElementById('modalRecRel');
      if (modalName) modalName.textContent = name;
      if (modalAv) modalAv.textContent = avatar;
      if (modalRel) modalRel.textContent = (rel || 'Contact') + ' · Verified 🛡️';

      // Update active contact chip
      var chips = document.querySelectorAll('.spend-contact-chip');
      chips.forEach(function(c) {
        if (c.getAttribute('data-name') === name) c.classList.add('active');
        else c.classList.remove('active');
      });

      enteredAmount = '';
      var spendInput = document.getElementById('spendAmountInput');
      if (spendInput) {
        spendInput.value = '';
        setTimeout(function() { spendInput.focus(); }, 150);
      }
      updateModalAmount();

      if (payModal) payModal.classList.add('active');
      if (window.EasyAudio) {
        window.EasyAudio.playClick();
        window.EasyAudio.speak('Spending money to ' + name + '. Type amount using your laptop keyboard, phone keypad, or tap the numbers below.');
      }
    }

    if (closeModalBtn && payModal) {
      closeModalBtn.addEventListener('click', function () {
        payModal.classList.remove('active');
        if (window.EasyAudio) window.EasyAudio.playClick();
      });
    }

    // Direct Native Keyboard Input on Phone / Laptop
    var spendInput = document.getElementById('spendAmountInput');
    if (spendInput) {
      spendInput.addEventListener('input', function () {
        var clean = this.value.replace(/\D/g, '');
        if (clean.length > 7) clean = clean.slice(0, 7);
        enteredAmount = clean;
        this.value = clean;
        updateModalAmount();
        if (window.EasyAudio && clean.length > 0) {
          window.EasyAudio.playKeyTap(clean.slice(-1));
        }
      });

      spendInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          var confirmBtn = document.getElementById('confirmPayBtn');
          if (confirmBtn && !confirmBtn.disabled) confirmBtn.click();
        } else if (e.key === 'Escape') {
          if (payModal) payModal.classList.remove('active');
        }
      });
    }

    // Modern Spacious Phone Dial Keypad Buttons
    var dialKeys = document.querySelectorAll('.dial-key-btn, .m-key-btn');
    dialKeys.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var val = this.getAttribute('data-val');
        if (val === 'clear') {
          enteredAmount = '';
          if (window.EasyAudio) window.EasyAudio.playClick();
        } else if (val === 'backspace') {
          enteredAmount = enteredAmount.slice(0, -1);
          if (window.EasyAudio) window.EasyAudio.playClick();
        } else if (val === 'voice') {
          triggerVoiceInput();
          return;
        } else if (/^\d$/.test(val)) {
          if (enteredAmount.length < 7) {
            enteredAmount += val;
            if (window.EasyAudio) window.EasyAudio.playKeyTap(val);
          }
        }
        if (spendInput) {
          spendInput.value = enteredAmount;
          spendInput.focus();
        }
        updateModalAmount();
      });
    });

    // Global Physical Keyboard Listener for Laptop / Desktop Users
    window.addEventListener('keydown', function (e) {
      if (!payModal || !payModal.classList.contains('active')) return;
      if (e.target && e.target.id === 'spendNoteInput') return; // Don't intercept note writing

      if (/^[0-9]$/.test(e.key)) {
        if (document.activeElement !== spendInput) {
          if (enteredAmount.length < 7) {
            enteredAmount += e.key;
            if (spendInput) spendInput.value = enteredAmount;
            updateModalAmount();
            if (window.EasyAudio) window.EasyAudio.playKeyTap(e.key);
          }
        }
      } else if (e.key === 'Backspace') {
        if (document.activeElement !== spendInput) {
          enteredAmount = enteredAmount.slice(0, -1);
          if (spendInput) spendInput.value = enteredAmount;
          updateModalAmount();
          if (window.EasyAudio) window.EasyAudio.playClick();
        }
      } else if (e.key === 'Enter') {
        var confirmBtn = document.getElementById('confirmPayBtn');
        if (confirmBtn && !confirmBtn.disabled) {
          confirmBtn.click();
        }
      } else if (e.key === 'Escape') {
        payModal.classList.remove('active');
      }
    });

    function updateModalAmount() {
      var spendInput = document.getElementById('spendAmountInput');
      var amtEl = document.getElementById('modalAmountVal');
      var wordsEl = document.getElementById('modalAmountWords');
      var coinEl = document.getElementById('spendCoinPreview');
      var projectedBalEl = document.getElementById('spendProjectedBal');
      var safetyBadgeEl = document.getElementById('spendSafetyBadge');
      var confirmBtn = document.getElementById('confirmPayBtn');
      var confirmBtnText = document.getElementById('confirmPayBtnText');

      var num = parseInt(enteredAmount, 10) || 0;

      if (spendInput && document.activeElement !== spendInput) {
        spendInput.value = enteredAmount || '';
      }
      if (amtEl) amtEl.textContent = '₹ ' + (num > 0 ? num.toLocaleString('en-IN') : '0');
      if (wordsEl) {
        wordsEl.textContent = num > 0 ? num.toLocaleString('en-IN') + ' Rupees' : 'Type on keyboard or use keypad below';
      }

      // Coin preview
      if (coinEl) {
        if (num === 0) {
          coinEl.textContent = '🪙 0 Coins';
        } else {
          var gold = Math.floor(num / 1000);
          var silver = Math.floor((num % 1000) / 100);
          var parts = [];
          if (gold > 0) parts.push(gold + ' Gold Coin' + (gold > 1 ? 's' : ''));
          if (silver > 0) parts.push(silver + ' Silver Coin' + (silver > 1 ? 's' : ''));
          coinEl.textContent = '🪙 ' + (parts.length > 0 ? parts.join(' + ') : '1 Silver Coin');
        }
      }

      // Projected remaining balance
      if (projectedBalEl) {
        var rem = appBalance - num;
        if (rem < 0) {
          projectedBalEl.textContent = 'Insufficient! Short by ₹ ' + Math.abs(rem).toLocaleString('en-IN');
          projectedBalEl.style.color = '#DC2626';
        } else {
          projectedBalEl.textContent = '₹ ' + rem.toLocaleString('en-IN');
          projectedBalEl.style.color = '#003DD1';
        }
      }

      // Safety Badge
      if (safetyBadgeEl) {
        if (num > 2000) {
          safetyBadgeEl.className = 'spend-warn-badge';
          safetyBadgeEl.textContent = '🛡️ High Value (>₹2,000) · Alerting Guardian';
        } else {
          safetyBadgeEl.className = 'spend-safe-badge';
          safetyBadgeEl.textContent = '🛡️ Safe Contact Transfer';
        }
      }

      // Confirm Button
      if (confirmBtnText) {
        if (num > 0) {
          confirmBtnText.textContent = '✓ Confirm & Spend ₹ ' + num.toLocaleString('en-IN') + ' to ' + (activeRecipient.name || 'Contact');
        } else {
          confirmBtnText.textContent = 'Enter Amount to Spend →';
        }
      }
      if (confirmBtn) {
        confirmBtn.disabled = num <= 0 || num > appBalance;
      }
    }

    // Expose EasyBanking UI Controllers
    window.EasyBanking = {
      openSpendModal: function(name, avatar, rel) {
        openPayModal(name || 'Son Rahul', avatar || '👨‍🦱', rel || 'Family · Son');
      },
      selectRecipient: function(name, avatar, rel) {
        activeRecipient = { name: name, avatar: avatar, rel: rel };
        var modalName = document.getElementById('modalRecName');
        var modalAv = document.getElementById('modalRecAv');
        var modalRel = document.getElementById('modalRecRel');
        if (modalName) modalName.textContent = name;
        if (modalAv) modalAv.textContent = avatar;
        if (modalRel) modalRel.textContent = (rel || 'Contact') + ' · Verified 🛡️';

        var chips = document.querySelectorAll('.spend-contact-chip');
        chips.forEach(function(c) {
          if (c.getAttribute('data-name') === name) c.classList.add('active');
          else c.classList.remove('active');
        });

        updateModalAmount();
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Selected ' + name + '.');
        }
      },
      addAmountPreset: function(delta) {
        var current = parseInt(enteredAmount, 10) || 0;
        var newAmt = current + delta;
        if (newAmt <= appBalance) {
          enteredAmount = String(newAmt);
        } else {
          enteredAmount = String(appBalance);
        }
        updateModalAmount();
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak(newAmt + ' Rupees.');
        }
      },
      clearAmount: function() {
        enteredAmount = '';
        updateModalAmount();
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Amount cleared.');
        }
      },
      selectPurpose: function(purpose, elem) {
        activePurpose = purpose;
        var pills = document.querySelectorAll('.spend-purpose-pill');
        pills.forEach(function(p) { p.classList.remove('active'); });
        if (elem) elem.classList.add('active');

        var memo = document.getElementById('spendNoteInput');
        if (memo) memo.value = purpose;

        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Purpose: ' + purpose);
        }
      },
      speakSpendHelp: function() {
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak(
            'Here are the 4 easy steps to spend money: ' +
            'Step 1: Check who is receiving the payment. ' +
            'Step 2: Enter the amount using the quick rupee buttons or keypad. ' +
            'Step 3: Choose what this payment is for, such as groceries or family support. ' +
            'Step 4: Review your balance and tap the blue Confirm button to complete.'
          );
        }
      },
      speakRecipient: function() {
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('You are paying ' + activeRecipient.name + ', categorized as ' + activeRecipient.rel + '.');
        }
      },
      speakReview: function() {
        var num = parseInt(enteredAmount, 10) || 0;
        var rem = appBalance - num;
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          if (num <= 0) {
            window.EasyAudio.speak('Your current balance is ' + appBalance + ' Rupees. Please enter an amount to spend.');
          } else if (rem < 0) {
            window.EasyAudio.speak('Warning: You are trying to spend ' + num + ' Rupees, but your balance is only ' + appBalance + ' Rupees.');
          } else {
            window.EasyAudio.speak(
              'Reviewing payment: Sending ' + num + ' Rupees to ' + activeRecipient.name + ' for ' + activePurpose + '. ' +
              'Your remaining balance will be ' + rem + ' Rupees.'
            );
          }
        }
      },
      toggleContactsPicker: function() {
        var scroller = document.getElementById('spendContactsScroller');
        if (scroller) {
          scroller.style.display = (scroller.style.display === 'none' || scroller.style.display === '') ? 'flex' : 'none';
        }
      },
      filterPassbook: function(filterType, elem) {
        currentPbFilter = filterType;
        var tabs = document.querySelectorAll('.pb-filter-tab');
        tabs.forEach(function(t) { t.classList.remove('active'); });
        if (elem) elem.classList.add('active');
        renderPassbook();
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          var filterName = filterType === 'in' ? 'Money Received' : filterType === 'out' ? 'Money Spent' : 'All Transactions';
          window.EasyAudio.speak('Showing ' + filterName);
        }
      },
      searchPassbook: function(query) {
        currentPbSearch = (query || '').trim();
        var clearBtn = document.getElementById('pbClearSearchBtn');
        if (clearBtn) clearBtn.style.display = currentPbSearch ? 'inline-block' : 'none';
        renderPassbook();
      },
      openReceiptModal: function(tx) {
        if (!tx) {
          if (transactions && transactions.length > 0) tx = transactions[0];
          else return;
        }
        activeReceiptTx = tx;
        var receiptModal = document.getElementById('receiptModal');
        if (!receiptModal) return;

        var isOut = tx.type === 'out';
        var typeLabel = document.getElementById('receiptTypeLabel');
        var amtVal = document.getElementById('receiptAmountVal');
        var partyName = document.getElementById('receiptPartyName');
        var purpose = document.getElementById('receiptPurpose');
        var time = document.getElementById('receiptTime');
        var txnId = document.getElementById('receiptTxnId');
        var utrId = document.getElementById('receiptUtrId');

        if (typeLabel) {
          typeLabel.textContent = isOut ? 'Payment Sent' : 'Deposit Received';
          typeLabel.className = 'receipt-type-pill ' + (isOut ? 'out' : 'in');
        }
        if (amtVal) {
          amtVal.textContent = (isOut ? '- ' : '+ ') + '₹ ' + tx.amount.toLocaleString('en-IN');
          amtVal.className = 'receipt-amount-display ' + (isOut ? 'out' : 'in');
        }
        if (partyName) partyName.textContent = (tx.icon ? tx.icon + ' ' : '') + tx.name;
        if (purpose) purpose.textContent = tx.desc || 'Direct Transfer';
        if (time) time.textContent = tx.time;
        if (txnId) txnId.textContent = 'TXN-' + (tx.id || 100).toString().padStart(4, '0');
        if (utrId) {
          var pseudoUtr = 'UTR-EC-2026-' + (((tx.id || 1) * 8921 + 104729) % 900000 + 100000);
          utrId.textContent = pseudoUtr;
        }

        receiptModal.classList.add('active');
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          var desc = (isOut ? 'Payment of ' : 'Deposit of ') + tx.amount + ' Rupees ' +
            (isOut ? 'to ' : 'from ') + tx.name + ' for ' + (tx.desc || 'Transfer') + '.';
          window.EasyAudio.speak(desc);
        }
      },
      copyReceiptText: function() {
        if (!activeReceiptTx) return;
        var tx = activeReceiptTx;
        var isOut = tx.type === 'out';
        var txnId = 'TXN-' + (tx.id || 100).toString().padStart(4, '0');
        var pseudoUtr = 'UTR-EC-2026-' + (((tx.id || 1) * 8921 + 104729) % 900000 + 100000);
        var text = [
          '====================================',
          '🏦 EASYCOIN DIGITAL BANK RECEIPT',
          '====================================',
          'Status: ✓ SUCCESSFUL & PROTECTED',
          'Type: ' + (isOut ? 'Payment Sent (-)' : 'Deposit Received (+)'),
          'Amount: ₹ ' + tx.amount.toLocaleString('en-IN'),
          'Party: ' + tx.name,
          'Purpose: ' + (tx.desc || 'Direct Transfer'),
          'Date & Time: ' + tx.time,
          'Txn Reference: ' + txnId,
          'UTR ID: ' + pseudoUtr,
          'Account: Senior Savings (**** 8921)',
          'IFSC: EASY0008921 · Priority Branch',
          'Guardian Shield: 🛡️ 100% Verified',
          '===================================='
        ].join('\n');

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text);
        }
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Receipt text copied to clipboard.');
        }
        if (window.showEasyToast) {
          window.showEasyToast('📋 Digital receipt copied! Ready to share.', 'success', '🧾');
        }
      },
      speakCurrentReceipt: function() {
        if (!activeReceiptTx) return;
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          var isOut = activeReceiptTx.type === 'out';
          var desc = 'Official EasyCoin Receipt: ' + (isOut ? 'Payment of ' : 'Deposit of ') +
            activeReceiptTx.amount + ' Rupees with ' + activeReceiptTx.name + ' for ' +
            activeReceiptTx.desc + ' on ' + activeReceiptTx.time + '. 100% Protected and verified by Guardian Shield.';
          window.EasyAudio.speak(desc);
        }
      },
      openStatementModal: function() {
        var stmtModal = document.getElementById('statementModal');
        if (!stmtModal) return;

        var totalIn = 0, countIn = 0;
        var totalOut = 0, countOut = 0;
        transactions.forEach(function (tx) {
          if (tx.type === 'in') {
            totalIn += tx.amount;
            countIn++;
          } else {
            totalOut += tx.amount;
            countOut++;
          }
        });

        // Compute starting opening balance
        var openingBal = appBalance - totalIn + totalOut;

        var elOpening = document.getElementById('stmtOpeningBal');
        var elIn = document.getElementById('stmtTotalIn');
        var elOut = document.getElementById('stmtTotalOut');
        var elClose = document.getElementById('stmtClosingBal');
        var elDate = document.getElementById('stmtGeneratedDate');
        var tbody = document.getElementById('stmtTableBody');

        if (elOpening) elOpening.textContent = '₹ ' + openingBal.toLocaleString('en-IN');
        if (elIn) elIn.textContent = '+ ₹ ' + totalIn.toLocaleString('en-IN') + ' (' + countIn + ')';
        if (elOut) elOut.textContent = '- ₹ ' + totalOut.toLocaleString('en-IN') + ' (' + countOut + ')';
        if (elClose) elClose.textContent = '₹ ' + appBalance.toLocaleString('en-IN');
        if (elDate) {
          elDate.textContent = new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric', day: 'numeric' });
        }

        // Build itemized table with running balance calculations
        if (tbody) {
          tbody.innerHTML = '';
          var running = openingBal;
          var chronological = transactions.slice().reverse();
          var calculatedList = [];
          chronological.forEach(function (tx) {
            if (tx.type === 'in') running += tx.amount;
            else running -= tx.amount;
            calculatedList.unshift({
              tx: tx,
              runningBal: running
            });
          });

          calculatedList.forEach(function (item) {
            var tx = item.tx;
            var isOut = tx.type === 'out';
            var tr = document.createElement('tr');
            var txnId = 'TXN-' + (tx.id || 100).toString().padStart(4, '0');
            var pseudoUtr = 'UTR-' + (((tx.id || 1) * 8921 + 104729) % 900000 + 100000);

            tr.innerHTML = `
              <td style="white-space:nowrap; font-weight:600;">${tx.time}</td>
              <td>
                <div style="font-weight:700; color:#0F172A;">${tx.icon ? tx.icon + ' ' : ''}${tx.name}</div>
                <div style="font-size:11px; color:#64748B;">${tx.desc || 'Transfer'}</div>
              </td>
              <td style="font-family:monospace; font-size:11px; color:#475569;">${txnId}</td>
              <td class="stmt-amt-debit">${isOut ? '- ₹ ' + tx.amount.toLocaleString('en-IN') : '—'}</td>
              <td class="stmt-amt-credit">${!isOut ? '+ ₹ ' + tx.amount.toLocaleString('en-IN') : '—'}</td>
              <td style="font-weight:800; color:#00174E;">₹ ${item.runningBal.toLocaleString('en-IN')}</td>
              <td>
                <button type="button" class="stmt-row-btn" title="View official receipt slip">
                  🧾 Slip
                </button>
              </td>
            `;

            var slipBtn = tr.querySelector('.stmt-row-btn');
            if (slipBtn) {
              slipBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                stmtModal.classList.remove('active');
                window.EasyBanking.openReceiptModal(tx);
              });
            }

            tbody.appendChild(tr);
          });
        }

        stmtModal.classList.add('active');
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Opening your official certified passbook statement.');
        }
      },
      closeStatementModal: function() {
        var stmtModal = document.getElementById('statementModal');
        if (stmtModal) stmtModal.classList.remove('active');
        if (window.EasyAudio) window.EasyAudio.playClick();
      },
      speakStatementSummary: function() {
        var totalIn = 0, totalOut = 0;
        transactions.forEach(function (tx) {
          if (tx.type === 'in') totalIn += tx.amount;
          else totalOut += tx.amount;
        });
        var openingBal = appBalance - totalIn + totalOut;
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          var summary = 'EasyCoin Official Passbook Statement. Opening balance: ' + openingBal.toLocaleString('en-IN') + ' Rupees. ' +
            'Total money received: ' + totalIn.toLocaleString('en-IN') + ' Rupees. ' +
            'Total money spent: ' + totalOut.toLocaleString('en-IN') + ' Rupees. ' +
            'Current available balance: ' + appBalance.toLocaleString('en-IN') + ' Rupees. Certified and verified by Guardian Shield.';
          window.EasyAudio.speak(summary);
        }
      },
      copyStatementSlip: function() {
        var totalIn = 0, totalOut = 0;
        transactions.forEach(function (tx) {
          if (tx.type === 'in') totalIn += tx.amount;
          else totalOut += tx.amount;
        });
        var openingBal = appBalance - totalIn + totalOut;
        var lines = [
          '====================================================',
          '🏦 EASYCOIN SENIOR CITIZEN PASSBOOK STATEMENT',
          '====================================================',
          'Account Holder: Harish Chandra (Super Senior)',
          'Account Number: 1092-8834-8921',
          'Guardian: Daughter Ananya (+91 98112 23344)',
          'IFSC: EASY0008921 · Senior Priority Hub',
          '----------------------------------------------------',
          'Opening Balance: ₹ ' + openingBal.toLocaleString('en-IN'),
          'Total Credits (+): + ₹ ' + totalIn.toLocaleString('en-IN'),
          'Total Debits (-): - ₹ ' + totalOut.toLocaleString('en-IN'),
          'Closing Balance: ₹ ' + appBalance.toLocaleString('en-IN'),
          '----------------------------------------------------',
          'RECENT TRANSACTIONS:'
        ];

        transactions.forEach(function (tx) {
          var sign = tx.type === 'in' ? '+' : '-';
          lines.push('• ' + tx.time + ' | ' + tx.name + ' (' + (tx.desc || 'Transfer') + ') | ' + sign + '₹ ' + tx.amount.toLocaleString('en-IN'));
        });

        lines.push('====================================================');
        lines.push('Status: 100% Cryptographically Signed & Protected');
        lines.push('====================================================');

        var text = lines.join('\n');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text);
        }
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Passbook statement copied to clipboard.');
        }
        if (window.showEasyToast) {
          window.showEasyToast('📋 Passbook statement copied to clipboard!', 'success', '📄');
        }
      },
      speakPassbookSummary: function() {
        var totalIn = 0, totalOut = 0;
        transactions.forEach(function(tx) {
          if (tx.type === 'in') totalIn += tx.amount;
          else totalOut += tx.amount;
        });
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          var summary = 'Your digital passbook summary: Account balance is ' + appBalance.toLocaleString('en-IN') + ' Rupees. ' +
            'Total money received is ' + totalIn.toLocaleString('en-IN') + ' Rupees. ' +
            'Total money spent is ' + totalOut.toLocaleString('en-IN') + ' Rupees. All transactions are safe and recorded.';
          window.EasyAudio.speak(summary);
        }
      },
      downloadStatement: function() {
        this.openStatementModal();
      }
    };

    // Digital Receipt Modal Close
    var receiptModal = document.getElementById('receiptModal');
    var closeReceiptBtn = document.getElementById('closeReceiptBtn');
    if (closeReceiptBtn && receiptModal) {
      closeReceiptBtn.addEventListener('click', function () {
        receiptModal.classList.remove('active');
        if (window.EasyAudio) window.EasyAudio.playClick();
      });
      receiptModal.addEventListener('click', function (e) {
        if (e.target === receiptModal) {
          receiptModal.classList.remove('active');
          if (window.EasyAudio) window.EasyAudio.playClick();
        }
      });
    }

    // Statement Modal Close
    var statementModal = document.getElementById('statementModal');
    var closeStatementBtn = document.getElementById('closeStatementBtn');
    if (closeStatementBtn && statementModal) {
      closeStatementBtn.addEventListener('click', function () {
        statementModal.classList.remove('active');
        if (window.EasyAudio) window.EasyAudio.playClick();
      });
      statementModal.addEventListener('click', function (e) {
        if (e.target === statementModal) {
          statementModal.classList.remove('active');
          if (window.EasyAudio) window.EasyAudio.playClick();
        }
      });
    }

    // Confirm Payment
    var confirmPayBtn = document.getElementById('confirmPayBtn');
    if (confirmPayBtn) {
      confirmPayBtn.addEventListener('click', function () {
        var num = parseInt(enteredAmount, 10) || 0;
        if (num <= 0) {
          if (window.EasyAudio) window.EasyAudio.speak('Please enter an amount first.');
          return;
        }
        if (num > appBalance) {
          if (window.EasyAudio) window.EasyAudio.speak('Insufficient balance. You only have ' + appBalance + ' Rupees.');
          return;
        }

        var noteInput = document.getElementById('spendNoteInput');
        var note = noteInput ? noteInput.value : activePurpose;

        // Notify backend API if connected
        if (window.EasyAPI) {
          window.EasyAPI.sendTransfer(activeRecipient.name, num, note || 'Direct Spend', activeRecipient.avatar);
        }

        appBalance -= num;
        syncBalanceUI();

        if (window.EasyAudio) {
          window.EasyAudio.playCoinSound();
          window.EasyAudio.speak('Payment Successful! ' + num + ' Rupees sent to ' + activeRecipient.name + ' for ' + (note || 'spending') + '.');
        }

        transactions.unshift({
          id: Date.now(),
          name: activeRecipient.name,
          type: 'out',
          amount: num,
          time: 'Just now',
          icon: activeRecipient.avatar,
          desc: note || 'Direct Spend'
        });

        if (window.EasyTransactions) {
          window.EasyTransactions.addTransaction(
            activeRecipient.name,
            'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            'Direct Family / Contact Payment',
            num,
            'out',
            'family',
            activeRecipient.avatar
          );
        }

        renderPassbook();
        if (payModal) payModal.classList.remove('active');
        if (window.showEasyToast) {
          window.showEasyToast('✅ ₹ ' + num.toLocaleString('en-IN') + ' sent to ' + activeRecipient.name + '. Receipt recorded in Passbook.', 'success', '💸');
        }
      });
    }

    // Dock Voice Assistant Button
    if (dockMicBtn) {
      dockMicBtn.addEventListener('click', function () {
        triggerVoiceInput();
      });
    }

    function triggerVoiceInput() {
      if (dockMicBtn) dockMicBtn.classList.add('listening');
      if (dockStatus) dockStatus.textContent = 'Listening... Speak your command';
      if (window.EasyAudio) {
        window.EasyAudio.playClick();
        window.EasyAudio.speak('I am listening. Say something like: Check balance, or Send 500 Rupees to Son.');
      }

      var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          var recognition = new SpeechRecognition();
          recognition.lang = 'en-IN';
          recognition.start();

          recognition.onresult = function (event) {
            var text = event.results[0][0].transcript.toLowerCase();
            handleVoiceCommand(text);
          };

          recognition.onend = function () {
            if (dockMicBtn) dockMicBtn.classList.remove('listening');
            if (dockStatus) dockStatus.textContent = 'Tap to speak anytime';
          };
          return;
        } catch (e) {
          console.warn(e);
        }
      }

      // Simulated Voice Recognition fallback
      setTimeout(function () {
        if (dockMicBtn) dockMicBtn.classList.remove('listening');
        if (dockStatus) dockStatus.textContent = 'Tap to speak anytime';
        if (window.EasyAudio) {
          window.EasyAudio.speak('Voice detected: Your balance is ' + appBalance + ' Rupees.');
        }
      }, 2000);
    }

    function handleVoiceCommand(cmd) {
      if (cmd.includes('balance') || cmd.includes('paisa') || cmd.includes('money')) {
        if (window.EasyAudio) window.EasyAudio.speak('Your balance is ' + appBalance + ' Rupees.');
      } else if (cmd.includes('send') || cmd.includes('transfer') || cmd.includes('pay')) {
        openPayModal('Son Rahul', '👨‍🦱', 'Son');
      } else if (cmd.includes('passbook') || cmd.includes('statement')) {
        var pb = document.getElementById('passbookSection');
        if (pb) pb.scrollIntoView({ behavior: 'smooth' });
        if (window.EasyAudio) window.EasyAudio.speak('Here is your passbook.');
      } else {
        if (window.EasyAudio) window.EasyAudio.speak('You said: ' + cmd + '. How may I help?');
      }
    }

    // Passbook State & Defined Rendering Engine
    var currentPbFilter = 'all';
    var currentPbSearch = '';
    var activeReceiptTx = null;

    function updatePassbookStats() {
      var totalIn = 0, countIn = 0;
      var totalOut = 0, countOut = 0;

      transactions.forEach(function (tx) {
        if (tx.type === 'in') {
          totalIn += tx.amount;
          countIn++;
        } else {
          totalOut += tx.amount;
          countOut++;
        }
      });

      var statBal = document.getElementById('pbStatBalance');
      var statIn = document.getElementById('pbStatReceived');
      var statOut = document.getElementById('pbStatSpent');
      var statInCount = document.getElementById('pbStatReceivedCount');
      var statOutCount = document.getElementById('pbStatSpentCount');

      var countAll = document.getElementById('pbCountAll');
      var countInEl = document.getElementById('pbCountIn');
      var countOutEl = document.getElementById('pbCountOut');

      if (statBal) statBal.textContent = '₹ ' + appBalance.toLocaleString('en-IN');
      if (statIn) statIn.textContent = '+ ₹ ' + totalIn.toLocaleString('en-IN');
      if (statOut) statOut.textContent = '- ₹ ' + totalOut.toLocaleString('en-IN');
      if (statInCount) statInCount.textContent = countIn + ' Deposit' + (countIn !== 1 ? 's' : '') + ' received';
      if (statOutCount) statOutCount.textContent = countOut + ' Payment' + (countOut !== 1 ? 's' : '') + ' sent';

      if (countAll) countAll.textContent = transactions.length;
      if (countInEl) countInEl.textContent = countIn;
      if (countOutEl) countOutEl.textContent = countOut;
    }

    function renderPassbook() {
      updatePassbookStats();
      var listEl = document.getElementById('standalonePassbookList');
      if (!listEl) return;
      listEl.innerHTML = '';

      var filtered = transactions.filter(function (tx) {
        if (currentPbFilter === 'in' && tx.type !== 'in') return false;
        if (currentPbFilter === 'out' && tx.type !== 'out') return false;

        if (currentPbSearch) {
          var q = currentPbSearch.toLowerCase();
          var nameMatch = (tx.name || '').toLowerCase().includes(q);
          var descMatch = (tx.desc || '').toLowerCase().includes(q);
          var timeMatch = (tx.time || '').toLowerCase().includes(q);
          var amtMatch = String(tx.amount || '').includes(q);
          if (!nameMatch && !descMatch && !timeMatch && !amtMatch) return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        listEl.innerHTML = `
          <div class="pb-empty-state">
            <div style="font-size:32px; margin-bottom:8px;">🔍</div>
            <div style="font-size:15px; font-weight:700; color:#1E293B;">No transactions found</div>
            <div style="font-size:13px; color:#64748B; margin-top:4px;">Try searching for another name or switch filter tabs.</div>
          </div>
        `;
        return;
      }

      filtered.forEach(function (tx) {
        var card = document.createElement('div');
        card.className = 'pb-defined-card';
        var isOut = tx.type === 'out';
        var txnId = 'TXN-' + (tx.id || 100).toString().padStart(4, '0');

        card.innerHTML = `
          <div class="pb-card-left">
            <div class="pb-avatar-wrap ${isOut ? 'out' : 'in'}">
              <span>${tx.icon || '💳'}</span>
              <span class="pb-dir-icon ${isOut ? 'out' : 'in'}">${isOut ? '↑' : '↓'}</span>
            </div>
            <div class="pb-details">
              <div class="pb-party-name">${tx.name}</div>
              <div class="pb-badges-row">
                <span class="pb-type-pill ${isOut ? 'out' : 'in'}">
                  ${isOut ? '🔴 Money Sent' : '🟢 Money Received'}
                </span>
                <span style="font-size:11px; background:#F1F5F9; color:#475569; padding:2px 8px; border-radius:6px; font-weight:700;">
                  ${tx.desc || 'Direct Transfer'}
                </span>
              </div>
              <div class="pb-meta-line">
                📅 ${tx.time} · <span style="font-family:monospace;">ID: ${txnId}</span> · Verified 🛡️
              </div>
            </div>
          </div>

          <div class="pb-card-right">
            <div class="pb-amount-val ${isOut ? 'out' : 'in'}">
              ${isOut ? '- ' : '+ '} ₹ ${tx.amount.toLocaleString('en-IN')}
            </div>
            <div class="pb-action-btns">
              <button type="button" class="pb-hear-btn" title="Read transaction aloud">
                🔊 Hear
              </button>
              <button type="button" class="pb-receipt-btn" title="View digital receipt">
                🧾 Receipt
              </button>
            </div>
          </div>
        `;

        var hearBtn = card.querySelector('.pb-hear-btn');
        if (hearBtn) {
          hearBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (window.EasyAudio) {
              window.EasyAudio.playClick();
              var narration = (isOut ? 'Payment of ' : 'Deposit of ') + tx.amount + ' Rupees ' +
                (isOut ? 'to ' : 'from ') + tx.name + ' for ' + tx.desc + ' on ' + tx.time + '. Verified and protected.';
              window.EasyAudio.speak(narration);
            }
          });
        }

        var receiptBtn = card.querySelector('.pb-receipt-btn');
        if (receiptBtn) {
          receiptBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            window.EasyBanking.openReceiptModal(tx);
          });
        }

        card.addEventListener('click', function () {
          window.EasyBanking.openReceiptModal(tx);
        });

        listEl.appendChild(card);
      });
    }

    renderPassbook();

    // Expose Banking Interface for UPI Circle & Modules
    if (window.EasyBanking) {
      Object.assign(window.EasyBanking, {
        getBalance: function () {
          return appBalance;
        },
        updateBalance: function (newBal) {
          appBalance = Math.max(0, newBal);
          syncBalanceUI();
        },
        addPassbookEntry: function (name, type, amount, icon, desc) {
          transactions.unshift({
            id: Date.now(),
            name: name,
            type: type || 'out',
            amount: amount,
            time: 'Just now',
            icon: icon || '👤',
            desc: desc || 'UPI Circle Spend'
          });
          renderPassbook();
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initStandaloneApp);
})();
