var db = require('../config/db');
var util = require('util');
const query = util.promisify(db.query).bind(db);

// Insert a new deposit return record
module.exports.addDepositReturn = async (booking_id, gpay_ref, screenshot_url, amount, returned_by, notes) => {
    var Query = `INSERT INTO deposit_returns(dr_booking_id, dr_gpay_ref_number, dr_gpay_screenshot_url, dr_amount, dr_returned_by, dr_notes)
                  VALUES (?, ?, ?, ?, ?, ?)`;
    var data = await query(Query, [booking_id, gpay_ref, screenshot_url || null, amount, returned_by, notes || null]);
    return data;
};

// Get deposit return record for a single booking
module.exports.getDepositReturnByBooking = async (booking_id) => {
    var Query = `SELECT dr.*, u.u_name AS returned_by_name
                  FROM deposit_returns dr
                  LEFT JOIN user u ON u.u_id = dr.dr_returned_by
                  WHERE dr.dr_booking_id = ?
                  ORDER BY dr.dr_returned_at DESC
                  LIMIT 1`;
    var data = await query(Query, [booking_id]);
    return data;
};

// Check if a booking already has a deposit return (boolean)
module.exports.hasDepositReturn = async (booking_id) => {
    var Query = `SELECT COUNT(*) AS cnt FROM deposit_returns WHERE dr_booking_id = ?`;
    var data = await query(Query, [booking_id]);
    return data[0]?.cnt > 0;
};

// List deposit returns, with optional date filter
module.exports.listDepositReturns = async (from_date, to_date, franchise_id = null) => {
    var conditions = [];
    var params = [];
    if (from_date) {
        conditions.push('DATE(dr.dr_returned_at) >= ?');
        params.push(from_date);
    }
    if (to_date) {
        conditions.push('DATE(dr.dr_returned_at) <= ?');
        params.push(to_date);
    }
    if (franchise_id) {
        conditions.push('b.b_franchise_id = ?');
        params.push(franchise_id);
    }
    var where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    var Query = `
        SELECT
            dr.dr_id,
            dr.dr_booking_id,
            b.b_id AS booking_id,
            b.b_rent_amount,
            b.b_total_amount,
            b.b_franchise_id,
            fr.fr_name AS franchise_name,
            dr.dr_gpay_ref_number,
            dr.dr_amount AS deposit_returned_amount,
            dr.dr_returned_at,
            dr.dr_notes,
            dr.dr_gpay_screenshot_url,
            u_customer.u_id AS customer_id,
            u_customer.u_name AS customer_name,
            u_customer.u_mobile AS customer_mobile,
            bk.b_name AS bike_name,
            bk.vehicle_number,
            u_admin.u_name AS returned_by_name
        FROM deposit_returns dr
        JOIN bookings b ON b.b_id = dr.dr_booking_id
        LEFT JOIN user u_customer ON u_customer.u_id = b.b_u_id
        LEFT JOIN bikes bk ON bk.b_id = b.b_bk_id
        LEFT JOIN user u_admin ON u_admin.u_id = dr.dr_returned_by
        LEFT JOIN franchises fr ON fr.fr_id = b.b_franchise_id
        ${where}
        ORDER BY dr.dr_returned_at DESC
    `;
    var data = await query(Query, params);
    return data;
};

// Build a WHERE clause for joining with payment reports (used by paymentReport.js)
module.exports.buildJoinClause = () => {
    return `LEFT JOIN deposit_returns dr ON dr.dr_booking_id = b.b_id`;
};