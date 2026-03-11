var db = require("../config/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);


module.exports.CheckUser = async (emailorphone_number, role) => {
    var Query = `SELECT * FROM user
    WHERE (u_email = ? OR u_mobile = ?) AND u_role = ? and u_status = 'active'`
    var data = await query(Query, [emailorphone_number, emailorphone_number, role])
    return data;
}

module.exports.UpdateUserJWTToken = async (token, user_id) => {
    let Query = `update user_token set ut_token=? where ut_u_id =?`
    return await query(Query, [token, user_id])
}

module.exports.CheckJwtToken = async (user_id) => {
    let Query = `select * from user_token where ut_u_id =?`
    return await query(Query, [user_id])
}

module.exports.AddUserJWTToken = async (token, user_id) => {
    let Query = `insert into user_token (ut_u_id,ut_token) values (?,?)`
    return await query(Query, [user_id, token])
}

module.exports.UpdateUserJWTToken = async (token, user_id) => {
    let Query = `update user_token set ut_token=? where ut_u_id =?`
    return await query(Query, [token, user_id])
}

