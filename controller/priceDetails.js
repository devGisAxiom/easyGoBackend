const model = require('../model/priceDetails');
const logger = require('../util/logger');

module.exports.AddPriceDetails = async (req, res) => {
    try {
        logger.info('AddPriceDetails API called', { body: req.body });

        const { rent_time, duration_text, rent, deposit } = req.body;

        if (!rent_time || !duration_text || !rent || !deposit) {
            logger.warn('AddPriceDetails validation failed');
            return res.send({
                result: false,
                message: "All Price details are required.",
            });
        }

        const computedGst = parseFloat((parseFloat(rent) * 0.05).toFixed(2));
        const computedTotal = parseFloat((parseFloat(rent) + computedGst + parseFloat(deposit)).toFixed(2));

        const newPriceDetails = await model.AddPriceDetails(
            rent_time, duration_text, rent, computedGst, deposit, computedTotal
        );

        if (newPriceDetails.insertId) {
            logger.info('Price Details added successfully', { insertId: newPriceDetails.insertId });
            return res.send({
                result: true,
                message: "Price Details added successfully"
            });
        } else {
            logger.warn('Failed to add Price Details');
            return res.send({
                result: false,
                message: "Failed to add price details",
            });
        }

    } catch (error) {
        logger.error('AddPriceDetails error', error);
        return res.send({
            result: false,
            message: "Unexpected server error.",
            data: error.message,
        });
    }
};

module.exports.ListPriceDetails = async (req, res) => {
    try {
        logger.info('ListPriceDetails API called');

        let PriceDetailslist = await model.ListPriceDetails();

        if (PriceDetailslist.length > 0) {
            logger.info('Price Details retrieved', { count: PriceDetailslist.length });
            return res.send({
                result: true,
                message: "Data retrieved",
                list: PriceDetailslist,
            });
        } else {
            logger.warn('No Price Details found');
            return res.send({
                result: false,
                message: "Data not found",
            });
        }
    } catch (error) {
        logger.error('ListPriceDetails error', error);
        return res.send({
            result: false,
            message: error.message,
        });
    }
};

module.exports.EditPriceDetails = async (req, res) => {
    try {
        logger.info('EditPriceDetails API called', { body: req.body });

        const { price_id, rent_time, duration_text, rent, deposit } = req.body;

        if (!price_id) {
            logger.warn('EditPriceDetails: price_id missing');
            return res.send({
                result: false,
                message: "Price Details ID is required.",
            });
        }

        const checkPrice = await model.checkPriceDetails(price_id);
        if (checkPrice.length === 0) {
            logger.warn('EditPriceDetails: Price Details not found', { price_id });
            return res.send({
                result: false,
                message: "Price Details not found.",
            });
        }

        const existingRent = parseFloat(checkPrice[0].rent_amount);
        const existingDeposit = parseFloat(checkPrice[0].rent_deposit);
        const newRent = rent ? parseFloat(rent) : existingRent;
        const newDeposit = deposit ? parseFloat(deposit) : existingDeposit;
        const computedGst = parseFloat((newRent * 0.05).toFixed(2));
        const computedTotal = parseFloat((newRent + computedGst + newDeposit).toFixed(2));

        let updates = [];
        if (rent_time) updates.push(`rent_duration='${rent_time}'`);
        if (duration_text) updates.push(`rent_duration_text='${duration_text}'`);
        if (rent) updates.push(`rent_amount='${rent}'`);
        if (deposit) updates.push(`rent_deposit='${deposit}'`);
        if (rent || deposit) {
            updates.push(`rent_gst='${computedGst}'`);
            updates.push(`rent_total='${computedTotal}'`);
        }

        if (updates.length > 0) {
            let updateQuery = `SET ${updates.join(', ')}`;
            let updateResult = await model.updatedPriceDetails(updateQuery, price_id);

            if (updateResult.affectedRows > 0) {
                logger.info('Price Details updated successfully', { price_id });
                return res.send({
                    result: true,
                    message: "Price Details updated successfully"
                });
            } else {
                logger.warn('EditPriceDetails update failed', { price_id });
                return res.send({
                    result: false,
                    message: "Failed to update Price Details"
                });
            }
        } else {
            logger.warn('EditPriceDetails: No fields to update', { price_id });
            return res.send({
                result: false,
                message: "No fields to update"
            });
        }

    } catch (error) {
        logger.error('EditPriceDetails error', error);
        return res.send({
            result: false,
            message: "Unexpected server error.",
            data: error.message,
        });
    }
};

module.exports.DeletePriceDetails = async (req, res) => {
    try {
        logger.info('DeletePriceDetails API called', { body: req.body });

        let { pd_id } = req.body || {};

        if (!pd_id) {
            logger.warn('DeletePriceDetails: pd_id missing');
            return res.send({
                result: false,
                message: "price id is required"
            });
        }

        let checkPrice = await model.checkPriceDetails(pd_id);

        if (checkPrice.length > 0) {
            let deleteResult = await model.deletepriceDetails(pd_id);

            if (deleteResult.affectedRows > 0) {
                logger.info('Price Details deleted successfully', { pd_id });
                return res.send({
                    result: true,
                    message: "Price Details deleted successfully",
                });
            } else {
                logger.warn('DeletePriceDetails failed', { pd_id });
                return res.send({
                    result: false,
                    message: "Failed to delete Price Details",
                });
            }
        } else {
            logger.warn('DeletePriceDetails: data not found', { pd_id });
            return res.send({
                result: false,
                message: "Price Details data not found",
            });
        }
    } catch (error) {
        logger.error('DeletePriceDetails error', error);
        return res.send({
            result: false,
            message: error.message,
        });
    }
};
