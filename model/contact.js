var db = require('../config/db');
var util = require('util');
const query = util.promisify(db.query).bind(db);

module.exports.addcontactQuery = async (name, email, message, phonenumber, issutype) => {
    var Query = `INSERT INTO ContactUs (c_name, c_email, c_message,c_phonenumber,c_issuetype) VALUES (?,?,?,?,?)`;
    var data = query(Query, [name, email, message, phonenumber, issutype]);
    return data;
};

module.exports.listcontactQuery = async () => {
    var Query = `select * from ContactUs ;`
    var data = await query(Query);
    return data;
}
module.exports.checkcontactQuery = async (c_id) => {
    var Query = `select * from ContactUs where c_id=?`;
    var data = await query(Query, [c_id]);
    return data;
}
module.exports.removecontactQuery = async (c_id) => {
    var Query = `delete from ContactUs where c_id=?`
    var data = await query(Query, [c_id]);
    return data;
}
module.exports.AddcontactimageQuery = async (c_id, imagepath) => {
    var Query = `update  ContactUs SET c_image =? WHERE c_id =?`;
    var data = await query(Query, [imagepath, c_id])
    return data;
}
