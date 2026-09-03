/**
 * EasyCoin Universal Frontend API Client
 * Seamlessly talks to the modular backend services on port 5000 with automatic resilient fallback.
 */
class EasyAPIClient {
  constructor() {
    this.baseUrl = 'http://localhost:5000/api';
    this.isLive = false;
    this.checkHealth();
  }

  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        this.isLive = true;
        console.log('✅ EasyCoin Connected to Live Backend Services (Port 5000)');
      }
    } catch (e) {
      this.isLive = false;
      console.log('ℹ️ Backend offline: EasyCoin running in Smart Local Storage Mode');
    }
  }

  // Module 1: Auth & User
  async getUser() {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/auth/me`);
        const json = await res.json();
        return json.data;
      } catch (e) { console.warn(e); }
    }
    return { name: 'Harish Chandra', age: 78, isFrozen: false };
  }

  // Module 2: Account & Balance
  async getBalance() {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/account/balance`);
        const json = await res.json();
        return json.data;
      } catch (e) { console.warn(e); }
    }
    return {
      balance: 14250,
      formatted: '₹ 14,250',
      spokenText: 'Your EasyCoin balance is 14,250 Rupees.'
    };
  }

  async getCoins() {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/account/coins`);
        const json = await res.json();
        return json.data;
      } catch (e) { console.warn(e); }
    }
    return {
      goldCoins: { count: 14 },
      silverCoins: { count: 25 },
      spokenText: 'You have 14 gold coins and 25 silver coins.'
    };
  }

  async getPassbook() {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/account/passbook`);
        const json = await res.json();
        return json.data.transactions;
      } catch (e) { console.warn(e); }
    }
    return null; // fallback to local memory in phone-simulator
  }

  // Module 3: Payments & Voice
  async sendTransfer(recipientName, amount, note = '', avatar = '👤') {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/payments/transfer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientName, amount, note, avatar })
        });
        const json = await res.json();
        return json;
      } catch (e) { console.warn(e); }
    }
    return { success: true, simulated: true };
  }

  async parseVoiceCommand(voiceText) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/payments/voice-pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voiceText })
        });
        const json = await res.json();
        return json.data;
      } catch (e) { console.warn(e); }
    }
    return null;
  }

  // Module 4: Guardian & SOS
  async freezeAccount() {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/guardian/freeze`, { method: 'POST' });
        const json = await res.json();
        return json;
      } catch (e) { console.warn(e); }
    }
    return { isFrozen: true, spokenResponse: 'Emergency Lock Active. Account frozen.' };
  }
}

window.EasyAPI = new EasyAPIClient();
