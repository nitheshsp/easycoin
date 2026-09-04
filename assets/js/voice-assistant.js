/**
 * EasyCoin Multi-Lingual Speech Assistant Engine
 * Seamless voice banking with real-time SpeechRecognition, animated waveforms,
 * and multi-lingual NLP parsing (Hindi, Tamil, English).
 */
(function () {
  'use strict';

  class SpeechAssistant {
    constructor() {
      this.modal = null;
      this.micCore = null;
      this.statusHeading = null;
      this.transcriptCard = null;
      this.transcriptText = null;
      this.waveBars = null;
      this.intentCard = null;
      this.detectedLangText = null;
      this.intentAvatar = null;
      this.intentName = null;
      this.intentRel = null;
      this.intentAmount = null;
      this.intentPrompt = null;
      this.proceedPayBtn = null;
      this.toggleListenBtn = null;
      this.toggleListenLabel = null;

      this.recognition = null;
      this.isListening = false;
      this.lastParsedData = null;

      document.addEventListener('DOMContentLoaded', () => this.init());
    }

    init() {
      this.modal = document.getElementById('voiceAssistantOverlay');
      this.micCore = document.getElementById('voiceMicCore');
      this.statusHeading = document.getElementById('voiceStatusHeading');
      this.transcriptCard = document.getElementById('voiceTranscriptCard');
      this.transcriptText = document.getElementById('voiceTranscriptText');
      this.waveBars = document.getElementById('voiceWaveBars');
      this.intentCard = document.getElementById('voiceIntentCard');
      this.detectedLangText = document.getElementById('voiceDetectedLangText');
      this.intentAvatar = document.getElementById('voiceIntentAvatar');
      this.intentName = document.getElementById('voiceIntentName');
      this.intentRel = document.getElementById('voiceIntentRel');
      this.intentAmount = document.getElementById('voiceIntentAmount');
      this.intentPrompt = document.getElementById('voiceIntentPrompt');
      this.proceedPayBtn = document.getElementById('voiceProceedPayBtn');
      this.toggleListenBtn = document.getElementById('voiceToggleListenBtn');
      this.toggleListenLabel = document.getElementById('voiceToggleListenLabel');

      // Wire floating dock mic buttons if present
      const dockMicBtn = document.getElementById('dockMicBtn');
      if (dockMicBtn) {
        dockMicBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.openOverlay();
        });
      }

      // Wire mic core click
      if (this.micCore) {
        this.micCore.addEventListener('click', () => {
          this.toggleListening();
        });
      }

      // Wire proceed to pay button
      if (this.proceedPayBtn) {
        this.proceedPayBtn.addEventListener('click', () => {
          this.executeParsedTransfer();
        });
      }

      // Wire modal backdrop click
      if (this.modal) {
        this.modal.addEventListener('click', (e) => {
          if (e.target === this.modal) {
            this.closeOverlay();
          }
        });
      }
    }

    openOverlay() {
      if (!this.modal) return;

      if (window.EasyAudio) {
        window.EasyAudio.playClick();
      }

      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Reset state
      this.resetCardState();
      this.startListening();
    }

    closeOverlay() {
      if (!this.modal) return;

      this.stopListening();
      this.modal.classList.remove('active');
      document.body.style.overflow = '';

      if (window.EasyAudio) {
        window.EasyAudio.playClick();
      }
    }

    resetCardState() {
      if (this.intentCard) this.intentCard.classList.remove('active');
      if (this.transcriptCard) this.transcriptCard.classList.remove('has-text');
      if (this.transcriptText) {
        this.transcriptText.className = 'voice-transcript-text placeholder';
        this.transcriptText.textContent = '"Speak your command (e.g. Rahul ko 500 rupaye bhej do, or Send 500 to Son)"';
      }
      if (this.statusHeading) {
        this.statusHeading.textContent = 'Listening... Speak in Hindi, Tamil, or English';
      }
      this.lastParsedData = null;
    }

    startListening() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      this.setListeningVisuals(true);

      if (!SpeechRecognition) {
        if (this.statusHeading) {
          this.statusHeading.textContent = 'Voice Ready: Tap an example bubble below or speak into mic';
        }
        return;
      }

      try {
        if (this.recognition) {
          this.recognition.abort();
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'en-IN';
        this.recognition.continuous = false;
        this.recognition.interimResults = true;

        this.recognition.onstart = () => {
          this.isListening = true;
          this.setListeningVisuals(true);
        };

        this.recognition.onresult = (event) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }

          if (this.transcriptText) {
            this.transcriptText.className = 'voice-transcript-text';
            this.transcriptText.textContent = `"${transcript}"`;
          }
          if (this.transcriptCard) {
            this.transcriptCard.classList.add('has-text');
          }

          if (event.results[0].isFinal) {
            this.processVoiceText(transcript);
          }
        };

        this.recognition.onerror = (err) => {
          console.warn('Speech recognition error:', err);
          this.setListeningVisuals(false);
          if (this.statusHeading) {
            this.statusHeading.textContent = 'Could not catch that clearly. Tap below or try again:';
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.setListeningVisuals(false);
        };

        this.recognition.start();
      } catch (e) {
        console.warn('Speech recognition start failed:', e);
        this.setListeningVisuals(false);
      }
    }

    stopListening() {
      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch (e) {}
      }
      this.isListening = false;
      this.setListeningVisuals(false);
    }

    toggleListening() {
      if (this.isListening) {
        this.stopListening();
      } else {
        this.resetCardState();
        this.startListening();
      }
    }

    setListeningVisuals(active) {
      this.isListening = active;
      if (this.micCore) {
        if (active) this.micCore.classList.add('listening');
        else this.micCore.classList.remove('listening');
      }
      if (this.waveBars) {
        if (active) this.waveBars.classList.add('active');
        else this.waveBars.classList.remove('active');
      }
      if (this.toggleListenLabel) {
        this.toggleListenLabel.textContent = active ? 'Stop Listening' : 'Listen Again';
      }
    }

    testVoicePhrase(phrase) {
      if (window.EasyAudio) {
        window.EasyAudio.playClick();
      }

      this.stopListening();

      if (this.transcriptText) {
        this.transcriptText.className = 'voice-transcript-text';
        this.transcriptText.textContent = `"${phrase}"`;
      }
      if (this.transcriptCard) {
        this.transcriptCard.classList.add('has-text');
      }

      this.processVoiceText(phrase);
    }

    async processVoiceText(text) {
      if (!text || !text.trim()) return;

      if (this.statusHeading) {
        this.statusHeading.textContent = '🧠 Analyzing spoken command with AI...';
      }

      const lower = text.toLowerCase();

      // Check if it's a balance inquiry
      if (lower.includes('balance') || lower.includes('paisa') || lower.includes('money') || lower.includes('இருப்பு')) {
        const bal = (window.EasyBanking && typeof window.EasyBanking.getBalance === 'function')
          ? window.EasyBanking.getBalance()
          : 14250;
        
        if (this.statusHeading) {
          this.statusHeading.textContent = `✅ Balance Checked: ₹${bal.toLocaleString('en-IN')}`;
        }
        
        const spoken = `Your current EasyCoin balance is ${bal.toLocaleString('en-IN')} Rupees. Your money is safe in your digital vault.`;
        if (window.EasyAudio) {
          window.EasyAudio.playCoinSound();
          window.EasyAudio.speak(spoken);
        }
        if (typeof window.showEasyToast === 'function') {
          window.showEasyToast(`💳 Balance: ₹${bal.toLocaleString('en-IN')}`);
        }
        return;
      }

      // Check if it's a statement inquiry
      if (lower.includes('statement') || lower.includes('passbook') || lower.includes('receipt') || lower.includes('பாஸ்புக்')) {
        this.closeOverlay();
        if (window.EasyBanking && typeof window.EasyBanking.openStatementModal === 'function') {
          window.EasyBanking.openStatementModal();
        } else {
          const pb = document.getElementById('passbookSection');
          if (pb) pb.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }

      // Parse payment intent via backend Multi-Lingual NLP Engine
      try {
        let result = null;
        if (window.EasyAPI && typeof window.EasyAPI.parseVoiceCommand === 'function') {
          result = await window.EasyAPI.parseVoiceCommand(text);
        }

        // Fallback parser if offline
        if (!result) {
          const numMatch = text.match(/\d+/);
          const amount = numMatch ? parseInt(numMatch[0], 10) : 500;
          result = {
            recipientName: 'Son Rahul',
            amount,
            avatar: '👨‍🦱',
            languageDetected: 'en',
            spokenPrompt: `Understood: Send ₹${amount} to Son Rahul. Please tap Confirm to send.`
          };
        }

        this.displayIntentCard(result, text);
      } catch (err) {
        console.error('Error processing voice command:', err);
        if (this.statusHeading) {
          this.statusHeading.textContent = 'Could not parse command. Please try again.';
        }
      }
    }

    displayIntentCard(data, rawText) {
      this.lastParsedData = data;

      if (this.statusHeading) {
        this.statusHeading.textContent = '✨ Command Understood!';
      }

      // Display detected language
      if (this.detectedLangText) {
        const langMap = {
          'hi': '🇮🇳 हिन्दी Recognized',
          'ta': '🇮🇳 தமிழ் Recognized',
          'en': '🇬🇧 English Recognized'
        };
        this.detectedLangText.textContent = langMap[data.languageDetected] || 'AI Recognized';
      }

      // Display entities
      if (this.intentAvatar) this.intentAvatar.textContent = data.avatar || '👤';
      if (this.intentName) this.intentName.textContent = data.recipientName || 'Beneficiary';
      if (this.intentRel) this.intentRel.textContent = data.relation || 'Contact';
      if (this.intentAmount) this.intentAmount.textContent = `₹ ${data.amount}`;
      if (this.intentPrompt) this.intentPrompt.textContent = data.spokenPrompt || `Send ₹${data.amount} to ${data.recipientName}`;

      if (this.intentCard) {
        this.intentCard.classList.add('active');
        this.intentCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Speak localized confirmation
      if (window.EasyAudio && data.spokenPrompt) {
        window.EasyAudio.speak(data.spokenPrompt);
      }
    }

    executeParsedTransfer() {
      if (!this.lastParsedData) return;

      const data = this.lastParsedData;
      this.closeOverlay();

      // If standalone app pay modal exists
      if (typeof window.openPayModal === 'function') {
        window.openPayModal(data.recipientName, data.avatar || '👤', data.relation || 'Contact');
        
        // Auto-fill amount into keypad
        const display = document.getElementById('payAmountDisplay');
        if (display) {
          display.textContent = `₹ ${data.amount}`;
        }
        const noteInput = document.getElementById('spendNoteInput');
        if (noteInput) {
          noteInput.value = `Voice Pay (${data.recipientName})`;
        }
      } else if (window.EasyBanking && typeof window.EasyBanking.openPayModal === 'function') {
        window.EasyBanking.openPayModal(data.recipientName, data.avatar || '👤', data.relation || 'Contact');
      } else {
        // Phone simulator support
        const simAmt = document.getElementById('enteredAmount');
        if (simAmt) simAmt.textContent = `₹ ${data.amount}`;
      }

      if (typeof window.showEasyToast === 'function') {
        window.showEasyToast(`🎙️ Voice Loaded: ₹${data.amount} to ${data.recipientName}`);
      }
    }
  }

  window.EasyVoice = new SpeechAssistant();
})();
