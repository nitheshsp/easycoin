# 🧑‍💻 Friend 2: Accounts, Visual Coins & Spoken Passbook

**Assigned Module**: `account.routes.js` & `accountController.js`  
**Domain**: Multi-wallet balances, Visual physical coin counter logic, Spoken transaction ledger.

---

## 🎯 Your Assigned Endpoints

| Method | Endpoint | Description | Query / Body | Response Structure |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/account/balance` | Real-time balance + speech text | None | `{ balance: 14250, spokenText: "..." }` |
| `GET` | `/api/account/coins` | Breakdown into gold & silver coins | None | `{ goldCoins: { count: 14 }, silverCoins: { count: 25 } }` |
| `GET` | `/api/account/passbook` | Spoken transaction ledger | None | `{ transactions: [ { spokenEntry: "..." } ] }` |
| `GET` | `/api/account/contacts` | Beneficiaries with photo avatars | None | `[ { name: "Son Rahul", avatar: "👨‍🦱" } ]` |

---

## 🛠️ Step-by-Step Implementation Tasks
1. **Visual Coin Calculator**: Convert arbitrary rupee numbers into physical gold coins (₹1,000 unit), silver coins (₹10 unit), and copper coins (₹1 unit) so illiterate users can immediately grasp their wealth visually.
2. **Audio Ledger Narration**: Generate natural human-friendly spoken descriptions for every debit/credit (e.g. *"You received 8,000 Rupees pension yesterday at 10:00 AM"*).
3. **Database Ledger Queries**: Wire up PostgreSQL/MongoDB transactions table with pagination and filter by beneficiary photo.

---

## 🧪 How to Test Your Module
```bash
curl http://localhost:5000/api/account/balance
curl http://localhost:5000/api/account/coins
curl http://localhost:5000/api/account/passbook
```
