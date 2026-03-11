var model = require('../model/addbike');
var formidable = require("formidable");
var fs = require("fs");
const path = require("path");
let moment = require('moment')
const logger = require('../util/logger');

module.exports.addbike = async (req, res) => {

    try {
        const form = new formidable.IncomingForm({ multiples: true });
        form.parse(req, async (err, fields, files) => {
            if (err) {
                logger.error("File Upload Failed in addbike: ", err);
                return res.send({
                    result: false,
                    message: 'File Upload Failed!',
                    data: err,
                })
            }

            let { name, description, rate, location, extras, milage, geartype, fueltype, bhp, distance, max_speed, maintaince_status, centerList, latitude, longitude } = fields;

            if (!name || !description || !rate || !location || !extras || !milage || !geartype || !fueltype || !bhp || !max_speed || !maintaince_status) {
                return res.send({
                    result: false,
                    message: "insufficent parameter",
                })
            }
            let date = moment().format('MM-DD HH:MM:SS')
            // 1️⃣ Insert bike details first
            const bikeResult = await model.AddBikeQuery(name, description, rate, location, latitude, longitude, extras, milage, geartype, fueltype, bhp, distance, max_speed, maintaince_status);
            const bike_id = bikeResult.insertId; // get new bike id
            centerList = JSON.parse(centerList)
            for (const centerId of centerList) {
                logger.info("Adding bike to centerId: %s", centerId);

                await model.AddBikeresultCenterQuery(bike_id, centerId);
            }

            if (files && files.image) {
                // Normalize to array: handles both single and multiple image uploads
                const imageFiles = Array.isArray(files.image) ? files.image : [files.image];

                for (const file of imageFiles) {
                    if (!file || !file.filepath || !file.originalFilename) continue;

                    const oldPath = file.filepath;
                    const filename = `${date}_${file.originalFilename}`;
                    const newPath = path.join(process.cwd(), '/uploads/bikes', filename);

                    const rawData = fs.readFileSync(oldPath);
                    fs.writeFileSync(newPath, rawData);

                    const imagePath = "/uploads/bikes/" + filename;

                    var insertResult = await model.AddBikeimageQuery(bike_id, imagePath);

                    // logger.info(insertResult, "image insert result");
                    logger.info("Bike image insert result: %o", insertResult);
                }

                if (insertResult.affectedRows > 0) {

                    return res.status(200).json({
                        result: true,
                        message: 'bike added successfully',
                    });
                } else {
                    return res.status(500).json({
                        result: false,
                        message: 'Failed to add bike deatils',
                    });
                }
            }



        })

    } catch (error) {
        logger.error("Error in addbike: ", error);
        return res.status(500).json({
            result: false,
            message: 'Internal server error.',
            data: error.message,
        });
    }
}

module.exports.listbike = async (req, res) => {
    try {
        let { b_id, search, most_rated } = req.body || {}
        var condition = ''
        if (b_id) {
            condition = `where b_id='${b_id}'`
        }
        if (search) {
            condition = `where (b_name LIKE '%${search}%')`;
        }
        if (most_rated) {
            condition = `ORDER BY b_ratings DESC`;
        }
        let listbike = await model.listbikeQuery(condition);

        if (listbike.length > 0) {

            let getbikes = await Promise.all(
                listbike.map(async (bike) => {
                    let bike_id = bike.b_id
                    let bikeimages = await model.bikeImages(bike_id);
                    let bikereviews = await model.getbikeReview(bike_id);
                    let bike_centers = await model.getbikeCenter(bike_id);
                    bike.bikeimages = bikeimages;
                    bike.bikereviews = bikereviews;
                    bike.bike_centers = bike_centers;
                    return bike;
                })
            )
            return res.send({
                result: true,
                message: "Data retrived",
                list: getbikes
            });
        } else {
            return res.send({
                result: false,
                message: "data not found",
            });
        }
    } catch (error) {

        return res.send({
            result: false,
            message: error.message,
        });


    }
}

module.exports.deleteBikes = async (req, res) => {
    try {
        let b_id = req.body.b_id;
        if (b_id) {
            let checkbikes = await model.checkbikesQuery(b_id);
            if (checkbikes.length == 0) {
                return res.send({
                    result: false,
                    message: "bikes details not found"
                });
            } else {
                var deletesection = await model.RemoveBikesQuery(b_id);
                if (deletesection.affectedRows > 0) {
                    return res.send({
                        result: true,
                        message: "bikes list deleted successfully"
                    });

                }
            }
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message,

        });
    }
}

module.exports.editbikes = async (req, res) => {
    try {
        const form = new formidable.IncomingForm({ multiples: false });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.send({
                    result: false,
                    message: 'File Upload Failed!',
                    data: err,
                });
            }
            const { b_id, name, description, rate, location, extras, milage, geartype, fueltype, bhp, distance, max_speed, maintaince_status, latitude, longitude, bikecenter, status } = fields;

            let date = moment().format('MM-DD HH:MM:SS')

            if (!b_id) {
                return res.send({
                    result: false,
                    message: 'Insufficient parameters',
                });
            }
            const bikesExists = await model.checkbikesQuery(b_id);
            if (bikesExists.length === 0) {
                return res.send({
                    result: false,
                    message: ' bikes does not exist',
                });
            }

            let updates = [];

            if (name) updates.push(`b_name='${name}'`);
            if (description) updates.push(`b_description='${description}'`);
            if (rate) updates.push(`b_price='${rate}'`);
            if (location) updates.push(`b_location='${location}'`);
            if (extras) updates.push(`b_extras='${extras}'`);
            if (milage) updates.push(`b_milage='${milage}'`);
            if (geartype) updates.push(`b_geartype='${geartype}'`);
            if (fueltype) updates.push(`b_fueltype='${fueltype}'`);
            if (bhp) updates.push(`b_bhp='${bhp}'`);
            if (distance) updates.push(`distance='${distance}'`);
            if (max_speed) updates.push(`max_speed='${max_speed}'`);
            if (maintaince_status) updates.push(`maintaince_status='${maintaince_status}'`);
            if (latitude) updates.push(`b_latitude='${latitude}'`);
            if (longitude) updates.push(`b_longitude='${longitude}'`);
            if (status) updates.push(`b_status='${status}'`);

            if (updates.length > 0) {
                const updateQuery = `SET ${updates.join(', ')}`;
                var updateResult = await model.UpdateBikesDetails(updateQuery, b_id);
            }

            // 2️⃣ Delete old images if requested
            // 2️⃣ Update bike centers if provided
            if (bikecenter) {
                try {
                    const bikeCenters = JSON.parse(bikecenter); // ensure it's parsed from string (form-data comes as string)

                    // Delete all existing centers for this bike
                    await model.DeleteBikeCentersByBikeId(b_id);

                    // Insert new centers
                    for (const center of bikeCenters) {
                        await model.AddBikeresultCenterQuery(center.b_id, center.center_id);
                    }
                } catch (err) {
                    console.error('Error updating bike centers:', err);
                    return res.send({
                        result: false,
                        message: 'Failed to update bike centers',
                        data: err.message,
                    });
                }
            }


            if (files) {
                const fileKeys = Object.keys(files).filter(item => item !== 'image');
                console.log("fileKeys :", fileKeys);

                if (fileKeys.length > 0) {
                    await model.DeleteFilesQuery(b_id, fileKeys);
                }
            }

            if (files.image) {
                const oldPath = files.image.filepath;
                const fileName = `${date}_${files.originalFilename}`;
                const newPath = path.join(process.cwd(), '/uploads/addbike/', fileName);

                const rawData = fs.readFileSync(oldPath);
                fs.writeFileSync(newPath, rawData);

                const imagePath = `/uploads/addbike/${fileName}`;
                const imageUpdate = await model.UpdateBikesImage(imagePath, b_id);

                if (!imageUpdate.affectedRows) {
                    return res.send({
                        result: false,
                        message: 'Failed to update bikes image',
                    });
                }
            }

            return res.send({
                result: true,
                message: 'bikes updated successfully',
            });
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }

}

















