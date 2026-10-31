var db = require("../config/db");
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.CheckUser = async (user_id) => {
  var Query = `select * from user where u_id=? `;
  var data = query(Query, [user_id]);
  return data;
};

module.exports.GetPriceDetails = async (price_id) => {
  var Query = `select * from rent_details where rent_id=? `;
  var data = query(Query, [price_id]);
  return data;
};

module.exports.Addbooking = async (
  u_id,
  rent_amount,
  fine_amount,
  total_amount,
  price_id,
  pickup_location,
  pickup_date,
  pickup_time,
  drop_location,
  drop_date,
  drop_time,
  booking_date,
  b_bk_id = null,
  b_bike_name = null,
  b_franchise_id = null,
  b_source = 'app',
  b_selfie = '',
) => {
  // `b_selfie` is written explicitly rather than relying on the column
  // default, so the insert behaves the same whether or not the column is
  // nullable in a given environment.
  var Query = `insert into bookings(b_u_id,b_rent_amount,b_fine_amount,b_total_amount,b_price_id, b_pickup_location, b_pickup_date, b_picup_time, b_drop_location, b_drop_date, b_drop_time,booking_date, b_bk_id, b_bike_name, b_franchise_id, b_source, b_selfie)values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
  var data = query(Query, [
    u_id,
    rent_amount,
    fine_amount,
    total_amount,
    price_id,
    pickup_location,
    pickup_date,
    pickup_time,
    drop_location,
    drop_date,
    drop_time,
    booking_date,
    b_bk_id,
    b_bike_name,
    b_franchise_id,
    b_source,
    b_selfie,
  ]);
  return data;
};

module.exports.AddPaymentHistory = async (
  user_id,
  booking_id,
  rent_amount,
  fine_amount,
  total_amount,
  price_id,
  booking_date,
  ph_bike_id = 0,
) => {
  // ph_bike_id is written explicitly (0 = not yet assigned) instead of
  // relying on the column default.
  var Query = `insert into paymentHistory(ph_user_id,ph_booking_id,ph_bike_id,ph_rent_amount,ph_fine_amount,ph_total_amount,ph_price_id,ph_booking_date)values(?,?,?,?,?,?,?,?);`;
  var data = query(Query, [
    user_id,
    booking_id,
    ph_bike_id,
    rent_amount,
    fine_amount,
    total_amount,
    price_id,
    booking_date,
  ]);
  return data;
};

module.exports.listbookingQuery = async (condition, params) => {
  var Query = `SELECT b.*, u.u_id,u_name,u.u_email,u.u_mobile,u.u_address,u.u_state,u.u_district,u.u_pincode,u.u_joindate,u.u_profile_pic,u.u_adharfront,u.u_addarback,u.u_licensefront,u.u_licenseback,u.u_dob,u.u_role,
       dr.dr_id AS deposit_return_id,
       dr.dr_gpay_ref_number AS deposit_gpay_ref,
       dr.dr_amount AS deposit_returned_amount,
       dr.dr_returned_at AS deposit_returned_at,
       fr.fr_name AS franchise_name
   FROM bookings b
   LEFT JOIN user u ON b.b_u_id = u.u_id
   LEFT JOIN deposit_returns dr ON dr.dr_booking_id = b.b_id
   LEFT JOIN franchises fr ON fr.fr_id = b.b_franchise_id ${condition}
   ORDER BY b.booking_date DESC `;
  // mysql library: when params is undefined/null, query() with one arg works.
  // When params is an array, we pass them through for ?-substitution.
  var data =
    params && params.length ? await query(Query, params) : await query(Query);
  return data;
};

module.exports.GetAdmin = async () => {
  var Query = `SELECT * FROM user where u_role='admin'`;
  var data = await query(Query);
  return data;
};

module.exports.listNotificationQuery = async (condition) => {
  var Query = `SELECT * FROM notifications ${condition}`;
  var data = await query(Query);
  return data;
};

module.exports.getOneBikeImage = async (bike_id) => {
  var Query = `SELECT * FROM bike_images WHERE bike_id= ? LIMIT 1`;
  var data = await query(Query, [bike_id]);
  return data;
};

module.exports.AddBookingImageQuery = async (selfie_path, booking_id) => {
  var Query = `UPDATE bookings SET b_selfie = ? WHERE b_id = ?`;
  var data = await query(Query, [selfie_path, booking_id]);
  return data;
};

module.exports.extendbookingQuery = async (
  b_id,
  new_drop_date,
  new_drop_time,
  new_drop_location,
  extend_reason,
) => {
  var Query = `update bookings SET b_drop_date =?,b_drop_time=?,b_drop_location=?,extend_reason=?,b_status='extendedreq' WHERE b_id=?`;
  var data = await query(Query, [
    new_drop_date,
    new_drop_time,
    new_drop_location,
    extend_reason,
    b_id,
  ]);
  return data;
};

module.exports.GetAdmin = async () => {
  var Query = `SELECT * FROM user WHERE u_role = 'admin'`;
  var data = await query(Query);
  return data;
};

module.exports.getUserIdByBooking = async (b_id) => {
  var Query = `SELECT * FROM bookings WHERE b_id = ?`;
  var data = query(Query, [b_id]);
  return data;
};

module.exports.getBikeById = async (bk_id) => {
  var Query = `SELECT b_id, b_name, vehicle_number FROM bikes WHERE b_id = ?`;
  var data = query(Query, [bk_id]);
  return Array.isArray(data) ? data[0] : data;
};

module.exports.getBookingFullDetails = async (b_id) => {
  var Query = `
    SELECT b.*, u.u_name, u.u_mobile, u.u_email,
           bk.b_name AS bike_name, bk.vehicle_number,
           rd.rent_duration_text, rd.rent_amount, rd.rent_gst,
           rd.rent_deposit, rd.rent_total
    FROM bookings b
    LEFT JOIN user u ON b.b_u_id = u.u_id
    LEFT JOIN bikes bk ON b.b_bk_id = bk.b_id
    LEFT JOIN rent_details rd ON b.b_price_id = rd.rent_id
    WHERE b.b_id = ?
  `;
  var data = query(Query, [b_id]);
  return Array.isArray(data) ? data[0] : data;
};

/**
 * Snapshot the final-bill calculation onto the booking so later edits to
 * penalties or manual payments never rewrite historical figures.
 */
module.exports.saveFinalBill = async (b_id, snapshot) => {
  var Query = `UPDATE bookings SET b_final_bill = ? WHERE b_id = ?`;
  return await query(Query, [JSON.stringify(snapshot), b_id]);
};

module.exports.getFinalBill = async (b_id) => {
  var Query = `SELECT b_final_bill FROM bookings WHERE b_id = ?`;
  var data = await query(Query, [b_id]);
  return data[0]?.b_final_bill ?? null;
};

