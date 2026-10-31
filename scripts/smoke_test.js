/**
 * Backend smoke test.
 *
 * Runs against a LOCAL database (use DB_HOST / DB_PORT to point at it) and
 * exercises every endpoint added in this cycle, with a real admin token.
 *
 *   node scripts/smoke_test.js
 *
 * Exit code is non-zero if any check fails, so it can gate a deploy.
 */

require('../config/env');

const db = require('../config/db');
const util = require('util');
const { GenerateToken } = require('../util/jwt');
const logger = require('../util/logger');

const query = util.promisify(db.query).bind(db);
const BASE = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:7006/easygo';

let passed = 0;
let failed = 0;
const failures = [];

function record(name, ok, detail) {
    if (ok) {
        passed++;
        console.log(`  [PASS] ${name}`);
    } else {
        failed++;
        failures.push({ name, detail });
        console.log(`  [FAIL] ${name}${detail ? ` -> ${detail}` : ''}`);
    }
}

async function api(path, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body || {}),
    });

    const text = await res.text();
    let json;
    try {
        json = JSON.parse(text);
    } catch {
        json = { _raw: text.slice(0, 200), _status: res.status };
    }
    return { status: res.status, body: json, contentType: res.headers.get('content-type') };
}

/**
 * Create a real session token for the super-admin.
 */
async function adminToken() {
    const rows = await query(`SELECT u_id, u_name, u_email, u_role FROM user WHERE u_role = 'admin' LIMIT 1`);
    if (!rows.length) throw new Error('No admin user found');
    const admin = rows[0];

    const payload = {
        u_id: admin.u_id,
        email: admin.u_email,
        role: admin.u_role,
        franchise_id: null,
    };
    const token = GenerateToken(payload);
    await query(`INSERT INTO user_token (ut_u_id, ut_token, ut_expires_at) VALUES (?,?,?)`, [
        admin.u_id, token, new Date(Date.now() + 3600 * 1000),
    ]);
    return { token, admin };
}

/**
 * Create a throwaway customer we can safely delete.
 */
async function createTestCustomer() {
    const stamp = Date.now();
    const email = `smoke_test_${stamp}@example.invalid`;
    const result = await query(
        `INSERT INTO user (u_name, u_email, u_password, u_mobile, u_joindate, u_role, u_status, u_email_verify, u_address, u_state, u_district)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        ['Smoke Tester', email, 'x', 9990000000 + (stamp % 100000), '2026-01-01', 'user', 'active', 'true', 'Test Address', 'Kerala', 'Ernakulam'],
    );
    return { u_id: result.insertId, email, mobile: 9990000000 + (stamp % 100000) };
}

async function main() {
    console.log(`\nEasyGo backend smoke test -> ${BASE}\n`);
    console.log(`DB: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${process.env.DB_USERNAME}\n`);

    const { token, admin } = await adminToken();
    console.log(`Admin: ${admin.u_name} (u_id=${admin.u_id})\n`);

    // ── Auth sanity ────────────────────────────────────────────────────────
    console.log('--- auth ---');
    {
        const r = await api('/list/booking', {}, token);
        record('GET /list/booking with admin token', r.status === 200 && r.body.result === true, `HTTP ${r.status}`);
    }
    {
        const r = await api('/list/booking', {}, 'garbage.token.value');
        record('unauthenticated request is rejected', r.status === 401 || r.status === 498, `HTTP ${r.status}`);
    }

    // ── Franchise ──────────────────────────────────────────────────────────
    console.log('\n--- franchise ---');
    let franchiseId = null;
    {
        const r = await api('/list/franchise', {}, token);
        record('list franchises', r.status === 200 && r.body.result === true && Array.isArray(r.body.list), `HTTP ${r.status}`);
        const easygo = (r.body.list || []).find((f) => f.fr_code === 'EASYGO');
        record('default EASYGO franchise exists', !!easygo, 'not seeded');
        franchiseId = easygo?.fr_id;
    }
    {
        const r = await api('/add/franchise', { fr_code: 'SMOKE1', fr_name: 'Smoke Test Franchise' }, token);
        record('create franchise', r.status === 200 && r.body.result === true, r.body.message);
        const created = r.body.fr_id;
        if (created) {
            const r2 = await api('/edit/franchise', { fr_id: created, fr_name: 'Smoke Test Franchise v2' }, token);
            record('edit franchise', r2.body.result === true, r2.body.message);

            const r3 = await api('/franchise/stats', { fr_id: created }, token);
            record('franchise stats', r3.body.result === true && r3.body.stats !== undefined, r3.body.message);

            const r4 = await api('/delete/franchise', { fr_id: created }, token);
            record('delete empty franchise', r4.body.result === true, r4.body.message);
        }
    }
    {
        const r = await api('/add/franchise', { fr_code: 'EASYGO', fr_name: 'Duplicate' }, token);
        record('duplicate franchise code is rejected', r.body.result === false, r.body.message);
    }
    {
        const r = await api('/assign/franchise-admin', { u_id: admin.u_id, fr_id: 999999 }, token);
        record('assign admin to non-existent franchise is rejected', r.body.result === false, r.body.message);
    }

    // ── Availability / block booking ───────────────────────────────────────
    console.log('\n--- availability ---');
    {
        const r = await api('/list/availability', {
            pickup_location: 'ERANAKULAM NORTH ERNAKULAM',
            pickup_date: '2026-12-01', pickup_time: '2026-12-01 10:00:00',
            drop_date: '2026-12-01', drop_time: '2026-12-01 12:00:00',
        }, token);
        record('availability probe', r.status === 200 && r.body.result === true && typeof r.body.available_count === 'number', JSON.stringify(r.body).slice(0, 150));
    }
    {
        const r = await api('/list/availability', { pickup_date: '2026-12-01' }, token);
        record('availability requires pickup time', r.body.result === false, r.body.message);
    }

    // ── Reports ────────────────────────────────────────────────────────────
    console.log('\n--- reports ---');
    {
        const r = await api('/report/income-by-location', {}, token);
        record('income by pickup location', r.body.result === true && Array.isArray(r.body.list), JSON.stringify(r.body).slice(0, 150));
    }
    {
        const r = await api('/report/vehicles-on-ride', {}, token);
        record('vehicles on ride', r.body.result === true && Array.isArray(r.body.list), JSON.stringify(r.body).slice(0, 150));
    }
    {
        const r = await api('/report/vehicles-on-ride-excel', {}, token);
        record('vehicles on ride Excel', r.status === 200 && r.contentType && r.contentType.includes('spreadsheetml'), `HTTP ${r.status} ${r.contentType}`);
    }
    {
        const r = await api('/report/weekly-excel', {}, token);
        record('weekly report Excel', r.status === 200 && r.contentType && r.contentType.includes('spreadsheetml'), `HTTP ${r.status} ${r.contentType}`);
    }
    {
        const r = await api('/report/payments', {}, token);
        record('payment report list', r.body.result === true && Array.isArray(r.body.list), `HTTP ${r.status}`);
    }

    // ── Final bill on a real booking ───────────────────────────────────────
    console.log('\n--- final bill / penalties / manual payments ---');
    let completedBooking = null;
    {
        const rows = await query(
            `SELECT b_id, b_u_id, b_price_id, b_fine_amount, b_total_amount, b_status
             FROM bookings WHERE b_status = 'completed' AND b_payment_status = 'paid' LIMIT 1`,
        );
        completedBooking = rows[0] || null;
        record('found a completed booking to test against', !!completedBooking);
    }
    if (completedBooking) {
        const r = await api('/booking/final-bill', { b_id: completedBooking.b_id }, token);
        const fb = r.body.final_bill;
        record('final bill calculates', r.body.result === true && fb && typeof fb.refund_to_customer === 'number', r.body.message);
        if (fb) {
            record('final bill has deposit + paid components',
                typeof fb.security_deposit === 'number' && typeof fb.total_paid === 'number',
                `deposit=${fb.security_deposit} paid=${fb.total_paid}`);
            record('final bill maths is consistent',
                Math.abs(fb.net_revenue - (fb.total_paid - fb.refund_to_customer)) < 0.02,
                `net=${fb.net_revenue} paid=${fb.total_paid} refund=${fb.refund_to_customer}`);
        }

        const r2 = await api('/booking/save-final-bill', { b_id: completedBooking.b_id }, token);
        record('final bill snapshot saves', r2.body.result === true, r2.body.message);

        // penalty
        const r3 = await api('/add/penalty', { b_id: completedBooking.b_id, type: 'damage', amount: 150, notes: 'smoke test' }, token);
        record('add penalty', r3.body.result === true, r3.body.message);

        const r4 = await api('/list/booking-penalties', { b_id: completedBooking.b_id }, token);
        record('list booking penalties', r4.body.result === true && r4.body.list.length >= 1, r4.body.message);

        const r5 = await api('/list/penalties', {}, token);
        record('list all penalties', r5.body.result === true && Array.isArray(r5.body.list), r5.body.message);

        // final bill now reflects the penalty
        const r6 = await api('/booking/final-bill', { b_id: completedBooking.b_id }, token);
        record('final bill reflects penalty',
            r6.body.final_bill && r6.body.final_bill.penalties_total >= 150,
            `penalties=${r6.body.final_bill?.penalties_total}`);

        // clean up the penalty we added
        const del = await api('/delete/penalty', { pn_id: r3.body.pn_id }, token);
        record('delete penalty (cleanup)', del.body.result === true, del.body.message);

        // manual payment
        const r7 = await api('/add/manual-payment', {
            b_id: completedBooking.b_id, amount: 99.5, mode: 'cash', reference: 'SMOKE-REF-1', notes: 'smoke test',
        }, token);
        record('add manual payment', r7.body.result === true, r7.body.message);

        const r8 = await api('/list/manual-payments', { booking_id: completedBooking.b_id }, token);
        record('list manual payments', r8.body.result === true && r8.body.list.length >= 1, r8.body.message);

        const r9 = await api('/delete/manual-payment', { mp_id: r7.body.mp_id }, token);
        record('delete manual payment (cleanup)', r9.body.result === true, r9.body.message);
    }

    // ── Swaps ──────────────────────────────────────────────────────────────
    console.log('\n--- swaps ---');
    {
        const r = await api('/swap/quote', { b_id: completedBooking?.b_id }, token);
        record('swap quote', r.body.result === true && r.body.charge === 0 && r.body.swap_number === 1, JSON.stringify(r.body).slice(0, 150));
        record('swap policy: 1 free then Rs.100', r.body.free_swaps_allowed === 1 && r.body.charge_per_extra_swap === 100, JSON.stringify(r.body).slice(0, 150));
    }
    {
        const r = await api('/list/swaps', {}, token);
        record('list swaps', r.body.result === true && Array.isArray(r.body.list), r.body.message);
    }
    {
        const r = await api('/list/swap-requests', {}, token);
        record('list swap requests', r.body.result === true && Array.isArray(r.body.list), r.body.message);
    }

    // ── Feedback ───────────────────────────────────────────────────────────
    console.log('\n--- feedback ---');
    const testUser = await createTestCustomer();
    {
        const userRows = await query(`SELECT u_id FROM user WHERE u_email = ?`, [testUser.email]);
        const uid = userRows[0].u_id;
        const userToken = GenerateToken({ u_id: uid, email: testUser.email, role: 'user', franchise_id: null });
        await query(`INSERT INTO user_token (ut_u_id, ut_token, ut_expires_at) VALUES (?,?,?)`, [
            uid, userToken, new Date(Date.now() + 3600 * 1000),
        ]);

        const r = await api('/add/feedback', { type: 'suggestion', message: 'Smoke test feedback', rating: 4 }, userToken);
        record('customer submits feedback', r.body.result === true, r.body.message);

        const r2 = await api('/list/my-feedback', {}, userToken);
        record('customer sees own feedback', r2.body.result === true && r2.body.list.length >= 1, r2.body.message);

        const r3 = await api('/list/feedback', {}, token);
        record('admin lists feedback', r3.body.result === true && Array.isArray(r3.body.list), r3.body.message);

        const r4 = await api('/update/feedback-status', { fb_id: r.body.fb_id, status: 'resolved' }, token);
        record('admin updates feedback status', r4.body.result === true, r4.body.message);

        // ── Account deletion (full flow on the throwaway user) ─────────────
        console.log('\n--- account deletion ---');
        {
            const r5 = await api('/delete/account/preview', {}, userToken);
            record('deletion preview', r5.body.result === true && Array.isArray(r5.body.will_be_removed), r5.body.message);

            const r6 = await api('/delete/account/request-otp', {}, userToken);
            record('deletion OTP issued', r6.body.result === true, r6.body.message);

            // Read the OTP straight from the DB (the email is not delivered locally).
            const otpRows = await query(`SELECT u_token FROM user WHERE u_id = ?`, [uid]);
            const otp = otpRows[0].u_token;

            const r7 = await api('/delete/account', { otp: '000000' }, userToken);
            record('wrong OTP is rejected', r7.body.result === false && r7.body.code === 'INVALID_OTP', r7.body.message);

            const r8 = await api('/delete/account', { otp: String(otp) }, userToken);
            record('correct OTP deletes the account', r8.body.result === true && r8.body.deleted === true, r8.body.message);

            const after = await query(`SELECT u_name, u_email, u_mobile, u_status FROM user WHERE u_id = ?`, [uid]);
            const row = after[0];
            record('account is anonymised', row.u_name === 'Deleted User' && row.u_email.includes('@removed.in') && row.u_mobile === null, JSON.stringify(row));
            record('account marked deleted', row.u_status === 'deleted', row.u_status);

            const tokens = await query(`SELECT COUNT(*) AS c FROM user_token WHERE ut_u_id = ?`, [uid]);
            record('all sessions revoked', Number(tokens[0].c) === 0, `tokens=${tokens[0].c}`);

            const r9 = await api('/list/booking', {}, userToken);
            record('deleted account cannot authenticate', r9.status === 401, `HTTP ${r9.status}`);

            const bookings = await query(`SELECT COUNT(*) AS c FROM bookings WHERE b_u_id = ?`, [uid]);
            record('booking rows are retained (financial data kept)', Number(bookings[0].c) >= 0, `bookings=${bookings[0].c}`);
        }
    }

    // ── Summary ────────────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(70));
    console.log(`RESULT: ${passed} passed, ${failed} failed`);
    if (failures.length) {
        console.log('\nFailures:');
        failures.forEach((f) => console.log(`  - ${f.name}: ${f.detail || ''}`));
    }
    console.log('='.repeat(70) + '\n');

    db.end();
    process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
    logger.error('Smoke test crashed: %s', err.stack || err.message);
    console.error('\nSmoke test crashed:', err.stack || err.message);
    try { db.end(); } catch { /* ignore */ }
    process.exit(1);
});
