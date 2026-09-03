/**
 * Module 1: Authentication & Biometrics Controller
 * Assigned to: FRIEND 1
 * Responsibilities: Voice OTP, Biometric Login, Senior Session Management
 */
const db = require('../config/database');

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

  return res.status(200).json({
    success: true,
    message: 'Authentication successful',
    data: {
      token: 'jwt_mock_easycoin_senior_token_9921',
      user: db.getUser()
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

  return res.status(200).json({
    success: true,
    message: 'Biometric verification passed',
    data: {
      user,
      token: 'jwt_mock_easycoin_senior_token_9921'
    }
  });
};

exports.getCurrentUser = (req, res) => {
  return res.status(200).json({
    success: true,
    data: db.getUser()
  });
};
