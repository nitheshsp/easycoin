# 🏦 EasyCoin Modular Backend System

Welcome to the **EasyCoin Backend Gateway**. This repository powers the accessible digital payment and banking application designed for senior citizens and illiterate users.

---

## 👥 Team Module Assignment

The backend is cleanly divided into 4 independent modules so teammates can work concurrently without merge conflicts:

| Module | File Location | Owner | Guide Link |
| :--- | :--- | :--- | :--- |
| **Module 1: Auth & Biometrics** | `routes/auth.routes.js`, `controllers/authController.js` | **Friend 1** | [Friend 1 Guide](docs/FRIEND_1_AUTH_GUIDE.md) |
| **Module 2: Accounts & Passbook** | `routes/account.routes.js`, `controllers/accountController.js` | **Friend 2** | [Friend 2 Guide](docs/FRIEND_2_ACCOUNT_GUIDE.md) |
| **Module 3: Payments & Voice** | `routes/payment.routes.js`, `controllers/paymentController.js` | **Friend 3** | [Friend 3 Guide](docs/FRIEND_3_PAYMENT_GUIDE.md) |
| **Module 4: Guardian & Safety** | `routes/guardian.routes.js`, `controllers/guardianController.js` | **Friend 4** | [Friend 4 Guide](docs/FRIEND_4_GUARDIAN_GUIDE.md) |

---

## 🚀 How to Run the Backend Server

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
# Server starts on http://localhost:5000
```

3. Test the health status:
```bash
curl http://localhost:5000/api/health
```

---

## 🧪 Testing Endpoints

Open [tests/api_test.http](tests/api_test.http) in VS Code (using the REST Client extension) or run standard `curl` commands to test all routes interactively.
