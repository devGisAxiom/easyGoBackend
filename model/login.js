var db = require("../config/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);


module.exports.CheckUser = async (emailorphone_number, role) => {
    // The admin panel posts role='admin' for every admin-side login. Accept
    // the franchise-admin role for that same request — the login response
    // carries the real role (and the franchise) back, so the panel knows
    // which kind of admin has signed in without needing a second form.
    const roles = role === 'admin' ? ['admin', 'franchise_admin'] : [role];
    const placeholders = roles.map(() => '?').join(', ');

    var Query = `SELECT * FROM user
    WHERE (u_email = ? OR u_mobile = ?) AND u_role IN (${placeholders}) and u_status = 'active'`
    var data = await query(Query, [emailorphone_number, emailorphone_number, ...roles])
    return data;
}

module.exports.AddUserJWTToken = async (token, user_id, expires_at) => {
    let Query = `insert into user_token (ut_u_id, ut_token, ut_expires_at) values (?,?,?)`
    return await query(Query, [user_id, token, expires_at])
}

module.exports.CheckJwtToken = async (token, user_id) => {
    let Query = `select * from user_token where ut_token =? and ut_u_id =?`
    return await query(Query, [token, user_id])
}

module.exports.DeleteUserJWTToken = async (token, user_id) => {
    let Query = `delete from user_token where ut_token =? and ut_u_id =?`
    return await query(Query, [token, user_id])
}

module.exports.CleanupExpiredTokens = async () => {
    let Query = `delete from user_token where ut_expires_at is not null and ut_expires_at < NOW()`
    return await query(Query)
}
