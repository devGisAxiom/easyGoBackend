const { log } = require('console');
var db = require('../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.addNotification = async (userId, admin_id, userRole, type, message, status, image) => {
    try {

        let notification = await addNotification(userId, admin_id, userRole, type, message, status, image);
        return notification.affectedRows > 0 ? true : false;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

async function addNotification(user_id, admin_id, role, type, message, status, image) {
    var Query = `INSERT INTO notifications(user_id,admin_id,role,type,message,status,n_image) VALUES(?,?,?,?,?,?,?)`;
    var data = await query(Query, [user_id, admin_id, role, type, message, status, image]);
    return data;
}