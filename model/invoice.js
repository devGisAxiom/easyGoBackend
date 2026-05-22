var db = require("../config/db");
var util = require("util");
const query = util.promisify(db.query).bind(db);


module.exports.getBooking = async (b_id) => {
  var Query = `SELECT b.*, u.*,
    bk.b_name AS bike_name, bk.vehicle_number,
    rd.rent_amount AS rd_rent_amount, rd.rent_gst AS rd_rent_gst,
    rd.rent_deposit AS rd_rent_deposit, rd.rent_duration_text
    FROM bookings b
    LEFT JOIN user u ON b.b_u_id = u.u_id
    LEFT JOIN bikes bk ON b.b_bk_id = bk.b_id
    LEFT JOIN rent_details rd ON b.b_price_id = rd.rent_id
    WHERE b.b_id=?`;
  var data = await query(Query, [b_id]);
  return data;
}

module.exports.getUser = async (u_id) => {
  var Query = `SELECT * FROM user where u_id=?`;
  var data = await query(Query, [u_id]);
  return data;
}
