var db = require('../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);


module.exports.listUserQuery = async (condition = {}) => {
  const parts = [];
  const params = [];

  parts.push(`u.u_role = 'user'`);

  // Soft-deleted accounts (Apple account deletion) must never show up in
  // listings — their personal data is gone, only the financial rows remain.
  parts.push(`(u.u_status IS NULL OR u.u_status <> 'deleted')`);

  if (condition.u_id) {
    parts.push(`u.u_id = ?`);
    params.push(condition.u_id);
  }

  if (condition.franchise_id) {
    // A franchise-admin sees customers who have booked with their franchise.
    parts.push(`u.u_id IN (SELECT b_u_id FROM bookings WHERE b_franchise_id = ?)`);
    params.push(condition.franchise_id);
  }

  const where = parts.length ? `WHERE ${parts.join(' AND ')}` : '';

  const Query = `
    SELECT u.*, fr.fr_name AS franchise_name
    FROM user u
    LEFT JOIN franchises fr ON fr.fr_id = u.u_franchise_id
    ${where}
    ORDER BY u.u_id DESC
  `;

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
