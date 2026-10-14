const model = require('../model/depositReturn');
const logger = require('../util/logger');

module.exports.listDepositReturns = async (req, res) => {
    try {
        const { from_date, to_date } = req.body || {};

        // Build date filter
        const conditions = [];
        const params = [];

        if (from_date) {
            conditions.push('DATE(dr.dr_returned_at) >= ?');
            params.push(from_date);
        }
        if (to_date) {
            conditions.push('DATE(dr.dr_returned_at) <= ?');
            params.push(to_date);
        }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        // Direct query with full booking + customer + bike joins
        const Query = `
            SELECT
                dr.dr_id,
                dr.dr_booking_id,
                dr.dr_gpay_ref_number,
                dr.dr_amount AS deposit_returned_amount,
                dr.dr_returned_at,
                dr.dr_notes,
                dr.dr_gpay_screenshot_url,
                b.b_id AS booking_id,
                b.b_rent_amount,
                b.b_total_amount,
                b.b_payment_status,
                b.b_status AS booking_status,
                b.b_pickup_date,
                b.b_drop_date,
                u_customer.u_id AS customer_id,
                u_customer.u_name AS customer_name,
                u_customer.u_mobile AS customer_mobile,
                u_customer.u_email AS customer_email,
                bk.b_name AS bike_name,
                bk.vehicle_number,
                u_admin.u_name AS returned_by_name
            FROM deposit_returns dr
            JOIN bookings b ON b.b_id = dr.dr_booking_id
            LEFT JOIN user u_customer ON u_customer.u_id = b.b_u_id
            LEFT JOIN bikes bk ON bk.b_id = b.b_bk_id
            LEFT JOIN user u_admin ON u_admin.u_id = dr.dr_returned_by
            ${where}
            ORDER BY dr.dr_returned_at DESC
        `;

        const data = await model.listDepositReturns(from_date, to_date);

        return res.send({
            result: true,
            message: data.length > 0 ? 'Deposit returns retrieved' : 'NoNo data',
            count: data.length,
            list: data,
        });
    } catch (error) {
        logger.error('listDepositReturns error: ', error);
        return res.send({
            result: false,
            message: error.message,
        });
    }
};

// Single booking deposit return (used by admin panel to show "Already returned" or pre-fill dialog)
module.exports.getDepositReturn = async (req, res) => {
    try {
        const { b_id } = req.body || {};
        if (!b_id) {
            return res.send({ result: false, message: 'b_id is required' });
        }
        const data = await model.getDepositReturnByBooking(Number(b_id));
        return res.send({
            result: true,
            message: data.length > 0 ? 'Deposit return found' : 'No return recorded',
            list: data,
            count: data.length,
        });
    } catch (error) {
        logger.error('getDepositReturn error: ', error);
        return res.send({ result: false, message: error.message });
    }
};