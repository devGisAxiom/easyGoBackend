var model = require('../model/updatebooking');
const bookingModel = require('../model/booking');
const addbikeController = require('./addbike');
const { addNotification } = require('../util/notification');
const sms = require('../util/sms');
const logger = require('../util/logger');
const moment = require('moment');
const { assertFranchiseAccess } = require('../util/franchiseScope');

module.exports.updateBookingStatus = async (req, res) => {
    try {
        const { b_id, b_status, view_reason, rejection_reason, b_bk_id } = req.body;

        if (!b_id || !b_status) {
            logger.warn("updateBookingStatus failed: Insufficient parameters");
            return res.send({
                result: false,
                message: "Insufficient parameters"
            });
        }

        if (!["approved", "rejected", "completed", "cancelled", "cancelreq", "onride", "pending", "extendedreq"].includes(b_status)) {
            return res.send({
                result: false,
                message: "Invalid status value"
            });
        }

        if (b_status === 'rejected' && (!rejection_reason || !String(rejection_reason).trim())) {
            logger.warn("updateBookingStatus failed: rejection_reason required when rejecting");
            return res.send({
                result: false,
                message: "rejection_reason is required when rejecting a booking"
            });
        }

        if (b_status === 'approved' && !b_bk_id) {
            logger.warn("updateBookingStatus failed: b_bk_id required when approving");
            return res.send({
                result: false,
                message: "b_bk_id (vehicle) is required when approving a booking. Use /list/available-bikes to pick one."
            });
        }

        const booking = await model.findBooking(b_id);
        if (booking.length === 0) {
            logger.warn("updateBookingStatus failed: Booking not found");
            return res.send({ result: false, message: "Booking not found" });
        }

        // Franchise guard — a franchise-admin must not be able to act on
        // another franchise's booking by passing its id directly.
        const access = assertFranchiseAccess(req.user, booking[0].b_franchise_id);
        if (!access.allowed) {
            logger.warn(
                "updateBookingStatus denied: booking %s belongs to another franchise",
                b_id,
            );
            return res.send({
                result: false,
                code: 'FRANCHISE_FORBIDDEN',
                message: access.message,
            });
        }

        let getadmin = await model.GetAdmin();
        const updates = [];
        const updateParams = [];
        let assignedBike = null;

        // Every value goes through a `?` placeholder — never interpolated
        // into the SQL string.
        const pushUpdate = (column, value) => {
            updates.push(`${column} = ?`);
            updateParams.push(value);
        };

        if (b_status === 'approved' && b_bk_id) {
            const pickup_date = booking[0].b_pickup_date;
            const pickup_time = booking[0].b_picup_time;
            const drop_date = booking[0].b_drop_date;
            const drop_time = booking[0].b_drop_time;

            const isAvailable = await addbikeController.checkBikeAvailability(
                b_bk_id, pickup_date, pickup_time, drop_date, drop_time
            );

            if (!isAvailable) {
                logger.warn("updateBookingStatus failed: bike %s not available for booking %s time window", b_bk_id, b_id);
                return res.status(409).send({
                    result: false,
                    message: "This vehicle was just taken by another request. Please pick another vehicle.",
                    code: 'BIKE_UNAVAILABLE',
                });
            }

            const bike = await bookingModel.getBikeById(b_bk_id);
            if (!bike) {
                logger.warn("updateBookingStatus failed: bike %s not found", b_bk_id);
                return res.send({
                    result: false,
                    message: "Selected vehicle does not exist"
                });
            }
            assignedBike = bike;

            pushUpdate('b_status', 'approved');
            pushUpdate('b_bk_id', Number(b_bk_id));
            pushUpdate('b_bike_name', String(bike.b_name));
        } else {
            if (b_status !== undefined) pushUpdate('b_status', b_status);
        }

        if (view_reason !== undefined) pushUpdate('view_reason', view_reason);
        if (rejection_reason !== undefined && b_status === 'rejected') {
            pushUpdate('rejection_reason', String(rejection_reason).trim());
        }

        let result;
        if (updates.length > 0) {
            const updateString = updates.join(', ');
            result = await model.updateBookingStatus(updateString, updateParams, b_id);
            if (result.affectedRows == 0) {
                return res.send({
                    result: false,
                    message: "Failed to update Booking status"
                });
            }
        }

        if (result && result.affectedRows > 0) {
            await addNotification(getadmin[0]?.u_id,
                booking[0]?.b_u_id,
                "user",
                "Booking",
                `Your booking has been ${b_status}.`,
                "unread"
            );

            if (b_status === 'rejected') {
                sendBookingRejectedSMS({
                    b_id,
                    rejection_reason: String(rejection_reason).trim(),
                }).catch((err) => {
                    logger.error('Booking rejected SMS task failed: %s', err.message);
                });
            } else if (b_status === 'approved' && assignedBike) {
                sendBookingApprovedSMS({
                    b_id,
                }).catch((err) => {
                    logger.error('Booking approved SMS task failed: %s', err.message);
                });
            }

            return res.send({
                result: true,
                message: `Booking status updated to ${b_status}`,
                b_bk_id: assignedBike ? b_bk_id : booking[0].b_bk_id,
                b_bike_name: assignedBike ? assignedBike.b_name : booking[0].b_bike_name,
                vehicle_number: assignedBike ? assignedBike.vehicle_number : null,
            });

        } else {
            return res.send({
                result: false,
                message: "Booking not found or status not updated"
            });
        }

    } catch (error) {
        logger.error("Error in updateBookingStatus: ", error);
        return res.send({
            result: false,
            message: error.message
        });
    }
};

async function sendBookingApprovedSMS({ b_id }) {
    try {
        const details = await bookingModel.getBookingFullDetails(b_id);
        if (!details) {
            logger.warn('SMS approved: booking %s not found', b_id);
            return;
        }

        const mobile = details.u_mobile;
        const name = details.u_name || 'Customer';
        if (!mobile) {
            logger.warn('SMS approved: no mobile for booking %s', b_id);
            return;
        }

        if (!details.b_bk_id) {
            logger.warn('SMS approved: no bike assigned for booking %s, skipping', b_id);
            return;
        }

        const fmtDate = (d) => (d ? moment(d, 'YYYY-MM-DD').format('DD MMM YYYY') : 'N/A');
        const fmtTime = (t) => (t ? String(t).substring(0, 5) : 'N/A');

        const smsVars = [
            name,
            details.vehicle_number || details.bike_name || 'TBD',
            `${fmtDate(details.b_pickup_date)} ${fmtTime(details.b_picup_time)}`,
            `${fmtDate(details.b_drop_date)} ${fmtTime(details.b_drop_time)}`,
            details.rent_duration_text || 'N/A',
            parseFloat(details.b_rent_amount || 0).toFixed(2),
            parseFloat(details.rent_gst !== undefined && details.rent_gst !== null
                ? details.rent_gst
                : (parseFloat(details.b_rent_amount || 0) * 0.05)).toFixed(2),
            parseFloat(details.rd_rent_deposit || details.rent_deposit || 0).toFixed(2),
            parseFloat(details.b_total_amount || 0).toFixed(2),
        ];

        await sms.sendSMS('BOOKING_CONFIRMED', mobile, smsVars, b_id);
    } catch (err) {
        logger.error('sendBookingApprovedSMS error: %s', err.message);
    }
}

async function sendBookingRejectedSMS({ b_id, rejection_reason }) {
    try {
        const details = await bookingModel.getBookingFullDetails(b_id);
        if (!details) {
            logger.warn('SMS rejected: booking %s not found', b_id);
            return;
        }

        const mobile = details.u_mobile;
        const name = details.u_name || 'Customer';
        if (!mobile) {
            logger.warn('SMS rejected: no mobile for booking %s', b_id);
            return;
        }

        const vehicleNumber = details.vehicle_number || details.bike_name || 'Vehicle';
        const bookingDate = details.booking_date
            ? moment(details.booking_date).format('DD MMM YYYY')
            : 'N/A';

        const smsVars = [
            name,
            vehicleNumber,
            bookingDate,
            rejection_reason,
        ];

        await sms.sendSMS('BOOKING_REJECTED', mobile, smsVars, b_id);
    } catch (err) {
        logger.error('sendBookingRejectedSMS error: %s', err.message);
    }
}