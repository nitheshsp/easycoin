/**
 * EasyCoin Standalone Web App Banking Engine
 * Powers full-screen accessible digital payments, voice assistance, and tactile keypad interactions.
 */
(function () {
  'use strict';

  var appBalance = 14250;
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
    }
    syncBalanceUI();

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

    if (tileReceive) {
      tileReceive.addEventListener('click', function () {
        renderAppQR();
        if (qrModal) qrModal.classList.add('active');
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Scan merchant QR code or show your personal receive QR.');
        }
      });
    }

    if (closeQrModalBtn && qrModal) {
      closeQrModalBtn.addEventListener('click', function () {
        qrModal.classList.remove('active');
        if (window.EasyAudio) window.EasyAudio.playClick();
      });
    }

    function renderAppQR() {
      var appQrBox = document.getElementById('appQrCodeContainer');
      if (appQrBox && window.EasyQR) {
        appQrBox.innerHTML = window.EasyQR.generateQRCodeSVG('upi://pay?pa=harish.chandra@easycoin&pn=Harish%20Chandra', 200);
      }
    }
    renderAppQR();

    // Standalone QR Tabs
    var appQrTabScanBtn = document.getElementById('appQrTabScanBtn');
    var appQrTabReceiveBtn = document.getElementById('appQrTabReceiveBtn');
    var appQrScanView = document.getElementById('appQrScanView');
    var appQrReceiveView = document.getElementById('appQrReceiveView');

    if (appQrTabScanBtn && appQrTabReceiveBtn) {
      appQrTabScanBtn.addEventListener('click', function () {
        appQrTabScanBtn.classList.add('active');
        appQrTabReceiveBtn.classList.remove('active');
        if (appQrScanView) appQrScanView.style.display = 'block';
        if (appQrReceiveView) appQrReceiveView.style.display = 'none';
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Camera scanner active.');
        }
      });

      appQrTabReceiveBtn.addEventListener('click', function () {
        appQrTabReceiveBtn.classList.add('active');
        appQrTabScanBtn.classList.remove('active');
        if (appQrScanView) appQrScanView.style.display = 'none';
        if (appQrReceiveView) appQrReceiveView.style.display = 'block';
        renderAppQR();
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('Your personal receive QR code is ready on screen.');
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

        if (qrModal) qrModal.classList.remove('active');
        openPayModal(name, av, 'Merchant QR');
        enteredAmount = amt;
        updateModalAmount();

        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak('QR scanned for ' + name + '. Amount is ' + amt + ' Rupees. Tap Confirm to pay.');
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

    function openPayModal(name, avatar, rel) {
      activeRecipient = { name: name, avatar: avatar, rel: rel };
      var modalName = document.getElementById('modalRecName');
      var modalAv = document.getElementById('modalRecAv');
      if (modalName) modalName.textContent = name;
      if (modalAv) modalAv.textContent = avatar;

      enteredAmount = '';
      updateModalAmount();

      if (payModal) payModal.classList.add('active');
      if (window.EasyAudio) {
        window.EasyAudio.playClick();
        window.EasyAudio.speak('Transferring money to ' + name + '. Tap numbers or speak amount.');
      }
    }

    if (closeModalBtn && payModal) {
      closeModalBtn.addEventListener('click', function () {
        payModal.classList.remove('active');
        if (window.EasyAudio) window.EasyAudio.playClick();
      });
    }

    // Modal Senior Keypad
    var modalKeys = document.querySelectorAll('.m-key-btn');
    modalKeys.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var val = this.getAttribute('data-val');
        if (val === 'clear') {
          enteredAmount = '';
          if (window.EasyAudio) window.EasyAudio.playClick();
        } else if (val === 'voice') {
          triggerVoiceInput();
          return;
        } else {
          if (enteredAmount.length < 6) {
            enteredAmount += val;
            if (window.EasyAudio) window.EasyAudio.playKeyTap(val);
          }
        }
        updateModalAmount();
      });
    });

    function updateModalAmount() {
      var amtEl = document.getElementById('modalAmountVal');
      var wordsEl = document.getElementById('modalAmountWords');
      var num = parseInt(enteredAmount, 10) || 0;

      if (amtEl) amtEl.textContent = '₹ ' + (enteredAmount || '0');
      if (wordsEl) {
        wordsEl.textContent = num > 0 ? num.toLocaleString('en-IN') + ' Rupees' : 'Tap numbers to enter amount';
      }
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

        // Notify backend API if connected
        if (window.EasyAPI) {
          window.EasyAPI.sendTransfer(activeRecipient.name, num, 'Direct Payment', activeRecipient.avatar);
        }

        appBalance -= num;
        syncBalanceUI();

        if (window.EasyAudio) {
          window.EasyAudio.playCoinSound();
          window.EasyAudio.speak('Payment Successful! ' + num + ' Rupees sent to ' + activeRecipient.name + '.');
        }

        transactions.unshift({
          id: Date.now(),
          name: activeRecipient.name,
          type: 'out',
          amount: num,
          time: 'Just now',
          icon: activeRecipient.avatar,
          desc: 'Direct Payment'
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
        alert('✅ Success! ₹ ' + num + ' sent to ' + activeRecipient.name);
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

    // Render Standalone Passbook
    function renderPassbook() {
      var listEl = document.getElementById('standalonePassbookList');
      if (!listEl) return;
      listEl.innerHTML = '';

      transactions.forEach(function (tx) {
        var row = document.createElement('div');
        row.className = 'passbook-item';
        var isOut = tx.type === 'out';
        row.innerHTML = `
          <div class="pb-icon ${isOut ? 'out' : 'in'}">${tx.icon}</div>
          <div class="pb-info">
            <div class="pb-title">${tx.name}</div>
            <div class="pb-time">${tx.time} · ${tx.desc}</div>
          </div>
          <div class="pb-amount ${isOut ? 'out' : 'in'}">
            ${isOut ? '-' : '+'} ₹ ${tx.amount.toLocaleString('en-IN')}
          </div>
        `;
        row.addEventListener('click', function () {
          if (window.EasyAudio) {
            window.EasyAudio.playClick();
            var readout = (isOut ? 'Paid ' : 'Received ') + tx.amount + ' Rupees with ' + tx.name + ' on ' + tx.time;
            window.EasyAudio.speak(readout);
          }
        });
        listEl.appendChild(row);
      });
    }
    renderPassbook();

    // Expose Banking Interface for UPI Circle & Modules
    window.EasyBanking = {
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
    };
  }

  document.addEventListener('DOMContentLoaded', initStandaloneApp);
})();
