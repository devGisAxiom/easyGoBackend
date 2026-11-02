const model = require('../model/franchise');
const db = require('../config/db');
const util = require('util');
const logger = require('../util/logger');
const { isSuperAdmin, isFranchiseAdmin } = require('../util/franchiseScope');

const query = util.promisify(db.query).bind(db);

/**
 * List franchises.
 *  - super-admin      -> all franchises
 *  - franchise-admin  -> only their own franchise
 */
module.exports.listFranchises = async (req, res) => {
    try {
        const onlyActive = String(req.body?.only_active || '') === 'true';

        if (isFranchiseAdmin(req.user)) {
            const own = await model.getFranchiseById(req.user.franchise_id);
            return res.send({
                result: true,
                message: own ? 'Franchise retrieved' : 'No data',
                count: own ? 1 : 0,
                list: own ? [own] : [],
            });
        }

        const list = await model.listFranchises(onlyActive);
        return res.send({
            result: true,
            message: list.length ? 'Franchises retrieved' : 'No data',
            count: list.length,
            list,
        });
    } catch (error) {
        logger.error('listFranchises error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * Create a franchise.
 */
module.exports.addFranchise = async (req, res) => {
    try {
        const {
            fr_code, fr_name, fr_location, fr_district,
            fr_contact_name, fr_contact_phone, fr_contact_email, fr_status,
        } = req.body || {};

        if (!fr_code || !fr_name) {
            return res.send({
                result: false,
                message: 'fr_code and fr_name are required',
            });
        }

        const code = String(fr_code).trim().toUpperCase();
        if (!/^[A-Z0-9_-]{2,50}$/.test(code)) {
            return res.send({
                result: false,
                message: 'fr_code must be 2-50 characters using letters, numbers, dash or underscore',
            });
        }

        const existing = await model.getFranchiseByCode(code);
        if (existing) {
            return res.send({
                result: false,
                message: `A franchise with code "${code}" already exists`,
            });
        }

        const result = await model.createFranchise({
            fr_code: code,
            fr_name: String(fr_name).trim(),
            fr_location,
            fr_district,
            fr_contact_name,
            fr_contact_phone,
            fr_contact_email,
            fr_status,
        });

        if (result.affectedRows === 0) {
            return res.send({ result: false, message: 'Failed to create franchise' });
        }

        logger.info('Franchise created', { fr_id: result.insertId, fr_code: code });
        return res.send({
            result: true,
            message: 'Franchise created successfully',
            fr_id: result.insertId,
        });
    } catch (error) {
        logger.error('addFranchise error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * Edit a franchise.
 */
module.exports.editFranchise = async (req, res) => {
    try {
        const { fr_id } = req.body || {};

        if (!fr_id) {
            return res.send({ result: false, message: 'fr_id is required' });
        }

        const existing = await model.getFranchiseById(fr_id);
        if (!existing) {
            return res.send({ result: false, message: 'Franchise not found' });
        }

        const fields = {};
        for (const key of [
            'fr_code', 'fr_name', 'fr_location', 'fr_district',
            'fr_contact_name', 'fr_contact_phone', 'fr_contact_email', 'fr_status',
        ]) {
            if (req.body[key] !== undefined) fields[key] = req.body[key];
        }

        if (fields.fr_code) {
            fields.fr_code = String(fields.fr_code).trim().toUpperCase();
            const clash = await model.getFranchiseByCode(fields.fr_code);
            if (clash && clash.fr_id !== Number(fr_id)) {
                return res.send({
                    result: false,
                    message: `A franchise with code "${fields.fr_code}" already exists`,
                });
            }
        }

        const result = await model.updateFranchise(fr_id, fields);
        if (result.affectedRows === 0) {
            return res.send({ result: false, message: 'No fields to update' });
        }

        logger.info('Franchise updated', { fr_id });
        return res.send({ result: true, message: 'Franchise updated successfully' });
    } catch (error) {
        logger.error('editFranchise error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * Delete a franchise. Blocked while it still owns operational data.
 */
module.exports.deleteFranchise = async (req, res) => {
    try {
        const { fr_id } = req.body || {};

        if (!fr_id) {
            return res.send({ result: false, message: 'fr_id is required' });
        }

        const existing = await model.getFranchiseById(fr_id);
        if (!existing) {
            return res.send({ result: false, message: 'Franchise not found' });
        }

        if (existing.fr_code === 'EASYGO') {
            return res.send({
                result: false,
                message: 'The default franchise cannot be deleted',
            });
        }

        const usage = await model.getFranchiseUsage(fr_id);
        const total = usage.bookings + usage.bikes + usage.locations + usage.admins;
        if (total > 0) {
            return res.send({
                result: false,
                message: `This franchise still has data attached (${usage.bookings} bookings, ${usage.bikes} vehicles, ${usage.locations} locations, ${usage.admins} admins). Deactivate it instead of deleting.`,
                usage,
            });
        }

        const result = await model.deleteFranchise(fr_id);
        if (result.affectedRows === 0) {
            return res.send({ result: false, message: 'Failed to delete franchise' });
        }

        logger.info('Franchise deleted', { fr_id });
        return res.send({ result: true, message: 'Franchise deleted successfully' });
    } catch (error) {
        logger.error('deleteFranchise error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * List the admins assigned to a franchise.
 */
module.exports.listFranchiseAdmins = async (req, res) => {
    try {
        const { fr_id, search } = req.body || {};

        if (isFranchiseAdmin(req.user)) {
            const list = await model.listFranchiseAdmins(req.user.franchise_id);
            return res.send({
                result: true,
                message: list.length ? 'Franchise admins retrieved' : 'No data',
                count: list.length,
                list,
            });
        }

        const list = await model.listFranchiseAdmins(
            fr_id ? Number(fr_id) : null,
            search ? String(search).trim() : null,
        );
        return res.send({
            result: true,
            message: list.length ? 'Franchise admins retrieved' : 'No data',
            count: list.length,
            list,
        });
    } catch (error) {
        logger.error('listFranchiseAdmins error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * Create a franchise-admin login.
 *
 * The head office creates this from the Franchises page; the franchise owner
 * then signs in with it and only ever sees their own franchise.
 */
module.exports.addFranchiseAdmin = async (req, res) => {
    try {
        const {
            name, email, mobile, password, fr_id,
        } = req.body || {};

        if (!name || !email || !mobile || !password) {
            return res.send({
                result: false,
                message: 'name, email, mobile and password are required',
            });
        }

        if (!fr_id) {
            return res.send({
                result: false,
                message: 'A franchise must be selected',
            });
        }

        const cleanEmail = String(email).trim().toLowerCase();
        const cleanMobile = String(mobile).trim();
        const cleanName = String(name).trim();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return res.send({ result: false, message: 'Enter a valid email address' });
        }
        if (!/^\d{10}$/.test(cleanMobile)) {
            return res.send({ result: false, message: 'Enter a valid 10-digit mobile number' });
        }
        if (String(password).length < 6) {
            return res.send({ result: false, message: 'Password must be at least 6 characters' });
        }

        // The franchise must exist and be active.
        const franchise = await model.getFranchiseById(fr_id);
        if (!franchise) {
            return res.send({ result: false, message: 'Franchise not found' });
        }
        if (!franchise.fr_status || franchise.fr_status.toLowerCase() !== 'active') {
            return res.send({
                result: false,
                message: 'Cannot add an admin to an inactive franchise',
            });
        }

        // The login must be unique.
        const existing = await model.checkUserExists(cleanEmail, cleanMobile);
        if (existing) {
            return res.send({
                result: false,
                message: 'A user with that email or mobile already exists',
            });
        }

        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(String(password), 10);

        const result = await model.createFranchiseAdmin({
            name: cleanName,
            email: cleanEmail,
            mobile: cleanMobile,
            password: String(password),
            hashed_password: hashedPassword,
            franchise_id: Number(fr_id),
            joined_date: new Date().toISOString().slice(0, 10),
        });

        if (result.affectedRows === 0) {
            return res.send({ result: false, message: 'Failed to create franchise admin' });
        }

        logger.info('Franchise admin created', {
            u_id: result.insertId,
            fr_id: Number(fr_id),
            fr_code: franchise.fr_code,
        });

        return res.send({
            result: true,
            message: `Franchise admin created for ${franchise.fr_name}`,
            u_id: result.insertId,
            franchise_id: Number(fr_id),
            franchise_name: franchise.fr_name,
            email: cleanEmail,
        });
    } catch (error) {
        logger.error('addFranchiseAdmin error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * Assign (or un-assign) a user to a franchise.
 * Assigning makes them a 'franchise_admin'.
 */
module.exports.assignFranchiseAdmin = async (req, res) => {
    try {
        const { u_id, fr_id } = req.body || {};

        if (!u_id) {
            return res.send({ result: false, message: 'u_id is required' });
        }

        if (fr_id) {
            const franchise = await model.getFranchiseById(fr_id);
            if (!franchise) {
                return res.send({ result: false, message: 'Franchise not found' });
            }
            if (franchise.fr_status !== 'active') {
                return res.send({
                    result: false,
                    message: 'Cannot assign an admin to an inactive franchise',
                });
            }
        }

        const result = await model.assignUserToFranchise(u_id, fr_id || null);
        if (result.affectedRows === 0) {
            return res.send({ result: false, message: 'User not found' });
        }

        logger.info('Franchise admin assignment updated', { u_id, fr_id: fr_id || null });
        return res.send({
            result: true,
            message: fr_id
                ? 'Admin assigned to franchise successfully'
                : 'Admin returned to head office',
        });
    } catch (error) {
        logger.error('assignFranchiseAdmin error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * Franchise-aware dashboard counters.
 */
module.exports.getFranchiseStats = async (req, res) => {
    try {
        const { fr_id } = req.body || {};
        const scopeId = isFranchiseAdmin(req.user)
            ? Number(req.user.franchise_id)
            : (fr_id ? Number(fr_id) : null);

        const Query = `
            SELECT
                (SELECT COUNT(*) FROM bookings
                    WHERE b_status = 'pending'   ${scopeId ? 'AND b_franchise_id = ?' : ''}) AS pending,
                (SELECT COUNT(*) FROM bookings
                    WHERE b_status = 'approved'  ${scopeId ? 'AND b_franchise_id = ?' : ''}) AS approved,
                (SELECT COUNT(*) FROM bookings
                    WHERE b_status = 'onride'    ${scopeId ? 'AND b_franchise_id = ?' : ''}) AS onride,
                (SELECT COUNT(*) FROM bookings
                    WHERE b_status = 'completed' ${scopeId ? 'AND b_franchise_id = ?' : ''}) AS completed,
                (SELECT COUNT(*) FROM bookings
                    WHERE b_status IN ('cancelled','rejected') ${scopeId ? 'AND b_franchise_id = ?' : ''}) AS cancelled,
                (SELECT COUNT(*) FROM bikes
                    WHERE b_status = 'Active'    ${scopeId ? 'AND b_franchise_id = ?' : ''}) AS bikes,
                (SELECT COUNT(*) FROM location_center ${scopeId ? 'WHERE l_franchise_id = ?' : ''}) AS locations,
                (SELECT COALESCE(SUM(b_total_amount),0) FROM bookings
                    WHERE b_payment_status = 'paid' ${scopeId ? 'AND b_franchise_id = ?' : ''}) AS revenue
        `;

        const placeholders = scopeId ? Array(8).fill(scopeId) : [];
        const data = await query(Query, placeholders);

        return res.send({
            result: true,
            message: 'Franchise stats retrieved',
            franchise_id: scopeId,
            stats: data[0] || {},
        });
    } catch (error) {
        logger.error('getFranchiseStats error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};
