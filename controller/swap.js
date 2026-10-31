const model = require('../model/swap');
const bookingModel = require('../model/booking');
const addbikeController = require('../controller/addbike');
const notify = require('../util/notification');
const logger = require('../util/logger');
const moment = require('moment');
const { assertFranchiseAccess, isFranchiseAdmin } = require('../util/franchiseScope');
const { sendWhatsApp } = require('../util/whatsapp');

/**
 * Customer raises a swap request for a vehicle that is not working out.
 * The admin then approves it (assigning a replacement vehicle) or rejects it.
 */
module.exports.requestSwap = async (req, res) => {
    try {
        const { u_id } = req.user || {};
        const { b_id, reason } = req.body || {};

        if (!b_id) {
            return res.send({ result: false, message: 'b_id is required' });
        }

        const booking = await bookingModel.getUserIdByBooking(Number(b_id));
        if (!booking || booking.length === 0) {
            return res.send({ result: false, message: 'Booking not found' });
        }

        // Only the customer who owns the booking may request a swap.
        if (Number(booking[0].b_u_id) !== Number(u_id)) {
            return res.send({
                result: false,
                message: 'You can only request a swap for your own booking',
            });
        }

        const status = String(booking[0].b_status || '').toLowerCase();
        if (!['approved', 'onride', 'extendedreq'].includes(status)) {
            return res.send({
                result: false,
                message: `A swap cannot be requested for a booking with status "${booking[0].b_status}"`,
            });
        }

        // One open request at a time.
        if (await model.hasPendingSwapRequest(Number(b_id))) {
            return res.send({
                result: false,
                code: 'SWAP_REQUEST_PENDING',
                message: 'You already have a swap request awaiting review',
            });
        }

        // Tell the customer up-front what the swap will cost.
        const pricing = await model.getSwapCharge(Number(b_id));

        const result = await model.createSwapRequest({
            booking_id: Number(b_id),
            reason: reason ? String(reason).trim().substring(0, 1000) : null,
            requested_by: Number(u_id),
        });

        if (result.affectedRows === 0) {
            return res.send({ result: false, message: 'Failed to create swap request' });
        }

        // Notify the admins.
        try {
            const admins = await require('../model/updatebooking').GetAdmin();
            if (admins.length) {
                await notify.addNotification(
                    Number(u_id),
                    admins[0].u_id,
                    'user',
                    'Booking',
                    `Swap requested for booking #${b_id}`,
                    'unread',
                );
            }
        } catch (notifyErr) {
            logger.warn('requestSwap: notification failed: %s', notifyErr.message);
        }

        logger.info('Swap request created', { sr_id: result.insertId, b_id });

        return res.send({
            result: true,
            message: 'Swap request submitted. Our team will get in touch shortly.',
            sr_id: result.insertId,
            swap_number: pricing.swap_number,
            swap_charge: pricing.charge,
            swap_is_free: pricing.is_free,
        });
    } catch (error) {
        logger.error('requestSwap error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * Admin lists swap requests.
 */
module.exports.listSwapRequests = async (req, res) => {
    try {
        const { status } = req.body || {};

        const franchiseId = isFranchiseAdmin(req.user)
            ? Number(req.user.franchise_id)
            : null;

        const list = await model.listSwapRequests({
            status: status || null,
            franchise_id: franchiseId,
        });

        return res.send({
            result: true,
            message: list.length ? 'Swap requests retrieved' : 'No data',
            count: list.length,
            list,
        });
    } catch (error) {
        logger.error('listSwapRequests error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * Approve a swap request: assign a replacement vehicle and record the
 * charge. The first swap on a booking is free; every swap after that costs
 * Rs.100.
 */
module.exports.approveSwap = async (req, res) => {
    try {
        const { sr_id, b_id, new_bk_id, reason } = req.body || {};
        const { u_id } = req.user || {};

        if (!sr_id && !b_id) {
            return res.send({ result: false, message: 'sr_id or b_id is required' });
        }
        if (!new_bk_id) {
            return res.send({ result: false, message: 'new_bk_id is required' });
        }

        let bookingId = b_id ? Number(b_id) : null;
        let swapRequest = null;

        if (sr_id) {
            swapRequest = await model.getSwapRequestById(Number(sr_id));
            if (!swapRequest) {
                return res.send({ result: false, message: 'Swap request not found' });
            }
            if (swapRequest.sr_status !== 'pending') {
                return res.send({
                    result: false,
                    message: `This swap request has already been ${swapRequest.sr_status}`,
                });
            }
            bookingId = Number(swapRequest.sr_booking_id);
        }

        const booking = await bookingModel.getUserIdByBooking(bookingId);
        if (!booking || booking.length === 0) {
            return res.send({ result: false, message: 'Booking not found' });
        }

        const access = assertFranchiseAccess(req.user, booking[0].b_franchise_id);
        if (!access.allowed) {
            return res.send({
                result: false,
                code: 'FRANCHISE_FORBIDDEN',
                message: access.message,
            });
        }

        const status = String(booking[0].b_status || '').toLowerCase();
        if (!['approved', 'onride', 'extendedreq'].includes(status)) {
            return res.send({
                result: false,
                message: `A swap cannot be approved for a booking with status "${booking[0].b_status}"`,
            });
        }

        const oldBikeId = booking[0].b_bk_id;

        if (oldBikeId && Number(oldBikeId) === Number(new_bk_id)) {
            return res.send({
                result: false,
                message: 'The replacement vehicle is the same as the current one',
            });
        }

        // The replacement vehicle must be free for the remainder of the ride.
        // The old vehicle is excluded so it can be swapped straight back in.
        const now = moment();
        const available = await addbikeController.findAvailableBikes(
            now.format('YYYY-MM-DD'),
            now.format('YYYY-MM-DD HH:mm:ss'),
            booking[0].b_drop_date,
            booking[0].b_drop_time,
            oldBikeId || null,
            booking[0].b_franchise_id || null,
        );

        const target = available.find((b) => Number(b.b_id) === Number(new_bk_id));
        if (!target) {
            logger.warn(
                'approveSwap denied: bike %s not available for booking %s',
                new_bk_id, bookingId,
            );
            return res.status(409).send({
                result: false,
                code: 'BIKE_UNAVAILABLE',
                message: 'That vehicle is not available for the remaining rental period',
                available: available.map((b) => ({
                    b_id: b.b_id,
                    b_name: b.b_name,
                    vehicle_number: b.vehicle_number,
                })),
            });
        }

        // Charge: first swap free, Rs.100 from the second onwards.
        const pricing = await model.getSwapCharge(bookingId);

        // Swap the vehicle on the booking.
        const updateQuery = `UPDATE bookings SET b_bk_id = ?, b_bike_name = ? WHERE b_id = ?`;
        const db = require('../config/db');
        const util = require('util');
        const q = util.promisify(db.query).bind(db);
        await q(updateQuery, [Number(new_bk_id), target.b_name, bookingId]);

        // Record the swap.
        const swapResult = await model.createSwap({
            booking_id: bookingId,
            swap_number: pricing.swap_number,
            is_free: pricing.is_free,
            charge: pricing.charge,
            old_bk_id: oldBikeId || null,
            new_bk_id: Number(new_bk_id),
            reason: reason || swapRequest?.sr_reason || null,
            requested_by: swapRequest?.sr_requested_by || null,
            approved_by: Number(u_id),
        });

        // A charged swap becomes an extra charge on the booking, so it flows
        // into the final-bill calculation.
        if (pricing.charge > 0) {
            const newFine = Number(booking[0].b_fine_amount || 0) + pricing.charge;
            await q(`UPDATE bookings SET b_fine_amount = ? WHERE b_id = ?`, [newFine, bookingId]);
        }

        if (swapRequest) {
            await model.resolveSwapRequest(
                Number(sr_id), 'approved', Number(u_id),
                `Swapped to ${target.vehicle_number || target.b_name}`,
            );
        }

        // Tell the customer.
        try {
            await notify.addNotification(
                Number(booking[0].b_u_id),
                Number(u_id),
                'user',
                'Booking',
                `Your vehicle for booking #${bookingId} has been swapped to ${target.vehicle_number || target.b_name}.`,
                'unread',
            );
            const customer = await require('../model/registration').CheckUserWithId(booking[0].b_u_id);
            if (customer?.[0]?.u_mobile) {
                await sendWhatsApp({
                    to: customer[0].u_mobile,
                    template: 'SWAP_APPROVED',
                    variables: [
                        customer[0].u_name || 'Customer',
                        target.vehicle_number || target.b_name || 'your vehicle',
                        pricing.is_free ? 'Free' : `Rs.${pricing.charge}`,
                    ],
                });
            }
        } catch (notifyErr) {
            logger.warn('approveSwap: notification failed: %s', notifyErr.message);
        }

        logger.info('Swap approved', {
            booking_id: bookingId,
            old_bk_id: oldBikeId,
            new_bk_id: new_bk_id,
            swap_number: pricing.swap_number,
            charge: pricing.charge,
        });

        return res.send({
            result: true,
            message: 'Swap approved successfully',
            swap_id: swapResult.insertId,
            booking_id: bookingId,
            swap_number: pricing.swap_number,
            swap_is_free: pricing.is_free,
            swap_charge: pricing.charge,
            new_bike_name: target.b_name,
            new_vehicle_number: target.vehicle_number,
        });
    } catch (error) {
        logger.error('approveSwap error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * Reject a swap request.
 */
module.exports.rejectSwap = async (req, res) => {
    try {
        const { sr_id, remarks } = req.body || {};
        const { u_id } = req.user || {};

        if (!sr_id) {
            return res.send({ result: false, message: 'sr_id is required' });
        }

        const swapRequest = await model.getSwapRequestById(Number(sr_id));
        if (!swapRequest) {
            return res.send({ result: false, message: 'Swap request not found' });
        }
        if (swapRequest.sr_status !== 'pending') {
            return res.send({
                result: false,
                message: `This swap request has already been ${swapRequest.sr_status}`,
            });
        }

        const booking = await bookingModel.getUserIdByBooking(swapRequest.sr_booking_id);
        if (booking && booking.length) {
            const access = assertFranchiseAccess(req.user, booking[0].b_franchise_id);
            if (!access.allowed) {
                return res.send({
                    result: false,
                    code: 'FRANCHISE_FORBIDDEN',
                    message: access.message,
                });
            }

            try {
                await notify.addNotification(
                    Number(booking[0].b_u_id),
                    Number(u_id),
                    'user',
                    'Booking',
                    `Your swap request for booking #${swapRequest.sr_booking_id} was declined.${remarks ? ' Reason: ' + remarks : ''}`,
                    'unread',
                );
            } catch (notifyErr) {
                logger.warn('rejectSwap: notification failed: %s', notifyErr.message);
            }
        }

        await model.resolveSwapRequest(
            Number(sr_id), 'rejected', Number(u_id),
            remarks ? String(remarks).trim().substring(0, 1000) : null,
        );

        logger.info('Swap request rejected', { sr_id });
        return res.send({ result: true, message: 'Swap request rejected' });
    } catch (error) {
        logger.error('rejectSwap error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * List executed swaps.
 */
module.exports.listSwaps = async (req, res) => {
    try {
        const { from_date, to_date, booking_id } = req.body || {};

        const franchiseId = isFranchiseAdmin(req.user)
            ? Number(req.user.franchise_id)
            : null;

        const list = await model.listSwaps({
            from_date: from_date || null,
            to_date: to_date || null,
            franchise_id: franchiseId,
            booking_id: booking_id ? Number(booking_id) : null,
        });

        const totalCharge = list.reduce((sum, r) => sum + Number(r.sw_charge || 0), 0);

        return res.send({
            result: true,
            message: list.length ? 'Swaps retrieved' : 'No data',
            count: list.length,
            total_charges: Number(totalCharge.toFixed(2)),
            swap_charge_policy: {
                free_swaps: 1,
                charge_after: model.SWAP_CHARGE,
            },
            list,
        });
    } catch (error) {
        logger.error('listSwaps error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * Pricing preview for the next swap on a booking — used by the customer app
 * so the charge is never a surprise.
 */
module.exports.getSwapQuote = async (req, res) => {
    try {
        const { b_id } = req.body || {};

        if (!b_id) {
            return res.send({ result: false, message: 'b_id is required' });
        }

        const pricing = await model.getSwapCharge(Number(b_id));
        const swaps = await model.listForBooking(Number(b_id));

        return res.send({
            result: true,
            message: 'Swap quote',
            swap_number: pricing.swap_number,
            is_free: pricing.is_free,
            charge: pricing.charge,
            free_swaps_allowed: 1,
            charge_per_extra_swap: model.SWAP_CHARGE,
            swaps_done: swaps.length,
            list: swaps,
        });
    } catch (error) {
        logger.error('getSwapQuote error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};
