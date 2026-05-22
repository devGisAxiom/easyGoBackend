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
            b.b_status,
            u.u_name,
            u.u_email,
            u.u_mobile,
            u.u_address,
            u.u_state,
            u.u_district,
            rd.rent_duration_text,
            rd.rent_deposit,
            bk.b_name  AS bike_name,
            bk.vehicle_number
        FROM bookings b
        LEFT JOIN user        u  ON b.b_u_id    = u.u_id
        LEFT JOIN rent_details rd ON b.b_price_id = rd.rent_id
        LEFT JOIN bikes        bk ON b.b_bk_id   = bk.b_id
        ${condition}
        ORDER BY b.booking_date DESC
    `;
    const data = await query(Query);
    return data;
};
