# 🔐 EasyCoin Accessible Login – Developer & Team Integration Guide

> **Module**: Senior & Illiterate-Friendly Authentication Engine  
> **Status**: Ready for Merge & Team Integration  
> **Compatibility**: Fully compatible with Express API (`backend/routes/auth.routes.js`) & Standalone Offline Mode.

---

## 🌟 1. Overview & Architecture

We have implemented an ultra-accessible authentication experience designed specifically for **senior citizens**, **visually impaired users**, and **illiterate/low-literacy individuals**.

To ensure that your friend's ongoing work on other features is never blocked or overwritten by merge conflicts, all login files are isolated and decoupled:

```
easycoin/
├── login.html                           # 🌐 Dedicated Accessible Senior Login Page
├── assets/
│   ├── css/
│   │   └── login.css                    # 🎨 Isolated Liquid Glass + High Contrast Styles
│   └── js/
│       ├── login-engine.js              # 🧠 Multi-lingual Voice, Audio Acoustics & Auth Logic
│       ├── auth-guard.js                # 🛡️ Optional 1-Line Session Guard for app.html
│       └── api-client.js                # 🔌 Enhanced Universal API Client (Live/Mock)
└── backend/
    ├── routes/auth.routes.js            # ⚙️ Voice OTP & Biometric API Routes
    └── controllers/authController.js    # ⚙️ Friend 1 Backend Handlers
```

---

## 🎯 2. The 4 Accessible Authentication Modes

| Mode | Target User Group | How It Works | Audio Guidance |
| :--- | :--- | :--- | :--- |
| **👆 1-Tap Biometric** | Seniors & Tremor Patients | Big glowing sensor pad. Touch fingerprint or look at camera. Validates in 1 tap without passwords. | Speaks: *"Place your thumb on the sensor to sign in."* |
| **🔢 Voice Code (OTP)** | Seniors with mobile phones | Enters phone or taps profile. Senior taps *"Call & Speak Code"*. Backend/Voice engine speaks 4 digits slowly (`4 ... 8 ... 2 ... 1`). Senior taps jumbo tactile numbers with audio pitch feedback. | Speaks: *"Your security code is 4, 8, 2, 1."* |
| **🎨 Picture Lock (Symbol PIN)** | **Illiterate & Non-Readers** | 3x3 grid of familiar cultural symbols (☀️ Sun, 🐄 Cow, 🪔 Diya Lamp, 🌾 Wheat, 🚜 Tractor, 🐘 Elephant, 🏠 House, 🌸 Lotus, 🔔 Bell). User unlocks by tapping their 3 secret pictures. | Speaks the name of each picture on touch or focus. |
| **🎙️ Speak Name / Passphrase** | Hands-free / Low Vision | Tap the big pulsing red mic orb and speak their name (e.g. *"Harish"*, *"Namaste"*, or *"EasyCoin"*). Browser Web Speech API matches the senior's voice. | Speaks: *"Listening... please speak your name clearly."* |

---

## 🛠️ 3. Senior Accessibility Toolbar Included

1. **Multi-Language Switcher**:
   - English (🇬🇧), हिन्दी (🇮🇳), தமிழ் (🇮🇳), বাংলা (🇮🇳), తెలుగు (🇮🇳).
   - Instant live translation of visual labels and voice prompts in the selected native tongue.
2. **High-Contrast Mode**:
   - Ultra-crisp `#000000` dark canvas with `#FFE600` bright gold borders and `#FFFFFF` text. Specially calibrated for glaucoma, cataracts, and low vision.
3. **Font Size Zoomer**:
   - Cycles between Normal (16px), Large (20px), and Jumbo 150% (24px) for easy reading.
4. **Guardian SOS Hotline**:
   - Direct 1-tap call button linking to designated family guardian: `Daughter Ananya (+91 9811223344)`.

---

## 🔌 4. How to Test Your Login Module Right Now

### Option A: Open directly in your browser
Simply double-click or open `login.html` in Chrome, Safari, Edge, or Firefox:
```bash
open login.html
```
- Test all 4 login tabs.
- Notice that all audio prompts, number tones, and speech recognition work smoothly even without internet!

### Option B: Run via Local HTTP Server (Port 8088)
```bash
# In the root cropwise directory:
npx serve -l 8088 .
# Or using Python:
python3 -m http.server 8088
```
Visit: `http://localhost:8088/login.html`

### Option C: Run with Live Express Backend (Port 5000)
```bash
cd backend
npm install
npm start
```
`login.html` and `EasyAPIClient` will automatically detect the live backend server on `http://localhost:5000/api` and connect to your `/api/auth/voice-otp` and `/api/auth/verify-otp` endpoints!

---

## 🤝 5. How to Integrate When Your Friend Is Done (Checklist)

Integrating this login module into `app.html` and `index.html` takes less than 2 minutes:

### Step 1: Add Session Protection to `app.html`
In `app.html`, add `data-auth-protect` to `<body>` and include the `auth-guard.js` script right before `</body>`:

```html
<!-- Inside app.html: -->
<body class="standalone-app-body" data-auth-protect>
  ...
  <script src="assets/js/audio-synth.js"></script>
  <script src="assets/js/api-client.js"></script>
  <script src="assets/js/auth-guard.js"></script> <!-- ADD THIS LINE -->
  <script src="assets/js/banking-engine.js"></script>
</body>
```

**What this accomplishes automatically**:
- If someone visits `app.html` without logging in, it automatically redirects them to `login.html`.
- Displays a neat user pill (`👴 Harish Chandra`) and a red `🚪 Sign Out` button directly on the top navigation bar.
- Implements the **10-minute inactivity auto-logout** required in `backend/docs/FRIEND_1_AUTH_GUIDE.md`!

### Step 2: Add Login Link in `index.html` (Landing Page)
In `index.html`, inside the navigation bar or header CTA buttons, link directly to `login.html`:
```html
<a href="login.html" class="dlrtt-btn-nav">
  <span>Senior Sign In</span>
  <span class="arr">→</span>
</a>
```

### Step 3: Clear Session on Sign Out
Users can sign out anytime using `window.EasyAPI.logout()` or by clicking the `🚪 Sign Out` button injected by `auth-guard.js`.

---

## 🔒 6. Security Features Built In

- **JWT Session Storage**: Successful logins store a mock/live JWT in `localStorage.getItem('easycoin_auth_token')`.
- **Session Auto-Guard**: Inactivity of 10 minutes clears the credentials and presents an audio alert.
- **Guardian Safeguard**: Emergency account freezing blocks biometric and voice login if the account has been reported frozen.
