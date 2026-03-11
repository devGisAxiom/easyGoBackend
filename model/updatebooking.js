var db = require('../config/db');
var util = require('util');
const query = util.promisify(db.query).bind(db);

module.exports.updateBookingStatus = async (updateString, b_id) => {
  var Query = `UPDATE bookings SET ${updateString} WHERE b_id = ?`;
  var data = await query(Query, [b_id]);
  return data;
};

module.exports.findBooking = async (b_id) => {
  var Query = `SELECT * FROM bookings WHERE b_id = ?`;
  return await query(Query, [b_id]);
};
module.exports.GetAdmin = async () => {
  var Query = `SELECT * FROM user where u_role='admin'`;
  var data = await query(Query);
  return data;
}
