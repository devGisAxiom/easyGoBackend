const model = require('../model/manualPayment');
const bookingModel = require('../model/booking');
const logger = require('../util/logger');
const { assertFranchiseAccess, isFranchiseAdmin } = require('../util/franchiseScope');

const PAYMENT_MODES = ['cash', 'upi_offline', 'bank_transfer'];

/**
 * Record a manual (offline) payment against a booking.
 */
module.exports.addManualPayment = async (req, res) => {
    try {
        const { b_id, amount, mode, reference, notes, screenshot_url } = req.body || {};
        const { u_id } = req.user || {};

        if (!b_id || !amount) {
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
        if (isNaN(amountNum) || amountNum <= 0) {
            return res.send({ result: false, message: 'amount must be a positive number' });
        }

        const paymentMode = PAYMENT_MODES.includes(mode) ? mode : 'cash';

        const booking = await bookingModel.getUserIdByBooking(bookingId);
        if (!booking || booking.length === 0) {
            logger.warn('addManualPayment: booking %s not found', bookingId);
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

        // Only accept money against bookings that have actually been issued.
        const allowedStatuses = ['approved', 'onride', 'completed'];
        const status = String(booking[0].b_status || '').toLowerCase();
        if (!allowedStatuses.includes(status)) {
            return res.send({
                result: false,
                message: `A manual payment cannot be recorded against a booking with status "${booking[0].b_status}"`,
            });
        }

        const result = await model.addManualPayment({
            booking_id: bookingId,
            amount: amountNum,
            mode: paymentMode,
            reference: reference ? String(reference).trim().substring(0, 200) : null,
            collected_by: Number(u_id),
            notes: notes ? String(notes).trim().substring(0, 1000) : null,
            screenshot_url: screenshot_url ? String(screenshot_url).trim().substring(0, 500) : null,
        });

        if (result.affectedRows === 0) {
            return res.send({ result: false, message: 'Failed to record manual payment' });
        }

        logger.info('Manual payment recorded', {
            mp_id: result.insertId,
            booking_id: bookingId,
            amount: amountNum,
            mode: paymentMode,
        });

        return res.send({
            result: true,
            message: 'Manual payment recorded successfully',
            mp_id: result.insertId,
            booking_id: bookingId,
            amount: amountNum,
        });
    } catch (error) {
        logger.error('addManualPayment error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * List manual payments.
 */
module.exports.listManualPayments = async (req, res) => {
    try {
        const { from_date, to_date, booking_id } = req.body || {};

        const franchiseId = isFranchiseAdmin(req.user)
            ? Number(req.user.franchise_id)
            : null;

        const list = await model.listManualPayments({
            from_date: from_date || null,
            to_date: to_date || null,
            franchise_id: franchiseId,
            booking_id: booking_id ? Number(booking_id) : null,
        });

        const totalsByMode = await model.getTotalsByMode({
            from_date: from_date || null,
            to_date: to_date || null,
            franchise_id: franchiseId,
        });

        const total = list.reduce((sum, r) => sum + Number(r.mp_amount || 0), 0);

        return res.send({
            result: true,
            message: list.length ? 'Manual payments retrieved' : 'No data',
            count: list.length,
            total_amount: Number(total.toFixed(2)),
            totals_by_mode: totalsByMode,
            list,
        });
    } catch (error) {
        logger.error('listManualPayments error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * Delete a manual payment (super-admin only, for corrections).
 */
module.exports.deleteManualPayment = async (req, res) => {
    try {
        const { mp_id } = req.body || {};

        if (!mp_id) {
            return res.send({ result: false, message: 'mp_id is required' });
        }

        const existing = await model.getManualPaymentById(mp_id);
        if (!existing) {
            return res.send({ result: false, message: 'Manual payment not found' });
        }

        const result = await model.deleteManualPayment(mp_id);
        if (result.affectedRows === 0) {
            return res.send({ result: false, message: 'Failed to delete manual payment' });
        }

        logger.info('Manual payment deleted', { mp_id });
        return res.send({ result: true, message: 'Manual payment deleted successfully' });
    } catch (error) {
        logger.error('deleteManualPayment error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

module.exports.PAYMENT_MODES = PAYMENT_MODES;
