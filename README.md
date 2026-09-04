# 🪙 EasyCoin – Accessible Digital Payment & Banking

> **Empowering senior citizens, illiterate, and visually challenged individuals with effortless voice-first and symbol-assisted digital banking.**

---

## 📂 Repository Directory Structure

```
easycoin/
├── .gitignore                           # Ignored files (node_modules, logs, cache)
├── README.md                            # Master Project Documentation & Quickstart
├── index.html                           # 🌐 Master Landing Page + Interactive Phone Showcase
├── app.html                             # 📱 Dedicated Standalone Accessible Web App
│
├── assets/                              # 🎨 FRONTEND / USER INTERFACE ASSETS
│   ├── css/
│   │   ├── style.css                    # Master Design System (Colors, Typography, Sticky Nav)
│   │   ├── liquid-glass.css             # Liquid Glass UI (Refraction, Orbs, Specular Sheen)
│   │   ├── phone.css                    # Smartphone Bezels, Statusbar, Dynamic Island & QR
│   │   └── accessible-app.css           # Jumbo Tactile Touch Targets & Voice Dock
│   └── js/
│       ├── api-client.js                # Universal Frontend API SDK with Live/Mock Fallback
│       ├── audio-synth.js               # Web Audio Haptic Clicks & Web Speech (TTS)
│       ├── qr-generator.js              # Vector SVG QR Generator & Camera Laser Scanner
│       ├── liquid-glass.js              # Cursor Specular Sheen & 3D Tilt Physics
│       ├── hero-shader.js               # WebGL Mouse-Reactive Perlin Fluid Wave
│       ├── pitch-scroll.js              # Kinetic Typography Scroll-Reveal Engine
│       ├── phone-simulator.js           # Interactive Phone Stage, Bezels & Screen Routing
│       ├── main.js                      # Sticky Glass Header, Accordions & Drawer
│       └── banking-engine.js            # Standalone Accessible Banking App Logic
│
└── backend/                             # ⚙️ MODULAR BACKEND ARCHITECTURE
    ├── server.js                        # Central API Gateway (Express) on Port 5000
    ├── package.json                     # Backend Dependencies & Start Scripts
    ├── README.md                        # Backend Architecture & Onboarding Guide
    │
    ├── config/
    │   ├── database.js                  # Persistent Mock Database & State Store
    │   └── constants.js                 # System Configs, Thresholds & Audio Constants
    │
    ├── routes/                          # Modular API Endpoints
    │   ├── auth.routes.js               # [Friend 1] Voice OTP & Biometric Routes
    │   ├── account.routes.js            # [Friend 2] Balances & Spoken Passbook Routes
    │   ├── payment.routes.js            # [Friend 3] Payments & Voice NLP Routes
    │   └── guardian.routes.js           # [Friend 4] Guardian Shield & SOS Routes
    │
    ├── controllers/                     # Business Logic Handlers
    │   ├── authController.js            # [Friend 1] Auth & Session Verification
    │   ├── accountController.js         # [Friend 2] Balance & Coin Stack Calculation
    │   ├── paymentController.js         # [Friend 3] 1-Tap Transfers & QR Decoders
    │   └── guardianController.js        # [Friend 4] Emergency Panic Freeze & Pings
    │
    ├── docs/                            # 📖 Team Developer Onboarding Guides
    │   ├── FRIEND_1_AUTH_GUIDE.md       # Task Checklist for Friend 1
    │   ├── FRIEND_2_ACCOUNT_GUIDE.md    # Task Checklist for Friend 2
    │   ├── FRIEND_3_PAYMENT_GUIDE.md    # Task Checklist for Friend 3
    │   └── FRIEND_4_GUARDIAN_GUIDE.md   # Task Checklist for Friend 4
    │
    └── tests/
        └── api_test.http                # Ready-to-Run REST API Test Suite
```

---

## 👥 Team Work Division

| Module | Team Member | Scope & Directory | Guide |
| :--- | :--- | :--- | :--- |
| **Auth & Biometrics** | **Friend 1** | `backend/routes/auth.routes.js`, `backend/controllers/authController.js` | [Friend 1 Guide](backend/docs/FRIEND_1_AUTH_GUIDE.md) |
| **Accounts & Passbook** | **Friend 2** | `backend/routes/account.routes.js`, `backend/controllers/accountController.js` | [Friend 2 Guide](backend/docs/FRIEND_2_ACCOUNT_GUIDE.md) |
| **Payments & Voice Engine** | **Friend 3** | `backend/routes/payment.routes.js`, `backend/controllers/paymentController.js` | [Friend 3 Guide](backend/docs/FRIEND_3_PAYMENT_GUIDE.md) |
| **Guardian Shield & SOS** | **Friend 4** | `backend/routes/guardian.routes.js`, `backend/controllers/guardianController.js` | [Friend 4 Guide](backend/docs/FRIEND_4_GUARDIAN_GUIDE.md) |

---

## 🚀 Quickstart Guide

### 1. Run Frontend
Open `index.html` (Landing Page) or `app.html` (Accessible App) in any browser, or serve locally on port 8088:
```bash
# Serves frontend on http://localhost:8088
```

### 2. Run Backend API Server
```bash
cd backend
npm install
npm start
# Express Server running on http://localhost:5000/api
```

### 3. Test Endpoints
Open `backend/tests/api_test.http` with the REST Client extension in VS Code.

---

## 📄 License
MIT © 2026 EasyCoin Technologies Inc.
