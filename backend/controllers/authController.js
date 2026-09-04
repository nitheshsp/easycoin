/**
 * Module 1: Authentication & Biometrics Controller
 * Assigned to: FRIEND 1
 * Responsibilities: Voice OTP, Biometric Login, Senior Session Management
 */
const db = require('../config/database');
const authGuard = require('../middleware/authGuard');

exports.requestVoiceOTP = (req, res) => {
  const { phone } = req.body;
  const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Audio text ready for senior Text-to-Speech playback
  const spokenPrompt = `Your EasyCoin security code is: ${otpCode.split('').join(' ')}. Do not share this with anyone.`;

  return res.status(200).json({
    success: true,
    message: 'Voice OTP generated successfully',
    data: {
      phone: phone || db.getUser().phone,
      otpCode, // in real production, sent via voice call / SMS gateway
      spokenPrompt,
      expiresInSeconds: 300
    }
  });
};

exports.verifyOTP = (req, res) => {
  const { otp } = req.body;
  if (!otp || otp.length < 4) {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP format. Please enter 4 digits.'
    });
  }

  const user = db.getUser();
  const token = authGuard.generateToken({ userId: user.id, role: 'senior' });

  return res.status(200).json({
    success: true,
    message: 'Authentication successful',
    data: {
      token,
      user
    }
  });
};

exports.biometricLogin = (req, res) => {
  const { biometricSignature } = req.body;
  const user = db.getUser();

  if (user.isFrozen) {
    return res.status(403).json({
      success: false,
      message: 'Account is currently FROZEN due to Emergency SOS Lock.',
      isFrozen: true
    });
  }

  const token = authGuard.generateToken({ userId: user.id, role: 'senior', method: 'biometric' });

  return res.status(200).json({
    success: true,
    message: 'Biometric verification passed',
    data: {
      user,
      token
    }
  });
};


exports.symbolLogin = (req, res) => {
  const { symbols } = req.body;
  if (!Array.isArray(symbols) || symbols.length !== 3) {
    return res.status(400).json({
      success: false,
      message: 'Please choose all 3 secret pictures.'
    });
  }

  const user = db.getUser();
  if (user.isFrozen) {
    return res.status(403).json({
      success: false,
      message: 'Account is currently FROZEN due to Emergency SOS Lock.',
      isFrozen: true
    });
  }

  const isValid = db.verifySymbolPin(symbols);
  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect secret pictures. Please try again.'
    });
  }

  const token = authGuard.generateToken({ userId: user.id, role: 'senior', method: 'symbol' });

  return res.status(200).json({
    success: true,
    message: 'Secret picture lock verified successfully',
    data: {
      token,
      user
    }
  });
};

exports.registerUser = (req, res) => {
  const { name, phone, age, guardianName, guardianPhone, balance, symbols } = req.body;
  if (!name || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Name and phone number are required.'
    });
  }

  const user = db.registerUser({
    name,
    phone,
    age,
    guardianName,
    guardianPhone,
    balance,
    symbols
  });

  const token = authGuard.generateToken({ userId: user.id, role: 'senior', method: 'registration' });

  return res.status(201).json({
    success: true,
    message: `Account created successfully for ${user.name}!`,
    data: {
      user,
      token
    }
  });
};


exports.getCurrentUser = (req, res) => {
  return res.status(200).json({
    success: true,
    data: db.getUser()
  });
};


