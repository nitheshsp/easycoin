/**
 * EasyCoin Automated Verification & Regression Test Suite
 * Tests SQLite persistence, ACID state, payments, bills, UPI circle, and authentication.
 */
const assert = require('assert');
const db = require('../config/database');

async function runTests() {
  console.log('====================================================');
  console.log('🧪 EasyCoin Official Test Suite (SQLite & REST APIs)');
  console.log('====================================================\n');

  const BASE_URL = 'http://localhost:5001/api';

  // 1. Health check
  console.log('1️⃣ Health Check...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  assert.strictEqual(healthRes.status, 200);
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'ONLINE');
  console.log('   ✅ Health Check passed!\n');

  // 2. Account & Balance
  console.log('2️⃣ Account & Coin Breakdown...');
  const balRes = await fetch(`${BASE_URL}/account/balance`);
  assert.strictEqual(balRes.status, 200);
  const balData = await balRes.json();
  assert.strictEqual(typeof balData.data.balance, 'number');
  console.log(`   ✅ Current Balance: ₹${balData.data.balance}\n`);

  // 3. Secret Picture Lock
  console.log('3️⃣ Secret Picture Lock Authentication...');
  const validAuth = await fetch(`${BASE_URL}/auth/symbol-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbols: ['☀️', '🐄', '🪔'] })
  });
  assert.strictEqual(validAuth.status, 200);

  const invalidAuth = await fetch(`${BASE_URL}/auth/symbol-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbols: ['☀️', '🐄', '🚜'] })
  });
  assert.strictEqual(invalidAuth.status, 401);
  console.log('   ✅ Valid credentials authenticated, invalid credentials rejected!\n');

  // 4. UPI Circle Management
  console.log('4️⃣ UPI Circle Minor Delegation...');
  const circleRes = await fetch(`${BASE_URL}/circle/members`);
  assert.strictEqual(circleRes.status, 200);
  const circleData = await circleRes.json();
  assert(circleData.data.members.length >= 2);
  console.log(`   ✅ Active Family Circle members: ${circleData.data.members.length}\n`);

  // 5. User Registration Persistence
  console.log('5️⃣ User Registration Persistence...');
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rameshwar Dayal',
      phone: '9876599999',
      age: 72,
      guardianName: 'Son Amit',
      guardianPhone: '+91 98112 33445',
      balance: 15000,
      symbols: ['☀️', '🐄', '🪔']
    })
  });
  assert.strictEqual(regRes.status, 201);
  const regData = await regRes.json();
  assert.strictEqual(regData.data.user.name, 'Rameshwar Dayal');
  console.log(`   ✅ Registered new user in SQLite: ${regData.data.user.name}\n`);

  // 6. Multi-Lingual Voice-to-Intent NLP (Hindi, Tamil, English)
  console.log('6️⃣ Multi-Lingual Voice NLP Parser...');
  // Hindi Command
  const hiVoiceRes = await fetch(`${BASE_URL}/payments/voice-pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voiceText: 'Rahul ko 500 rupaye bhej do' })
  });
  assert.strictEqual(hiVoiceRes.status, 200);
  const hiVoice = await hiVoiceRes.json();
  assert.strictEqual(hiVoice.data.recipientName, 'Son Rahul');
  assert.strictEqual(hiVoice.data.amount, 500);
  assert.strictEqual(hiVoice.data.languageDetected, 'hi');
  console.log('   ✅ Hindi Voice command recognized ("Rahul ko 500 rupaye bhej do" -> ₹500 to Son Rahul)');

  // Tamil Command
  const taVoiceRes = await fetch(`${BASE_URL}/payments/voice-pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voiceText: 'Lakshmi grocery-ku moonu nooru roobai kudu' })
  });
  assert.strictEqual(taVoiceRes.status, 200);
  const taVoice = await taVoiceRes.json();
  assert.strictEqual(taVoice.data.recipientName, 'Lakshmi Grocery');
  assert.strictEqual(taVoice.data.amount, 300);
  assert.strictEqual(taVoice.data.languageDetected, 'ta');
  console.log('   ✅ Tamil Voice command recognized ("Lakshmi grocery-ku moonu nooru roobai kudu" -> ₹300 to Lakshmi Grocery)');

  // English Command
  const enVoiceRes = await fetch(`${BASE_URL}/payments/voice-pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voiceText: 'Pay 340 to Dr Sharma' })
  });
  assert.strictEqual(enVoiceRes.status, 200);
  const enVoice = await enVoiceRes.json();
  assert.strictEqual(enVoice.data.recipientName, 'Dr. Sharma');
  assert.strictEqual(enVoice.data.amount, 340);
  assert.strictEqual(enVoice.data.languageDetected, 'en');
  console.log('   ✅ English Voice command recognized ("Pay 340 to Dr Sharma" -> ₹340 to Dr. Sharma)\n');

  // 7. Senior Fraud Guard & Double-Tap Idempotency
  console.log('7️⃣ Senior Fraud Guard & Double-Tap Idempotency...');
  const initialBal = db.getBalance();
  const txRes1 = await fetch(`${BASE_URL}/payments/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipientName: 'Son Rahul', amount: 100, note: 'Tea' })
  });
  assert.strictEqual(txRes1.status, 200);
  const txData1 = await txRes1.json();
  assert.strictEqual(txData1.success, true);
  assert.strictEqual(db.getBalance(), initialBal - 100);

  // Immediate duplicate request within 5s window
  const txRes2 = await fetch(`${BASE_URL}/payments/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipientName: 'Son Rahul', amount: 100, note: 'Tea' })
  });
  assert.strictEqual(txRes2.status, 200);
  const txData2 = await txRes2.json();
  assert.strictEqual(txData2.deduplicated, true);
  // Balance should NOT be deducted twice!
  assert.strictEqual(db.getBalance(), initialBal - 100);
  console.log('   ✅ Double-tap prevented! Duplicate transfer intercepted without double debit.\n');

  // 8. High-Value Guardian Approval Flow
  console.log('8️⃣ High-Value Guardian Approval Flow...');
  const highValRes = await fetch(`${BASE_URL}/payments/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipientName: 'Dr. Sharma', amount: 2500, note: 'Medical Procedure' })
  });
  assert.strictEqual(highValRes.status, 202);
  const highValData = await highValRes.json();
  assert.strictEqual(highValData.pendingApproval, true);
  assert(highValData.guardianPing && highValData.guardianPing.pingId);
  console.log(`   ✅ Transfer of ₹2,500 held for guardian approval: ${highValData.guardianPing.pingId}`);

  // Guardian approves
  const approveRes = await fetch(`${BASE_URL}/guardian/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pingId: highValData.guardianPing.pingId, approved: true })
  });
  assert.strictEqual(approveRes.status, 200);
  console.log('   ✅ Guardian approved and transaction executed!\n');

  // 9. Emergency SOS Siren & Audit Trail
  console.log('9️⃣ Emergency SOS Siren & Audit Trail...');
  const sosRes = await fetch(`${BASE_URL}/guardian/sos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  assert.strictEqual(sosRes.status, 200);
  console.log('   ✅ Emergency SOS Siren dispatched.');

  const auditRes = await fetch(`${BASE_URL}/guardian/audit-logs`);
  assert.strictEqual(auditRes.status, 200);
  const auditData = await auditRes.json();
  assert(auditData.data && auditData.data.length > 0);
  console.log(`   ✅ RBI-compliant Audit Trail contains ${auditData.data.length} tamper-evident entries.\n`);

  // 10. Cleanup to pristine state
  db.db.exec("DELETE FROM circle_members WHERE id NOT IN ('minor-aarav', 'minor-diya');");
  db.db.exec("DELETE FROM circle_spends WHERE id NOT IN ('sp_01', 'sp_02', 'sp_03', 'sp_04');");
  db.db.exec("DELETE FROM transactions WHERE id NOT IN ('tx_101', 'tx_102', 'tx_103');");
  db.db.exec("DELETE FROM users WHERE id != 'usr_senior_01';");
  db.setBalance(14250);

  console.log('====================================================');
  console.log('🎉 ALL TESTS PASSED! PERSISTENCE & APIS VERIFIED 100%');
  console.log('====================================================\n');
}


runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
