var model = require("../model/review");
var util = require("util");
const logger = require('../util/logger');

module.exports.reviewadd = async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);
    let { bike_id, rating, review, userid } = req.body;

    // Validate params
    if (!bike_id || !rating || !review || !userid) {
      return res.send({
        result: false,
        message: "Insufficient parameters"
      });
    }
    console.log(bike_id, rating, review, userid);

    let date = new Date()
    if (rating < 0 || rating > 5) {
      return res.send({
        result: false,
        message: "Rating should be between 0 and 5"
      });
    }

    // Insert review
    console.log(userid);
    let insertResult = await model.addReviewQuery(bike_id, rating, review, date, userid);


    if (insertResult.affectedRows > 0) {
      // Get all ratings for this bike
      let ratings = await model.getAllRatingsQuery(bike_id);

      if (ratings.length > 0) {
        let totalRating = ratings.reduce((acc, cur) => acc + cur.br_rating, 0);
        let avgRating = (totalRating / ratings.length).toFixed(1);

        // Update bike's average rating
        await model.updateBikeRatingQuery(bike_id, avgRating);
      }

      return res.send({
        result: true,
        message: "Review added successfully and rating updated"
      });
    } else {
      return res.send({
        result: false,
        message: "Failed to add review"
      });
    }
  } catch (error) {
    logger.error("Error in reviewadd: ", error);
    return res.send({
      result: false,
      message: error.message
    });
  }
};
