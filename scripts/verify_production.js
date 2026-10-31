/**
 * Production verification (READ-ONLY).
 *
 * Exercises every endpoint added in this cycle against a live server using a
 * real super-admin session, and asserts the response shape.
 *
 * Nothing is written to business data. The only write is one row in
 * `user_token` — exactly what a normal login creates — which is deleted
 * again at the end.
 *
 *   node scripts/verify_production.js
 *
 * Env:
 *   VERIFY_BASE_URL  default https://api.tgelectric.in/easygo
 *   VERIFY_LOCAL     set to 1 to skip the token cleanup (debugging)
 */

require('../config/env');

const db = require('../config/db');
const util = require('util');
const { GenerateToken } = require('../util/jwt');
const logger = require('../util/logger');

const query = util.promisify(db.query).bind(db);

const BASE = process.env.VERIFY_BASE_URL || 'https://api.tgelectric.in/easygo';
const KEEP_TOKEN = process.env.VERIFY_LOCAL === '1';

let passed = 0;
let failed = 0;
const failures = [];

function check(name, ok, detail) {
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

    const buf = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') || '';

    // Excel files come back as a binary buffer.
    if (contentType.includes('spreadsheetml') || contentType.includes('octet-stream')) {
        return {
            status: res.status,
            isExcel: true,
            buffer: buf,
            contentType,
        };
    }

    const text = buf.toString('utf8');
    let json;
    try {
        json = JSON.parse(text);
    } catch {
        json = { _raw: text.slice(0, 200) };
    }
    return { status: res.status, body: json, isExcel: false, contentType };
}

function isValidXlsx(buffer) {
    // XLSX is a ZIP archive: starts with PK\x03\x04
    return buffer.length > 1000 && buffer[0] === 0x50 && buffer[1] === 0x4b;
}

async function main() {
    console.log(`\nEasyGo production verification -> ${BASE}\n`);
    console.log(`DB: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_USERNAME}\n`);

    // ── Build a real admin session ─────────────────────────────────────────
    const rows = await query(
        `SELECT u_id, u_name, u_email, u_role FROM user WHERE u_role = 'admin' LIMIT 1`,
    );
    if (!rows.length) {
        console.log('No admin user found - cannot verify.');
        process.exit(1);
    }
    const admin = rows[0];

    const token = GenerateToken({
        u_id: admin.u_id,
        email: admin.u_email,
        role: admin.u_role,
        franchise_id: null,
    });
    await query(
        `INSERT INTO user_token (ut_u_id, ut_token, ut_expires_at) VALUES (?,?,?)`,
        [admin.u_id, token, new Date(Date.now() + 1800 * 1000)],
    );
    console.log(`Admin session: ${admin.u_name} (u_id=${admin.u_id})\n`);

    try {
        // ── Public ──────────────────────────────────────────────────────────
        console.log('--- public endpoints ---');
        {
            const r = await api('/list/price', {});
            check('list/price (public)', r.status === 200 && r.body.result === true, `HTTP ${r.status}`);
            check('pricing tiers returned', (r.body.list || []).length > 0, `count=${(r.body.list || []).length}`);
        }

        // ── Auth gate ───────────────────────────────────────────────────────
        console.log('\n--- auth enforcement ---');
        for (const p of [
            '/list/booking', '/list/franchise', '/list/bike', '/list/user',
            '/report/payments', '/report/income-by-location',
            '/report/vehicles-on-ride', '/list/manual-payments', '/list/penalties',
            '/list/swaps', '/list/feedback', '/list/availability',
            '/add/manual-payment', '/add/penalty', '/request/swap',
            '/booking/final-bill', '/delete/account/preview', '/franchise/stats',
            '/list/deposit-returns', '/swap/quote',
        ]) {
            const r = await api(p, {});
            check(`${p} rejects anonymous`, r.status === 401, `HTTP ${r.status}`);
        }

        // ── Franchise ───────────────────────────────────────────────────────
        console.log('\n--- franchise ---');
        {
            const r = await api('/list/franchise', {}, token);
            const list = r.body.list || [];
            check('list/franchise', r.body.result === true && list.length >= 1, `count=${list.length}`);
            check('EASYGO franchise present', list.some((f) => f.fr_code === 'EASYGO'), JSON.stringify(list.map((f) => f.fr_code)));
            check('franchise has booking_count', list.every((f) => f.booking_count !== undefined), 'missing counts');
        }
        {
            const r = await api('/franchise/stats', {}, token);
            check('franchise/stats', r.body.result === true && r.body.stats !== undefined, r.body.message);
            if (r.body.stats) {
                check('stats has counters', ['pending', 'approved', 'onride', 'completed', 'bikes', 'locations', 'revenue']
                    .every((k) => r.body.stats[k] !== undefined), JSON.stringify(r.body.stats));
            }
        }
        {
            const r = await api('/list/franchise-admins', {}, token);
            check('list/franchise-admins', r.body.result === true && Array.isArray(r.body.list), r.body.message);
        }

        // ── Core lists still work ───────────────────────────────────────────
        console.log('\n--- core lists (regression) ---');
        {
            const r = await api('/list/booking', {}, token);
            check('list/booking', r.body.result === true && Array.isArray(r.body.list), `HTTP ${r.status} count=${(r.body.list || []).length}`);
            const first = (r.body.list || [])[0];
            if (first) {
                check('booking carries franchise_name', first.franchise_name !== undefined, 'missing');
                check('booking carries b_source', first.b_source !== undefined, 'missing');
                check('booking carries manual_payment_total', first.manual_payment_total !== undefined, 'missing');
            }
        }
        {
            const r = await api('/list/bike', {}, token);
            check('list/bike', r.body.result === true && Array.isArray(r.body.list), `count=${(r.body.list || []).length}`);
            const first = (r.body.list || [])[0];
            if (first) check('bike carries franchise_name', first.franchise_name !== undefined, 'missing');
        }
        {
            const r = await api('/list/user', {}, token);
            check('list/user', r.body.result === true && Array.isArray(r.body.list), `count=${(r.body.list || []).length}`);
            const deleted = (r.body.list || []).filter((u) => String(u.u_status || '').toLowerCase() === 'deleted');
            check('deleted accounts hidden from the list', deleted.length === 0, `${deleted.length} leaked`);
        }
        {
            const r = await api('/list/center', {}, token);
            check('list/center', r.body.result === true && Array.isArray(r.body.list), `count=${(r.body.list || []).length}`);
            const first = (r.body.list || [])[0];
            if (first) check('center carries franchise_name', first.franchise_name !== undefined, 'missing');
        }
        {
            const r = await api('/list/deposit-returns', {}, token);
            check('list/deposit-returns', r.body.result === true && Array.isArray(r.body.list), `count=${(r.body.list || []).length}`);
        }

        // ── Reports ─────────────────────────────────────────────────────────
        console.log('\n--- reports ---');
        {
            const r = await api('/report/payments', {}, token);
            check('report/payments', r.body.result === true && Array.isArray(r.body.list), `count=${(r.body.list || []).length}`);
        }
        {
            const r = await api('/report/income-by-location', {}, token);
            check('report/income-by-location', r.body.result === true && Array.isArray(r.body.list), `count=${(r.body.list || []).length}`);
            const first = (r.body.list || [])[0];
            if (first) {
                check('income grouped by location', !!first.pickup_location && typeof first.total_collected === 'number', JSON.stringify(first).slice(0, 120));
                check('income has net_revenue', typeof first.net_income === 'number', 'missing');
            }
        }
        {
            const r = await api('/report/vehicles-on-ride', {}, token);
            check('report/vehicles-on-ride', r.body.result === true && Array.isArray(r.body.list), `count=${(r.body.list || []).length}`);
            const first = (r.body.list || [])[0];
            if (first) {
                check('vehicle row has customer + issue + return',
                    first.customer_name !== undefined && first.issue_date !== undefined && first.return_date !== undefined,
                    JSON.stringify(first).slice(0, 140));
            }
        }

        // ── Excel exports ───────────────────────────────────────────────────
        console.log('\n--- Excel exports ---');
        for (const p of ['/report/excel', '/report/vehicles-on-ride-excel', '/report/weekly-excel']) {
            const r = await api(p, {}, token);
            check(`${p} returns a valid xlsx`, r.isExcel && isValidXlsx(r.buffer),
                `HTTP ${r.status} bytes=${r.buffer ? r.buffer.length : 0} type=${r.contentType}`);
        }

        // ── New feature lists (expected empty on a fresh deploy) ────────────
        console.log('\n--- new feature lists (should be empty) ---');
        for (const p of ['/list/manual-payments', '/list/penalties', '/list/swaps', '/list/feedback']) {
            const r = await api(p, {}, token);
            check(`${p} responds`, r.body.result === true && Array.isArray(r.body.list), r.body.message);
        }

        // ── Availability ────────────────────────────────────────────────────
        console.log('\n--- availability ---');
        {
            const r = await api('/list/availability', {
                pickup_location: 'ERANAKULAM NORTH ERNAKULAM',
                pickup_date: '2027-01-15',
                pickup_time: '2027-01-15 10:00:00',
                drop_date: '2027-01-15',
                drop_time: '2027-01-15 12:00:00',
            }, token);
            check('availability probe', r.body.result === true && typeof r.body.available_count === 'number',
                JSON.stringify(r.body).slice(0, 140));
            check('fleet has spare vehicles', (r.body.available_count || 0) > 0, `available=${r.body.available_count}`);
        }

        // ── Final bill on a real completed booking ──────────────────────────
        console.log('\n--- final bill ---');
        {
            const rowsB = await query(
                `SELECT b_id FROM bookings WHERE b_status='completed' AND b_payment_status='paid' LIMIT 1`,
            );
            if (!rowsB.length) {
                check('found a completed booking', false, 'none available');
            } else {
                const r = await api('/booking/final-bill', { b_id: rowsB[0].b_id }, token);
                const fb = r.body.final_bill;
                check('final bill calculates', r.body.result === true && !!fb, r.body.message);
                if (fb) {
                    check('final bill components present',
                        ['security_deposit', 'base_rent', 'gst', 'penalties_total',
                            'total_paid', 'refund_to_customer', 'additional_due', 'net_revenue']
                            .every((k) => fb[k] !== undefined),
                        JSON.stringify(Object.keys(fb)).slice(0, 160));
                    check('final bill maths consistent',
                        Math.abs(fb.net_revenue - (fb.total_paid - fb.refund_to_customer)) < 0.02,
                        `net=${fb.net_revenue} paid=${fb.total_paid} refund=${fb.refund_to_customer}`);
                }
            }
        }

        // ── Account deletion preview (read-only) ────────────────────────────
        console.log('\n--- account deletion ---');
        {
            const r = await api('/delete/account/preview', {}, token);
            check('deletion preview', r.body.result === true && Array.isArray(r.body.will_be_removed), r.body.message);
        }

        // ── Swap quote ──────────────────────────────────────────────────────
        console.log('\n--- swaps ---');
        {
            const rowsS = await query(`SELECT b_id FROM bookings WHERE b_status='onride' LIMIT 1`);
            if (rowsS.length) {
                const r = await api('/swap/quote', { b_id: rowsS[0].b_id }, token);
                check('swap quote', r.body.result === true && r.body.charge_per_extra_swap === 100,
                    JSON.stringify(r.body).slice(0, 140));
                check('swap policy: 1 free then Rs.100',
                    r.body.free_swaps_allowed === 1 && r.body.charge_per_extra_swap === 100,
                    JSON.stringify(r.body).slice(0, 140));
            } else {
                check('found an onride booking for the swap quote', false, 'none');
            }
        }
    } finally {
        // ── Clean up the temporary session ──────────────────────────────────
        if (!KEEP_TOKEN) {
            await query(`DELETE FROM user_token WHERE ut_token = ?`, [token]);
            console.log('\nTemporary admin session removed.');
        }
    }

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
    logger.error('Verification crashed: %s', err.stack || err.message);
    console.error('\nVerification crashed:', err.stack || err.message);
    try { db.end(); } catch { /* ignore */ }
    process.exit(1);
});
