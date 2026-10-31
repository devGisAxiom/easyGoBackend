var model = require('../model/addbike');
var formidable = require("formidable");
var fs = require("fs");
const path = require("path");
let moment = require('moment')
const logger = require('../util/logger');
const { getScope, assertFranchiseAccess, isFranchiseAdmin } = require('../util/franchiseScope');
const { toDateTimeString, toDatePart, toTimePart } = require('../util/datetime');

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

                let { name, vehicle_number, description, rate, location, extras, milage, geartype, fueltype, bhp, distance, max_speed, maintaince_status, centerList, latitude, longitude, franchise_id } = fields;

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
                // A franchise-admin's vehicles are always tagged with their own
                // franchise; a super-admin can pick the franchise explicitly.
                let bikeFranchiseId = franchise_id || null;
                if (isFranchiseAdmin(req.user)) {
                    bikeFranchiseId = Number(req.user.franchise_id);
                }

                // 1️⃣ Insert bike details first
                const bikeResult = await model.AddBikeQuery(name, vehicle_number || null, description, rate, location, safeLatitude, safeLongitude, extras, milage, geartype, fueltype, bhp, distance, max_speed, maintaince_status, bikeFranchiseId);
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
        const where = [];
        const params = [];

        if (b_id) {
            where.push('bk.b_id = ?');
            params.push(Number(b_id));
        }
        if (search) {
            where.push('(bk.b_name LIKE ? OR bk.b_location LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        // Franchise-admin only sees their own franchise's vehicles.
        const scope = getScope(req.user, 'bk.b_franchise_id');
        if (scope.clause) {
            where.push(scope.clause);
            params.push(...scope.params);
        }

        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const order = most_rated ? 'bk.b_ratings DESC' : 'bk.b_id DESC';

        let listbike = await model.listbikeQuery(whereClause, order, params);

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
                // Franchise guard — a franchise-admin must not delete another
                // franchise's vehicle.
                const access = assertFranchiseAccess(req.user, checkbikes[0].b_franchise_id);
                if (!access.allowed) {
                    return res.send({
                        result: false,
                        code: 'FRANCHISE_FORBIDDEN',
                        message: access.message,
                    });
                }

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
            const { b_id, name, vehicle_number, description, rate, location, extras, milage, geartype, fueltype, bhp, distance, max_speed, maintaince_status, latitude, longitude, bikecenter, status, franchise_id } = fields;

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

            // Franchise guard — a franchise-admin must not edit another
            // franchise's vehicle.
            const access = assertFranchiseAccess(req.user, bikesExists[0].b_franchise_id);
            if (!access.allowed) {
                return res.send({
                    result: false,
                    code: 'FRANCHISE_FORBIDDEN',
                    message: access.message,
                });
            }

            // Whitelisted field → column map. Building the SET clause from a
            // fixed map (instead of interpolating values into SQL) keeps every
            // value parameterised and prevents SQL injection through the
            // edit-bike form.
            const FIELD_MAP = {
                name: 'b_name',
                vehicle_number: 'vehicle_number',
                description: 'b_description',
                rate: 'b_price',
                location: 'b_location',
                extras: 'b_extras',
                milage: 'b_milage',
                geartype: 'b_geartype',
                fueltype: 'b_fueltype',
                bhp: 'b_bhp',
                distance: 'distance',
                max_speed: 'max_speed',
                maintaince_status: 'maintaince_status',
                latitude: 'b_latitude',
                longitude: 'b_longitude',
                status: 'b_status',
                franchise_id: 'b_franchise_id',
            };

            const updates = [];
            const updateParams = [];
            for (const [field, column] of Object.entries(FIELD_MAP)) {
                const value = fields[field];
                if (value === undefined || value === null || value === '') continue;
                updates.push(`${column} = ?`);
                updateParams.push(value);
            }

            if (updates.length > 0) {
                const updateQuery = `SET ${updates.join(', ')}`;
                var updateResult = await model.UpdateBikesDetails(updateQuery, updateParams, b_id);
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

/**
 * List bikes that are free for a given time window.
 *
 * The optional `franchise_id` narrows the candidates to a franchise's own
 * fleet — a booking at a Nedumbassery pickup location must not be blocked
 * (or satisfied) by an Ernakulam vehicle.
 */
module.exports.getAvailableBikes = async (req, res) => {
    try {
        const {
            pickup_date, pickup_time, drop_date, drop_time,
            exclude_b_id, franchise_id,
        } = req.body || {};

        if (!pickup_date || !pickup_time || !drop_date || !drop_time) {
            return res.send({
                result: false,
                message: 'pickup_date, pickup_time, drop_date, drop_time are required',
            });
        }

        const list = await findAvailableBikes(
            pickup_date, pickup_time, drop_date, drop_time,
            exclude_b_id, franchise_id,
        );

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

/**
 * Shared availability query used by both the admin "assign vehicle" dialog
 * and the customer booking flow.
 *
 * @returns {Promise<Array>} Available bikes.
 */
async function findAvailableBikes(
    pickup_date, pickup_time, drop_date, drop_time,
    exclude_b_id = null, franchise_id = null,
) {
    // Normalise both ends — the customer app sends a full timestamp
    // ("2026-12-01 10:00:00.000") while the admin panel sends a bare time
    // ("10:00:00"). TIMESTAMP() needs both parts separately.
    const pickupDt = toDateTimeString(pickup_date, pickup_time);
    const dropDt = toDateTimeString(drop_date, drop_time);

    const params = [dropDt, pickupDt];
    let extra = '';

    if (exclude_b_id) {
        extra += ' AND bk.b_id != ?';
        params.push(Number(exclude_b_id));
    }
    if (franchise_id) {
        extra += ' AND bk.b_franchise_id = ?';
        params.push(Number(franchise_id));
    }

    const Query = `
        SELECT bk.b_id, bk.b_name, bk.vehicle_number, bk.b_location,
               bk.b_fueltype, bk.b_geartype, bk.maintaince_status
        FROM bikes bk
        WHERE bk.b_status = 'Active'
          AND (bk.maintaince_status IS NULL
               OR bk.maintaince_status NOT IN ('maintenance', 'damaged', 'Damaged', 'MAINTENANCE'))
          AND bk.b_id NOT IN (
              SELECT b.b_bk_id FROM bookings b
              WHERE b.b_bk_id IS NOT NULL
                AND b.b_status IN ('approved', 'onride', 'extendedreq')
                AND TIMESTAMP(b.b_pickup_date, SUBSTRING_INDEX(b.b_picup_time, '.', 1)) < ?
                AND TIMESTAMP(b.b_drop_date,   SUBSTRING_INDEX(b.b_drop_time,   '.', 1)) > ?
          )${extra}
        ORDER BY bk.b_name ASC
    `;

    return await model.getAvailableBikesQuery(Query, params);
}

/**
 * How many vehicles are free in a window (optionally within one franchise).
 *
 * @returns {Promise<number>} Count of available vehicles.
 */
async function countAvailableBikes(
    pickup_date, pickup_time, drop_date, drop_time, franchise_id = null,
) {
    const list = await findAvailableBikes(
        pickup_date, pickup_time, drop_date, drop_time, null, franchise_id,
    );
    return list.length;
}

/**
 * Customer-facing availability probe.
 *
 * The customer app calls this before letting the user confirm a booking so
 * it can show "no vehicles available for this slot" instead of creating a
 * booking that has to be refunded later.
 *
 * If `price_id` is supplied the drop time is derived from the tier duration
 * when the caller did not pass one explicitly.
 */
module.exports.checkAvailability = async (req, res) => {
    try {
        const {
            pickup_location, pickup_date, pickup_time,
            drop_date, drop_time, price_id,
        } = req.body || {};

        if (!pickup_date || !pickup_time) {
            return res.send({
                result: false,
                message: 'pickup_date and pickup_time are required',
            });
        }

        let resolvedDropDate = toDatePart(drop_date);
        let resolvedDropTime = toTimePart(drop_time);

        // Derive the drop window from the pricing tier when not supplied.
        if ((!resolvedDropDate || !resolvedDropTime) && price_id) {
            const priceModel = require('../model/priceDetails');
            const priceRows = await priceModel.checkPriceDetails(price_id);
            if (priceRows.length) {
                const hours = Number(priceRows[0].rent_duration);
                if (hours > 0) {
                    const pickup = moment(
                        `${toDatePart(pickup_date)} ${toTimePart(pickup_time)}`,
                        'YYYY-MM-DD HH:mm:ss',
                    );
                    if (pickup.isValid()) {
                        const drop = pickup.clone().add(hours, 'hours');
                        resolvedDropDate = resolvedDropDate || drop.format('YYYY-MM-DD');
                        resolvedDropTime = resolvedDropTime || drop.format('HH:mm:ss');
                    }
                }
            }
        }

        if (!resolvedDropDate || !resolvedDropTime) {
            return res.send({
                result: false,
                message: 'drop_date and drop_time are required (or provide price_id)',
            });
        }

        // Scope the fleet to the franchise that owns the pickup location.
        let franchiseId = null;
        if (pickup_location) {
            try {
                const franchiseModel = require('../model/franchise');
                franchiseId = await franchiseModel.resolveFranchiseByLocation(
                    pickup_location, null,
                );
            } catch (frErr) {
                logger.warn('checkAvailability: franchise lookup failed: %s', frErr.message);
            }
        }

        const list = await findAvailableBikes(
            pickup_date, pickup_time, resolvedDropDate, resolvedDropTime,
            null, franchiseId,
        );

        return res.send({
            result: true,
            available: list.length > 0,
            available_count: list.length,
            franchise_id: franchiseId,
            drop_date: resolvedDropDate,
            drop_time: resolvedDropTime,
            list: list.map((b) => ({
                b_id: b.b_id,
                b_name: b.b_name,
                vehicle_number: b.vehicle_number,
            })),
        });
    } catch (error) {
        logger.error('Error in checkAvailability: %s', error.message);
        return res.send({
            result: false,
            message: error.message,
        });
    }
};

module.exports.findAvailableBikes = findAvailableBikes;
module.exports.countAvailableBikes = countAvailableBikes;

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

















