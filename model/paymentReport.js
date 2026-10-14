var db = require('../config/db');
var util = require('util');
const query = util.promisify(db.query).bind(db);

module.exports.getPaymentReport = async (condition) => {
    const Query = `
        SELECT
            b.b_id,
            b.booking_date,
            b.b_pickup_date,
            b.b_picup_time,
            b.b_drop_date,
            b.b_drop_time,
            b.b_pickup_location,
            b.b_drop_location,
            b.b_rent_amount,
            b.b_fine_amount,
            b.b_total_amount,
            b.b_payment_status,
            b.b_payment_mode AS payment_mode,
            b.b_status,
            u.u_name,
            u.u_email,
            u.u_mobile,
            u.u_address,
            u.u_state,
            u.u_district,
            u.u_pincode,
            rd.rent_duration_text,
            rd.rent_gst,
            rd.rent_deposit,
            bk.b_name  AS bike_name,
            bk.vehicle_number,
            dr.dr_id AS deposit_return_id,
            dr.dr_gpay_ref_number AS deposit_gpay_ref,
            dr.dr_amount AS deposit_returned_amount,
            dr.dr_returned_at AS deposit_returned_at,
            u_admin.u_name AS deposit_returned_by
        FROM bookings b
        LEFT JOIN user        u  ON b.b_u_id    = u.u_id
        LEFT JOIN rent_details rd ON b.b_price_id = rd.rent_id
        LEFT JOIN bikes        bk ON b.b_bk_id   = bk.b_id
        LEFT JOIN deposit_returns dr ON dr.dr_booking_id = b.b_id
        LEFT JOIN user u_admin ON u_admin.u_id = dr.dr_returned_by
        ${condition}
        ORDER BY b.booking_date DESC
    `;
    const data = await query(Query);
    return data;
};
