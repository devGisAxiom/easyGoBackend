var db = require('../config/db');
var util = require('util');
const query = util.promisify(db.query).bind(db);

/**
 * Manual (offline) payments — cash, in-person UPI, bank transfer.
 *
 * These are tracked separately from `bookings.b_total_amount` so that online
 * and offline income stay independently reportable, and so there is always
 * an audit trail of who collected what, when and how.
 */

module.exports.addManualPayment = async (fields) => {
    const {
        booking_id, amount, mode, reference,
        collected_by, notes, screenshot_url,
    } = fields;

    const Query = `INSERT INTO manual_payments
        (mp_booking_id, mp_amount, mp_mode, mp_reference, mp_collected_by, mp_notes, mp_screenshot_url)
        VALUES (?,?,?,?,?,?,?)`;
    return await query(Query, [
        booking_id, amount, mode || 'cash', reference || null,
        collected_by, notes || null, screenshot_url || null,
    ]);
};

module.exports.getManualPaymentById = async (mp_id) => {
    const Query = `SELECT * FROM manual_payments WHERE mp_id = ?`;
    const data = await query(Query, [mp_id]);
    return Array.isArray(data) ? data[0] : data;
};

module.exports.hasManualPayment = async (booking_id) => {
    const Query = `SELECT COUNT(*) AS cnt FROM manual_payments WHERE mp_booking_id = ?`;
    const data = await query(Query, [booking_id]);
    return data[0]?.cnt > 0;
};

module.exports.deleteManualPayment = async (mp_id) => {
    const Query = `DELETE FROM manual_payments WHERE mp_id = ?`;
    return await query(Query, [mp_id]);
};

/**
 * Total manual money collected against a booking.
 */
module.exports.getTotalForBooking = async (booking_id) => {
    const Query = `SELECT COALESCE(SUM(mp_amount),0) AS total FROM manual_payments WHERE mp_booking_id = ?`;
    const data = await query(Query, [booking_id]);
    return Number(data[0]?.total || 0);
};

/**
 * List manual payments with optional date / franchise filters.
 */
module.exports.listManualPayments = async ({
    from_date = null, to_date = null, franchise_id = null, booking_id = null,
} = {}) => {
    const conditions = [];
    const params = [];

    if (from_date) {
        conditions.push('DATE(mp.mp_collected_at) >= ?');
        params.push(from_date);
    }
    if (to_date) {
        conditions.push('DATE(mp.mp_collected_at) <= ?');
        params.push(to_date);
    }
    if (franchise_id) {
        conditions.push('b.b_franchise_id = ?');
        params.push(franchise_id);
    }
    if (booking_id) {
        conditions.push('mp.mp_booking_id = ?');
        params.push(booking_id);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const Query = `
        SELECT
            mp.mp_id,
            mp.mp_booking_id,
            mp.mp_amount,
            mp.mp_mode,
            mp.mp_reference,
            mp.mp_collected_at,
            mp.mp_notes,
            mp.mp_screenshot_url,
            b.b_id AS booking_id,
            b.b_status AS booking_status,
            b.b_pickup_location,
            b.b_franchise_id,
            fr.fr_name AS franchise_name,
            u_customer.u_name AS customer_name,
            u_customer.u_mobile AS customer_mobile,
            u_admin.u_name AS collected_by_name,
            COALESCE(mp_total.total, 0) AS booking_manual_total
        FROM manual_payments mp
        JOIN bookings b ON b.b_id = mp.mp_booking_id
        LEFT JOIN user u_customer ON u_customer.u_id = b.b_u_id
        LEFT JOIN user u_admin ON u_admin.u_id = mp.mp_collected_by
        LEFT JOIN franchises fr ON fr.fr_id = b.b_franchise_id
        LEFT JOIN (
            SELECT mp_booking_id, SUM(mp_amount) AS total
            FROM manual_payments GROUP BY mp_booking_id
        ) mp_total ON mp_total.mp_booking_id = mp.mp_booking_id
        ${where}
        ORDER BY mp.mp_collected_at DESC
    `;
    return await query(Query, params);
};

/**
 * Totals grouped by collection mode — used in the report header.
 */
module.exports.getTotalsByMode = async ({ from_date = null, to_date = null, franchise_id = null } = {}) => {
    const conditions = [];
    const params = [];

    if (from_date) {
        conditions.push('DATE(mp.mp_collected_at) >= ?');
        params.push(from_date);
    }
    if (to_date) {
        conditions.push('DATE(mp.mp_collected_at) <= ?');
        params.push(to_date);
    }
    if (franchise_id) {
        conditions.push('b.b_franchise_id = ?');
        params.push(franchise_id);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const Query = `
        SELECT mp.mp_mode, COUNT(*) AS entries, COALESCE(SUM(mp.mp_amount),0) AS total
        FROM manual_payments mp
        JOIN bookings b ON b.b_id = mp.mp_booking_id
        ${where}
        GROUP BY mp.mp_mode
        ORDER BY total DESC
    `;
    return await query(Query, params);
};
