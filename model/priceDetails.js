var db = require('../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.AddPriceDetails = async (rent_time, duration_text, rent, gst, deposit, total) => {
    var Query = `INSERT INTO rent_details(rent_duration,rent_duration_text,rent_amount,rent_gst,rent_deposit,rent_total) VALUES (?, ?, ?, ? ,?,?)`;
    var data = await query(Query, [rent_time, duration_text, rent, gst, deposit, total]);
    return data;
}

module.exports.ListPriceDetails = async () => {
    var Query = `SELECT * FROM rent_details`;
    var data = await query(Query);
    return data;
}

module.exports.checkPriceDetails = async (rent_id) => {
    var Query = `SELECT * FROM rent_details WHERE rent_id = ?`;
    var data = await query(Query, [rent_id]);
    return data;
}

module.exports.updatedPriceDetails = async (updateQuery, rent_id) => {
    var Query = `UPDATE rent_details ${updateQuery} WHERE rent_id = ?`;
    var data = await query(Query, [rent_id]);
    return data;
}

module.exports.deletepriceDetails = async (rent_id) => {
    var Query = `DELETE FROM rent_details WHERE rent_id = ?`;
    var data = await query(Query, [rent_id]);
    return data;
}
