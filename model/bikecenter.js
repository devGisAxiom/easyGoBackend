var db = require('../config/db')
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.AddBikeCenterQuery = async (location, district, latitude, longitude) => {
    var Query = `INSERT INTO location_center (l_location, l_district,l_latitude, l_longitude) VALUES (?,?,?,?)`;
    var data = await query(Query, [location, district, latitude, longitude]);
    return data;
}
module.exports.listcenterQuery = async (condition) => {
    var Query = `select * from location_center ${condition}`;
    var data = await query(Query, [condition]);
    return data;
}
module.exports.checkcenterQuery = async (l_id) => {
    var Query = `select * from  location_center where l_id=?`;
    var data = await query(Query, [l_id]);
    return data;
}
module.exports.removecenterQuery = async (l_id) => {
    var Query = `delete from location_center where l_id=?`;
    var data = await query(Query, [l_id])
    return data;
}
module.exports.updatecenterQuery = async (l_id, location, district) => {
    var Query = `UPDATE location_center
                 SET l_location	 = ?, l_district = ? 
                 WHERE l_id = ?`;
    var data = await query(Query, [location, district, l_id]);
    return data;
}
