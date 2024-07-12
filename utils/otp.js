// utils/otp.js
const OTP = require('../model/otp');
const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set");
}

const client = new twilio(accountSid, authToken);

const sendOTP = async (phone, otp) => {
  try {
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    console.log('OTP sent successfully');
  } catch (error) {
    console.error('Error sending OTP:', error);
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  sendOTP,
  generateOTP
};
