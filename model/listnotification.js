var db = require('../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);


module.exports.listNotificationQuery = async (condition, params) => {
  var Query = `SELECT * FROM  notifications ${condition}`;
  var data = params && params.length ? await query(Query, params) : await query(Query);
  return data;
}
