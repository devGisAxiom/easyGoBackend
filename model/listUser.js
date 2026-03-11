var db = require('../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);


module.exports.listUserQuery = async (condition) => {
  let Query = `SELECT * FROM user WHERE u_role = "user"`;
  let params = [];

  if (condition.u_id) {
    Query += ` AND u_id = ?`;
    params.push(condition.u_id);
  }

  const data = await query(Query, params);
  return data;
};


module.exports.listAdminQuery = async () => {
  var Query = `SELECT * FROM  user where u_role = "admin" `;
  var data = await query(Query);
  return data;
}
module.exports.deleteUserQuery = async (user_id) => {
  var Query = `DELETE FROM user WHERE u_id = ?`;
  var data = await query(Query, [user_id]);
  return data;
};


module.exports.listAdminContactQuery = async () => {
  var Query = `SELECT u_name,
u_email,
u_mobile,
u_address,
u_state,
u_district,
u_pincode
 FROM  user where u_role = 'admin' `;
  var data = await query(Query);
  return data;
}