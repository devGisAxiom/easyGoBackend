var db = require('../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);


module.exports.listNotificationQuery = async (condition) => {
  var Query = `SELECT * FROM  notifications ${condition}`;
  var data = await query(Query);
  return data;
}