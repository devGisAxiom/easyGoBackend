var model = require('../model/addbike');
var formidable = require("formidable");
var fs = require("fs");
const path = require("path");
let moment = require('moment')
const logger = require('../util/logger');

function ensureUploadDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

module.exports.addbike = async (req, res) => {

    try {
        const form = new formidable.IncomingForm({ multiples: true });
        form.parse(req, async (err, fields, files) => {
            try {
                if (err) {
                    logger.error("File Upload Failed in addbike: ", err);
                    return res.send({
                        result: false,
                        message: 'File Upload Failed!',
                        data: err,
                    });
                }

                let { name, vehicle_number, description, rate, location, extras, milage, geartype, fueltype, bhp, distance, max_speed, maintaince_status, centerList, latitude, longitude } = fields;

                if (!name || !description || !rate || !location || !extras || !milage || !geartype || !fueltype || !bhp || !max_speed || !maintaince_status) {
                    return res.send({
                        result: false,
                        message: "insufficent parameter",
                    });
                }

                const bikesUploadDir = path.join(process.cwd(), 'uploads', 'bikes');
                ensureUploadDir(bikesUploadDir);

                let date = moment().format('MM-DD_HH-mm-ss');
                const safeLatitude = latitude && latitude !== 'null' ? latitude : '0';
                const safeLongitude = longitude && longitude !== 'null' ? longitude : '0';
                // 1️⃣ Insert bike details first
                const bikeResult = await model.AddBikeQuery(name, vehicle_number || null, description, rate, location, safeLatitude, safeLongitude, extras, milage, geartype, fueltype, bhp, distance, max_speed, maintaince_status);
                const bike_id = bikeResult.insertId; // get new bike id
                centerList = centerList ? JSON.parse(centerList) : [];
                for (const centerId of centerList) {
                    logger.info("Adding bike to centerId: %s", centerId);

                    await model.AddBikeresultCenterQuery(bike_id, centerId);
                }

                let imageSaved = false;
                if (files && files.image) {
                    // Normalize to array: handles both single and multiple image uploads
                    const imageFiles = Array.isArray(files.image) ? files.image : [files.image];

                    for (const file of imageFiles) {
                        if (!file || !file.filepath || !file.originalFilename) continue;

                        const oldPath = file.filepath;
                        const filename = `${date}_${file.originalFilename}`;
                        const newPath = path.join(bikesUploadDir, filename);

                        const rawData = fs.readFileSync(oldPath);
                        fs.writeFileSync(newPath, rawData);

                        const imagePath = "/uploads/bikes/" + filename;

                        const insertResult = await model.AddBikeimageQuery(bike_id, imagePath);
                        imageSaved = imageSaved || insertResult?.affectedRows > 0;

                        logger.info("Bike image insert result: %o", insertResult);
                    }
                }

                return res.status(200).json({
                    result: true,
                    message: imageSaved ? 'bike added successfully' : 'bike added successfully',
                });
            } catch (error) {
                logger.error("Error while saving bike: ", error);
                return res.status(500).json({
                    result: false,
                    message: 'Failed to add bike details',
                    data: error.message,
                });
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
            const { b_id, name, vehicle_number, description, rate, location, extras, milage, geartype, fueltype, bhp, distance, max_speed, maintaince_status, latitude, longitude, bikecenter, status } = fields;

            const addBikeUploadDir = path.join(process.cwd(), 'uploads', 'addbike');
            ensureUploadDir(addBikeUploadDir);

            let date = moment().format('MM-DD_HH-mm-ss')

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
            if (vehicle_number) updates.push(`vehicle_number='${vehicle_number}'`);
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


            if (files && files.image) {
                const oldPath = files.image.filepath;
                const fileName = `${date}_${files.image.originalFilename}`;
                const newPath = path.join(addBikeUploadDir, fileName);

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
        logger.error('Error in editbikes: ', error);
        return res.send({
            result: false,
            message: error.message
        });
    }
}

module.exports.getAvailableBikes = async (req, res) => {
    try {
        const { pickup_date, pickup_time, drop_date, drop_time, exclude_b_id } = req.body || {};

        if (!pickup_date || !pickup_time || !drop_date || !drop_time) {
            return res.send({
                result: false,
                message: 'pickup_date, pickup_time, drop_date, drop_time are required',
            });
        }

        const pickupDt = `${pickup_date} ${String(pickup_time).substring(0, 8)}`;
        const dropDt = `${drop_date} ${String(drop_time).substring(0, 8)}`;

        const params = [dropDt, pickupDt];
        let excludeClause = '';
        if (exclude_b_id) {
            excludeClause = 'AND b_id != ?';
            params.push(Number(exclude_b_id));
        }

        const Query = `
            SELECT b_id, b_name, vehicle_number, b_location, b_fueltype, b_geartype, maintaince_status
            FROM bikes
            WHERE b_status = 'Active'
              AND (maintaince_status IS NULL
                   OR maintaince_status NOT IN ('maintenance', 'damaged', 'Damaged', 'MAINTENANCE'))
              AND b_id NOT IN (
                  SELECT bk.b_bk_id FROM bookings bk
                  WHERE bk.b_bk_id IS NOT NULL
                    AND bk.b_status IN ('approved', 'onride', 'extendedreq')
                    AND TIMESTAMP(bk.b_pickup_date, SUBSTRING_INDEX(bk.b_picup_time, '.', 1)) < ?
                    AND TIMESTAMP(bk.b_drop_date,   SUBSTRING_INDEX(bk.b_drop_time,   '.', 1)) > ?
              )
              ${exclude_b_id ? `AND b_id != ${Number(exclude_b_id)}` : ''}
            ORDER BY b_name ASC
        `;

        const list = await model.getAvailableBikesQuery(Query, [dropDt, pickupDt]);

        return res.send({
            result: true,
            message: list.length > 0 ? 'Available bikes retrieved' : 'No bikes available for this time window',
            list,
            count: list.length,
        });
    } catch (error) {
        logger.error('Error in getAvailableBikes: ', error);
        return res.send({
            result: false,
            message: error.message,
        });
    }
};

module.exports.checkBikeAvailability = async (bk_id, pickup_date, pickup_time, drop_date, drop_time) => {
    try {
        const pickupDt = `${pickup_date} ${String(pickup_time).substring(0, 8)}`;
        const dropDt = `${drop_date} ${String(drop_time).substring(0, 8)}`;

        const Query = `
            SELECT COUNT(*) AS conflict_count FROM bookings
            WHERE b_bk_id = ?
              AND b_status IN ('approved', 'onride', 'extendedreq')
              AND TIMESTAMP(b_pickup_date, SUBSTRING_INDEX(b_picup_time, '.', 1)) < ?
              AND TIMESTAMP(b_drop_date,   SUBSTRING_INDEX(b_drop_time,   '.', 1)) > ?
        `;
        const rows = await model.checkBikeAvailabilityQuery(Query, [Number(bk_id), dropDt, pickupDt]);
        return rows[0]?.conflict_count === 0;
    } catch (err) {
        logger.error('checkBikeAvailability error: %s', err.message);
        return false;
    }
};

















