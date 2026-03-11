var model = require('../model/listnotification');
const logger = require('../util/logger');


module.exports.listNotification = async (req, res) => {
    try {
        let { u_id, role } = req.user || {}
        let { type } = req.body || {}
        var condition = ''
        if (role === 'admin') {
            condition = `where admin_id ='${u_id}'`
        }
        if (role === 'user') {
            condition = `where user_id ='${u_id}'`
        }
        if (role === 'admin' && type) {
            condition = `where admin_id ='${u_id}' and type ='${type}'`
        }
        if (role === 'user' && type) {
            condition = `where user_id ='${u_id}' and type ='${type}'`
        }
        let listNotification = await model.listNotificationQuery(condition);
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