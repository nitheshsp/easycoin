# 🧑‍💻 Friend 1: Authentication, Voice OTP & Biometrics

**Assigned Module**: `auth.routes.js` & `authController.js`  
**Domain**: Senior Identity, Voice OTP Generator, WebAuthn Biometrics, Session Security.

---

## 🎯 Your Assigned Endpoints

| Method | Endpoint | Description | Request Body Sample | Response Structure |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/voice-otp` | Sends/speaks 4-digit OTP | `{"phone": "+919876543210"}` | `{ otpCode: "4821", spokenPrompt: "..." }` |
| `POST` | `/api/auth/verify-otp` | Validates 4-digit OTP | `{"otp": "4821"}` | `{ token: "jwt_...", user: {...} }` |
| `POST` | `/api/auth/biometric-login` | WebAuthn Fingerprint/Face | `{"biometricSignature": "..."}` | `{ user: {...}, token: "jwt_..." }` |
| `GET` | `/api/auth/me` | Current senior user profile | Header: `Bearer <token>` | `{ id, name, age, balance, guardian }` |

---

## 🛠️ Step-by-Step Implementation Tasks
1. **Connect Voice OTP Service**: Integrate Twilio / Exotel / AWS SNS to place an automated phone call reading the 4 digits slowly and clearly for senior citizens.
2. **WebAuthn Passkeys**: Wire up FIDO2 WebAuthn biometrics so elderly users can authenticate using native touch/face ID with zero passwords.
3. **Session Timeout Guard**: Implement a 10-minute inactivity auto-logout to protect senior bank accounts if their phone is left unlocked on a table.

---

## 🧪 How to Test Your Module
Run the test command in your terminal:
```bash
curl -X POST http://localhost:5000/api/auth/voice-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```
