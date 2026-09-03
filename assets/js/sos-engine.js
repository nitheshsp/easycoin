/**
 * EasyCoin SOS & Emergency Guardian Engine
 * Provides panic-proof countdown timers, spoken reassurance, GPS beacon simulation, and guardian unfreeze protocols.
 */
class EasySOSEngine {
  constructor() {
    this.countdownTimer = null;
    this.countdownSeconds = 8;
    this.isFrozen = false;
    this.guardian = {
      name: 'Daughter Ananya',
      relation: 'Daughter · Primary Guardian',
      phone: '+919811223344',
      avatar: '👩‍⚕️'
    };
  }

  // 1. Trigger Emergency SOS with 8-second safety countdown
  triggerSOSFlow(type = 'PANIC_FREEZE') {
    var overlay = document.getElementById('sosCountdownOverlay');
    var circle = document.getElementById('sosCountdownCircle');
    var numDisplay = document.getElementById('sosCountdownNum');
    var promptTxt = document.getElementById('sosPromptText');

    if (!overlay || !circle || !numDisplay) {
      // Direct execution fallback if modal elements are not present
      this.executeEmergencyFreeze();
      return;
    }

    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak('Emergency alert initiated. Freezing account in 8 seconds. Tap Cancel if accidental.');
    }

    overlay.classList.add('active');
    this.countdownSeconds = 8;
    numDisplay.textContent = this.countdownSeconds;

    var radius = 45;
    var circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = '0';

    if (promptTxt) {
      promptTxt.textContent = type === 'SCAM_CALL' ? '🚨 Scam Call Alert: Freezing card & alerting Ananya...' : '🚨 Emergency Freeze: Locking all withdrawals & sending GPS alert...';
    }

    clearInterval(this.countdownTimer);
    var self = this;

    this.countdownTimer = setInterval(() => {
      self.countdownSeconds--;
      numDisplay.textContent = self.countdownSeconds;
      
      var offset = circumference - (self.countdownSeconds / 8) * circumference;
      circle.style.strokeDashoffset = offset;

      if (window.EasyAudio && self.countdownSeconds > 0) {
        window.EasyAudio.playKeyTap(self.countdownSeconds);
      }

      if (self.countdownSeconds <= 0) {
        clearInterval(self.countdownTimer);
        overlay.classList.remove('active');
        self.executeEmergencyFreeze();
      }
    }, 1000);
  }

  // Cancel countdown if user tapped by mistake
  cancelSOS() {
    clearInterval(this.countdownTimer);
    var overlay = document.getElementById('sosCountdownOverlay');
    if (overlay) overlay.classList.remove('active');

    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak('Emergency alert cancelled. Your account remains normal.');
    }
  }

  // 2. Execute Emergency Freeze
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

    // Update UI banners
    this.updateFrozenUI(true);

    alert(`🚨 EMERGENCY LOCK ACTIVE\n\n1. All outgoing transfers are frozen.\n2. SMS Alert sent to ${this.guardian.name} (${this.guardian.phone}).\n3. GPS Coordinates: 28.6139° N, 77.2090° E dispatched.`);
  }

  // 3. Unfreeze Account with Guardian Passcode
  unfreezeWithPasscode(passcode = '1234') {
    if (passcode !== '1234') {
      if (window.EasyAudio) window.EasyAudio.speak('Incorrect passcode. Please try again.');
      alert('❌ Incorrect Guardian Passcode. Please enter 1234.');
      return false;
    }

    this.isFrozen = false;
    this.updateFrozenUI(false);

    if (window.EasyAudio) {
      window.EasyAudio.playLockSound(false);
      window.EasyAudio.speak('Account successfully restored. Normal banking resumed.');
    }

    alert('✅ Account Unlocked: Normal banking operations restored.');
    return true;
  }

  // 4. Senior Helpline 1-Touch Speed Dial
  callHelpline() {
    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak('Connecting to EasyCoin 24/7 Senior Human Assistant...');
    }
    setTimeout(() => {
      alert('📞 Connected to EasyCoin Priority Support: An empathetic human agent is speaking to you.');
    }, 1200);
  }

  // 5. Speed Dial Family Guardian
  callGuardian() {
    if (window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak(`Calling ${this.guardian.name}...`);
    }
    setTimeout(() => {
      alert(`📞 Calling ${this.guardian.name} (${this.guardian.phone})...`);
    }, 1000);
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
