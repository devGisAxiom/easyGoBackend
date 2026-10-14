// Test script to verify SMS delivery and check account balance
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.SMSBUDDY_API_KEY;
// Real customer test number (for end-to-end verification)
const TEST_MOBILE = '918105523847';

(async () => {
  console.log('=== SMSBuddy Live Connectivity Test ===\n');

  console.log('1. Testing account balance endpoints...');
  const balancePaths = [
    'https://thesmsbuddy.com/api/v1/check-balance',
    'https://thesmsbuddy.com/api/v1/account/balance',
    'https://thesmsbuddy.com/api/v1/wallet-balance',
    'https://thesmsbuddy.com/api/v1/balance',
    'https://thesmsbuddy.com/api/v1/get-balance',
    'https://thesmsbuddy.com/api/v1/me/balance',
    'https://thesmsbuddy.com/api/v1/user/balance',
  ];

  for (const path of balancePaths) {
    try {
      const resp = await axios.get(path, {
        params: { key: API_KEY },
        timeout: 5000,
      });
      console.log(`   OK   ${path}: ${JSON.stringify(resp.data)}`);
    } catch (err) {
      const code = err.response?.status || 'ERR';
      const body = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      console.log(`   ${code} ${path}: ${body}`);
    }
  }

  console.log('\n2. Testing real SMS send (BOOKING_CONFIRMED template)...');
  const TARGET_MOBILE = '918105523847';  // Hemanth's number with 91 prefix
  const payload = {
    root: {
      type: '1',
      flash: '0',
      sender: 'ESYGOO',
      message: 'Test',
      key: API_KEY,
      template_id: '1707178255997402259',
    },
    nodes: [
      {
        to: TARGET_MOBILE,
        message: 'Dear Hemanth, your EasyGo vehicle booking is confirmed. Vehicle No: KL01AB1234 | Start: 01 Sep 2026 10:00 | Return: 01 Sep 2026 12:00 Duration: 1 day | Rent: Rs.500.00 | GST(5%): Rs.25.00 Deposit: Rs.299.00 | Total: Rs.824.00 For support contact us. - https://easygo.net.in/',
      },
    ],
  };

  try {
    const resp = await axios.post('https://thesmsbuddy.com/api/v1/sms/send/json', payload, {
      timeout: 8000,
    });
    console.log(`   OK ${resp.status}: ${JSON.stringify(resp.data)}`);
    if (resp.data.status === '200') {
      console.log('   ✅ SMS delivered successfully!');
    }
  } catch (err) {
    const code = err.response?.status || 'ERR';
    const body = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    console.log(`   ${code}: ${body}`);
    if (code === 409 && body && body.includes('Insufficient')) {
      console.log('\n   ⚠️  Your SMSBuddy account has 0 credits.');
      console.log('   To verify SMS delivery, top up your wallet at https://thesmsbuddy.com');
    }
  }

  console.log('\n3. Testing real SMS send (BOOKING_REJECTED template)...');
  const rejectPayload = {
    root: {
      type: '1',
      flash: '0',
      sender: 'ESYGOO',
      message: 'Test',
      key: API_KEY,
      template_id: '1707178256004172786',
    },
    nodes: [
      {
        to: TARGET_MOBILE,
        message: 'Dear Hemanth, your EasyGo vehicle booking request for KL01AB1234 on 01 Sep 2026 has been rejected. Reason: Documents unclear. Please contact us for assistance. - https://easygo.net.in/',
      },
    ],
  };

  try {
    const resp = await axios.post('https://thesmsbuddy.com/api/v1/sms/send/json', rejectPayload, {
      timeout: 8000,
    });
    console.log(`   OK ${resp.status}: ${JSON.stringify(resp.data)}`);
  } catch (err) {
    const code = err.response?.status || 'ERR';
    const body = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    console.log(`   ${code}: ${body}`);
  }
})();