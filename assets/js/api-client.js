/**
 * EasyCoin Universal Frontend API Client
 * Seamlessly talks to the modular backend services on port 5000 with automatic resilient fallback.
 */
class EasyAPIClient {
  constructor() {
    this.baseUrl = (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http'))
      ? `${window.location.origin}/api`
      : 'http://localhost:5001/api';
    this.isLive = false;
    this.checkHealth();
  }

  async checkHealth() {
    // Check possible ports: current origin, port 5001, port 5000
    const candidates = [];
    if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
      candidates.push(`${window.location.origin}/api`);
    }
    candidates.push('http://localhost:5001/api');
    candidates.push('http://localhost:5000/api');

    // Deduplicate candidates
    const uniqueCandidates = [...new Set(candidates)];

    for (const url of uniqueCandidates) {
      try {
        const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(1500) });
        if (res.ok) {
          this.baseUrl = url;
          this.isLive = true;
          console.log(`✅ EasyCoin Connected to Live Backend Services (${url})`);
          return;
        }
      } catch (e) {
        // Continue to next candidate
      }
    }
    this.isLive = false;
    console.log('ℹ️ Backend offline: EasyCoin running in Smart Local Storage Mode');
  }

  // Module 1: Auth & User
  async getUser() {
    if (this.isLive) {
      try {
        const token = localStorage.getItem('easycoin_auth_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`${this.baseUrl}/auth/me`, { headers });
        const json = await res.json();
        return json.data;
      } catch (e) { console.warn(e); }
    }
    const saved = localStorage.getItem('easycoin_user_session');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { name: 'Harish Chandra', age: 78, phone: '+919876543210', isFrozen: false };
  }

  async requestVoiceOTP(phone) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/auth/voice-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: phone || '+919876543210' })
        });
        const json = await res.json();
        return json;
      } catch (e) { console.warn('Live OTP request failed, using mock fallback', e); }
    }
    // Resilient Local Mock Fallback
    const mockCode = '4821';
    return {
      success: true,
      message: 'Voice OTP generated successfully',
      data: {
        phone: phone || '+919876543210',
        otpCode: mockCode,
        spokenPrompt: `Your EasyCoin security code is: ${mockCode.split('').join(' ')}. Do not share this with anyone.`,
        expiresInSeconds: 300
      }
    };
  }

  async verifyOTP(otp) {
    if (!otp || otp.length < 4) {
      return { success: false, message: 'Invalid OTP format. Please enter 4 digits.' };
    }
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp })
        });
        const json = await res.json();
        if (json.success && json.data?.token) {
          localStorage.setItem('easycoin_auth_token', json.data.token);
          localStorage.setItem('easycoin_user_session', JSON.stringify(json.data.user));
        }
        return json;
      } catch (e) { console.warn('Live OTP verification failed, using mock fallback', e); }
    }
    // Resilient Local Mock Fallback
    const user = {
      id: 'usr_senior_01',
      name: 'Harish Chandra',
      age: 78,
      phone: '+919876543210',
      balance: 14250,
      avatar: '👴'
    };
    const token = 'jwt_mock_easycoin_senior_token_9921';
    localStorage.setItem('easycoin_auth_token', token);
    localStorage.setItem('easycoin_user_session', JSON.stringify(user));
    return {
      success: true,
      message: 'Authentication successful',
      data: { token, user }
    };
  }

  async biometricLogin(biometricSignature = 'webauthn_passkey_sig_001') {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/auth/biometric-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ biometricSignature })
        });
        const json = await res.json();
        if (json.success && json.data?.token) {
          localStorage.setItem('easycoin_auth_token', json.data.token);
          localStorage.setItem('easycoin_user_session', JSON.stringify(json.data.user));
        }
        return json;
      } catch (e) { console.warn('Live biometric login failed, using mock fallback', e); }
    }
    // Resilient Local Mock Fallback
    const user = {
      id: 'usr_senior_01',
      name: 'Harish Chandra',
      age: 78,
      phone: '+919876543210',
      balance: 14250,
      avatar: '👴'
    };
    const token = 'jwt_mock_easycoin_senior_token_9921';
    localStorage.setItem('easycoin_auth_token', token);
    localStorage.setItem('easycoin_user_session', JSON.stringify(user));
    return {
      success: true,
      message: 'Biometric verification passed',
      data: { token, user }
    };
  }

  async verifySymbolPin(symbols) {
    if (!Array.isArray(symbols) || symbols.length < 3) {
      return { success: false, message: 'Please choose all 3 secret pictures.' };
    }

    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/auth/symbol-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbols })
        });
        const json = await res.json();
        if (json.success && json.data?.token) {
          localStorage.setItem('easycoin_auth_token', json.data.token);
          localStorage.setItem('easycoin_user_session', JSON.stringify(json.data.user));
        }
        return json;
      } catch (e) {
        console.warn('Live symbol-login failed, using mock fallback', e);
      }
    }

    // Resilient local fallback
    const user = {
      id: 'usr_senior_01',
      name: 'Harish Chandra',
      age: 78,
      phone: '+919876543210',
      balance: 14250,
      avatar: '👴'
    };
    const token = 'jwt_mock_easycoin_symbol_auth_8842';
    localStorage.setItem('easycoin_auth_token', token);
    localStorage.setItem('easycoin_user_session', JSON.stringify(user));
    return {
      success: true,
      message: 'Secret picture lock verified successfully',
      data: { token, user }
    };
  }

  logout() {
    localStorage.removeItem('easycoin_auth_token');
    localStorage.removeItem('easycoin_user_session');
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

  // Module 3: Payments, Voice & Bills
  async getBills() {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/payments/bills`);
        const json = await res.json();
        if (json.success && json.data) {
          return json.data.bills;
        }
      } catch (e) { console.warn(e); }
    }
    return null;
  }

  async addBill(billData) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/payments/bills`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(billData)
        });
        const json = await res.json();
        return json;
      } catch (e) { console.warn(e); }
    }
    return {
      success: true,
      data: {
        bill: {
          id: `bill_custom_${Date.now()}`,
          ...billData,
          status: 'DUE',
          custom: true
        }
      }
    };
  }

  async payBillById(billId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/payments/bills/${billId}/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const json = await res.json();
        return json;
      } catch (e) { console.warn(e); }
    }
    return { success: true, simulated: true };
  }

  async deleteBill(billId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/payments/bills/${billId}`, {
          method: 'DELETE'
        });
        const json = await res.json();
        return json;
      } catch (e) { console.warn(e); }
    }
    return { success: true, simulated: true };
  }

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

  // Module 5: UPI Circle (Delegated Minor Spends)
  async getCircleData() {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/circle/members`);
        const json = await res.json();
        return json.data;
      } catch (e) { console.warn(e); }
    }
    return null;
  }

  async addCircleMember(memberData) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/circle/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memberData)
        });
        return await res.json();
      } catch (e) { console.warn(e); }
    }
    return { success: true, simulated: true };
  }

  async toggleCircleFreeze(memberId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/circle/members/${memberId}/freeze`, { method: 'POST' });
        return await res.json();
      } catch (e) { console.warn(e); }
    }
    return { success: true, simulated: true };
  }

  async updateCircleLimit(memberId, newLimit) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/circle/members/${memberId}/limit`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newLimit })
        });
        return await res.json();
      } catch (e) { console.warn(e); }
    }
    return { success: true, simulated: true };
  }

  async simulateCircleSpend(memberId, amount, merchant, category) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/circle/simulate-spend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: memberId, amount, merchant, category })
        });
        return await res.json();
      } catch (e) { console.warn(e); }
    }
    return { success: true, simulated: true };
  }

  async resolveCircleRequest(requestId, approved) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/circle/requests/${requestId}/resolve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approved })
        });
        return await res.json();
      } catch (e) { console.warn(e); }
    }
    return { success: true, simulated: true };
  }
}

window.EasyAPI = new EasyAPIClient();

