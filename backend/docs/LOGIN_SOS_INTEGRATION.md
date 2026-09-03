# 🔐 Login Page & SOS Emergency System Integration Guide

> **For Friend working on the Login Page & Antigravity IDE Instance**

This guide provides the exact integration contract so your newly developed **Accessible Login Page** seamlessly integrates with the **SOS / Emergency Guardian Shield System**.

---

## 🎯 How Login & SOS Work Together

1. **Normal Login Flow**:
   - Senior enters Phone Number or speaks Voice OTP.
   - Login succeeds (`POST /api/auth/verify-otp` or `POST /api/auth/biometric-login`).
   - Redirects to `index.html` (Dashboard) or `app.html` (Standalone App).

2. **Emergency Frozen Account Flow (Anti-Scam Protection)**:
   - If the user or their family previously activated **Emergency Panic Freeze** (due to scam callers or lost phone):
     - The backend returns `isFrozen: true` with HTTP status `403` or `200` with `{ user: { isFrozen: true } }`.
     - The login page immediately displays the high-contrast **Guardian Safety Screen**:
       > *"🚨 Account Frozen for Your Safety. To restore payments, please have Daughter Ananya enter the 4-digit Guardian Passcode (1234)."*
     - Provides a **1-Tap "Call Guardian"** button so the senior doesn't feel stuck.

---

## 🛠️ Code Snippets for Your Login Page

### 1. In Your Frontend Login Handler:
```javascript
async function handleSeniorLogin(phone, otp) {
  try {
    const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    const result = await res.json();

    if (result.success) {
      // Check if account is frozen
      if (result.data.user.isFrozen) {
        window.EasyAudio?.speak('Welcome back. Your account is currently frozen for safety. Enter guardian passcode to unlock.');
        showGuardianUnlockPrompt(result.data.user.guardian);
      } else {
        window.EasyAudio?.speak('Login successful. Welcome to EasyCoin.');
        window.location.href = 'app.html';
      }
    } else {
      window.EasyAudio?.speak('Incorrect code. Tap Voice Help for assistance.');
    }
  } catch (err) {
    console.error('Login error:', err);
  }
}
```

### 2. Guardian Unlock Modal Trigger:
```javascript
function showGuardianUnlockPrompt(guardian) {
  const passcode = prompt(`🚨 Account Frozen for Security.\n\nPlease enter the Guardian Passcode (Default: 1234) or call ${guardian.name} (${guardian.phone}):`);
  if (passcode) {
    if (window.EasySOS) {
      const unlocked = window.EasySOS.unfreezeWithPasscode(passcode);
      if (unlocked) {
        window.location.href = 'app.html';
      }
    }
  }
}
```

---

## 📡 Shared Endpoints Contract

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/auth/voice-otp` | `POST` | Generates 4-digit spoken voice OTP |
| `/api/auth/verify-otp` | `POST` | Validates OTP & returns `user.isFrozen` status |
| `/api/guardian/status` | `GET` | Retrieves live emergency freeze status |
| `/api/guardian/unfreeze` | `POST` | Unfreezes account using `{ guardianPasscode: "1234" }` |

---

## 🤝 Merge Checklist
When you are ready to combine your Login page into the main project:
1. Place your login markup in `login.html` (or modal in `index.html`).
2. Include the shared engines:
   ```html
   <script src="assets/js/audio-synth.js"></script>
   <script src="assets/js/api-client.js"></script>
   <script src="assets/js/sos-engine.js"></script>
   ```
3. Test logging in both in normal mode and after triggering the SOS emergency freeze.
