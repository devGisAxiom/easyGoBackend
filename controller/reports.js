const db = require('../config/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);
const ExcelJS = require('exceljs');
const moment = require('moment');
const logger = require('../util/logger');
const { getScope, isFranchiseAdmin } = require('../util/franchiseScope');
const {
    addBookingsSheet, addManualPaymentsSheet, addPenaltiesSheet, addSwapsSheet,
} = require('../util/reportWorkbook');
const weeklyReport = require('../util/weeklyReport');

/**
 * Reporting endpoints.
 *
 * All of these are franchise-aware: a franchise-admin only ever sees their
 * own franchise's numbers.
 */

// ─── Income grouped by pickup location ──────────────────────────────────────

/**
 * Revenue grouped by the location the customer picked the vehicle up from.
 */
module.exports.incomeByLocation = async (req, res) => {
    try {
        const { from_date, to_date } = req.body || {};

        const conditions = [];
        const params = [];

        if (from_date) {
            conditions.push('DATE(b.booking_date) >= ?');
            params.push(from_date);
        }
        if (to_date) {
            conditions.push('DATE(b.booking_date) <= ?');
            params.push(to_date);
        }

        const scope = getScope(req.user, 'b.b_franchise_id');
        if (scope.clause) {
            conditions.push(scope.clause);
            params.push(...scope.params);
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        // Manual collections and penalties are aggregated in subqueries so
        // they do not multiply the booking rows.
        const Query = `
            SELECT
                COALESCE(NULLIF(b.b_pickup_location, ''), 'Unspecified') AS pickup_location,
                COUNT(*) AS bookings,
                SUM(CASE WHEN b.b_payment_status = 'paid' THEN 1 ELSE 0 END) AS paid_bookings,
                COALESCE(SUM(b.b_rent_amount), 0) AS total_rent,
                COALESCE(SUM(b.b_fine_amount), 0) AS total_fines,
                COALESCE(SUM(b.b_total_amount), 0) AS total_collected,
                COALESCE(SUM(mp.manual_total), 0) AS total_manual,
                COALESCE(SUM(pn.penalty_total), 0) AS total_penalties
            FROM bookings b
            LEFT JOIN (
                SELECT b2.b_pickup_location AS loc, SUM(mp_amount) AS manual_total
                FROM manual_payments mp
                JOIN bookings b2 ON b2.b_id = mp.mp_booking_id
                GROUP BY b2.b_pickup_location
            ) mp ON mp.loc = COALESCE(NULLIF(b.b_pickup_location, ''), 'Unspecified')
            LEFT JOIN (
                SELECT b3.b_pickup_location AS loc, SUM(pn_amount) AS penalty_total
                FROM penalties pn
                JOIN bookings b3 ON b3.b_id = pn.pn_booking_id
                GROUP BY b3.b_pickup_location
            ) pn ON pn.loc = COALESCE(NULLIF(b.b_pickup_location, ''), 'Unspecified')
            ${where}
            GROUP BY COALESCE(NULLIF(b.b_pickup_location, ''), 'Unspecified')
            ORDER BY total_collected DESC
        `;

        const rows = await query(Query, params);

        const list = rows.map((r) => ({
            pickup_location: r.pickup_location,
            bookings: Number(r.bookings || 0),
            paid_bookings: Number(r.paid_bookings || 0),
            total_rent: Number(Number(r.total_rent || 0).toFixed(2)),
            total_fines: Number(Number(r.total_fines || 0).toFixed(2)),
            total_collected: Number(Number(r.total_collected || 0).toFixed(2)),
            total_manual: Number(Number(r.total_manual || 0).toFixed(2)),
            total_penalties: Number(Number(r.total_penalties || 0).toFixed(2)),
            // Gross income actually collected (online + offline) less penalties.
            net_income: Number(
                (Number(r.total_collected || 0) + Number(r.total_manual || 0)
                    - Number(r.total_penalties || 0)).toFixed(2),
            ),
        }));

        const grandTotal = list.reduce(
            (acc, r) => ({
                bookings: acc.bookings + r.bookings,
                total_collected: acc.total_collected + r.total_collected,
                total_manual: acc.total_manual + r.total_manual,
                total_penalties: acc.total_penalties + r.total_penalties,
            }),
            { bookings: 0, total_collected: 0, total_manual: 0, total_penalties: 0 },
        );

        return res.send({
            result: true,
            message: list.length ? 'Income by location retrieved' : 'No data',
            count: list.length,
            totals: {
                bookings: grandTotal.bookings,
                total_collected: Number(grandTotal.total_collected.toFixed(2)),
                total_manual: Number(grandTotal.total_manual.toFixed(2)),
                total_penalties: Number(grandTotal.total_penalties.toFixed(2)),
                net_income: Number(
                    (grandTotal.total_collected + grandTotal.total_manual
                        - grandTotal.total_penalties).toFixed(2),
                ),
            },
            list,
        });
    } catch (error) {
        logger.error('incomeByLocation error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

// ─── Vehicles currently out ─────────────────────────────────────────────────

/**
 * Every vehicle that is out with a customer right now: who has it, when and
 * where it was issued, the vehicle number and model, and when it is due back.
 */
async function fetchVehiclesOnRide({ from_date = null, to_date = null, franchiseId = null, includeCompleted = false } = {}) {
    const conditions = [];
    const params = [];

    const statuses = includeCompleted
        ? ['approved', 'onride', 'extendedreq', 'completed']
        : ['approved', 'onride', 'extendedreq'];

    conditions.push(`b.b_status IN (${statuses.map(() => '?').join(', ')})`);
    params.push(...statuses);

    if (from_date) {
        conditions.push('DATE(b.booking_date) >= ?');
        params.push(from_date);
    }
    if (to_date) {
        conditions.push('DATE(b.booking_date) <= ?');
        params.push(to_date);
    }
    if (franchiseId) {
        conditions.push('b.b_franchise_id = ?');
        params.push(franchiseId);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const Query = `
        SELECT
            b.b_id,
            b.booking_date,
            b.b_pickup_date,
            b.b_picup_time,
            b.b_pickup_location,
            b.b_drop_date,
            b.b_drop_time,
            b.b_status,
            b.b_franchise_id,
            fr.fr_name AS franchise_name,
            u.u_name AS customer_name,
            u.u_mobile AS customer_mobile,
            u.u_email AS customer_email,
            bk.b_id AS bk_id,
            bk.b_name AS bike_model,
            bk.vehicle_number
        FROM bookings b
        JOIN bikes bk ON bk.b_id = b.b_bk_id
        LEFT JOIN user u ON u.u_id = b.b_u_id
        LEFT JOIN franchises fr ON fr.fr_id = b.b_franchise_id
        ${where}
        ORDER BY b.b_pickup_date DESC, b.b_id DESC
    `;

    const rows = await query(Query, params);

    const now = moment();
    return rows.map((r) => {
        const dropDateTime = r.b_drop_date
            ? moment(`${r.b_drop_date} ${String(r.b_drop_time || '').substring(0, 8)}`, 'YYYY-MM-DD HH:mm:ss')
            : null;
        const isOverdue = dropDateTime && dropDateTime.isValid()
            ? now.isAfter(dropDateTime)
            : false;

        return {
            booking_id: r.b_id,
            customer_name: r.customer_name || '',
            customer_mobile: r.customer_mobile || '',
            customer_email: r.customer_email || '',
            issue_date: r.b_pickup_date,
            issue_time: r.b_picup_time,
            issue_location: r.b_pickup_location || '',
            vehicle_number: r.vehicle_number || '',
            vehicle_model: r.bike_model || '',
            return_date: r.b_drop_date,
            return_time: r.b_drop_time,
            booking_status: r.b_status,
            franchise_name: r.franchise_name || '',
            is_overdue: isOverdue,
        };
    });
}

module.exports.fetchVehiclesOnRide = fetchVehiclesOnRide;

module.exports.vehiclesOnRide = async (req, res) => {
    try {
        const { from_date, to_date, include_completed } = req.body || {};

        const franchiseId = isFranchiseAdmin(req.user)
            ? Number(req.user.franchise_id)
            : null;

        const list = await fetchVehiclesOnRide({
            from_date: from_date || null,
            to_date: to_date || null,
            franchiseId,
            includeCompleted: String(include_completed || '') === 'true',
        });

        return res.send({
            result: true,
            message: list.length ? 'Vehicles on ride retrieved' : 'No data',
            count: list.length,
            overdue_count: list.filter((r) => r.is_overdue).length,
            list,
        });
    } catch (error) {
        logger.error('vehiclesOnRide error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

module.exports.vehiclesOnRideExcel = async (req, res) => {
    try {
        const { from_date, to_date, include_completed } = req.body || {};

        const franchiseId = isFranchiseAdmin(req.user)
            ? Number(req.user.franchise_id)
            : null;

        const list = await fetchVehiclesOnRide({
            from_date: from_date || null,
            to_date: to_date || null,
            franchiseId,
            includeCompleted: String(include_completed || '') === 'true',
        });

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'EasyGo Admin';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Vehicles On Ride');
        sheet.columns = [
            { header: 'Booking ID', key: 'booking_id', width: 12 },
            { header: 'Customer Name', key: 'customer_name', width: 20 },
            { header: 'Mobile', key: 'customer_mobile', width: 14 },
            { header: 'Vehicle Number', key: 'vehicle_number', width: 16 },
            { header: 'Vehicle Model', key: 'vehicle_model', width: 18 },
            { header: 'Date of Issue', key: 'issue_date', width: 14 },
            { header: 'Issue Time', key: 'issue_time', width: 12 },
            { header: 'Issue Location', key: 'issue_location', width: 24 },
            { header: 'Date of Return', key: 'return_date', width: 14 },
            { header: 'Return Time', key: 'return_time', width: 12 },
            { header: 'Status', key: 'booking_status', width: 14 },
            { header: 'Franchise', key: 'franchise_name', width: 18 },
            { header: 'Overdue?', key: 'is_overdue', width: 10 },
        ];

        const header = sheet.getRow(1);
        header.height = 22;
        header.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        });

        list.forEach((r, i) => {
            const row = sheet.addRow({
                booking_id: r.booking_id,
                customer_name: r.customer_name,
                customer_mobile: r.customer_mobile,
                vehicle_number: r.vehicle_number,
                vehicle_model: r.vehicle_model,
                issue_date: r.issue_date ? moment(r.issue_date).format('DD/MM/YYYY') : '',
                issue_time: r.issue_time || '',
                issue_location: r.issue_location,
                return_date: r.return_date ? moment(r.return_date).format('DD/MM/YYYY') : '',
                return_time: r.return_time || '',
                booking_status: r.booking_status,
                franchise_name: r.franchise_name,
                is_overdue: r.is_overdue ? 'Yes' : 'No',
            });

            const fillColor = i % 2 === 0 ? 'FFFFFFFF' : 'FFF1F5FF';
            row.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
                cell.alignment = { vertical: 'middle' };
            });

            if (r.is_overdue) {
                row.getCell('is_overdue').font = { bold: true, color: { argb: 'FFDC2626' } };
            }
        });

        const filename = `EasyGo_Vehicles_On_Ride_${moment().format('DD-MM-YYYY')}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        logger.error('vehiclesOnRideExcel error: %s', error.message);
        return res.status(500).send({ result: false, message: error.message });
    }
};

// ─── Weekly report ──────────────────────────────────────────────────────────

/**
 * Download the weekly report on demand.
 */
module.exports.weeklyReportExcel = async (req, res) => {
    try {
        const { report_date } = req.body || {};

        const range = weeklyReport.getDateRangeForWeeklyReport(report_date || null);
        const paymentModel = require('../model/paymentReport');
        const rows = await paymentModel.getPaymentReport(range.condition, range.params);
        const buffer = await weeklyReport.buildWeeklyWorkbook(range, rows);

        const filename = `EasyGo_Weekly_Payment_Report_${range.start_date}_to_${range.end_date}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

        res.send(Buffer.from(buffer));
    } catch (error) {
        logger.error('weeklyReportExcel error: %s', error.message);
        return res.status(500).send({ result: false, message: error.message });
    }
};

/**
 * Send the weekly report right now (the "Send Test Mail" style button).
 */
module.exports.weeklyReportSendNow = async (req, res) => {
    try {
        const { report_date } = req.body || {};

        const result = await weeklyReport.sendWeeklyPaymentReport(report_date || null);

        return res.send({
            result: true,
            message: 'Weekly payment report sent successfully',
            bookings_count: result?.rows ?? 0,
            period: result?.range,
        });
    } catch (error) {
        logger.error('weeklyReportSendNow error: %s', error.message);
        return res.status(500).send({ result: false, message: error.message });
    }
};
