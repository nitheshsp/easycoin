# 🧑‍💻 Friend 4: Guardian Shield, Anti-Fraud & Emergency SOS

**Assigned Module**: `guardian.routes.js` & `guardianController.js`  
**Domain**: Family Guardian link, High-value approval ping gateway, 1-Tap Emergency Account Freeze, SOS dispatch.

---

## 🎯 Your Assigned Endpoints

| Method | Endpoint | Description | Request Body Sample | Response Structure |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/guardian/freeze` | 1-Tap Emergency Panic Lock | None | `{ isFrozen: true, spokenResponse: "..." }` |
| `POST` | `/api/guardian/unfreeze` | Unlock with passcode | `{"guardianPasscode": "1234"}` | `{ isFrozen: false, message: "Restored" }` |
| `GET` | `/api/guardian/status` | Guardian details & pings | None | `{ guardian: {...}, isFrozen: false, pendingPings: [...] }` |
| `POST` | `/api/guardian/approve` | Guardian approves/rejects | `{"pingId": "png_...", "approved": true}` | `{ message: "Approved & executed" }` |
| `POST` | `/api/guardian/sos` | Human voice helper dispatch | None | `{ supportPhone: "1800-EASY-COIN" }` |

---

## 🛠️ Step-by-Step Implementation Tasks
1. **Emergency Panic Freeze**: When triggered, instantly block all outgoing API transfers across the entire system. Return clear spoken audio reassuring the elder that their money is protected.
2. **Guardian Push Notification Service**: Connect Firebase Cloud Messaging (FCM) / Apple Push Notifications (APNs) so when an elder initiates a transfer > ₹2,000, their adult child immediately receives a confirmation ping on their smartphone.
3. **Anti-Fraud Anomaly Rules**: Track rapid sequential transfers or midnight withdrawals and auto-prompt guardian verification.

---

## 🧪 How to Test Your Module
```bash
curl -X POST http://localhost:5000/api/guardian/freeze
curl http://localhost:5000/api/guardian/status
curl -X POST http://localhost:5000/api/guardian/unfreeze -H "Content-Type: application/json" -d '{"guardianPasscode": "1234"}'
```
