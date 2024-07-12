// models/otp.js
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: { expires: '5m' } } // OTP will expire after 5 minutes
});

module.exports = mongoose.model('OTP', otpSchema);
