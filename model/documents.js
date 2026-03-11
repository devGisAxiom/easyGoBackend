var db = require('../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

// ✅ Save Aadhar Path
module.exports.AddadharfrontQuery = async (adharPath, u_id) => {
    var Query = `UPDATE user SET u_adharfront = ? WHERE u_id = ?`;
    var data = await query(Query, [adharPath, u_id]);
    return data;
}
module.exports.AddadharBackQuery = async (adharPath, u_id) => {
    var Query = `UPDATE user SET u_addarback = ? WHERE u_id = ?`;
    var data = await query(Query, [adharPath, u_id]);
    return data;
}

// ✅ Save License Path
module.exports.AddlicenseFrontQuery = async (licensePath, u_id) => {
    var Query = `UPDATE user SET u_licensefront = ? WHERE u_id = ?`;
    var data = await query(Query, [licensePath, u_id]);
    return data;
}

module.exports.AddlicenseBackQuery = async (licensePath, u_id) => {
    var Query = `UPDATE user SET u_licenseback = ? WHERE u_id = ?`;
    var data = await query(Query, [licensePath, u_id]);
    return data;
}