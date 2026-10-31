const model = require('../model/depositReturn');
const logger = require('../util/logger');
const { isFranchiseAdmin } = require('../util/franchiseScope');

module.exports.listDepositReturns = async (req, res) => {
    try {
        const { from_date, to_date } = req.body || {};

        // Franchise-admin only sees their own franchise's deposit returns.
        const franchiseId = isFranchiseAdmin(req.user)
            ? Number(req.user.franchise_id)
            : null;

        const data = await model.listDepositReturns(from_date, to_date, franchiseId);


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