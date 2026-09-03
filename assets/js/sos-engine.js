/**
 * EasyCoin SOS & Emergency Guardian Engine
 * Provides panic-proof countdown timers, spoken reassurance, in-website confirmation cards, and guardian unfreeze protocols.
 * Fully eliminates browser native alert() / prompt() popups in favor of rich in-website UI.
 */
class EasySOSEngine {
  constructor() {
    this.countdownTimer = null;
    this.countdownSeconds = 8;
    this.isFrozen = false;
    this.toastTimeout = null;
    this.guardian = {
      name: 'Daughter Ananya',
      relation: 'Daughter · Primary Guardian',
      phone: '+919811223344',
      avatar: '👩‍⚕️'
    };
  }

  // 1. Trigger Emergency SOS with safety countdown
  triggerSOSFlow(type = 'PANIC_FREEZE') {
    var overlay = document.getElementById('sosCountdownOverlay');
    var circle = document.getElementById('sosCountdownCircle');
    var numDisplay = document.getElementById('sosCountdownNum');
    var promptTxt = document.getElementById('sosPromptText');
    var countdownState = document.getElementById('sosCountdownState');
    var activeState = document.getElementById('sosActiveState');

    if (!overlay) {
      this.executeEmergencyFreeze();
      return;
    }

    // Reset view states to countdown
    if (countdownState) countdownState.style.display = 'flex';
    if (activeState) activeState.style.display = 'none';

    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak('Emergency alert initiated. Freezing account in 8 seconds. Tap Cancel if accidental.');
    }

    overlay.classList.add('active');
    this.countdownSeconds = 8;
    if (numDisplay) numDisplay.textContent = this.countdownSeconds;

    var radius = 45;
    var circumference = 2 * Math.PI * radius;
    if (circle) {
      circle.style.strokeDasharray = `${circumference} ${circumference}`;
      circle.style.strokeDashoffset = '0';
    }

    if (promptTxt) {
      promptTxt.textContent = type === 'SCAM_CALL' 
        ? '🚨 Scam Call Alert: Freezing card & alerting Ananya...' 
        : '🚨 Emergency Freeze: Locking all withdrawals & sending GPS alert...';
    }

    clearInterval(this.countdownTimer);
    var self = this;

    this.countdownTimer = setInterval(() => {
      self.countdownSeconds--;
      if (numDisplay) numDisplay.textContent = self.countdownSeconds;

      if (circle) {
        var offset = circumference - (self.countdownSeconds / 8) * circumference;
        circle.style.strokeDashoffset = offset;
      }

      if (window.EasyAudio && self.countdownSeconds > 0) {
        window.EasyAudio.playKeyTap(self.countdownSeconds);
      }

      if (self.countdownSeconds <= 0) {
        clearInterval(self.countdownTimer);
        self.countdownTimer = null;
        self.executeEmergencyFreeze();
      }
    }, 1000);
  }

  // Cancel countdown if user tapped by mistake
  cancelSOS() {
    clearInterval(this.countdownTimer);
    this.countdownTimer = null;
    var overlay = document.getElementById('sosCountdownOverlay');
    if (overlay) overlay.classList.remove('active');

    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak('Emergency alert cancelled. Your account remains normal.');
    }
  }

  // 2. Execute Emergency Freeze (Replaced browser alert with in-website confirmation card)
  async executeEmergencyFreeze() {
    this.isFrozen = true;

    // Call backend API if available
    if (window.EasyAPI) {
      await window.EasyAPI.freezeAccount();
    }

    // Spoken Audio Guidance
    if (window.EasyAudio) {
      window.EasyAudio.playLockSound(true);
      window.EasyAudio.speak('Emergency Lock Active. All payments are frozen. Stay calm, your money is safe and Daughter Ananya has received an alert with your location.');
    }

    // Update in-page UI banners
    this.updateFrozenUI(true);

    // Switch modal from countdown to the in-website confirmation card
    var overlay = document.getElementById('sosCountdownOverlay');
    var countdownState = document.getElementById('sosCountdownState');
    var activeState = document.getElementById('sosActiveState');

    if (countdownState) countdownState.style.display = 'none';
    if (activeState) activeState.style.display = 'flex';
    if (overlay) overlay.classList.add('active');
  }

  // Dismiss in-website lock active modal
  dismissActiveLock() {
    var overlay = document.getElementById('sosCountdownOverlay');
    if (overlay) overlay.classList.remove('active');

    // Smoothly focus on frozen banner
    var banner = document.querySelector('.frozen-alert-banner');
    if (banner) {
      banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak('Account freeze is active. Use your guardian PIN whenever you wish to unlock.');
    }
  }

  // Speak lock details aloud
  speakLockStatus() {
    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak(
        'Security Status: Emergency Lock Active. ' +
        '1: All outgoing transfers are frozen. ' +
        '2: SMS Alert sent to Daughter Ananya at +91 98112 23344. ' +
        '3: GPS coordinates 28.6139 North, 77.2090 East dispatched.'
      );
    }
  }

  // 3. In-Website Guardian Passcode Unlock Modal (Replaces browser prompt)
  openUnlockModal() {
    var modal = document.getElementById('unfreezeModal');
    var input = document.getElementById('guardianPinInput');
    var errMsg = document.getElementById('unfreezeErrorMsg');

    if (errMsg) errMsg.style.display = 'none';
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 150);
    }
    if (modal) modal.classList.add('active');

    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak('Enter your 4 digit Guardian PIN to unlock account.');
    }
  }

  closeUnlockModal() {
    var modal = document.getElementById('unfreezeModal');
    if (modal) modal.classList.remove('active');
    if (window.EasyAudio) window.EasyAudio.playClick();
  }

  submitPasscode() {
    var input = document.getElementById('guardianPinInput');
    var errMsg = document.getElementById('unfreezeErrorMsg');
    var pin = input ? input.value.trim() : '';

    if (pin === '1234') {
      this.closeUnlockModal();
      this.unfreezeWithPasscode('1234');
    } else {
      if (errMsg) errMsg.style.display = 'block';
      if (input) {
        input.value = '';
        input.focus();
      }
      if (window.EasyAudio) {
        window.EasyAudio.speak('Incorrect PIN. Please enter 1234.');
      }
    }
  }

  unfreezeWithPasscode(passcode = '1234') {
    if (passcode !== '1234') {
      if (window.EasyAudio) window.EasyAudio.speak('Incorrect passcode. Please try again.');
      return false;
    }

    this.isFrozen = false;
    this.updateFrozenUI(false);

    if (window.EasyAudio) {
      window.EasyAudio.playLockSound(false);
      window.EasyAudio.speak('Account successfully restored. Normal banking operations resumed.');
    }

    this.showToast('✅ Account Unlocked: Normal banking operations restored.', 'success', '🔓');
    return true;
  }

  // 4. Senior Helpline 1-Touch Speed Dial
  callHelpline() {
    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak('Connecting to EasyCoin 24/7 Senior Human Assistant...');
    }
    this.showToast('📞 Connected to EasyCoin Priority Support: Senior Agent speaking.', 'info', '📞');
  }

  // 5. Speed Dial Family Guardian
  callGuardian() {
    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak(`Calling ${this.guardian.name}...`);
    }
    this.showToast(`📞 Calling ${this.guardian.name} (${this.guardian.phone})...`, 'info', '👩‍⚕️');
  }

  // Universal in-website floating toast notification
  showToast(msg, type = 'success', icon = '✅') {
    var toast = document.getElementById('easyToast');
    var msgEl = document.getElementById('easyToastMsg');
    var iconEl = document.getElementById('easyToastIcon');

    if (!toast) {
      // Fallback create toast element if missing
      toast = document.createElement('div');
      toast.id = 'easyToast';
      toast.className = 'easy-toast-container';
      toast.innerHTML = '<span id="easyToastIcon"></span><span id="easyToastMsg"></span>';
      document.body.appendChild(toast);
      msgEl = document.getElementById('easyToastMsg');
      iconEl = document.getElementById('easyToastIcon');
    }

    toast.className = 'easy-toast-container ' + type;
    if (msgEl) msgEl.textContent = msg;
    if (iconEl) iconEl.textContent = icon;

    toast.classList.add('active');

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('active');
    }, 3500);
  }

  // Update UI Elements to reflect frozen state
  updateFrozenUI(frozen) {
    var frozenBanners = document.querySelectorAll('.frozen-alert-banner, .phone-frozen-banner');
    frozenBanners.forEach(b => {
      b.style.display = frozen ? 'flex' : 'none';
    });

    var normalCards = document.querySelectorAll('.sos-panic-card');
    normalCards.forEach(c => {
      c.style.display = frozen ? 'none' : 'block';
    });
  }
}

window.EasySOS = new EasySOSEngine();
window.showEasyToast = function(msg, type, icon) {
  if (window.EasySOS) window.EasySOS.showToast(msg, type, icon);
};
