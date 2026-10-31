var db = require('../config/db');
var util = require('util');
const query = util.promisify(db.query).bind(db);

/**
 * Penalties / fines / damages charged against a booking's security deposit.
 */

const PENALTY_TYPES = ['damage', 'traffic_fine', 'helmet_missing', 'late_return', 'cleaning', 'other'];

module.exports.PENALTY_TYPES = PENALTY_TYPES;

module.exports.addPenalty = async (fields) => {
    const { booking_id, type, amount, notes, added_by } = fields;
    const Query = `INSERT INTO penalties
        (pn_booking_id, pn_type, pn_amount, pn_notes, pn_added_by)
        VALUES (?,?,?,?,?)`;
    return await query(Query, [booking_id, type || 'other', amount, notes || null, added_by]);
};

module.exports.getPenaltyById = async (pn_id) => {
    const Query = `SELECT * FROM penalties WHERE pn_id = ?`;
    const data = await query(Query, [pn_id]);
    return Array.isArray(data) ? data[0] : data;
};

module.exports.deletePenalty = async (pn_id) => {
    const Query = `DELETE FROM penalties WHERE pn_id = ?`;
    return await query(Query, [pn_id]);
};

/**
 * All penalties on a booking, newest first.
 */
module.exports.listForBooking = async (booking_id) => {
    const Query = `
        SELECT pn.*, u.u_name AS added_by_name
        FROM penalties pn
        LEFT JOIN user u ON u.u_id = pn.pn_added_by
        WHERE pn.pn_booking_id = ?
        ORDER BY pn.pn_added_at DESC
    `;
    return await query(Query, [booking_id]);
};

/**
 * Total penalties for a booking.
 */
module.exports.getTotalForBooking = async (booking_id) => {
    const Query = `SELECT COALESCE(SUM(pn_amount),0) AS total FROM penalties WHERE pn_booking_id = ?`;
    const data = await query(Query, [booking_id]);
    return Number(data[0]?.total || 0);
};

/**
 * List penalties across bookings, with optional date / franchise filters.
 */
module.exports.listPenalties = async ({
    from_date = null, to_date = null, franchise_id = null, booking_id = null,
} = {}) => {
    const conditions = [];
    const params = [];

    if (from_date) {
        conditions.push('DATE(pn.pn_added_at) >= ?');
        params.push(from_date);
    }
    if (to_date) {
        conditions.push('DATE(pn.pn_added_at) <= ?');
        params.push(to_date);
    }
    if (franchise_id) {
        conditions.push('b.b_franchise_id = ?');
        params.push(franchise_id);
    }
    if (booking_id) {
        conditions.push('pn.pn_booking_id = ?');
        params.push(booking_id);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const Query = `
        SELECT
            pn.pn_id,
            pn.pn_booking_id,
            pn.pn_type,
            pn.pn_amount,
            pn.pn_notes,
            pn.pn_added_at,
            b.b_id AS booking_id,
            b.b_pickup_location,
            b.b_franchise_id,
            fr.fr_name AS franchise_name,
            u_customer.u_name AS customer_name,
            u_admin.u_name AS added_by_name
        FROM penalties pn
        JOIN bookings b ON b.b_id = pn.pn_booking_id
        LEFT JOIN user u_customer ON u_customer.u_id = b.b_u_id
        LEFT JOIN user u_admin ON u_admin.u_id = pn.pn_added_by
        LEFT JOIN franchises fr ON fr.fr_id = b.b_franchise_id
        ${where}
        ORDER BY pn.pn_added_at DESC
    `;
    return await query(Query, params);
};
