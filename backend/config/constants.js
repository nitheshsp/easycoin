/**
 * EasyCoin Backend Constants & System Configuration
 */
module.exports = {
  PORT: process.env.PORT || 5000,
  HIGH_VALUE_THRESHOLD: 2000, // Transfers above ₹2,000 trigger Guardian Approval
  SENIOR_SPEECH_RATE: 0.9,
  DEFAULT_CURRENCY: 'INR',
  SUPPORTED_LANGUAGES: ['en', 'hi', 'ta', 'te', 'mr', 'bn', 'gu', 'es', 'de']
};
