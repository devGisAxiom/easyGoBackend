const model = require('../model/feedback');
const bookingModel = require('../model/booking');
const logger = require('../util/logger');
const { assertFranchiseAccess } = require('../util/franchiseScope');

/**
 * Customer feedback.
 *
 * Separate from bike_reviews (star ratings against a specific vehicle) — this
 * captures app issues, service feedback, suggestions and complaints.
 */

/**
 * Submit feedback (customer).
 */
module.exports.addFeedback = async (req, res) => {
    try {
        const { u_id } = req.user || {};
        const { booking_id, type, message, rating } = req.body || {};

        if (!message || !String(message).trim()) {
            return res.send({
                result: false,
                message: 'Please enter your feedback',
            });
        }

        const feedbackType = model.FEEDBACK_TYPES.includes(type) ? type : 'suggestion';

        let ratingNum = null;
        if (rating !== undefined && rating !== null && rating !== '') {
            ratingNum = Number(rating);
            if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
                ratingNum = null;
            }
        }

        // If the feedback is tied to a booking, make sure the customer owns it.
        let bookingId = null;
        if (booking_id) {
            const booking = await bookingModel.getUserIdByBooking(Number(booking_id));
            if (!booking || booking.length === 0) {
                return res.send({ result: false, message: 'Booking not found' });
            }
            if (Number(booking[0].b_u_id) !== Number(u_id)) {
                return res.send({
                    result: false,
                    message: 'You can only leave feedback for your own booking',
                });
            }
            bookingId = Number(booking_id);
        }

        const result = await model.addFeedback({
            u_id: Number(u_id),
            booking_id: bookingId,
            type: feedbackType,
            message: String(message).trim().substring(0, 2000),
            rating: ratingNum,
        });

        if (result.affectedRows === 0) {
            return res.send({ result: false, message: 'Failed to submit feedback' });
        }

        logger.info('Feedback submitted', { fb_id: result.insertId, u_id, type: feedbackType });

        return res.send({
            result: true,
            message: 'Thank you for your feedback!',
            fb_id: result.insertId,
        });
    } catch (error) {
        logger.error('addFeedback error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * List feedback (admin).
 */
module.exports.listFeedback = async (req, res) => {
    try {
        const { status, type, from_date, to_date } = req.body || {};

        const list = await model.listFeedback({
            status: status || null,
            type: type || null,
            from_date: from_date || null,
            to_date: to_date || null,
        });

        const stats = await model.getStats();

        return res.send({
            result: true,
            message: list.length ? 'Feedback retrieved' : 'No data',
            count: list.length,
            stats,
            feedback_types: model.FEEDBACK_TYPES,
            list,
        });
    } catch (error) {
        logger.error('listFeedback error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * Feedback submitted by the signed-in customer.
 */
module.exports.listMyFeedback = async (req, res) => {
    try {
        const { u_id } = req.user || {};
        const list = await model.listForUser(Number(u_id));

        return res.send({
            result: true,
            message: list.length ? 'Feedback retrieved' : 'No data',
            count: list.length,
            list,
        });
    } catch (error) {
        logger.error('listMyFeedback error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * Update the status of a feedback item (admin).
 */
module.exports.updateFeedbackStatus = async (req, res) => {
    try {
        const { fb_id, status } = req.body || {};

        if (!fb_id || !status) {
            return res.send({ result: false, message: 'fb_id and status are required' });
        }

        const allowed = ['open', 'reviewed', 'resolved', 'closed'];
        if (!allowed.includes(status)) {
            return res.send({
                result: false,
                message: `status must be one of: ${allowed.join(', ')}`,
            });
        }

        const existing = await model.getFeedbackById(fb_id);
        if (!existing) {
            return res.send({ result: false, message: 'Feedback not found' });
        }

        await model.updateFeedbackStatus(Number(fb_id), status);

        logger.info('Feedback status updated', { fb_id, status });
        return res.send({ result: true, message: 'Feedback updated successfully' });
    } catch (error) {
        logger.error('updateFeedbackStatus error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * Delete a feedback item (admin).
 */
module.exports.deleteFeedback = async (req, res) => {
    try {
        const { fb_id } = req.body || {};

        if (!fb_id) {
            return res.send({ result: false, message: 'fb_id is required' });
        }

        const existing = await model.getFeedbackById(fb_id);
        if (!existing) {
            return res.send({ result: false, message: 'Feedback not found' });
        }

        const result = await model.deleteFeedback(Number(fb_id));
        if (result.affectedRows === 0) {
            return res.send({ result: false, message: 'Failed to delete feedback' });
        }

        logger.info('Feedback deleted', { fb_id });
        return res.send({ result: true, message: 'Feedback deleted successfully' });
    } catch (error) {
        logger.error('deleteFeedback error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};
