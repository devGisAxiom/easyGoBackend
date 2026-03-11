var db = require("../config/db");
var util=require("util")
const query =util.promisify(db.query).bind(db);




module.exports.addReviewQuery = (bike_id, rating, review,date,userid) => {
    var Query = `insert into   bike_reviews(br_bike_id, br_rating, br_review,date,br_used_id)values(?,?,?,?,?)`;
    var data = query(Query, [bike_id, rating, review,date,userid]);
    return data;



}

module.exports.getAllRatingsQuery = (bike_id) => {
    var Query = `SELECT br_rating FROM bike_reviews WHERE br_bike_id = ?`;
    var data = query(Query, [bike_id]);
    return data;

}
module.exports.updateBikeRatingQuery = (avgRating, bike_id) => {

    var Query = `UPDATE bike_reviews  SET br_rating = ? WHERE br_id = ?`
    var data = query(Query, [avgRating, bike_id]);
    return data;
}
