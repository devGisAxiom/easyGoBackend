const model = require('../model/penalty');
const bookingModel = require('../model/booking');
const logger = require('../util/logger');
const { assertFranchiseAccess, isFranchiseAdmin } = require('../util/franchiseScope');

/**
 * Add a penalty (damage, traffic fine, missing helmet…) against a booking.
 *
 * Penalties are deducted from the customer's security deposit and flow into
 * the final-bill calculation.
 */
module.exports.addPenalty = async (req, res) => {
    try {
        const { b_id, type, amount, notes } = req.body || {};
        const { u_id } = req.user || {};

        if (!b_id || amount === undefined || amount === null || amount === '') {
            return res.send({
                result: false,
                message: 'b_id and amount are required',
            });
        }

        const bookingId = Number(b_id);
        const amountNum = Number(amount);

        if (!bookingId || isNaN(bookingId)) {
            return res.send({ result: false, message: 'Invalid b_id' });
        }
        if (isNaN(amountNum) || amountNum < 0) {
            return res.send({ result: false, message: 'amount must be a positive number' });
        }

        const penaltyType = model.PENALTY_TYPES.includes(type) ? type : 'other';

        const booking = await bookingModel.getUserIdByBooking(bookingId);
        if (!booking || booking.length === 0) {
            logger.warn('addPenalty: booking %s not found', bookingId);
            return res.send({ result: false, message: 'Booking not found' });
        }

        // Franchise guard.
        const access = assertFranchiseAccess(req.user, booking[0].b_franchise_id);
        if (!access.allowed) {
            return res.send({
                result: false,
                code: 'FRANCHISE_FORBIDDEN',
                message: access.message,
            });
        }

        // Penalties are only meaningful once the vehicle has been issued.
        const allowedStatuses = ['onride', 'completed'];
        const status = String(booking[0].b_status || '').toLowerCase();
        if (!allowedStatuses.includes(status)) {
            return res.send({
                result: false,
                message: `A penalty cannot be added to a booking with status "${booking[0].b_status}"`,
            });
        }

        const result = await model.addPenalty({
            booking_id: bookingId,
            type: penaltyType,
            amount: amountNum,
            notes: notes ? String(notes).trim().substring(0, 1000) : null,
            added_by: Number(u_id),
        });

        if (result.affectedRows === 0) {
            return res.send({ result: false, message: 'Failed to add penalty' });
        }

        const totalPenalties = await model.getTotalForBooking(bookingId);

        logger.info('Penalty added', {
            pn_id: result.insertId,
            booking_id: bookingId,
            type: penaltyType,
            amount: amountNum,
        });

        return res.send({
            result: true,
            message: 'Penalty recorded successfully',
            pn_id: result.insertId,
            booking_id: bookingId,
            amount: amountNum,
            total_penalties: totalPenalties,
        });
    } catch (error) {
        logger.error('addPenalty error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * List the penalties on one booking.
 */
module.exports.listForBooking = async (req, res) => {
    try {
        const { b_id } = req.body || {};

        if (!b_id) {
            return res.send({ result: false, message: 'b_id is required' });
        }

        const booking = await bookingModel.getUserIdByBooking(Number(b_id));
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

        const list = await model.listForBooking(Number(b_id));
        const total = await model.getTotalForBooking(Number(b_id));

        return res.send({
            result: true,
            message: list.length ? 'Penalties retrieved' : 'No data',
            count: list.length,
            total_amount: total,
            list,
        });
    } catch (error) {
        logger.error('listForBooking error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * List penalties across all bookings.
 */
module.exports.listPenalties = async (req, res) => {
    try {
        const { from_date, to_date, booking_id } = req.body || {};

        const franchiseId = isFranchiseAdmin(req.user)
            ? Number(req.user.franchise_id)
            : null;

        const list = await model.listPenalties({
            from_date: from_date || null,
            to_date: to_date || null,
            franchise_id: franchiseId,
            booking_id: booking_id ? Number(booking_id) : null,
        });

        const total = list.reduce((sum, r) => sum + Number(r.pn_amount || 0), 0);

        return res.send({
            result: true,
            message: list.length ? 'Penalties retrieved' : 'No data',
            count: list.length,
            total_amount: Number(total.toFixed(2)),
            penalty_types: model.PENALTY_TYPES,
            list,
        });
    } catch (error) {
        logger.error('listPenalties error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * Delete a penalty (super-admin only, for corrections).
 */
module.exports.deletePenalty = async (req, res) => {
    try {
        const { pn_id } = req.body || {};

        if (!pn_id) {
            return res.send({ result: false, message: 'pn_id is required' });
        }

        const existing = await model.getPenaltyById(pn_id);
        if (!existing) {
            return res.send({ result: false, message: 'Penalty not found' });
        }

        const result = await model.deletePenalty(pn_id);
        if (result.affectedRows === 0) {
            return res.send({ result: false, message: 'Failed to delete penalty' });
        }

        logger.info('Penalty deleted', { pn_id });
        return res.send({ result: true, message: 'Penalty deleted successfully' });
    } catch (error) {
        logger.error('deletePenalty error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};
