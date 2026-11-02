var model = require('../model/listnotification');
const logger = require('../util/logger');


module.exports.listNotification = async (req, res) => {
    try {
        let { u_id, role } = req.user || {}
        let { type } = req.body || {}

        // A franchise-admin sits on the admin side: notifications are
        // addressed to them by admin_id. Before this, 'franchise_admin'
        // matched neither branch and fell through with an empty condition,
        // returning every notification in the system.
        const isAdminSide = role === 'admin' || role === 'franchise_admin';
        const isUserSide = role === 'user';

        let condition = '';
        const params = [];

        if (isAdminSide) {
            condition = 'where admin_id = ?';
            params.push(u_id);
        } else if (isUserSide) {
            condition = 'where user_id = ?';
            params.push(u_id);
        } else {
            // Unknown role — never fall through to "show everything".
            condition = 'where 1 = 0';
        }

        if (type && (isAdminSide || isUserSide)) {
            condition += ' and type = ?';
            params.push(type);
        }

        let listNotification = await model.listNotificationQuery(condition, params);
        if (listNotification.length > 0) {
            return res.send({
                result: true,
                message: "data retrived",
                list: listNotification
            });

        } else {
            return res.send({
                result: false,
                message: "data not found"
            })
        }
    } catch (error) {
        logger.error("Error in listNotification: ", error);
        return res.send({
            result: false,
            message: error.message,
        });


    }
}