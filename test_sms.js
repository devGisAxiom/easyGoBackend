// Test script for SMS integration verification
// Run with: node test_sms.js

require('dotenv').config();
const sms = require('./util/sms');

(async () => {
    console.log('=== SMS Integration Test ===\n');
    console.log('Templates configured:', sms.TEMPLATE_IDS);
    console.log('API key present:', !!process.env.SMSBUDDY_API_KEY);
    console.log('Sender ID:', process.env.SMSBUDDY_DEFAULT_SENDER || 'ESYGOO');
    console.log();

    // Test 1: Mobile normalization
    console.log('--- Test 1: Mobile normalization ---');
    console.log('  9895000000  ->', sms.normalizeMobile('9895000000'));
    console.log('  919895000000 ->', sms.normalizeMobile('919895000000'));
    console.log('  +919895000000 ->', sms.normalizeMobile('+919895000000'));
    console.log('  invalid     ->', sms.normalizeMobile('invalid'));
    console.log('  null        ->', sms.normalizeMobile(null));
    console.log();

    // Test 2: Invalid template key should skip
    console.log('--- Test 2: Invalid template key ---');
    const r2 = await sms.sendSMS('NONEXISTENT', '919895000000', ['x'], 't2');
    console.log('  Result:', r2);
    console.log();

    // Test 3: Empty variables should skip
    console.log('--- Test 3: Empty variables ---');
    const r3 = await sms.sendSMS('BOOKING_CONFIRMED', '919895000000', [], 't3');
    console.log('  Result:', r3);
    console.log();

    // Test 4: Invalid mobile should skip
    console.log('--- Test 4: Invalid mobile ---');
    const r4 = await sms.sendSMS('BOOKING_CONFIRMED', 'abc', ['x'], 't4');
    console.log('  Result:', r4);
    console.log();

    // Test 5: Actual API call (Booking Confirmed template)
    console.log('--- Test 5: Real Booking Confirmed SMS ---');
    const r5 = await sms.sendSMS(
        'BOOKING_CONFIRMED',
        '919895000000',
        [
            'Ram Kumar',
            'KL01AB1234',
            '01 Sep 2026 10:00',
            '02 Sep 2026 10:00',
            '1 day',
            '500.00',
            '25.00',
            '299.00',
            '824.00',
        ],
        'b_test_001'
    );
    console.log('  Result:', r5);
    console.log();

    // Test 6: Real Booking Rejected SMS
    console.log('--- Test 6: Real Booking Rejected SMS ---');
    const r6 = await sms.sendSMS(
        'BOOKING_REJECTED',
        '919895000000',
        [
            'Ram Kumar',
            'KL01AB1234',
            '01 Sep 2026',
            'Documents unclear',
        ],
        'b_test_002'
    );
    console.log('  Result:', r6);
    console.log();

    console.log('=== All tests complete ===');
    console.log();
    console.log('Note: "Insufficient Balance" or "Invalid API Key" responses are');
    console.log('expected if SMSBuddy account has no credits or key is invalid.');
    console.log('Top up SMSBuddy account to verify successful delivery.');
})();
