var model = require('../model/bikecenter')
const logger = require('../util/logger');

module.exports.addbikecenter = async (req, res) => {
    try {

        let { location, district, latitude, longitude } = req.body;

        if (!location || !district) {
            logger.warn("addbikecenter failed: insufficient parameters");
            return res.send({
                result: false,
                message: "insufficent parameter"
            });
        }

        let addbike = await model.AddBikeCenterQuery(location, district, latitude, longitude);
        if (addbike.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Bike  location added successfully"
            });
        } else {
            logger.error("addbikecenter failed: database insert failed");
            return res.send({
                result: false,
                message: "Failed to add bike center"
            });
        }

    } catch (error) {

        logger.error("Error in addbikecenter: ", error);
        return res.send({
            result: false,
            message: "Internal server error",
            data: error.message
        })
    }

}
module.exports.listcenter = async (req, res) => {
    try {
        let { l_id } = req.body || {}

        var condition = ""
        if (l_id) {
            condition = `where l_id='${l_id}'`
        }

        let listcenter = await model.listcenterQuery(condition);
        if (listcenter.length > 0) {
            return res.send({
                result: true,
                message: "data retrieved",
                list: listcenter
            });

        } else {
            return res.send({
                result: false,
                messsage: "data not found",
            });
        }
    }

    catch (error) {
        return res.send({
            result: false,
            message: error.message,
        });

    }
}
module.exports.deletecenter = async (req, res) => {
    try {
        let l_id = req.body.l_id;

        if (l_id) {
            let checkcenter = await model.checkcenterQuery(l_id);
            if (checkcenter.length == 0) {
                return res.send({
                    result: false,
                    message: "Center details not found"
                })
            } else {
                var deletesection = await model.removecenterQuery(l_id);
                if (deletesection.affectedRows > 0)
                    return res.send({
                        result: true,
                        message: "center list deleted successfully"
                    })
            }

        }


    } catch (error) {
        return res.send({
            result: false,
            message: error.message,

        })

    }

}

module.exports.editcenter = async (req, res) => {
    try {
        let { l_id, location, district } = req.body;

        // Check required parameters
        if (!l_id || !location || !district) {
            return res.send({
                result: false,
                message: "Insufficient parameters"
            });
        }

        // Check if center exists
        let checkcenter = await model.checkcenterQuery(l_id);
        if (checkcenter.length === 0) {
            return res.send({
                result: false,
                message: "Center details not found"
            });
        }

        // Update center
        let updatecenter = await model.updatecenterQuery(l_id, location, district);
        if (updatecenter.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Center updated successfully"
            });
        } else {
            return res.send({
                result: false,
                message: "Failed to update center"
            });
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};
