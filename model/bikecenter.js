var db = require('../config/db')
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.AddBikeCenterQuery = async (location, district, latitude, longitude, franchise_id = null) => {
    var Query = `INSERT INTO location_center (l_location, l_district,l_latitude, l_longitude, l_franchise_id) VALUES (?,?,?,?,?)`;
    var data = await query(Query, [location, district, latitude, longitude, franchise_id]);
    return data;
}
module.exports.listcenterQuery = async (condition, params) => {
    var Query = `SELECT lc.*, fr.fr_name AS franchise_name
                 FROM location_center lc
                 LEFT JOIN franchises fr ON fr.fr_id = lc.l_franchise_id
                 ${condition}`;
    var data = params && params.length ? await query(Query, params) : await query(Query);
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
module.exports.updatecenterQuery = async (l_id, location, district, franchise_id) => {
    var Query = `UPDATE location_center
                 SET l_location = ?, l_district = ?,
                     l_franchise_id = COALESCE(?, l_franchise_id)
                 WHERE l_id = ?`;
    var data = await query(Query, [location, district, franchise_id || null, l_id]);
    return data;
}
