/**
 * EasyCoin Audio Synthesis & Speech Engine
 * Provides Web Audio API synthesizers (haptics, button clicks, coin clinks, success chimes)
 * and Web Speech API Text-to-Speech (TTS) & Voice Recognition for senior/illiterate accessibility.
 */
class EasyAudioEngine {
  constructor() {
    this.ctx = null;
    this.speechSynth = window.speechSynthesis || null;
    this.voiceLang = 'en-US';
    this.isMuted = false;
    this.voiceRate = 0.92; // slightly slower, clear cadence for elderly users
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Tactile button click sound
  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.04);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      console.warn('Audio click error:', e);
    }
  }

  // Keypad number tap with pitch feedback
  playKeyTap(keyNumber = 5) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      const baseFreq = 520 + (parseInt(keyNumber, 10) || 5) * 35;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      console.warn('Audio key tap error:', e);
    }
  }

  // Coin drop / payment success chime
  playCoinSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [987.77, 1318.51, 1760.00].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + (i * 0.08);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.22, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch (e) {
      console.warn('Coin sound error:', e);
    }
  }

  // Phone lock / unlock mechanical sound
  playLockSound(isLocking = true) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      const startFreq = isLocking ? 680 : 340;
      const endFreq = isLocking ? 320 : 720;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn('Lock sound error:', e);
    }
  }

  // Text to Speech Voice Guidance for Illiterate / Senior Users
  speak(text, onEnd = null) {
    if (this.isMuted || !this.speechSynth) return;
    try {
      this.speechSynth.cancel(); // Stop any pending utterances

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.voiceRate;
      utterance.pitch = 1.0;
      utterance.lang = this.voiceLang;

      // Select warm natural voice if available
      const voices = this.speechSynth.getVoices();
      const preferredVoice = voices.find(v => (v.lang.startsWith(this.voiceLang.slice(0, 2)) && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Neural'))));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      if (onEnd) {
        utterance.onend = onEnd;
      }

      this.speechSynth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  stopSpeaking() {
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }
  }
}

window.EasyAudio = new EasyAudioEngine();
