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

module.exports.listFranchiseAdmins = async (fr_id = null) => {
    const where = fr_id ? 'WHERE u_franchise_id = ?' : '';
    const params = fr_id ? [fr_id] : [];
    const Query = `
        SELECT u_id, u_name, u_email, u_mobile, u_franchise_id, u_status, u_joindate
        FROM user
        WHERE u_role = 'franchise_admin' ${where}
        ORDER BY u_id ASC
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
