var db = require('../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.CheckMail = async (email) => {
    var Query = `select * from user where u_email =?`;
    var data = query(Query, [email]);
    return data;
}

module.exports.CheckUserWithId = async (user_id) => {
    var Query = `select * from user where u_id =?`;
    var data = query(Query, [user_id]);
    return data;
}

module.exports.CheckJwtToken = async (token, user_id) => {
    let Query = `select * from user_token where ut_token =? and ut_u_id =?`
    return await query(Query, [token, user_id])
}

module.exports.AddUser = async (name, email, hashedpasssword, mobile, date, token, tokenExpiry) => {
    var Query = `insert into user(u_name,u_email,u_password,u_mobile,u_joindate,u_token,u_token_expiry)values(?,?,?,?,?,?,?)`;
    var data = await query(Query, [name, email, hashedpasssword, mobile, date, token, tokenExpiry])
    return data;
}

module.exports.checkmobile = async (mobile) => {
    var Query = `select * from user where u_mobile=? `;
    var data = query(Query, [mobile]);
    return data;
}

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

module.exports.updateOtpStatus = async (email) => {
    var Query = `update user set u_token=? where u_email=?`;
    var data = await query(Query, [null, email])
    return data;
}

module.exports.ValidateResetToken = async (email, otp) => {
    var Query = `select * FROM user WHERE u_email=? AND u_token=? `;
    var data = await query(Query, [email, otp]);
    return data;
};

module.exports.updateemail = async (email) => {
    var Query = `UPDATE user SET u_email_verify = 'true',u_status = 'active' WHERE u_email = ?`;
    var data = await query(Query, [email]);

    return data;
};

module.exports.deleteUserEmailQuery = async (email) => {
    var Query = `DELETE FROM user WHERE u_email = ?`;
    var data = await query(Query, [email]);
    return data;
};

module.exports.deleteUserMobileQuery = async (mobile) => {
    var Query = `DELETE FROM user WHERE u_mobile = ?`;
    var data = await query(Query, [mobile]);
    return data;
};