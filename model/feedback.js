var db = require('../config/db');
var util = require('util');
const query = util.promisify(db.query).bind(db);

/**
 * Customer feedback — separate from bike_reviews (which only captures star
 * ratings against a specific vehicle).
 */

const FEEDBACK_TYPES = ['app_issue', 'service', 'suggestion', 'complaint', 'other'];

module.exports.FEEDBACK_TYPES = FEEDBACK_TYPES;

module.exports.addFeedback = async (fields) => {
    const { u_id, booking_id, type, message, rating } = fields;
    const Query = `INSERT INTO feedback
        (fb_u_id, fb_booking_id, fb_type, fb_message, fb_rating)
        VALUES (?,?,?,?,?)`;
    return await query(Query, [
        u_id || null, booking_id || null, type || 'suggestion',
        message, rating || null,
    ]);
};

module.exports.getFeedbackById = async (fb_id) => {
    const Query = `SELECT * FROM feedback WHERE fb_id = ?`;
    const data = await query(Query, [fb_id]);
    return Array.isArray(data) ? data[0] : data;
};

module.exports.updateFeedbackStatus = async (fb_id, status) => {
    const Query = `UPDATE feedback SET fb_status = ? WHERE fb_id = ?`;
    return await query(Query, [status, fb_id]);
};

module.exports.deleteFeedback = async (fb_id) => {
    const Query = `DELETE FROM feedback WHERE fb_id = ?`;
    return await query(Query, [fb_id]);
};

/**
 * List feedback with optional status / type filters.
 *
 * `franchise_id` restricts the result to feedback that belongs to that
 * franchise. Feedback is attributed to a franchise through the booking it
 * was left against, so feedback that isn't tied to a booking (fb_booking_id
 * is NULL) is only visible to the head office.
 */
module.exports.listFeedback = async ({
    status = null, type = null, from_date = null, to_date = null,
    franchise_id = null,
} = {}) => {
    const conditions = [];
    const params = [];

    if (status) {
        conditions.push('fb.fb_status = ?');
        params.push(status);
    }
    if (type) {
        conditions.push('fb.fb_type = ?');
        params.push(type);
    }
    if (from_date) {
        conditions.push('DATE(fb.fb_created_at) >= ?');
        params.push(from_date);
    }
    if (to_date) {
        conditions.push('DATE(fb.fb_created_at) <= ?');
        params.push(to_date);
    }
    if (franchise_id) {
        conditions.push('b.b_franchise_id = ?');
        params.push(franchise_id);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const Query = `
        SELECT
            fb.fb_id,
            fb.fb_u_id,
            fb.fb_booking_id,
            fb.fb_type,
            fb.fb_message,
            fb.fb_rating,
            fb.fb_status,
            fb.fb_created_at,
            u.u_name AS customer_name,
            u.u_mobile AS customer_mobile,
            u.u_email AS customer_email,
            b.b_pickup_location,
            b.b_status AS booking_status,
            b.b_franchise_id,
            fr.fr_name AS franchise_name
        FROM feedback fb
        LEFT JOIN user u ON u.u_id = fb.fb_u_id
        LEFT JOIN bookings b ON b.b_id = fb.fb_booking_id
        LEFT JOIN franchises fr ON fr.fr_id = b.b_franchise_id
        ${where}
        ORDER BY fb.fb_created_at DESC
    `;
    return await query(Query, params);
};

/**
 * Feedback submitted by one customer.
 */
module.exports.listForUser = async (u_id) => {
    const Query = `SELECT fb.* FROM feedback fb WHERE fb.fb_u_id = ? ORDER BY fb.fb_created_at DESC`;
    return await query(Query, [u_id]);
};

/**
 * Headline counts for the admin dashboard.
 *
 * Scoped the same way as [listFeedback] — a franchise-admin only counts
 * feedback attached to their own franchise's bookings.
 */
module.exports.getStats = async ({ franchise_id = null } = {}) => {
    const conditions = [];
    const params = [];

    if (franchise_id) {
        conditions.push('b.b_franchise_id = ?');
        params.push(franchise_id);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const Query = `
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN fb.fb_status = 'open' THEN 1 ELSE 0 END) AS open_count,
            SUM(CASE WHEN fb.fb_type = 'complaint' THEN 1 ELSE 0 END) AS complaints,
            AVG(fb.fb_rating) AS avg_rating
        FROM feedback fb
        LEFT JOIN bookings b ON b.b_id = fb.fb_booking_id
        ${where}
    `;
    const data = await query(Query, params);
    return data[0] || { total: 0, open_count: 0, complaints: 0, avg_rating: null };
};
