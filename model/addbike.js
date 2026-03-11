var db = require('../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.SelectImage = async () => {
    var Query = `SELECT 
            b_id, b_name, b_ratings, b_description, b_price, b_location, 
            b_extras, b_milage, b_geartype, b_fueltype, b_bhp, distance, max_speed, b_image
        FROM bikes
        ORDER BY b_id DESC
    `;
    var data = await query(Query);
    return data;

}

module.exports.AddBikeQuery = async (name, description, rate, location,latitude, longitude, extras, milage, geartype, fueltype, bhp, distance, max_speed, maintaince_status) => {
    var Query = `insert into bikes(b_name,b_description,b_price,b_location,b_latitude,b_longitude,b_extras,b_milage,b_geartype,b_fueltype,b_bhp,distance,max_speed,maintaince_status) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;
    var data = await query(Query, [name, description, rate, location,latitude, longitude, extras, milage, geartype, fueltype, bhp, distance, max_speed, maintaince_status]);
    return data;

}

module.exports.AddBikeimageQuery = async (bike_id, imagePath) => {
    var Query = `INSERT INTO bike_images(bike_id, image_path) VALUES (?, ?)`;
    var data = await query(Query, [bike_id, imagePath]);
    return data;
}


module.exports.listbikeQuery = async (condition) => {
    var Query = `SELECT * FROM  bikes ${condition} ORDER BY b_id DESC`;
    var data = query(Query);
    return data;
}

module.exports.getbikeReview = async (bike_id) => {
    var Query = `SELECT r.*,u.u_name,u.u_profile_pic FROM  bike_reviews r LEFT JOIN user u on r.br_used_id = u.u_id where r.br_bike_id =?`;
    var data = query(Query, [bike_id]);
    return data;
}

module.exports.RemoveBikesQuery = async (b_id) => {
    var Query = `delete from bikes where b_id=?`;
    var data = await query(Query, [b_id]);
    return data;
}
module.exports.checkbikesQuery = async (b_id) => {
    var Query = `select * from bikes where b_id =?`;
    var data = await query(Query, [b_id]);
    return data;

}
module.exports.UpdateBikesDetails = async (updateQuery, b_id) => {
    var Query = ` update bikes ${updateQuery} where b_id = ?`;
    var data = await query(Query, [b_id]);
    return data;
}
module.exports.DeleteBikeImages = async (b_id) => {
    var Query = `DELETE FROM bike_images WHERE bike_id = ?`;
    var data = await query(Query, [b_id]);
    return data;
}


module.exports.UpdateBikesImage = async (imagePath, b_id) => {
    var Query = ` update bikes set b_image=? where b_id = ?`;
    var data = await query(Query, [imagePath, b_id]);
    return data;
}

module.exports.bikeImages = async (b_id) => {
    var Query = `select * FROM bike_images WHERE bike_id = ?`;
    var data = await query(Query, [b_id]);
    return data;
}
module.exports.getbikeCenter = async (bike_id) => {
    var Query = `SELECT * 
FROM bike_centers bc 
LEFT JOIN location_center lc 
    ON bc.bc_center_id = lc.l_id 
WHERE bc_bike_id = ?`
    var data = await query(Query, [bike_id]);
    return data
}
module.exports.AddBikeresultCenterQuery = async (bike_id, centerId) => {
    var Query = `insert into  bike_centers (bc_bike_id,bc_center_id)values(?,?)`;
    var data = await query(Query, [bike_id, centerId]);
    return data;
}
module.exports.DeleteBikeCentersByBikeId = async (b_id) => {
  var Query = `delete from bike_centers where bc_bike_id=? `;
  var data = await query(Query, [b_id]);
  return data;
}

module.exports.DeleteFilesQuery = async (b_id, fileKeys) => {
  var Query = `delete from bike_images where bike_id=? and img_id not in (${fileKeys})`;
  var data = await query(Query, [b_id]);
  return data;
}