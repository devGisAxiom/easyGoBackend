var db = require('../config/db');
var util = require('util');
const query = util.promisify(db.query).bind(db);

/**
 * Vehicle swaps.
 *
 * Business rule: the FIRST swap on a booking is free, every swap from the
 * second onwards costs Rs.100.
 */

const SWAP_CHARGE = 100;

module.exports.SWAP_CHARGE = SWAP_CHARGE;

/**
 * How many swaps have already been executed for a booking.
 * Only 'approved' swaps count — a rejected request must not consume the
 * free swap.
 */
module.exports.getApprovedSwapCount = async (booking_id) => {
    const Query = `SELECT COUNT(*) AS cnt FROM swaps WHERE sw_booking_id = ? AND sw_status = 'approved'`;
    const data = await query(Query, [booking_id]);
    return Number(data[0]?.cnt || 0);
};

/**
 * The next swap number for a booking (1-based).
 */
module.exports.getNextSwapNumber = async (booking_id) => {
    const count = await module.exports.getApprovedSwapCount(booking_id);
    return count + 1;
};

/**
 * Charge for the next swap: free for the first, Rs.100 afterwards.
 */
module.exports.getSwapCharge = async (booking_id) => {
    const swapNumber = await module.exports.getNextSwapNumber(booking_id);
    return {
        swap_number: swapNumber,
        is_free: swapNumber <= 1,
        charge: swapNumber <= 1 ? 0 : SWAP_CHARGE,
    };
};

module.exports.createSwap = async (fields) => {
    const {
        booking_id, swap_number, is_free, charge,
        old_bk_id, new_bk_id, reason, requested_by, approved_by,
    } = fields;

    const Query = `INSERT INTO swaps
        (sw_booking_id, sw_swap_number, sw_is_free, sw_charge,
         sw_old_bk_id, sw_new_bk_id, sw_reason, sw_requested_by, sw_approved_by, sw_status)
        VALUES (?,?,?,?,?,?,?,?,?,'approved')`;
    return await query(Query, [
        booking_id, swap_number, is_free ? 1 : 0, charge,
        old_bk_id || null, new_bk_id || null, reason || null,
        requested_by || null, approved_by || null,
    ]);
};

module.exports.listForBooking = async (booking_id) => {
    const Query = `
        SELECT sw.*,
               oldbk.b_name AS old_bike_name, oldbk.vehicle_number AS old_vehicle_number,
               newbk.b_name AS new_bike_name, newbk.vehicle_number AS new_vehicle_number
        FROM swaps sw
        LEFT JOIN bikes oldbk ON oldbk.b_id = sw.sw_old_bk_id
        LEFT JOIN bikes newbk ON newbk.b_id = sw.sw_new_bk_id
        WHERE sw.sw_booking_id = ?
        ORDER BY sw.sw_swap_number ASC
    `;
    return await query(Query, [booking_id]);
};

/**
 * All swaps, with optional date / franchise filters.
 */
module.exports.listSwaps = async ({
    from_date = null, to_date = null, franchise_id = null, booking_id = null,
} = {}) => {
    const conditions = [];
    const params = [];

    if (from_date) {
        conditions.push('DATE(sw.sw_swap_at) >= ?');
        params.push(from_date);
    }
    if (to_date) {
        conditions.push('DATE(sw.sw_swap_at) <= ?');
        params.push(to_date);
    }
    if (franchise_id) {
        conditions.push('b.b_franchise_id = ?');
        params.push(franchise_id);
    }
    if (booking_id) {
        conditions.push('sw.sw_booking_id = ?');
        params.push(booking_id);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const Query = `
        SELECT
            sw.sw_id,
            sw.sw_booking_id,
            sw.sw_swap_number,
            sw.sw_is_free,
            sw.sw_charge,
            sw.sw_reason,
            sw.sw_swap_at,
            sw.sw_status,
            b.b_id AS booking_id,
            b.b_status AS booking_status,
            b.b_pickup_location,
            b.b_franchise_id,
            fr.fr_name AS franchise_name,
            u_customer.u_name AS customer_name,
            u_customer.u_mobile AS customer_mobile,
            oldbk.b_name AS old_bike_name, oldbk.vehicle_number AS old_vehicle_number,
            newbk.b_name AS new_bike_name, newbk.vehicle_number AS new_vehicle_number
        FROM swaps sw
        JOIN bookings b ON b.b_id = sw.sw_booking_id
        LEFT JOIN user u_customer ON u_customer.u_id = b.b_u_id
        LEFT JOIN bikes oldbk ON oldbk.b_id = sw.sw_old_bk_id
        LEFT JOIN bikes newbk ON newbk.b_id = sw.sw_new_bk_id
        LEFT JOIN franchises fr ON fr.fr_id = b.b_franchise_id
        ${where}
        ORDER BY sw.sw_swap_at DESC
    `;
    return await query(Query, params);
};

// ─── Swap requests (customer raises, admin resolves) ────────────────────────

module.exports.createSwapRequest = async (fields) => {
    const { booking_id, reason, requested_by } = fields;
    const Query = `INSERT INTO swap_requests
        (sr_booking_id, sr_reason, sr_status, sr_requested_by)
        VALUES (?,?,'pending',?)`;
    return await query(Query, [booking_id, reason || null, requested_by]);
};

module.exports.getSwapRequestById = async (sr_id) => {
    const Query = `SELECT * FROM swap_requests WHERE sr_id = ?`;
    const data = await query(Query, [sr_id]);
    return Array.isArray(data) ? data[0] : data;
};

module.exports.hasPendingSwapRequest = async (booking_id) => {
    const Query = `SELECT COUNT(*) AS cnt FROM swap_requests WHERE sr_booking_id = ? AND sr_status = 'pending'`;
    const data = await query(Query, [booking_id]);
    return data[0]?.cnt > 0;
};

module.exports.resolveSwapRequest = async (sr_id, status, resolved_by, remarks) => {
    const Query = `UPDATE swap_requests
                   SET sr_status = ?, sr_resolved_at = NOW(), sr_resolved_by = ?, sr_remarks = ?
                   WHERE sr_id = ?`;
    return await query(Query, [status, resolved_by || null, remarks || null, sr_id]);
};

module.exports.listSwapRequests = async ({
    status = null, franchise_id = null,
} = {}) => {
    const conditions = [];
    const params = [];

    if (status) {
        conditions.push('sr.sr_status = ?');
        params.push(status);
    }
    if (franchise_id) {
        conditions.push('b.b_franchise_id = ?');
        params.push(franchise_id);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const Query = `
        SELECT
            sr.sr_id,
            sr.sr_booking_id,
            sr.sr_reason,
            sr.sr_status,
            sr.sr_created_at,
            sr.sr_resolved_at,
            sr.sr_remarks,
            b.b_id AS booking_id,
            b.b_status AS booking_status,
            b.b_pickup_location,
            b.b_drop_date,
            b.b_drop_time,
            b.b_bk_id AS current_bike_id,
            b.b_franchise_id,
            fr.fr_name AS franchise_name,
            u_customer.u_name AS customer_name,
            u_customer.u_mobile AS customer_mobile,
            bk.b_name AS current_bike_name,
            bk.vehicle_number AS current_vehicle_number,
            (SELECT COUNT(*) FROM swaps sw
                WHERE sw.sw_booking_id = b.b_id AND sw.sw_status = 'approved') AS swaps_done
        FROM swap_requests sr
        JOIN bookings b ON b.b_id = sr.sr_booking_id
        LEFT JOIN user u_customer ON u_customer.u_id = b.b_u_id
        LEFT JOIN bikes bk ON bk.b_id = b.b_bk_id
        LEFT JOIN franchises fr ON fr.fr_id = b.b_franchise_id
        ${where}
        ORDER BY
            CASE WHEN sr.sr_status = 'pending' THEN 0 ELSE 1 END,
            sr.sr_created_at DESC
    `;
    return await query(Query, params);
};

/**
 * Total swap charges collected (fees), for reporting.
 */
module.exports.getTotalCharges = async (booking_id) => {
    const Query = `SELECT COALESCE(SUM(sw_charge),0) AS total FROM swaps WHERE sw_booking_id = ? AND sw_status = 'approved'`;
    const data = await query(Query, [booking_id]);
    return Number(data[0]?.total || 0);
};
