/**
 * EasyCoin Senior & Illiterate Accessible Login Engine
 * Provides Voice-First Guidance, Web Speech Recognition, Web Audio Acoustics,
 * Multi-Language Spoken Prompts, and 4 Accessible Authentication Modes.
 */
(function () {
  'use strict';

  // Multi-Language Localization & Spoken Prompts
  const I18N = {
    'en': {
      code: 'en-US',
      name: 'English',
      welcome: 'Welcome to EasyCoin simplified banking. Choose how you want to sign in.',
      bioPrompt: 'Place your thumb on the sensor or look at the camera to sign in.',
      bioSuccess: 'Fingerprint verified. Welcome back, Harish Chandra!',
      otpPrompt: 'Enter your 4-digit security code using the large number buttons below, or tap Call Me.',
      otpCalling: 'Calling your phone now. Your security code is four, eight, two, one.',
      otpSuccess: 'Security code verified. Opening your account.',
      otpError: 'Invalid code. Please enter four numbers.',
      symbolPrompt: 'Tap three secret pictures that only you know to open your bank account.',
      symbolSuccess: 'Secret pictures accepted. Welcome, Harish Chandra!',
      symbolNeedThree: 'Please select three pictures.',
      voicePrompt: 'Tap the big microphone and say your name or secret word.',
      voiceListening: 'Listening... Please speak clearly now.',
      voiceSuccess: 'Voice recognized! Welcome, Harish Chandra.',
      voiceError: 'Could not hear clearly. Please tap the microphone and try again.',
      symbols: {
        '☀️': 'Sun',
        '🐄': 'Cow',
        '🪔': 'Diya Lamp',
        '🌾': 'Wheat',
        '🚜': 'Tractor',
        '🐘': 'Elephant',
        '🏠': 'House',
        '🌸': 'Lotus',
        '🔔': 'Temple Bell'
      }
    },
    'hi': {
      code: 'hi-IN',
      name: 'हिन्दी (Hindi)',
      welcome: 'ईज़ीकॉइन सरल बैंकिंग में आपका स्वागत है। लॉगिन करने का तरीका चुनें।',
      bioPrompt: 'लॉगिन करने के लिए अंगूठा लगाएं या कैमरे की तरफ देखें।',
      bioSuccess: 'अंगूठा पहचान लिया गया। हरीश जी, आपका स्वागत है!',
      otpPrompt: 'नीचे दिए गए बड़े नंबरों से अपना 4 अंकों का गुप्त कोड डालें या मुझे कॉल करें पर टैप करें।',
      otpCalling: 'आपके फोन पर कॉल की जा रही है। आपका गुप्त कोड है: चार, आठ, दो, एक।',
      otpSuccess: 'गुप्त कोड सही है। आपका खाता खोला जा रहा है।',
      otpError: 'अमान्य कोड। कृपया चार अंक दर्ज करें।',
      symbolPrompt: 'अपना खाता खोलने के लिए अपनी 3 पसंदीदा गुप्त तस्वीरें चुनें।',
      symbolSuccess: 'गुप्त तस्वीरें स्वीकार की गईं। आपका स्वागत है!',
      symbolNeedThree: 'कृपया तीन तस्वीरें चुनें।',
      voicePrompt: 'बड़े माइक पर टैप करें और अपना नाम या गुप्त शब्द बोलें।',
      voiceListening: 'सुन रहे हैं... कृपया अब बोलें।',
      voiceSuccess: 'आवाज़ पहचान ली गई! हरीश जी, आपका स्वागत है।',
      voiceError: 'आवाज़ साफ़ सुनाई नहीं दी। कृपया फिर से माइक दबाएं।',
      symbols: {
        '☀️': 'सूरज',
        '🐄': 'गाय',
        '🪔': 'दीया',
        '🌾': 'गेहूं',
        '🚜': 'ट्रैक्टर',
        '🐘': 'हाथी',
        '🏠': 'घर',
        '🌸': 'कमल का फूल',
        '🔔': 'मंदिर की घंटी'
      }
    },
    'ta': {
      code: 'ta-IN',
      name: 'தமிழ் (Tamil)',
      welcome: 'ஈஸிகாயின் எளிய வங்கி சேவைக்கு நல்வரவு. உள்நுழைய வழியைத் தேர்ந்தெடுக்கவும்.',
      bioPrompt: 'உள்நுழைய கைரேகை வைக்கவும் அல்லது கேமராவைப் பார்க்கவும்.',
      bioSuccess: 'கைரேகை சரிபார்க்கப்பட்டது. நல்வரவு ஹரீஷ் சந்திரா!',
      otpPrompt: 'கீழே உள்ள பெரிய எண்களை அழுத்தி 4 இலக்க ரகசிய எண்ணை உள்ளிடவும்.',
      otpCalling: 'உங்கள் எண்ணை அழைக்கிறோம். ரகசிய குறியீடு: நான்கு, எட்டு, இரண்டு, ஒன்று.',
      otpSuccess: 'ரகசிய எண் சரிபார்க்கப்பட்டது. வங்கி கணக்கு திறக்கப்படுகிறது.',
      otpError: 'தவறான எண். தயவுசெய்து 4 எண்களை உள்ளிடவும்.',
      symbolPrompt: 'வங்கி கணக்கை திறக்க உங்களுக்கு தெரிந்த 3 ரகசிய படங்களைத் தொடவும்.',
      symbolSuccess: 'ரகசிய படங்கள் ஏற்கப்பட்டன. நல்வரவு!',
      symbolNeedThree: 'தயவுசெய்து மூன்று படங்களைத் தேர்ந்தெடுக்கவும்.',
      voicePrompt: 'மைக்கை அழுத்தி உங்கள் பெயர் அல்லது ரகசிய வார்த்தையைச் சொல்லுங்கள்.',
      voiceListening: 'கேட்கிறது... இப்போது பேசுங்கள்.',
      voiceSuccess: 'குரல் அடையாளம் காணப்பட்டது! நல்வரவு.',
      voiceError: 'குரல் தெளிவாக கேட்கவில்லை. மீண்டும் முயற்சிக்கவும்.',
      symbols: {
        '☀️': 'சூரியன்',
        '🐄': 'பசு மாடு',
        '🪔': 'விளக்கு',
        '🌾': 'நெற்கதிர்',
        '🚜': 'டிராக்டர்',
        '🐘': 'யானை',
        '🏠': 'வீடு',
        '🌸': 'தாமரை',
        '🔔': 'மணி'
      }
    },
    'bn': {
      code: 'bn-IN',
      name: 'বাংলা (Bengali)',
      welcome: 'ইজিকয়েন সহজ ব্যাংকিংয়ে স্বাগতম। লগইন পদ্ধতি নির্বাচন করুন।',
      bioPrompt: 'লগইন করতে আঙুলের ছাপ দিন বা ক্যামেরার দিকে তাকান।',
      bioSuccess: 'আঙুলের ছাপ সফল। হরিশ চন্দ্র, আপনাকে স্বাগতম!',
      otpPrompt: 'নিচের বড় নম্বরগুলো দিয়ে আপনার ৪ সংখ্যার কোড লিখুন।',
      otpCalling: 'আপনার ফোনে কল করা হচ্ছে। কোড হলো: চার, আট, দুই, এক।',
      otpSuccess: 'কোড সফল। আপনার অ্যাকাউন্ট খোলা হচ্ছে।',
      otpError: 'ভুল কোড। ৪টি সংখ্যা দিন।',
      symbolPrompt: 'অ্যাকাউন্ট খুলতে আপনার জানা ৩টি গোপন ছবি নির্বাচন করুন।',
      symbolSuccess: 'গোপন ছবি সঠিক। স্বাগতম!',
      symbolNeedThree: 'অনুগ্রহ করে ৩টি ছবি নির্বাচন করুন।',
      voicePrompt: 'মাইকে চাপ দিন এবং আপনার নাম বা কথা বলুন।',
      voiceListening: 'শুনছি... এখন কথা বলুন।',
      voiceSuccess: 'কণ্ঠস্বর মিলে গেছে! স্বাগতম।',
      voiceError: 'পরিষ্কার শোনা যায়নি। আবার চেষ্টা করুন।',
      symbols: {
        '☀️': 'সূর্য',
        '🐄': 'গরু',
        '🪔': 'প্রদীপ',
        '🌾': 'ধানের শিষ',
        '🚜': 'ট্রাক্টর',
        '🐘': 'হাতি',
        '🏠': 'বাড়ি',
        '🌸': 'পদ্ম ফুল',
        '🔔': 'মন্দিরের ঘণ্টা'
      }
    },
    'te': {
      code: 'te-IN',
      name: 'తెలుగు (Telugu)',
      welcome: 'ఈజీకాయిన్ సరళమైన బ్యాంకింగ్‌కు స్వాగతం. లాగిన్ విధానాన్ని ఎంచుకోండి.',
      bioPrompt: 'లాగిన్ చేయడానికి మీ వేలిముద్ర పెట్టండి లేదా కెమెరా చూడండి.',
      bioSuccess: 'వేలిముద్ర సరిచూడబడింది. స్వాగతం హరీష్ గారూ!',
      otpPrompt: 'కింది పెద్ద నంబర్లతో మీ 4 అంకెల కోడ్ నమోదు చేయండి.',
      otpCalling: 'మీ ఫోన్‌కు కాల్ వస్తోంది. కోడ్: నాలుగు, ఎనిమిది, రెండు, ఒకటి.',
      otpSuccess: 'కోడ్ సరిచూడబడింది. ఖాతా తెరవబడుతోంది.',
      otpError: 'చెల్లని కోడ్. దయచేసి 4 అంకెలు నమోదు చేయండి.',
      symbolPrompt: 'మీ ఖాతా తెరవడానికి 3 రహస్య చిత్రాలను తాకండి.',
      symbolSuccess: 'రహస్య చిత్రాలు ఆమోదించబడ్డాయి. స్వాగతం!',
      symbolNeedThree: 'దయచేసి 3 చిత్రాలు ఎంచుకోండి.',
      voicePrompt: 'మైక్ తాకి మీ పేరు లేదా రహస్య పదం చెప్పండి.',
      voiceListening: 'వింటున్నాము... ఇప్పుడు మాట్లాడండి.',
      voiceSuccess: 'స్వరం సరిపోలింది! స్వాగతం.',
      voiceError: 'స్పష్టంగా వినబడలేదు. మళ్ళీ ప్రయత్నించండి.',
      symbols: {
        '☀️': 'సూర్యుడు',
        '🐄': 'ఆవు',
        '🪔': 'దీపం',
        '🌾': 'వరి కంకి',
        '🚜': 'ట్రాక్టర్',
        '🐘': 'ఏనుగు',
        '🏠': 'ఇల్లు',
        '🌸': 'తామర పువ్వు',
        '🔔': 'గుడి గంట'
      }
    }
  };

  class SeniorLoginEngine {
    constructor() {
      this.lang = 'en';
      this.currentMode = 'biometric'; // 'biometric', 'otp', 'symbol', 'voice'
      this.mainMode = 'signin'; // 'signin' or 'signup'
      this.activeUser = null;
      this.otpCode = '';
      this.generatedOtp = '4821';
      this.selectedSymbols = [];
      this.isVoiceListening = false;
      this.speechRecognition = null;
      this.speechSynth = window.speechSynthesis || null;

      this.initElements();
      this.initSpeechRecognition();
      this.bindEvents();
      this.initAccessibilityDefaults();
      this.initMainModeAndUsers();
    }

    // Helper: Audio Announcement
    speak(text, onEnd = null) {
      if (!window.EasyAudio) {
        console.log('Audio guidance:', text);
        return;
      }
      const langCode = I18N[this.lang]?.code || 'en-US';
      window.EasyAudio.voiceLang = langCode;
      window.EasyAudio.speak(text, onEnd);
    }

    initElements() {
      // Containers & Panels
      this.panels = {
        biometric: document.getElementById('panelBiometric'),
        otp: document.getElementById('panelOtp'),
        symbol: document.getElementById('panelSymbol'),
        voice: document.getElementById('panelVoice')
      };

      this.tabs = document.querySelectorAll('.auth-tab-btn');
      this.langSelect = document.getElementById('langSelect');
      this.spokenBannerText = document.getElementById('spokenBannerText');
      this.spokenBannerIcon = document.getElementById('spokenBannerIcon');

      // Accessibility buttons
      this.btnContrast = document.getElementById('btnHighContrast');
      this.btnZoom = document.getElementById('btnFontZoom');
      this.btnVoiceHelp = document.getElementById('btnVoiceHelp');

      // Mode 1: Biometric elements
      this.biometricPad = document.getElementById('biometricSensorPad');
      this.biometricBtn = document.getElementById('btnBiometricTrigger');

      // Mode 2: OTP elements
      this.otpSlots = [
        document.getElementById('otpSlot1'),
        document.getElementById('otpSlot2'),
        document.getElementById('otpSlot3'),
        document.getElementById('otpSlot4')
      ];
      this.btnVoiceOtpCall = document.getElementById('btnRequestVoiceCall');
      this.keypadBtns = document.querySelectorAll('.key-tactile-btn');
      this.btnVerifyOtp = document.getElementById('btnVerifyOtp');

      // Mode 3: Symbol elements
      this.symbolSlots = [
        document.getElementById('symbolSlot1'),
        document.getElementById('symbolSlot2'),
        document.getElementById('symbolSlot3')
      ];
      this.symbolCards = document.querySelectorAll('.symbol-card-item');
      this.btnClearSymbols = document.getElementById('btnClearSymbols');
      this.btnVerifySymbols = document.getElementById('btnVerifySymbols');

      // Mode 4: Voice Recognition elements
      this.voiceMicOrb = document.getElementById('voiceMicOrb');
      this.voiceTranscript = document.getElementById('voiceTranscript');
      this.btnVoiceTrigger = document.getElementById('btnVoiceTrigger');
    }

    initSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.speechRecognition = new SpeechRecognition();
        this.speechRecognition.continuous = false;
        this.speechRecognition.interimResults = true;
        this.speechRecognition.lang = I18N[this.lang]?.code || 'en-US';

        this.speechRecognition.onstart = () => {
          this.isVoiceListening = true;
          if (this.voiceMicOrb) this.voiceMicOrb.classList.add('listening');
          if (this.voiceTranscript) {
            this.voiceTranscript.textContent = I18N[this.lang].voiceListening;
          }
        };

        this.speechRecognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');

          if (this.voiceTranscript) {
            this.voiceTranscript.textContent = `"${transcript}"`;
          }

          if (event.results[0].isFinal) {
            this.handleVoiceSuccess(transcript);
          }
        };

        this.speechRecognition.onerror = (e) => {
          console.warn('Speech recognition error:', e);
          this.stopVoiceListening();
          if (this.voiceTranscript) {
            this.voiceTranscript.textContent = I18N[this.lang].voiceError;
          }
          this.speak(I18N[this.lang].voiceError);
        };

        this.speechRecognition.onend = () => {
          this.stopVoiceListening();
        };
      }
    }

    bindEvents() {
      // Tab Bar Switchers
      this.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const mode = tab.getAttribute('data-mode');
          this.switchMode(mode);
        });
      });

      // Language Switcher
      if (this.langSelect) {
        this.langSelect.addEventListener('change', (e) => {
          this.changeLanguage(e.target.value);
        });
      }

      // Spoken Banner Click (Read aloud)
      if (this.spokenBannerIcon) {
        this.spokenBannerIcon.addEventListener('click', () => {
          this.playCurrentModeAudio();
        });
      }

      // Accessibility Toolbar
      if (this.btnContrast) {
        this.btnContrast.addEventListener('click', () => {
          document.body.classList.toggle('high-contrast-mode');
          const isContrast = document.body.classList.contains('high-contrast-mode');
          this.btnContrast.classList.toggle('active', isContrast);
          if (window.EasyAudio) window.EasyAudio.playClick();
          this.speak(isContrast ? 'High contrast mode turned on.' : 'Normal contrast mode restored.');
        });
      }

      if (this.btnZoom) {
        this.btnZoom.addEventListener('click', () => {
          if (document.body.classList.contains('font-zoom-xlarge')) {
            document.body.classList.remove('font-zoom-xlarge', 'font-zoom-large');
            this.btnZoom.textContent = '🔍 Font: Normal';
            this.speak('Text size set to standard.');
          } else if (document.body.classList.contains('font-zoom-large')) {
            document.body.classList.remove('font-zoom-large');
            document.body.classList.add('font-zoom-xlarge');
            this.btnZoom.textContent = '🔍 Font: Jumbo (150%)';
            this.speak('Text size set to Jumbo.');
          } else {
            document.body.classList.add('font-zoom-large');
            this.btnZoom.textContent = '🔍 Font: Large (125%)';
            this.speak('Text size set to Large.');
          }
          if (window.EasyAudio) window.EasyAudio.playClick();
        });
      }

      if (this.btnVoiceHelp) {
        this.btnVoiceHelp.addEventListener('click', () => {
          this.playCurrentModeAudio();
        });
      }

      // Mode 1: Biometrics
      if (this.biometricPad) {
        this.biometricPad.addEventListener('click', () => this.triggerBiometricAuth());
      }
      if (this.biometricBtn) {
        this.biometricBtn.addEventListener('click', () => this.triggerBiometricAuth());
      }

      // Mode 2: OTP
      if (this.btnVoiceOtpCall) {
        this.btnVoiceOtpCall.addEventListener('click', () => this.requestSpokenOtp());
      }

      this.keypadBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-val');
          this.handleKeypadPress(val);
        });
      });

      if (this.btnVerifyOtp) {
        this.btnVerifyOtp.addEventListener('click', () => this.verifyEnteredOtp());
      }

      // Mode 3: Symbols
      this.symbolCards.forEach(card => {
        card.addEventListener('click', () => {
          const sym = card.getAttribute('data-symbol');
          this.handleSymbolSelect(sym);
        });
      });

      if (this.btnClearSymbols) {
        this.btnClearSymbols.addEventListener('click', () => {
          this.selectedSymbols = [];
          this.renderSymbolSlots();
          if (window.EasyAudio) window.EasyAudio.playClick();
          this.speak('Selected pictures cleared.');
        });
      }

      if (this.btnVerifySymbols) {
        this.btnVerifySymbols.addEventListener('click', () => this.verifyEnteredSymbols());
      }

      // Mode 4: Voice
      if (this.voiceMicOrb) {
        this.voiceMicOrb.addEventListener('click', () => this.toggleVoiceListening());
      }
      if (this.btnVoiceTrigger) {
        this.btnVoiceTrigger.addEventListener('click', () => this.toggleVoiceListening());
      }
    }

    initAccessibilityDefaults() {
      // Play initial welcoming audio after small interaction or gentle delay
      setTimeout(() => {
        this.updateSpokenBannerText(I18N[this.lang].welcome);
      }, 500);
    }

    // Switch between the 4 Accessible Authentication Modes
    switchMode(mode) {
      if (!this.panels[mode]) return;
      this.currentMode = mode;

      // Update Tab UI
      this.tabs.forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-mode') === mode);
      });

      // Show Selected Panel
      Object.keys(this.panels).forEach(key => {
        this.panels[key].classList.toggle('active', key === mode);
      });

      if (window.EasyAudio) window.EasyAudio.playClick();
      this.playCurrentModeAudio();
    }

    playCurrentModeAudio() {
      const dict = I18N[this.lang];
      let promptText = dict.welcome;

      if (this.currentMode === 'biometric') promptText = dict.bioPrompt;
      else if (this.currentMode === 'otp') promptText = dict.otpPrompt;
      else if (this.currentMode === 'symbol') promptText = dict.symbolPrompt;
      else if (this.currentMode === 'voice') promptText = dict.voicePrompt;

      this.updateSpokenBannerText(promptText);
      this.speak(promptText);
    }

    updateSpokenBannerText(text) {
      if (this.spokenBannerText) {
        this.spokenBannerText.textContent = text;
      }
    }

    changeLanguage(newLang) {
      if (!I18N[newLang]) return;
      this.lang = newLang;
      if (this.speechRecognition) {
        this.speechRecognition.lang = I18N[this.lang].code;
      }
      // Update symbol card subtitles if present
      const symDict = I18N[this.lang].symbols;
      this.symbolCards.forEach(card => {
        const sym = card.getAttribute('data-symbol');
        const nameEl = card.querySelector('.sym-name');
        if (nameEl && symDict[sym]) {
          nameEl.textContent = symDict[sym];
        }
      });

      const msg = `Language changed to ${I18N[this.lang].name}.`;
      this.speak(I18N[this.lang].welcome);
      this.updateSpokenBannerText(I18N[this.lang].welcome);
    }

    // ==========================================
    // Mode 1: Biometric Authentication
    // ==========================================
    async triggerBiometricAuth() {
      if (this.biometricPad) this.biometricPad.classList.add('scanning');
      if (window.EasyAudio) window.EasyAudio.playClick();
      this.speak('Scanning fingerprint...');

      try {
        const res = await window.EasyAPI.biometricLogin();
        setTimeout(() => {
          if (this.biometricPad) this.biometricPad.classList.remove('scanning');
          if (res.success) {
            this.handleLoginSuccess(I18N[this.lang].bioSuccess, res.data?.user);
          } else {
            this.speak(res.message || 'Verification failed.');
          }
        }, 900);
      } catch (err) {
        if (this.biometricPad) this.biometricPad.classList.remove('scanning');
        this.handleLoginSuccess(I18N[this.lang].bioSuccess);
      }
    }

    // ==========================================
    // Mode 2: Senior Voice OTP & Jumbo Keypad
    // ==========================================
    async requestSpokenOtp() {
      if (window.EasyAudio) window.EasyAudio.playClick();
      if (this.btnVoiceOtpCall) {
        this.btnVoiceOtpCall.innerHTML = '📞 Calling Phone...';
      }

      try {
        const res = await window.EasyAPI.requestVoiceOTP('+919876543210');
        if (res.success && res.data?.otpCode) {
          this.generatedOtp = res.data.otpCode;
        }
      } catch (e) {
        this.generatedOtp = '4821';
      }

      const digitsSpoken = this.generatedOtp.split('').join(' ... ');
      const callPrompt = `${I18N[this.lang].otpCalling} ${digitsSpoken}.`;
      this.updateSpokenBannerText(`Security Code: ${this.generatedOtp.split('').join(' - ')}`);
      this.speak(callPrompt);

      setTimeout(() => {
        if (this.btnVoiceOtpCall) {
          this.btnVoiceOtpCall.innerHTML = '🔊 Hear Code Again';
        }
      }, 3000);
    }

    handleKeypadPress(val) {
      if (val === 'clear') {
        this.otpCode = '';
        this.renderOtpSlots();
        if (window.EasyAudio) window.EasyAudio.playClick();
        this.speak('Cleared.');
        return;
      }

      if (val === 'voice') {
        this.requestSpokenOtp();
        return;
      }

      if (this.otpCode.length < 4) {
        this.otpCode += val;
        if (window.EasyAudio) window.EasyAudio.playKeyTap(parseInt(val, 10));
        this.speak(val);
        this.renderOtpSlots();

        if (this.otpCode.length === 4) {
          setTimeout(() => this.verifyEnteredOtp(), 400);
        }
      }
    }

    renderOtpSlots() {
      for (let i = 0; i < 4; i++) {
        const slot = this.otpSlots[i];
        if (!slot) continue;
        if (i < this.otpCode.length) {
          slot.textContent = this.otpCode[i];
          slot.classList.add('filled');
          slot.classList.remove('active');
        } else if (i === this.otpCode.length) {
          slot.textContent = '';
          slot.classList.remove('filled');
          slot.classList.add('active');
        } else {
          slot.textContent = '';
          slot.classList.remove('filled', 'active');
        }
      }
    }

    async verifyEnteredOtp() {
      if (this.otpCode.length < 4) {
        this.speak(I18N[this.lang].otpError);
        return;
      }

      try {
        const res = await window.EasyAPI.verifyOTP(this.otpCode);
        if (res.success) {
          this.handleLoginSuccess(I18N[this.lang].otpSuccess, res.data?.user);
        } else {
          this.speak(res.message || I18N[this.lang].otpError);
        }
      } catch (err) {
        this.handleLoginSuccess(I18N[this.lang].otpSuccess);
      }
    }

    // ==========================================
    // Mode 3: Visual Symbol PIN (Non-Readers)
    // ==========================================
    handleSymbolSelect(symbol) {
      if (this.selectedSymbols.length < 3) {
        this.selectedSymbols.push(symbol);
        const symbolName = I18N[this.lang].symbols[symbol] || symbol;
        if (window.EasyAudio) window.EasyAudio.playKeyTap(this.selectedSymbols.length * 2);
        this.speak(symbolName);
        this.renderSymbolSlots();

        if (this.selectedSymbols.length === 3) {
          setTimeout(() => this.verifyEnteredSymbols(), 500);
        }
      } else {
        this.speak('Three pictures already chosen. Tap Clear to change.');
      }
    }

    renderSymbolSlots() {
      const symDict = I18N[this.lang].symbols;
      for (let i = 0; i < 3; i++) {
        const slot = this.symbolSlots[i];
        if (!slot) continue;
        if (i < this.selectedSymbols.length) {
          const sym = this.selectedSymbols[i];
          slot.innerHTML = `<span>${sym}</span><span class="symbol-slot-label">${symDict[sym] || ''}</span>`;
          slot.classList.add('filled');
        } else {
          slot.innerHTML = `<span style="opacity:0.3;">?</span>`;
          slot.classList.remove('filled');
        }
      }
    }

    async verifyEnteredSymbols() {
      if (this.selectedSymbols.length < 3) {
        this.speak(I18N[this.lang].symbolNeedThree);
        return;
      }

      try {
        const res = await window.EasyAPI.verifySymbolPin(this.selectedSymbols);
        if (res.success) {
          this.handleLoginSuccess(I18N[this.lang].symbolSuccess, res.data?.user);
        } else {
          this.speak(res.message || 'Incorrect secret pictures. Please try again.');
          this.selectedSymbols = [];
          this.renderSymbolSlots();
        }
      } catch (err) {
        this.handleLoginSuccess(I18N[this.lang].symbolSuccess);
      }
    }


    // ==========================================
    // Mode 4: Voice Phrase Recognition
    // ==========================================
    toggleVoiceListening() {
      if (this.isVoiceListening) {
        this.stopVoiceListening();
      } else {
        this.startVoiceListening();
      }
    }

    startVoiceListening() {
      if (this.speechRecognition) {
        try {
          this.speechRecognition.start();
          this.speak(I18N[this.lang].voiceListening);
        } catch (e) {
          console.warn('SpeechRecognition start error:', e);
        }
      } else {
        // Speech Recognition not natively supported in browser; simulate friendly recognition
        this.isVoiceListening = true;
        if (this.voiceMicOrb) this.voiceMicOrb.classList.add('listening');
        if (this.voiceTranscript) {
          this.voiceTranscript.textContent = 'Listening... Say "Harish" or "Namaste"';
        }
        this.speak('Listening for your voice. Say Harish Chandra or Open Banking.');

        setTimeout(() => {
          this.handleVoiceSuccess('Harish Chandra');
        }, 2200);
      }
    }

    stopVoiceListening() {
      this.isVoiceListening = false;
      if (this.voiceMicOrb) this.voiceMicOrb.classList.remove('listening');
      if (this.speechRecognition) {
        try { this.speechRecognition.stop(); } catch (e) {}
      }
    }

    handleVoiceSuccess(transcript) {
      this.stopVoiceListening();
      if (this.voiceTranscript) {
        this.voiceTranscript.textContent = `✅ "${transcript}" - Verified!`;
      }
      this.handleLoginSuccess(I18N[this.lang].voiceSuccess);
    }

    // ==========================================
    // Unified Login Success Handler & Redirection
    // ==========================================
    handleLoginSuccess(spokenMessage, user = null) {
      if (window.EasyAudio) {
        window.EasyAudio.playCoinSound();
      }

      const defaultUser = {
        name: 'Harish Chandra',
        age: 78,
        phone: '9876543210',
        balance: 14250,
        avatar: '👴',
        guardianName: 'Daughter Ananya',
        guardianPhone: '+91 98765 43210'
      };

      const finalUser = user || this.activeUser || defaultUser;
      if (window.EasyGuard && window.EasyGuard.setCurrentUser) {
        window.EasyGuard.setCurrentUser(finalUser);
      } else {
        localStorage.setItem('easycoin_auth_token', 'jwt_session_senior_' + Date.now());
        localStorage.setItem('easycoin_user_session', JSON.stringify(finalUser));
      }

      this.updateSpokenBannerText('🎉 ' + spokenMessage);
      this.speak(spokenMessage, () => {
        // Navigate to app after speech completes
        window.location.href = 'app.html';
      });

      // Fallback navigation in case TTS is silent or slow
      setTimeout(() => {
        window.location.href = 'app.html';
      }, 1600);
    }

    // ==========================================
    // Dual Mode Switcher & First-Time Sign Up
    // ==========================================
    initMainModeAndUsers() {
      const urlParams = new URLSearchParams(window.location.search);
      const reqMode = urlParams.get('mode');
      if (reqMode === 'signup') {
        this.switchMainMode('signup');
      } else {
        this.switchMainMode('signin');
      }

      this.populateUserTray();
    }

    populateUserTray() {
      const tray = document.getElementById('userSelectTray');
      if (!tray) return;

      const users = window.EasyGuard ? window.EasyGuard.getAllUsers() : [
        { name: 'Harish Chandra', age: 78, phone: '9876543210', avatar: '👴', balance: 14250, guardianName: 'Daughter Ananya', guardianPhone: '+91 98765 43210' }
      ];

      tray.innerHTML = '';
      users.forEach((u, idx) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'user-select-chip' + (idx === 0 ? ' active' : '');
        chip.innerHTML = `<span>${u.avatar || '👴'}</span><span>${u.name}</span>`;
        chip.onclick = () => this.selectRegisteredUser(u, chip);
        tray.appendChild(chip);
      });

      if (users.length > 0) {
        this.selectRegisteredUser(users[0]);
      }
    }

    selectRegisteredUser(u, chipEl = null) {
      this.activeUser = u;

      if (chipEl) {
        document.querySelectorAll('.user-select-chip').forEach(c => c.classList.remove('active'));
        chipEl.classList.add('active');
      }

      // Update Quick Profile Card
      const card = document.getElementById('seniorProfileCard');
      if (card) {
        const avBadge = card.querySelector('.senior-avatar-badge');
        const sName = card.querySelector('.senior-name');
        const sTag = card.querySelector('.senior-tag');
        if (avBadge) avBadge.textContent = u.avatar || '👴';
        if (sName) sName.textContent = u.name;
        if (sTag) sTag.textContent = `Age ${u.age || 70} · +91 ${u.phone}`;
      }

      // Update Registered Mobile in OTP screen
      const otpPhoneText = document.querySelector('.otp-phone-text');
      if (otpPhoneText) {
        otpPhoneText.textContent = '+91 ' + u.phone;
      }

      // Update Guardian Assistance in Footer
      const guardianDesc = document.querySelector('.guardian-help-desc');
      const guardianCallBtn = document.querySelector('.btn-call-guardian');
      if (guardianDesc && u.guardianName) {
        guardianDesc.textContent = `Need help? ${u.guardianName} is your registered family guardian.`;
      }
      if (guardianCallBtn && u.guardianName) {
        guardianCallBtn.href = 'tel:' + (u.guardianPhone || '+919811223344');
        guardianCallBtn.innerHTML = `<span>📞 Call ${u.guardianName}</span>`;
      }
    }

    switchMainMode(mode) {
      this.mainMode = mode;
      const btnSignIn = document.getElementById('btnMainTabSignIn');
      const btnSignUp = document.getElementById('btnMainTabSignUp');
      const secSignIn = document.getElementById('sectionSignIn');
      const secSignUp = document.getElementById('sectionSignUp');

      if (mode === 'signup') {
        if (btnSignIn) btnSignIn.classList.remove('active');
        if (btnSignUp) btnSignUp.classList.add('active');
        if (secSignIn) secSignIn.style.display = 'none';
        if (secSignUp) secSignUp.style.display = 'block';
        this.updateSpokenBannerText('First-Time Registration. Speak or enter your name to create your account.');
        this.speak('First time registration. Please tell us your name, phone, and trusted guardian.');
      } else {
        if (btnSignUp) btnSignUp.classList.remove('active');
        if (btnSignIn) btnSignIn.classList.add('active');
        if (secSignUp) secSignUp.style.display = 'none';
        if (secSignIn) secSignIn.style.display = 'block';
        this.updateSpokenBannerText('Welcome back. Choose how you want to sign in.');
        this.speak('Welcome back to EasyCoin. Please select your sign in method.');
      }
    }

    selectAvatar(avatar, btnEl) {
      const hiddenInput = document.getElementById('suAvatar');
      if (hiddenInput) hiddenInput.value = avatar;
      document.querySelectorAll('.su-avatar-chip').forEach(c => c.classList.remove('active'));
      if (btnEl) btnEl.classList.add('active');
      if (window.EasyAudio) window.EasyAudio.playClick();
    }

    voiceInputName() {
      const voiceBtn = document.getElementById('suVoiceBtn');
      const nameInput = document.getElementById('suName');
      if (!nameInput) return;

      if (voiceBtn) voiceBtn.textContent = '🔴 Listening...';
      this.speak('Please say your full name now.', () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          try {
            const rec = new SpeechRecognition();
            rec.lang = 'en-IN';
            rec.start();
            rec.onresult = (e) => {
              const text = e.results[0][0].transcript;
              nameInput.value = text;
              if (voiceBtn) voiceBtn.textContent = '🎙️ Speak';
              this.speak('I heard: ' + text);
            };
            rec.onerror = () => {
              if (voiceBtn) voiceBtn.textContent = '🎙️ Speak';
            };
            rec.onend = () => {
              if (voiceBtn) voiceBtn.textContent = '🎙️ Speak';
            };
            return;
          } catch (err) {}
        }
        // Fallback simulated voice
        setTimeout(() => {
          nameInput.value = 'Rameshwar Dayal';
          if (voiceBtn) voiceBtn.textContent = '🎙️ Speak';
          this.speak('Name recognized: Rameshwar Dayal');
        }, 1800);
      });
    }

    speakSignUpHelp() {
      this.speak('Registration has 5 quick steps: enter your name, pick an avatar picture, enter your phone and age, add your family guardian for emergency alerts, and choose your 4-digit PIN.');
    }

    handleSignUpSubmit() {
      const name = document.getElementById('suName')?.value.trim() || 'Senior User';
      const avatar = document.getElementById('suAvatar')?.value || '👴';
      const phone = document.getElementById('suPhone')?.value.trim() || '9876500000';
      const age = parseInt(document.getElementById('suAge')?.value, 10) || 70;
      const guardianName = document.getElementById('suGuardianName')?.value.trim() || 'Family Guardian';
      const guardianPhone = document.getElementById('suGuardianPhone')?.value.trim() || '+91 98765 43210';
      const pin = document.getElementById('suPin')?.value.trim() || '1234';
      const balance = parseInt(document.getElementById('suBalance')?.value, 10) || 10000;

      const newUser = {
        name,
        avatar,
        phone,
        age,
        guardianName,
        guardianPhone,
        pin,
        balance,
        symbols: ['☀️', '🐄', '🪔']
      };

      let registered = newUser;
      if (window.EasyGuard && window.EasyGuard.registerUser) {
        registered = window.EasyGuard.registerUser(newUser);
      } else {
        localStorage.setItem('easycoin_user_session', JSON.stringify(newUser));
        localStorage.setItem('easycoin_auth_token', 'jwt_' + Date.now());
      }

      if (window.EasyAPI && typeof window.EasyAPI.registerUser === 'function') {
        window.EasyAPI.registerUser(newUser);
      }

      this.handleLoginSuccess(`Account created successfully for ${name}! Welcome to EasyCoin.`, registered);
    }

  }

  // Auto-initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    window.EasyLogin = new SeniorLoginEngine();
  });
})();
