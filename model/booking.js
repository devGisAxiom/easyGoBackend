var db = require('../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.CheckUser = async (user_id) => {
  var Query = `select * from user where u_id=? `;
  var data = query(Query, [user_id]);
  return data;
}

module.exports.GetPriceDetails = async (price_id) => {
  var Query = `select * from rent_details where rent_id=? `;
  var data = query(Query, [price_id]);
  return data;
}

module.exports.Addbooking = async (u_id, rent_amount, fine_amount, total_amount, price_id, pickup_location, pickup_date, pickup_time, drop_location, drop_date, drop_time, booking_date) => {
  var Query = `insert into bookings(b_u_id,b_rent_amount,b_fine_amount,b_total_amount,b_price_id, b_pickup_location, b_pickup_date, b_picup_time, b_drop_location, b_drop_date, b_drop_time,booking_date)values(?,?,?,?,?,?,?,?,?,?,?,?);`
  var data = query(Query, [u_id, rent_amount, fine_amount, total_amount, price_id, pickup_location, pickup_date, pickup_time, drop_location, drop_date, drop_time, booking_date]);
  return data;
}

module.exports.AddPaymentHistory = async (user_id, booking_id, rent_amount, fine_amount, total_amount, price_id, booking_date) => {
  var Query = `insert into paymentHistory(ph_user_id,ph_booking_id,ph_rent_amount,ph_fine_amount,ph_total_amount,ph_price_id,ph_booking_date)values(?,?,?,?,?,?,?);`
  var data = query(Query, [user_id, booking_id, rent_amount, fine_amount, total_amount, price_id, booking_date]);
  return data;
}

module.exports.listbookingQuery = async (condition) => {
  var Query = `SELECT b.*, u.u_id,u_name,u.u_email,u.u_mobile,u.u_address,u.u_state,u.u_district,u.u_pincode,u.u_joindate,u.u_profile_pic,u.u_adharfront,u.u_addarback,u.u_licensefront,u.u_licenseback,u.u_dob,u.u_role FROM bookings b 
  LEFT JOIN user u ON b.b_u_id = u.u_id ${condition} 
  ORDER BY b.booking_date DESC `;
  var data = await query(Query);
  return data;
}

module.exports.GetAdmin = async () => {
  var Query = `SELECT * FROM user where u_role='admin'`;
  var data = await query(Query);
  return data;
}

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

module.exports.extendbookingQuery = async (b_id, new_drop_date, new_drop_time, new_drop_location, extend_reason) => {
  var Query = `update bookings SET b_drop_date =?,b_drop_time=?,b_drop_location=?,extend_reason=?,b_status='extendedreq' WHERE b_id=?`;
  var data = await query(Query, [new_drop_date, new_drop_time, new_drop_location, extend_reason, b_id]);
  return data;
}

module.exports.GetAdmin = async () => {
  var Query = `SELECT * FROM user WHERE u_role = 'admin'`;
  var data = await query(Query);
  return data;
};

module.exports.getUserIdByBooking = async (b_id) => {
  var Query = `SELECT * FROM bookings WHERE b_id = ?`;
  var data = await query(Query, [b_id]);
  return data;
};
