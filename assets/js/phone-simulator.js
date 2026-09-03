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

    // QR Mode Tabs
    var qrTabScanBtn = phoneEl.querySelector('#qrTabScanBtn');
    var qrTabReceiveBtn = phoneEl.querySelector('#qrTabReceiveBtn');
    var qrScanView = phoneEl.querySelector('#qrScanView');
    var qrReceiveView = phoneEl.querySelector('#qrReceiveView');

    if (qrTabScanBtn && qrTabReceiveBtn) {
      qrTabScanBtn.addEventListener('click', function () {
        qrTabScanBtn.classList.add('active');
        qrTabReceiveBtn.classList.remove('active');
        qrScanView.style.display = 'block';
        qrReceiveView.style.display = 'none';
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Camera scanner active.');
        }
      });

      qrTabReceiveBtn.addEventListener('click', function () {
        qrTabReceiveBtn.classList.add('active');
        qrTabScanBtn.classList.remove('active');
        qrScanView.style.display = 'none';
        qrReceiveView.style.display = 'block';
        renderPhoneQR();
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Your personal receive QR code is on screen.');
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

        activeRecipient = { name: name, avatar: av, rel: 'Merchant QR' };
        enteredAmount = amt;
        updateAmountUI();

        var recNameEl = phoneEl.querySelector('#recName');
        var recAvEl = phoneEl.querySelector('#recAvatar');
        if (recNameEl) recNameEl.textContent = name;
        if (recAvEl) recAvEl.textContent = av;

        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('QR scanned for ' + name + '. Amount is ' + amt + ' Rupees. Tap Send to confirm.');
        }
        switchScreen('s-send');
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
        } else if (val === 'voice') {
          triggerVoicePay();
          return;
        } else {
          if (enteredAmount.length < 6) {
            enteredAmount += val;
            if (window.EasyAudio) window.EasyAudio.playKeyTap(val);
          }
        }

        updateAmountUI();
      });
    });

    function updateAmountUI() {
      if (!amountDisplay) return;
      var num = parseInt(enteredAmount, 10) || 0;
      amountDisplay.textContent = '₹ ' + (enteredAmount || '0');
      if (wordsDisplay) {
        wordsDisplay.textContent = num > 0 ? num.toLocaleString('en-IN') + ' Rupees' : 'Tap numbers or tap Mic to speak';
      }
    }

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
          window.EasyAPI.sendTransfer(activeRecipient.name, num, 'Direct Transfer', activeRecipient.avatar);
        }

        // Deduct balance
        balance -= num;
        var balEl = phoneEl.querySelector('#balanceAmount');
        if (balEl) balEl.textContent = '₹ ' + balance.toLocaleString('en-IN');

        // Play coin sound
        if (window.EasyAudio) {
          window.EasyAudio.playCoinSound();
          window.EasyAudio.speak('Success! ' + num + ' Rupees sent to ' + activeRecipient.name + '.');
        }

        // Add to transactions
        transactions.unshift({
          id: Date.now(),
          title: activeRecipient.name,
          type: 'out',
          amount: num,
          time: 'Just now',
          icon: activeRecipient.avatar || '👤',
          note: 'Direct Transfer'
        });

        renderPassbook();
        enteredAmount = '';
        updateAmountUI();

        // Show brief success alert
        alert('✅ Payment Sent: ₹ ' + num + ' to ' + activeRecipient.name);
        switchScreen('s-passbook');
      });
    }

    // Render Passbook items
    function renderPassbook() {
      var listEl = phoneEl.querySelector('#passbookList');
      if (!listEl) return;
      listEl.innerHTML = '';

      transactions.forEach(function (tx) {
        var item = document.createElement('div');
        item.className = 'passbook-item';
        var isOut = tx.type === 'out';
        item.innerHTML = `
          <div class="pb-icon ${isOut ? 'out' : 'in'}">${tx.icon}</div>
          <div class="pb-info">
            <div class="pb-title">${tx.title}</div>
            <div class="pb-time">${tx.time} · ${tx.note}</div>
          </div>
          <div class="pb-amount ${isOut ? 'out' : 'in'}">
            ${isOut ? '-' : '+'} ₹ ${tx.amount.toLocaleString('en-IN')}
          </div>
        `;
        item.addEventListener('click', function () {
          if (window.EasyAudio) {
            window.EasyAudio.playClick();
            var readout = (isOut ? 'Sent ' : 'Received ') + tx.amount + ' Rupees with ' + tx.title + ' on ' + tx.time;
            window.EasyAudio.speak(readout);
          }
        });
        listEl.appendChild(item);
      });
    }
    renderPassbook();

    // SOS Emergency Button
    var sosBtn = phoneEl.querySelector('#sosFreezeBtn');
    if (sosBtn) {
      sosBtn.addEventListener('click', function () {
        if (window.EasyAPI) {
          window.EasyAPI.freezeAccount();
        }
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Emergency Mode: Your card and transfers are temporarily locked. Guardian notified.');
        }
        alert('🚨 Emergency Freeze Active: Your account is safe and family guardian has received an alert.');
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
  }

  document.addEventListener('DOMContentLoaded', initPhoneSimulator);
  window.initPhoneSimulator = initPhoneSimulator;
})();
