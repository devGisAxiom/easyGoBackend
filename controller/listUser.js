const model = require('../model/listUser');
const logger = require('../util/logger');

/*
 * List Users
 */
module.exports.listUser = async (req, res) => {
    try {
        const { role, u_id } = req.user || {};
        const { user_id } = req.body || {};

        logger.info("ListUser API called", {
            requester: u_id,
            role,
            filterUserId: user_id || null
        });

        let condition = {};

        if (role === 'admin') {
            if (user_id) {
                condition.u_id = user_id;
            }
        } else {
            // Non-admin can only view own data
            condition.u_id = u_id;
        }

        const listUser = await model.listUserQuery(condition);

        if (listUser?.length > 0) {
            logger.info("Users retrieved successfully", {
                count: listUser.length
            });

            return res.send({
                result: true,
                message: "Data retrieved successfully",
                list: listUser
            });
        }

        logger.warn("ListUser: Data not found", { condition });
        return res.send({
            result: false,
            message: "Data not found"
        });

    } catch (error) {
        logger.error("ListUser error", { error: error.message });
        return res.send({
            result: false,
            message: "Internal server error"
        });
    }
};

/**
 * Delete User
 */
module.exports.deleteUser = async (req, res) => {
    try {
        const { role, u_id } = req.user || {};   // 🔧 fixed
        const { user_id } = req.body || {};

        logger.info("DeleteUser API called", {
            requester: u_id,
            role,
            targetUserId: user_id
        });

        if (!user_id) {
            logger.warn("DeleteUser failed: user_id missing");
            return res.send({
                result: false,
                message: "user_id is required"
            });
        }

        // Only admin can delete users
        if (role !== 'admin') {
            logger.warn("Unauthorized delete attempt", {
                requester: u_id,
                targetUserId: user_id
            });
            return res.send({
                result: false,
                message: "Unauthorized access"
            });
        }

        const result = await model.deleteUserQuery(user_id);

        if (result?.affectedRows > 0) {
            logger.info("User deleted successfully", { user_id });
            return res.send({
                result: true,
                message: "User deleted successfully"
            });
        }

        logger.warn("DeleteUser: User not found", { user_id });
        return res.send({
            result: false,
            message: "User not found"
        });

    } catch (error) {
        logger.error("DeleteUser error", { error: error.message });
        return res.send({
            result: false,
            message: "Internal server error"
        });
    }
};

/**
 * List Admin Contacts
 */

module.exports.listAdmincontact = async (req, res) => {
    try {
        logger.info("ListAdminContact API called");

        const listAdminContact = await model.listAdminContactQuery();

        if (listAdminContact?.length > 0) {
            logger.info("Admin contacts retrieved", {
                count: listAdminContact.length
            });

            return res.send({
                result: true,
                message: "Data retrieved successfully",
                list: listAdminContact
            });
        }

        logger.warn("ListAdminContact: Data not found");
        return res.send({
            result: false,
            message: "Data not found"
        });

    } catch (error) {
        logger.error("ListAdminContact error", { error: error.message });
        return res.send({
            result: false,
            message: "Internal server error"
        });
    }
};
