var db = require('../config/db');
var util = require('util');
const query = util.promisify(db.query).bind(db);

/**
 * List franchises. Optionally only the active ones.
 */
module.exports.listFranchises = async (onlyActive = false) => {
    const where = onlyActive ? "WHERE fr_status = 'active'" : '';
    const Query = `SELECT fr.*,
                       (SELECT COUNT(*) FROM bookings b WHERE b.b_franchise_id = fr.fr_id) AS booking_count,
                       (SELECT COUNT(*) FROM bikes bk WHERE bk.b_franchise_id = fr.fr_id) AS bike_count,
                       (SELECT COUNT(*) FROM location_center lc WHERE lc.l_franchise_id = fr.fr_id) AS location_count,
                       (SELECT COUNT(*) FROM user fu WHERE fu.u_franchise_id = fr.fr_id AND fu.u_role = 'franchise_admin') AS admin_count
                   FROM franchises fr ${where}
                   ORDER BY fr.fr_id ASC`;
    return await query(Query);
};

module.exports.getFranchiseById = async (fr_id) => {
    const Query = `SELECT * FROM franchises WHERE fr_id = ?`;
    const data = await query(Query, [fr_id]);
    return Array.isArray(data) ? data[0] : data;
};

module.exports.getFranchiseByCode = async (fr_code) => {
    const Query = `SELECT * FROM franchises WHERE fr_code = ? LIMIT 1`;
    const data = await query(Query, [fr_code]);
    return Array.isArray(data) ? data[0] : data;
};

module.exports.createFranchise = async (fields) => {
    const {
        fr_code, fr_name, fr_location, fr_district,
        fr_contact_name, fr_contact_phone, fr_contact_email, fr_status,
    } = fields;

    const Query = `INSERT INTO franchises
        (fr_code, fr_name, fr_location, fr_district,
         fr_contact_name, fr_contact_phone, fr_contact_email, fr_status)
        VALUES (?,?,?,?,?,?,?,?)`;
    return await query(Query, [
        fr_code, fr_name, fr_location || null, fr_district || null,
        fr_contact_name || null, fr_contact_phone || null, fr_contact_email || null,
        fr_status || 'active',
    ]);
};

/**
 * Whitelisted field → column map, so updates stay parameterised.
 */
const EDITABLE_FIELDS = {
    fr_code: 'fr_code',
    fr_name: 'fr_name',
    fr_location: 'fr_location',
    fr_district: 'fr_district',
    fr_contact_name: 'fr_contact_name',
    fr_contact_phone: 'fr_contact_phone',
    fr_contact_email: 'fr_contact_email',
    fr_status: 'fr_status',
};

module.exports.updateFranchise = async (fr_id, fields) => {
    const updates = [];
    const params = [];

    for (const [field, column] of Object.entries(EDITABLE_FIELDS)) {
        if (fields[field] === undefined) continue;
        updates.push(`${column} = ?`);
        params.push(fields[field]);
    }

    if (!updates.length) return { affectedRows: 0 };

    const Query = `UPDATE franchises SET ${updates.join(', ')} WHERE fr_id = ?`;
    return await query(Query, [...params, fr_id]);
};

module.exports.deleteFranchise = async (fr_id) => {
    const Query = `DELETE FROM franchises WHERE fr_id = ?`;
    return await query(Query, [fr_id]);
};

/**
 * Count everything that still references this franchise. Used to block
 * deletion of a franchise that still has operational data.
 */
module.exports.getFranchiseUsage = async (fr_id) => {
    const Query = `
        SELECT
            (SELECT COUNT(*) FROM bookings       WHERE b_franchise_id = ?) AS bookings,
            (SELECT COUNT(*) FROM bikes          WHERE b_franchise_id = ?) AS bikes,
            (SELECT COUNT(*) FROM location_center WHERE l_franchise_id = ?) AS locations,
            (SELECT COUNT(*) FROM user           WHERE u_franchise_id = ?) AS admins
    `;
    const data = await query(Query, [fr_id, fr_id, fr_id, fr_id]);
    return data[0] || { bookings: 0, bikes: 0, locations: 0, admins: 0 };
};

/**
 * Resolve which franchise a pickup location belongs to.
 * A booking inherits the franchise of its pickup location.
 *
 * The customer app sends the pickup location as "<LOCATION> <DISTRICT>"
 * (see pickundrop.dart), so we match on the combined string first and fall
 * back to a plain location match.
 */
module.exports.resolveFranchiseByLocation = async (pickupLocation, dropLocation) => {
    const Query = `
        SELECT l_franchise_id FROM location_center
        WHERE (l_location = ? OR CONCAT(l_location, ' ', l_district) = ?)
        LIMIT 1
    `;
    const rows = await query(Query, [pickupLocation, pickupLocation]);
    if (rows.length && rows[0].l_franchise_id) {
        return rows[0].l_franchise_id;
    }

    if (dropLocation) {
        const fallback = await query(
            `SELECT l_franchise_id FROM location_center
             WHERE (l_location = ? OR CONCAT(l_location, ' ', l_district) = ?)
             LIMIT 1`,
            [dropLocation, dropLocation],
        );
        if (fallback.length && fallback[0].l_franchise_id) {
            return fallback[0].l_franchise_id;
        }
    }

    return null;
};

/**
 * Assign a user to a franchise as a franchise-admin.
 * Passing a null fr_id promotes them back to a plain admin.
 */
module.exports.assignUserToFranchise = async (u_id, fr_id) => {
    const Query = `UPDATE user SET u_franchise_id = ?, u_role = ? WHERE u_id = ?`;
    return await query(Query, [
        fr_id ? Number(fr_id) : null,
        fr_id ? 'franchise_admin' : 'admin',
        u_id,
    ]);
};

/**
 * Create a brand-new franchise-admin login.
 *
 * This is the entry point for onboarding a franchise: the head office
 * creates the login, and the franchise owner signs in with it to operate
 * their own franchise.
 */
module.exports.createFranchiseAdmin = async (fields) => {
    const {
        name, email, mobile, password, franchise_id, hashed_password,
    } = fields;

    const Query = `INSERT INTO user
        (u_name, u_email, u_password, u_mobile, u_joindate, u_role,
         u_status, u_email_verify, u_franchise_id)
        VALUES (?,?,?,?,?,?,?,?,?)`;

    return await query(Query, [
        name,
        email,
        hashed_password,
        mobile,
        fields.joined_date,
        'franchise_admin',
        'active',
        'true',
        franchise_id,
    ]);
};

/**
 * Is this email or mobile already taken by any user?
 * Used to reject a duplicate franchise-admin login.
 */
module.exports.checkUserExists = async (email, mobile) => {
    const Query = `SELECT u_id, u_email, u_mobile, u_role FROM user
                   WHERE u_email = ? OR u_mobile = ? LIMIT 1`;
    const data = await query(Query, [email, mobile]);
    return Array.isArray(data) ? data[0] : data;
};

/**
 * List the admins that can be assigned to a franchise.
 *
 * Without `fr_id` this returns every admin-side user (head-office admins
 * plus the ones already tied to a franchise) so the head office has someone
 * to pick when assigning. With `fr_id` it returns the admins already in that
 * franchise together with the still-unassigned ones.
 */
module.exports.listFranchiseAdmins = async (fr_id = null, search = null) => {
    const conditions = [];
    const params = [];

    if (fr_id) {
        conditions.push(`(u.u_franchise_id = ? OR u.u_role = 'admin')`);
        params.push(fr_id);
    } else {
        conditions.push(`u.u_role IN ('admin', 'franchise_admin')`);
    }

    if (search) {
        conditions.push('(u.u_name LIKE ? OR u.u_email LIKE ? OR u.u_mobile LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const Query = `
        SELECT u.u_id, u.u_name, u.u_email, u.u_mobile, u.u_franchise_id,
               u.u_status, u.u_joindate, u.u_role,
               fr.fr_name AS franchise_name
        FROM user u
        LEFT JOIN franchises fr ON fr.fr_id = u.u_franchise_id
        ${where}
        ORDER BY u.u_role ASC, u.u_name ASC
    `;
    return await query(Query, params);
};

/**
 * Franchise id for a booking row, used by report grouping.
 */
module.exports.getBookingFranchise = async (b_id) => {
    const Query = `SELECT b_franchise_id FROM bookings WHERE b_id = ?`;
    const data = await query(Query, [b_id]);
    return data[0]?.b_franchise_id ?? null;
};
