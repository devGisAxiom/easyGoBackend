const { log } = require("console");
var db = require("../config/db.js");
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.CheckUserQuery = async (u_id) => {
    var Query = `select * from user where u_id= ?`;
    var data = await query(Query, [u_id]);
    return data;
};

module.exports.CheckMobileQuery = async (mobile, u_id) => {
    var Query = `select * from user where u_mobile= ? and u_id != ?`;
    var data = await query(Query, [mobile, u_id]);
    return data;
};

module.exports.CheckEmailQuery = async (email, u_id) => {
    var Query = `select * from user where u_email= ? and u_id != ?`;
    var data = await query(Query, [email, u_id]);
    return data;
};

module.exports.ChangeUserInfo = async (condition, u_id) => {
    var Query = `update user ${condition} where u_id = ?`;
    console.log("query", Query);

    var data = await query(Query, [u_id]);
    return data;
};

module.exports.Updateimage = async (image, u_id) => {
    var Query = `update user set u_profile_pic= ?  where u_id = ? `;
    var data = await query(Query, [image, u_id]);
    return data;
};
