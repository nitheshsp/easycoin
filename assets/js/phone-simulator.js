/**
 * EasyCoin Interactive Phone Simulator Engine
 * Implements full senior-friendly banking interactions inside the phone mockup.
 */
(function () {
  'use strict';

  var balance = 14250;
  var currentScreen = 's-dash';
  var enteredAmount = '';
  var activeRecipient = { name: 'Son Rahul', rel: 'Family', avatar: '👨‍🦱' };

  var transactions = [
    { id: 1, title: 'Son Rahul', type: 'out', amount: 500, time: 'Today, 2:15 PM', icon: '👨‍🦱', note: 'Monthly Allowance' },
    { id: 2, title: 'Pension Deposit', type: 'in', amount: 8000, time: 'Yesterday', icon: '🏛️', note: 'Govt. Senior Pension' },
    { id: 3, title: 'Lakshmi Grocery', type: 'out', amount: 340, time: '2 Mar 2026', icon: '🏪', note: 'Groceries' },
    { id: 4, title: 'Daughter Ananya', type: 'in', amount: 2000, time: '28 Feb 2026', icon: '👩‍⚕️', note: 'Gift' }
  ];

  function initPhoneSimulator() {
    var phoneEl = document.querySelector('.phone');
    if (!phoneEl) return;

    // Clock updater
    function updateClocks() {
      var d = new Date();
      var h = String(d.getHours()).padStart(2, '0');
      var m = String(d.getMinutes()).padStart(2, '0');
      var timeStr = h + ':' + m;

      var clockEl = phoneEl.querySelector('#clock');
      var lsTimeEl = phoneEl.querySelector('#lsTime');
      var lsDateEl = phoneEl.querySelector('#lsDate');

      if (clockEl) clockEl.textContent = timeStr;
      if (lsTimeEl) lsTimeEl.textContent = timeStr;

      if (lsDateEl) {
        var options = { weekday: 'long', month: 'short', day: 'numeric' };
        lsDateEl.textContent = d.toLocaleDateString('en-US', options);
      }
    }
    setInterval(updateClocks, 1000);
    updateClocks();

    // Tab Bar Navigation
    var tabs = phoneEl.querySelectorAll('.tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = this.getAttribute('data-target');
        switchScreen(target);
      });
    });

    // Quick Action Tiles
    var tileSend = phoneEl.querySelector('.tile-send');
    var tileReceive = phoneEl.querySelector('.tile-receive');
    var tileBills = phoneEl.querySelector('.tile-bills');
    var tilePassbook = phoneEl.querySelector('.tile-passbook');

    if (tileSend) {
      tileSend.addEventListener('click', function () {
        switchScreen('s-send');
      });
    }
    if (tileReceive) {
      tileReceive.addEventListener('click', function () {
        renderPhoneQR();
        switchScreen('s-qr');
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Scan merchant QR code with camera, or show your receive QR.');
        }
      });
    }

    // QR Code Engine inside Phone
    function renderPhoneQR() {
      var qrBox = phoneEl.querySelector('#phoneQrCodeContainer');
      if (qrBox && window.EasyQR) {
        qrBox.innerHTML = window.EasyQR.generateQRCodeSVG('upi://pay?pa=harish.chandra@easycoin&pn=Harish%20Chandra', 160);
      }
    }
    renderPhoneQR();

    function startPhoneCamera() {
      var videoEl = phoneEl.querySelector('#phoneCameraVideo');
      var badgeEl = phoneEl.querySelector('#phoneCameraBadgeText');
      if (videoEl && window.EasyQR) {
        window.EasyQR.startCamera(videoEl, badgeEl, onPhoneQrDetected);
      }
    }

    function stopPhoneCamera() {
      if (window.EasyQR) {
        window.EasyQR.stopCamera();
      }
    }

    function onPhoneQrDetected(payload) {
      if (!payload) return;
      var parsed = window.EasyQR ? window.EasyQR.parseQRPayload(payload) : { name: 'Lakshmi Grocery', amt: 120, avatar: '🏪' };
      stopPhoneCamera();

      activeRecipient = { name: parsed.name, avatar: parsed.avatar, rel: 'Merchant QR' };
      enteredAmount = String(parsed.amt);
      updateAmountUI();

      var recNameEl = phoneEl.querySelector('#recName');
      var recAvEl = phoneEl.querySelector('#recAvatar');
      if (recNameEl) recNameEl.textContent = parsed.name;
      if (recAvEl) recAvEl.textContent = parsed.avatar;

      if (window.EasyAudio) {
        window.EasyAudio.playCoinSound();
        window.EasyAudio.speak('QR scanned for ' + parsed.name + '. Amount is ' + parsed.amt + ' Rupees. Tap Send to confirm.');
      }
      if (window.showEasyToast) {
        window.showEasyToast('📷 Scanned: ' + parsed.name + ' (₹' + parsed.amt + ')', 'success', '📷');
      }
      switchScreen('s-send');
    }

    // QR Mode Tabs (Defined Tabs)
    var qrTabScanBtn = phoneEl.querySelector('#qrTabScanBtn');
    var qrTabReceiveBtn = phoneEl.querySelector('#qrTabReceiveBtn');
    var qrScanView = phoneEl.querySelector('#qrScanView');
    var qrReceiveView = phoneEl.querySelector('#qrReceiveView');

    if (qrTabScanBtn && qrTabReceiveBtn) {
      qrTabScanBtn.addEventListener('click', function () {
        qrTabScanBtn.classList.add('active');
        qrTabScanBtn.setAttribute('aria-selected', 'true');
        qrTabReceiveBtn.classList.remove('active');
        qrTabReceiveBtn.setAttribute('aria-selected', 'false');
        qrScanView.style.display = 'block';
        qrReceiveView.style.display = 'none';
        startPhoneCamera();
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Camera scanner active.');
        }
      });

      qrTabReceiveBtn.addEventListener('click', function () {
        qrTabReceiveBtn.classList.add('active');
        qrTabReceiveBtn.setAttribute('aria-selected', 'true');
        qrTabScanBtn.classList.remove('active');
        qrTabScanBtn.setAttribute('aria-selected', 'false');
        qrScanView.style.display = 'none';
        qrReceiveView.style.display = 'block';
        stopPhoneCamera();
        renderPhoneQR();
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Your personal receive QR code is on screen.');
        }
      });
    }

    // Phone Camera Toolbar Controls
    var phoneSnapScanBtn = phoneEl.querySelector('#phoneSnapScanBtn');
    if (phoneSnapScanBtn) {
      phoneSnapScanBtn.addEventListener('click', async function () {
        var videoEl = phoneEl.querySelector('#phoneCameraVideo');
        if (window.EasyAudio) window.EasyAudio.playClick();
        if (window.EasyQR) {
          var found = await window.EasyQR.scanVideoFrame(videoEl, onPhoneQrDetected);
          if (!found) {
            onPhoneQrDetected('upi://pay?pa=lakshmigrocery@upi&pn=Lakshmi%20Grocery&am=120');
          }
        }
      });
    }

    var phoneFlipCameraBtn = phoneEl.querySelector('#phoneFlipCameraBtn');
    if (phoneFlipCameraBtn) {
      phoneFlipCameraBtn.addEventListener('click', function () {
        var videoEl = phoneEl.querySelector('#phoneCameraVideo');
        var badgeEl = phoneEl.querySelector('#phoneCameraBadgeText');
        if (window.EasyAudio) window.EasyAudio.playClick();
        if (window.EasyQR) {
          window.EasyQR.flipCamera(videoEl, badgeEl, onPhoneQrDetected);
        }
      });
    }

    var phoneTorchBtn = phoneEl.querySelector('#phoneTorchBtn');
    if (phoneTorchBtn) {
      phoneTorchBtn.addEventListener('click', async function () {
        if (window.EasyAudio) window.EasyAudio.playClick();
        if (window.EasyQR) {
          var on = await window.EasyQR.toggleTorch();
          if (window.showEasyToast) {
            window.showEasyToast(on ? '💡 Light ON' : '💡 Light OFF', 'info', '💡');
          }
        }
      });
    }

    var phoneUploadQrBtn = phoneEl.querySelector('#phoneUploadQrBtn');
    var phoneQrFileInput = phoneEl.querySelector('#phoneQrFileInput');
    if (phoneUploadQrBtn && phoneQrFileInput) {
      phoneUploadQrBtn.addEventListener('click', function () {
        phoneQrFileInput.click();
      });
      phoneQrFileInput.addEventListener('change', function (e) {
        var file = e.target.files && e.target.files[0];
        if (file && window.EasyQR) {
          window.EasyQR.scanImageFile(file, onPhoneQrDetected);
        }
      });
    }

    // Merchant sample scan simulation
    var merchantItems = phoneEl.querySelectorAll('.merchant-select-item');
    merchantItems.forEach(function (m) {
      m.addEventListener('click', function () {
        var name = this.getAttribute('data-name');
        var amt = this.getAttribute('data-amt');
        var av = this.getAttribute('data-avatar') || '🏪';

        onPhoneQrDetected('upi://pay?pa=lakshmigrocery@upi&pn=' + encodeURIComponent(name) + '&am=' + amt);
      });
    });
    if (tileBills) {
      tileBills.addEventListener('click', function () {
        if (window.EasyBills) {
          window.EasyBills.renderAll();
          window.EasyBills.speakBillSummary();
        }
        switchScreen('s-bills');
      });
    }
    if (tilePassbook) {
      tilePassbook.addEventListener('click', function () {
        switchScreen('s-passbook');
      });
    }

    var tileCircle = phoneEl.querySelector('.tile-circle');
    if (tileCircle) {
      tileCircle.addEventListener('click', function () {
        if (window.EasyCircle) {
          window.EasyCircle.renderPhoneSimulator();
          window.EasyCircle.speakCircleSummary();
        }
        switchScreen('s-circle');
      });
    }

    // Listen to balance button
    var listenBtn = phoneEl.querySelector('#listenBalanceBtn');
    if (listenBtn) {
      listenBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Your EasyCoin account balance is ' + balance.toLocaleString('en-IN') + ' Rupees. Everything is safe.');
        }
      });
    }

    // Contact Avatar Clicks
    var contacts = phoneEl.querySelectorAll('.contact-item');
    contacts.forEach(function (c) {
      c.addEventListener('click', function () {
        var name = this.getAttribute('data-name') || 'Contact';
        var rel = this.getAttribute('data-rel') || '';
        var av = this.querySelector('.contact-img-wrap').textContent.trim();
        activeRecipient = { name: name, rel: rel, avatar: av };

        var recNameEl = phoneEl.querySelector('#recName');
        var recAvEl = phoneEl.querySelector('#recAvatar');
        if (recNameEl) recNameEl.textContent = name;
        if (recAvEl) recAvEl.textContent = av;

        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Sending money to ' + name + '. Enter amount.');
        }
        switchScreen('s-send');
      });
    });

    // Senior Keypad logic
    var keyBtns = phoneEl.querySelectorAll('.key-btn');
    var amountDisplay = phoneEl.querySelector('#keypadAmount');
    var wordsDisplay = phoneEl.querySelector('#amountWords');

    keyBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var val = this.getAttribute('data-val');
        if (!val) return;

        if (val === 'clear') {
          enteredAmount = '';
          if (window.EasyAudio) window.EasyAudio.playClick();
        } else if (val === 'backspace') {
          enteredAmount = enteredAmount.slice(0, -1);
          if (window.EasyAudio) window.EasyAudio.playClick();
        } else if (val === 'voice') {
          triggerVoicePay();
          return;
        } else {
          if (enteredAmount.length < 7) {
            enteredAmount += val;
            if (window.EasyAudio) window.EasyAudio.playKeyTap(val);
          }
        }

        updateAmountUI();
      });
    });

    // Native direct typing on phoneAmountInput
    var phoneAmountInp = phoneEl.querySelector('#phoneAmountInput');
    if (phoneAmountInp) {
      phoneAmountInp.addEventListener('input', function () {
        var clean = this.value.replace(/\D/g, '');
        if (clean.length > 7) clean = clean.slice(0, 7);
        enteredAmount = clean;
        this.value = clean;
        updateAmountUI();
        if (window.EasyAudio && clean.length > 0) {
          window.EasyAudio.playKeyTap(clean.slice(-1));
        }
      });

      phoneAmountInp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          var btn = phoneEl.querySelector('#sendMoneyBtn');
          if (btn) btn.click();
        }
      });
    }

    // Connect laptop/desktop physical keyboard while on s-send screen
    window.addEventListener('keydown', function (e) {
      var sendScreen = phoneEl.querySelector('#s-send');
      if (!sendScreen || !sendScreen.classList.contains('active')) return;
      if (document.activeElement === phoneAmountInp) return;

      if (/^[0-9]$/.test(e.key)) {
        if (enteredAmount.length < 7) {
          enteredAmount += e.key;
          updateAmountUI();
          if (window.EasyAudio) window.EasyAudio.playKeyTap(e.key);
        }
      } else if (e.key === 'Backspace') {
        enteredAmount = enteredAmount.slice(0, -1);
        updateAmountUI();
        if (window.EasyAudio) window.EasyAudio.playClick();
      } else if (e.key === 'Enter') {
        var btn = phoneEl.querySelector('#sendMoneyBtn');
        if (btn) btn.click();
      }
    });

    function updateAmountUI() {
      var phoneInp = phoneEl.querySelector('#phoneAmountInput');
      if (phoneInp && document.activeElement !== phoneInp) {
        phoneInp.value = enteredAmount || '';
      }
      if (amountDisplay) {
        var num = parseInt(enteredAmount, 10) || 0;
        amountDisplay.textContent = '₹ ' + (num > 0 ? num.toLocaleString('en-IN') : '0');
      }
      if (wordsDisplay) {
        var num = parseInt(enteredAmount, 10) || 0;
        wordsDisplay.textContent = num > 0 ? num.toLocaleString('en-IN') + ' Rupees' : 'Type with keyboard or tap below';
      }

      var remBalEl = phoneEl.querySelector('#phoneRemBal');
      if (remBalEl) {
        var num = parseInt(enteredAmount, 10) || 0;
        var rem = balance - num;
        remBalEl.textContent = '₹ ' + (rem >= 0 ? rem.toLocaleString('en-IN') : 'Short by ' + Math.abs(rem));
        remBalEl.style.color = rem >= 0 ? '#1e40af' : '#dc2626';
      }

      var sendBtnTxt = phoneEl.querySelector('#phoneSendBtnTxt');
      if (sendBtnTxt) {
        var num = parseInt(enteredAmount, 10) || 0;
        if (num > 0) {
          sendBtnTxt.textContent = '✓ Confirm & Spend ₹ ' + num.toLocaleString('en-IN');
        } else {
          sendBtnTxt.textContent = '✓ Confirm & Spend Payment';
        }
      }
    }

    window.phoneAddAmt = function(delta) {
      var cur = parseInt(enteredAmount, 10) || 0;
      var next = cur + delta;
      if (next <= balance) enteredAmount = String(next);
      else enteredAmount = String(balance);
      updateAmountUI();
      if (window.EasyAudio) {
        window.EasyAudio.playClick();
        window.EasyAudio.speak(next + ' Rupees.');
      }
    };

    window.phoneClearAmt = function() {
      enteredAmount = '';
      updateAmountUI();
      if (window.EasyAudio) {
        window.EasyAudio.playClick();
        window.EasyAudio.speak('Cleared.');
      }
    };

    var phoneSelectedPurpose = 'Family';
    window.phoneSelectPurpose = function(p, elem) {
      phoneSelectedPurpose = p;
      var pills = phoneEl.querySelectorAll('.spend-purpose-pill');
      pills.forEach(function(pill) { pill.classList.remove('active'); });
      if (elem) elem.classList.add('active');
      if (window.EasyAudio) {
        window.EasyAudio.playClick();
        window.EasyAudio.speak('Purpose: ' + p);
      }
    };

    // Voice Pay Button
    var micBtn = phoneEl.querySelector('#micActionBtn');
    var waveBox = phoneEl.querySelector('#voiceWaveform');
    if (micBtn) {
      micBtn.addEventListener('click', function () {
        triggerVoicePay();
      });
    }

    function triggerVoicePay() {
      if (window.EasyAudio) {
        window.EasyAudio.playClick();
        window.EasyAudio.speak('Listening. Please say the amount.');
      }
      if (micBtn) micBtn.classList.add('active');
      if (waveBox) waveBox.classList.add('listening');

      // Voice recognition simulation / Web Speech Recognition
      var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          var recognition = new SpeechRecognition();
          recognition.lang = 'en-IN';
          recognition.start();
          recognition.onresult = function (event) {
            var text = event.results[0][0].transcript;
            var numMatch = text.match(/\d+/);
            if (numMatch) {
              enteredAmount = numMatch[0];
              updateAmountUI();
              if (window.EasyAudio) window.EasyAudio.speak('Got ' + enteredAmount + ' Rupees. Tap Send to confirm.');
            }
          };
          recognition.onend = function () {
            if (micBtn) micBtn.classList.remove('active');
            if (waveBox) waveBox.classList.remove('listening');
          };
          return;
        } catch (e) {
          console.warn(e);
        }
      }

      // Simulated voice input fallback
      setTimeout(function () {
        enteredAmount = '500';
        updateAmountUI();
        if (micBtn) micBtn.classList.remove('active');
        if (waveBox) waveBox.classList.remove('listening');
        if (window.EasyAudio) {
          window.EasyAudio.speak('Voice detected: 500 Rupees for ' + activeRecipient.name + '. Tap Confirm.');
        }
      }, 1600);
    }

    // Confirm Send Payment Button
    var sendBtn = phoneEl.querySelector('#sendMoneyBtn');
    if (sendBtn) {
      sendBtn.addEventListener('click', function () {
        var num = parseInt(enteredAmount, 10) || 0;
        if (num <= 0) {
          if (window.EasyAudio) window.EasyAudio.speak('Please enter or speak an amount first.');
          return;
        }
        if (num > balance) {
          if (window.EasyAudio) window.EasyAudio.speak('Insufficient balance. You only have ' + balance + ' Rupees.');
          return;
        }

        // Notify backend API if connected
        if (window.EasyAPI) {
          window.EasyAPI.sendTransfer(activeRecipient.name, num, phoneSelectedPurpose + ' Spend', activeRecipient.avatar);
        }

        // Deduct balance
        balance -= num;
        var balEl = phoneEl.querySelector('#balanceAmount');
        if (balEl) balEl.textContent = '₹ ' + balance.toLocaleString('en-IN');

        // Play coin sound
        if (window.EasyAudio) {
          window.EasyAudio.playCoinSound();
          window.EasyAudio.speak('Success! ' + num + ' Rupees spent on ' + phoneSelectedPurpose + ' for ' + activeRecipient.name + '.');
        }

        // Add to transactions
        transactions.unshift({
          id: Date.now(),
          title: activeRecipient.name,
          type: 'out',
          amount: num,
          time: 'Just now',
          icon: activeRecipient.avatar || '👤',
          note: phoneSelectedPurpose + ' Spend'
        });

        renderPassbook();
        enteredAmount = '';
        updateAmountUI();

        // Show brief success toast
        if (window.showEasyToast) {
          window.showEasyToast('✅ Payment Sent: ₹ ' + num + ' to ' + activeRecipient.name, 'success', '💸');
        }
        switchScreen('s-passbook');
      });
    }

    // Defined Phone Passbook Filters & Stats
    var phonePbFilter = 'all';

    window.phoneFilterPb = function (filter, elem) {
      phonePbFilter = filter;
      var chips = phoneEl.querySelectorAll('#s-passbook .quick-amt-chip');
      chips.forEach(function (c) { c.classList.remove('active'); });
      if (elem) elem.classList.add('active');
      renderPassbook();
      if (window.EasyAudio) {
        window.EasyAudio.playClick();
        var name = filter === 'in' ? 'Received' : filter === 'out' ? 'Spent' : 'All transactions';
        window.EasyAudio.speak('Showing ' + name);
      }
    };

    window.phoneSpeakPassbookSummary = function () {
      var totalIn = 0, totalOut = 0;
      transactions.forEach(function (tx) {
        if (tx.type === 'in') totalIn += tx.amount;
        else totalOut += tx.amount;
      });
      if (window.EasyAudio) {
        window.EasyAudio.playClick();
        window.EasyAudio.speak(
          'Passbook summary: Available balance is ' + balance.toLocaleString('en-IN') + ' Rupees. ' +
          'Total received is ' + totalIn.toLocaleString('en-IN') + ' Rupees. ' +
          'Total spent is ' + totalOut.toLocaleString('en-IN') + ' Rupees.'
        );
      }
    };

    // Render Passbook items with Defined Details
    function renderPassbook() {
      var listEl = phoneEl.querySelector('#passbookList');
      if (!listEl) return;
      listEl.innerHTML = '';

      var totalIn = 0, totalOut = 0;
      transactions.forEach(function (tx) {
        if (tx.type === 'in') totalIn += tx.amount;
        else totalOut += tx.amount;
      });

      var balEl = phoneEl.querySelector('#phonePbBal');
      var inValEl = phoneEl.querySelector('#phonePbInVal');
      var outValEl = phoneEl.querySelector('#phonePbOutVal');
      var tabAllEl = phoneEl.querySelector('#phonePbTabAll');

      if (balEl) balEl.textContent = '₹ ' + balance.toLocaleString('en-IN');
      if (inValEl) inValEl.textContent = '🟢 In: +₹' + totalIn.toLocaleString('en-IN');
      if (outValEl) outValEl.textContent = '🔴 Out: -₹' + totalOut.toLocaleString('en-IN');
      if (tabAllEl) tabAllEl.textContent = 'All (' + transactions.length + ')';

      var filtered = transactions.filter(function (tx) {
        if (phonePbFilter === 'in' && tx.type !== 'in') return false;
        if (phonePbFilter === 'out' && tx.type !== 'out') return false;
        return true;
      });

      if (filtered.length === 0) {
        listEl.innerHTML = '<div style="text-align:center; padding:20px; font-size:12px; color:#64748B;">No transactions in this filter.</div>';
        return;
      }

      filtered.forEach(function (tx) {
        var item = document.createElement('div');
        item.className = 'passbook-item';
        var isOut = tx.type === 'out';
        item.innerHTML = `
          <div class="pb-icon ${isOut ? 'out' : 'in'}">${tx.icon || '💳'}</div>
          <div class="pb-info">
            <div class="pb-title">${tx.title}</div>
            <div class="pb-time">${tx.time} · ${tx.note || (isOut ? 'Payment' : 'Deposit')}</div>
          </div>
          <div class="pb-amount ${isOut ? 'out' : 'in'}">
            ${isOut ? '-' : '+'} ₹ ${tx.amount.toLocaleString('en-IN')}
          </div>
        `;
        item.addEventListener('click', function () {
          window.openPhoneReceiptModal(tx);
        });
        listEl.appendChild(item);
      });
    }
    renderPassbook();

    // Mobile Phone Digital Receipt Handler
    var activePhoneReceiptTx = null;

    window.openPhoneReceiptModal = function (tx) {
      if (!tx) {
        if (transactions && transactions.length > 0) tx = transactions[0];
        else return;
      }
      activePhoneReceiptTx = tx;
      var overlay = phoneEl.querySelector('#phoneReceiptOverlay');
      if (!overlay) return;

      var isOut = tx.type === 'out';
      var typePill = overlay.querySelector('#pReceiptType');
      var amtEl = overlay.querySelector('#pReceiptAmt');
      var partyEl = overlay.querySelector('#pReceiptParty');
      var purposeEl = overlay.querySelector('#pReceiptPurpose');
      var timeEl = overlay.querySelector('#pReceiptTime');
      var txnIdEl = overlay.querySelector('#pReceiptTxnId');

      if (typePill) {
        typePill.className = 'receipt-type-pill ' + (isOut ? 'out' : 'in');
        typePill.textContent = isOut ? '🔴 Payment Sent' : '🟢 Deposit Received';
      }
      if (amtEl) {
        amtEl.textContent = (isOut ? '- ' : '+ ') + '₹ ' + tx.amount.toLocaleString('en-IN');
        amtEl.style.color = isOut ? '#DC2626' : '#16A34A';
      }
      if (partyEl) partyEl.textContent = tx.title || 'Bank Transfer';
      if (purposeEl) purposeEl.textContent = tx.note || (isOut ? 'Direct Payment' : 'Direct Credit');
      if (timeEl) timeEl.textContent = tx.time || 'Today';
      if (txnIdEl) {
        var pseudoId = 'TXN-EC-' + (tx.id ? String(tx.id).slice(-6) : Math.floor(100000 + Math.random() * 900000));
        txnIdEl.textContent = pseudoId;
      }

      overlay.classList.add('active');

      if (window.EasyAudio) {
        window.EasyAudio.playClick();
        var speech = (isOut ? 'Official receipt: Payment of ' : 'Official receipt: Deposit of ') +
          tx.amount + ' Rupees with ' + (tx.title || 'recipient') + '. Status: 100% verified.';
        window.EasyAudio.speak(speech);
      }
    };

    window.phoneOpenLatestReceipt = function () {
      if (!transactions || transactions.length === 0) {
        if (window.showEasyToast) window.showEasyToast('No transactions found in passbook.', 'info', 'ℹ️');
        return;
      }
      window.openPhoneReceiptModal(transactions[0]);
    };

    window.closePhoneReceipt = function () {
      var overlay = phoneEl.querySelector('#phoneReceiptOverlay');
      if (overlay) overlay.classList.remove('active');
      if (window.EasyAudio) window.EasyAudio.playClick();
    };

    window.phoneSpeakReceipt = function () {
      if (!activePhoneReceiptTx) return;
      var tx = activePhoneReceiptTx;
      var isOut = tx.type === 'out';
      if (window.EasyAudio) {
        window.EasyAudio.playClick();
        var speech = 'EasyCoin Official Receipt. ' + (isOut ? 'Payment sent to ' : 'Deposit received from ') +
          tx.title + '. Amount: ' + tx.amount.toLocaleString('en-IN') + ' Rupees. Purpose: ' + (tx.note || 'Transfer') +
          '. Date: ' + tx.time + '. 100% Protected and verified by Guardian Shield.';
        window.EasyAudio.speak(speech);
      }
    };

    window.phoneCopyReceipt = function () {
      if (!activePhoneReceiptTx) return;
      var tx = activePhoneReceiptTx;
      var isOut = tx.type === 'out';
      var pseudoId = 'TXN-EC-' + (tx.id ? String(tx.id).slice(-6) : '889214');
      var pseudoUtr = 'UTR-EC-2026-' + (tx.id ? (tx.id % 900000 + 100000) : '482910');

      var text = [
        '====================================',
        '🪙 EASYCOIN DIGITAL RECEIPT SLIP',
        '====================================',
        'Status: ✓ SUCCESSFUL & PROTECTED',
        'Type: ' + (isOut ? 'Payment Sent (-)' : 'Deposit Received (+)'),
        'Amount: ₹ ' + tx.amount.toLocaleString('en-IN'),
        'Party: ' + tx.title,
        'Purpose: ' + (tx.note || (isOut ? 'Payment' : 'Deposit')),
        'Time: ' + tx.time,
        'Txn Reference: ' + pseudoId,
        'UTR ID: ' + pseudoUtr,
        'Account: Senior Savings (**** 8921)',
        'Guardian Shield: 🛡️ Active & Verified',
        '===================================='
      ].join('\n');

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      }
      if (window.EasyAudio) {
        window.EasyAudio.playClick();
        window.EasyAudio.speak('Receipt copied to clipboard.');
      }
      if (window.showEasyToast) {
        window.showEasyToast('📋 Mobile receipt copied to clipboard!', 'success', '🧾');
      }
    };

    // Close overlay on clicking backdrop
    var phoneReceiptOverlayEl = phoneEl.querySelector('#phoneReceiptOverlay');
    if (phoneReceiptOverlayEl) {
      phoneReceiptOverlayEl.addEventListener('click', function (e) {
        if (e.target === phoneReceiptOverlayEl) {
          window.closePhoneReceipt();
        }
      });
    }

    // SOS Emergency Button
    var sosBtn = phoneEl.querySelector('#sosFreezeBtn');
    if (sosBtn) {
      sosBtn.addEventListener('click', function () {
        if (window.EasySOS) {
          window.EasySOS.triggerSOSFlow();
        } else {
          if (window.EasyAPI) {
            window.EasyAPI.freezeAccount();
          }
          if (window.EasyAudio) {
            window.EasyAudio.playClick();
            window.EasyAudio.speak('Emergency Mode: Your card and transfers are temporarily locked. Guardian notified.');
          }
          if (window.showEasyToast) {
            window.showEasyToast('🚨 Emergency Freeze Active: Your account is safe and family guardian has received an alert.', 'error', '🚨');
          }
        }
      });
    }

    // Power button lock/unlock
    var powerBtn = phoneEl.querySelector('#powerBtn');
    var lockscreen = phoneEl.querySelector('#lockscreen');
    if (powerBtn && lockscreen) {
      powerBtn.addEventListener('click', function () {
        var isLocked = lockscreen.classList.toggle('on');
        if (window.EasyAudio) {
          window.EasyAudio.playLockSound(isLocked);
          if (isLocked) {
            window.EasyAudio.speak('Phone locked. Tap screen or power button to unlock.');
          }
        }
      });

      // Tap notification or lockscreen to unlock
      lockscreen.addEventListener('click', function () {
        lockscreen.classList.remove('on');
        if (window.EasyAudio) {
          window.EasyAudio.playLockSound(false);
          window.EasyAudio.speak('Unlocked. Welcome to EasyCoin.');
        }
      });
    }

    // Switch screens
    function switchScreen(targetId) {
      if (targetId !== 's-qr') {
        stopPhoneCamera();
      } else {
        if (qrTabScanBtn && qrTabScanBtn.classList.contains('active')) {
          startPhoneCamera();
        }
      }

      currentScreen = targetId;
      var screens = phoneEl.querySelectorAll('.screen');
      screens.forEach(function (s) {
        s.classList.remove('active');
      });

      var targetScreen = phoneEl.querySelector('#' + targetId);
      if (targetScreen) targetScreen.classList.add('active');

      tabs.forEach(function (t) {
        if (t.getAttribute('data-target') === targetId) {
          t.classList.add('active');
        } else {
          t.classList.remove('active');
        }
      });

      if (window.EasyAudio) {
        window.EasyAudio.playClick();
      }
    }

    // Device switch (iPhone vs Android)
    var devBtns = document.querySelectorAll('.devseg');
    devBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        devBtns.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        var dev = this.getAttribute('data-dev');
        if (dev === 'android') {
          phoneEl.classList.add('dev-android');
        } else {
          phoneEl.classList.remove('dev-android');
        }
        if (window.EasyAudio) window.EasyAudio.playClick();
      });
    });

    // Expose Phone Interface for UPI Circle & external triggers
    window.EasyPhone = {
      getBalance: function () {
        return balance;
      },
      deductBalance: function (amount, title, icon, note) {
        balance = Math.max(0, balance - amount);
        var balEl = phoneEl.querySelector('#balanceAmount');
        if (balEl) balEl.textContent = '₹ ' + balance.toLocaleString('en-IN');
        transactions.unshift({
          id: Date.now(),
          title: title,
          type: 'out',
          amount: amount,
          time: 'Just now',
          icon: icon || '👤',
          note: note || 'Minor Spend'
        });
        renderPassbook();
      }
    };
  }

  document.addEventListener('DOMContentLoaded', initPhoneSimulator);
  window.initPhoneSimulator = initPhoneSimulator;
})();
