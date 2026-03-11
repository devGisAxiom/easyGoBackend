var db = require("../config/db");
var util = require("util");
const query = util.promisify(db.query).bind(db);


module.exports.getBooking = async (b_id) => {
  var Query = `SELECT b.*,u.* FROM bookings b left join user u on b.b_u_id = u.u_id where b.b_id=?`;
  var data = await query(Query, [b_id]);
  return data;
}

module.exports.getUser = async (u_id) => {
  var Query = `SELECT * FROM user where u_id=?`;
  var data = await query(Query, [u_id]);
  return data;
}
