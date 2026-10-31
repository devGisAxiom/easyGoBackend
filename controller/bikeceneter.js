var model = require('../model/bikecenter')
const logger = require('../util/logger');
const { getScope, assertFranchiseAccess, isFranchiseAdmin } = require('../util/franchiseScope');

module.exports.addbikecenter = async (req, res) => {
    try {

        let { location, district, latitude, longitude, franchise_id } = req.body;

        if (!location || !district) {
            logger.warn("addbikecenter failed: insufficient parameters");
            return res.send({
                result: false,
                message: "insuffcent parameter"
            });
        }

        // A franchise-admin's pickup locations belong to their own franchise.
        let centerFranchiseId = franchise_id || null;
        if (isFranchiseAdmin(req.user)) {
            centerFranchiseId = Number(req.user.franchise_id);
        }

        let addbike = await model.AddBikeCenterQuery(location, district, latitude, longitude, centerFranchiseId);
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
            message: "Internal server error.",
            data: error.message
        })
    }

}
module.exports.listcenter = async (req, res) => {
    try {
        let { l_id } = req.body || {}

        var condition = "";
        const params = [];

        if (l_id) {
            condition = `WHERE lc.l_id = ?`;
            params.push(Number(l_id));
        }

        // Franchise-admin only sees their own franchise's pickup locations.
        const scope = getScope(req.user, 'lc.l_franchise_id');
        if (scope.clause) {
            condition = condition
                ? `${condition} AND ${scope.clause}`
                : `WHERE ${scope.clause}`;
            params.push(...scope.params);
        }

        let listcenter = await model.listcenterQuery(condition, params);

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
                // Franchise guard — a franchise-admin must not delete another
                // franchise's pickup location.
                const access = assertFranchiseAccess(req.user, checkcenter[0].l_franchise_id);
                if (!access.allowed) {
                    return res.send({
                        result: false,
                        code: 'FRANCHISE_FORBIDDEN',
                        message: access.message,
                    });
                }

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
        let { l_id, location, district, franchise_id } = req.body;

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

        // Franchise guard — a franchise-admin must not edit another
        // franchise's pickup location.
        const access = assertFranchiseAccess(req.user, checkcenter[0].l_franchise_id);
        if (!access.allowed) {
            return res.send({
                result: false,
                code: 'FRANCHISE_FORBIDDEN',
                message: access.message,
            });
        }

        // Update center
        let updatecenter = await model.updatecenterQuery(l_id, location, district, franchise_id);
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
