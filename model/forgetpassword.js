const { log } = require("console");
var db = require("../config/db")
var util = require("util")
const query = util.promisify(db.query).bind(db);


module.exports.CheckEmailQuery = async (email, role) => {
    var Query = `select * from user where u_email=? and u_role =?`;
    var data = await query(Query, [email, role]);
    return data;

};
module.exports.updatepassword = async (password, email) => {
    var Query = `update user set u_password=? where u_email=?`;
    var data = await query(Query, [password, email]);
    return data;
};

module.exports.StoreResetToken = async (token, expirationDate, u_id) => {
    var Query = `update user SET u_token = ?, u_token_expiry = ? WHERE u_id = ?`;
    var data = await query(Query, [token, expirationDate, u_id]);
    return data;
};

module.exports.ValidateResetToken = async (email, otp) => {
    var Query = `select * FROM user WHERE u_email=? AND u_token=? `;
    var data = await query(Query, [email, otp]);
    return data;
};

module.exports.updateOtpStatus = async (email) => {
    var Query = `update user set u_token = ? where u_email=?`;
    var data = await query(Query, [null, email])
    return data;
}
