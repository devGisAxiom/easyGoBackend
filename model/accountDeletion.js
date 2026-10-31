var db = require('../config/db');
var util = require('util');
const query = util.promisify(db.query).bind(db);

/**
 * Account deletion (Apple App Store requirement).
 *
 * The customer asks us to delete their account from inside the app. Apple
 * requires that we actually remove the personal data, but the business is
 * legally required to keep financial records (bookings, payments, deposit
 * refunds). So we:
 *
 *   1. anonymise every personally-identifying field on the `user` row
 *   2. delete the physical ID/profile files from disk
 *   3. revoke all sessions (user_token rows)
 *   4. mark the account `deleted` so it can never authenticate again
 *
 * Booking / payment / deposit rows are deliberately left untouched.
 */

/**
 * Store the one-time password used to confirm the deletion.
 * Re-uses the existing `u_token` + `u_token_expiry` columns.
 */
module.exports.setDeleteOtp = async (u_id, otp, expiry) => {
    const Query = `UPDATE user SET u_token = ?, u_token_expiry = ? WHERE u_id = ?`;
    return await query(Query, [otp, expiry, u_id]);
};

/**
 * Read back the pending deletion OTP.
 */
module.exports.getDeleteOtp = async (u_id) => {
    const Query = `SELECT u_id, u_token, u_token_expiry, u_status FROM user WHERE u_id = ?`;
    const data = await query(Query, [u_id]);
    return Array.isArray(data) ? data[0] : data;
};

/**
 * Paths of the files uploaded for this user, so they can be removed from
 * disk when the account is deleted.
 */
module.exports.getUserDocumentPaths = async (u_id) => {
    const Query = `
        SELECT u_profile_pic, u_adharfront, u_addarback, u_licensefront, u_licenseback
        FROM user WHERE u_id = ?
    `;
    const data = await query(Query, [u_id]);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return [];
    return [
        row.u_profile_pic,
        row.u_adharfront,
        row.u_addarback,
        row.u_licensefront,
        row.u_licenseback,
    ].filter(Boolean);
};

/**
 * Anonymise the user row and revoke every session.
 *
 * `u_email` is kept unique by rewriting it to a per-user placeholder rather
 * than NULL — several code paths still expect a non-null email.
 */
module.exports.anonymizeUser = async (u_id) => {
    const Query = `
        UPDATE user SET
            u_name = 'Deleted User',
            u_email = CONCAT('deleted_', u_id, '@removed.in'),
            u_mobile = NULL,
            u_address = NULL,
            u_state = NULL,
            u_district = NULL,
            u_pincode = NULL,
            u_dob = NULL,
            u_profile_pic = NULL,
            u_adharfront = NULL,
            u_addarback = NULL,
            u_licensefront = NULL,
            u_licenseback = NULL,
            u_token = NULL,
            u_token_expiry = NULL,
            u_email_verify = 'deleted',
            u_status = 'deleted'
        WHERE u_id = ?
    `;
    return await query(Query, [u_id]);
};

/**
 * Revoke all sessions for this user.
 */
module.exports.deleteUserTokens = async (u_id) => {
    const Query = `DELETE FROM user_token WHERE ut_u_id = ?`;
    return await query(Query, [u_id]);
};

/**
 * How many bookings / payments reference this user. Returned to the app so
 * the confirmation screen can tell the customer what will and will not be
 * removed.
 */
module.exports.getDeletionImpact = async (u_id) => {
    const Query = `
        SELECT
            (SELECT COUNT(*) FROM bookings       WHERE b_u_id = ?) AS bookings,
            (SELECT COUNT(*) FROM paymentHistory WHERE ph_user_id = ?) AS payments,
            (SELECT COUNT(*) FROM deposit_returns dr
                JOIN bookings b ON b.b_id = dr.dr_booking_id
                WHERE b.b_u_id = ?) AS deposit_returns
    `;
    const data = await query(Query, [u_id, u_id, u_id]);
    return data[0] || { bookings: 0, payments: 0, deposit_returns: 0 };
};
