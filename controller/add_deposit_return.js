const model = require('../model/depositReturn');
const bookingModel = require('../model/booking');
const logger = require('../util/logger');

module.exports.addDepositReturn = async (req, res) => {
    try {
        const { b_id, gpay_ref_number, gpay_screenshot_url, amount, notes } = req.body;
        const { u_id } = req.user || {};

        // Validate required fields
        if (!b_id || !gpay_ref_number || !amount) {
            return res.send({
                result: false,
                message: 'b_id, gpay_ref_number and amount are required',
            });
        }

        // Sanitize and validate
        const bookingId = Number(b_id);
        const gpayRef = String(gpay_ref_number).trim().substring(0, 100);
        const amountNum = Number(amount);
        const adminId = Number(u_id);

        if (!bookingId || isNaN(bookingId)) {
            return res.send({ result: false, message: 'Invalid b_id' });
        }
        if (!gpayRef || gpayRef.length < 3) {
            return res.send({ result: false, message: 'gpay_ref_number must be at least 3 characters' });
        }
        if (!amountNum || isNaN(amountNum) || amountNum <= 0) {
            return res.send({ result: false, message: 'amount must be a positive number' });
        }
        if (!adminId) {
            return res.send({ result: false, message: 'Admin user not found in request' });
        }

        // Check booking exists
        const booking = await bookingModel.getUserIdByBooking(bookingId);
        if (!booking || booking.length === 0) {
            logger.warn('addDepositReturn: booking %s not found', bookingId);
            return res.send({ result: false, message: 'Booking not found' });
        }

        // Check if deposit already returned for this booking
        const alreadyReturned = await model.hasDepositReturn(bookingId);
        if (alreadyReturned) {
            return res.send({
                result: false,
                message: 'Deposit already returned for this booking',
            });
        }

        // Insert deposit_returns record
        const notesEscaped = notes ? String(notes).replace(/'/g, "''").substring(0, 1000) : null;
        const screenshotUrl = gpay_screenshot_url ? String(gpay_screenshot_url).trim().substring(0, 500) : null;

        const result = await model.addDepositReturn(
            bookingId,
            gpayRef,
            screenshotUrl,
            amountNum,
            adminId,
            notesEscaped
        );

        if (result.affectedRows === 0) {
            logger.error('addDepositReturn: insert failed for booking %s', bookingId);
            return res.send({ result: false, message: 'Failed to record deposit return' });
        }

        logger.info('Deposit return recorded', {
            booking_id: bookingId,
            gpay_ref: gpayRef,
            amount: amountNum,
            admin_id: adminId,
        });

        return res.send({
            result: true,
            message: 'Deposit return recorded successfully',
            dr_id: result.insertId,
            booking_id: bookingId,
            gpay_ref: gpayRef,
            amount: amountNum,
        });
    } catch (error) {
        logger.error('addDepositReturn error: ', error);
        return res.send({
            result: false,
            message: error.message,
        });
    }
};