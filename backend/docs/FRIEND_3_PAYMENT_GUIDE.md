# 🧑‍💻 Friend 3: Payments, Voice-to-Intent & QR Engine

**Assigned Module**: `payment.routes.js` & `paymentController.js`  
**Domain**: 1-Tap Photo transfers, Natural Language Voice-to-Intent parsing, Merchant QR audio decoding, Utility bills.

---

## 🎯 Your Assigned Endpoints

| Method | Endpoint | Description | Request Body Sample | Response Structure |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/transfer` | Photo / Direct transfer | `{"recipientName": "Son Rahul", "amount": 500}` | `{ transaction: {...}, remainingBalance: 13750 }` |
| `POST` | `/api/payments/voice-pay` | Natural Speech NLP parser | `{"voiceText": "Send 500 Rupees to Rahul"}` | `{ intent: "TRANSFER", recipientName: "Son Rahul", amount: 500 }` |
| `POST` | `/api/payments/qr-scan` | Merchant QR decoder | `{"qrPayload": "upi://pay?pa=lakshmi@upi"}` | `{ storeName: "Lakshmi Grocery", spokenDescription: "..." }` |
| `POST` | `/api/payments/bills/pay` | Symbol Utility Bill Pay | `{"billType": "Electricity", "amount": 450}` | `{ transaction: {...}, remainingBalance: 13800 }` |

---

## 🛠️ Step-by-Step Implementation Tasks
1. **Voice-to-Intent NLP Engine**: Build a fuzzy matcher and Regex/LLM parser that extracts `{ recipient, amount }` from diverse Indian and global spoken accents (e.g. *"Bete Rahul ko 500 rupay bhej do"* or *"Transfer 200 dollars to the grocery store"*).
2. **Transfer Idempotency & Safety**: Check sufficient balances, ensure negative amounts are impossible, and auto-route high-value transfers (≥ ₹2,000) to Friend 4's Guardian Gateway.
3. **Bill Payment Simulation**: Integrate Bharat BillPay (BBPS) / Stripe Billing mock for Electricity (⚡), Water (💧), and Gas (🔥).

---

## 🧪 How to Test Your Module
```bash
curl -X POST http://localhost:5000/api/payments/transfer \
  -H "Content-Type: application/json" \
  -d '{"recipientName": "Son Rahul", "amount": 500}'

curl -X POST http://localhost:5000/api/payments/voice-pay \
  -H "Content-Type: application/json" \
  -d '{"voiceText": "Pay Lakshmi Grocery 340 Rupees"}'
```
