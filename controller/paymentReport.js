const model = require('../model/paymentReport');
const ExcelJS = require('exceljs');
const moment = require('moment');
const logger = require('../util/logger');
const { sendNightlyPaymentReport } = require('../util/nightlyPaymentReport');
const { getScope, isFranchiseAdmin } = require('../util/franchiseScope');
const {
    addManualPaymentsSheet, addPenaltiesSheet, addSwapsSheet,
} = require('../util/reportWorkbook');

/**
 * Build the WHERE clause for the payment report.
 *
 * Returns the clause plus the matching params so every value is
 * parameterised (no interpolation of dates or ids into SQL).
 */
function buildCondition(from_date, to_date, user) {
    const parts = [];
    const params = [];

    if (from_date) {
        parts.push(`DATE(b.booking_date) >= ?`);
        params.push(from_date);
    }
    if (to_date) {
        parts.push(`DATE(b.booking_date) <= ?`);
        params.push(to_date);
    }

    // Franchise (tenant) restriction.
    const scope = getScope(user, 'b.b_franchise_id');
    if (scope.clause) {
        parts.push(scope.clause);
        params.push(...scope.params);
    }

    return {
        clause: parts.length ? `WHERE ${parts.join(' AND ')}` : '',
        params,
    };
}

// ─── JSON list (for the admin table view) ────────────────────────────────────
module.exports.paymentReportList = async (req, res) => {
    try {
        const { from_date, to_date } = req.body || {};
        const { clause, params } = buildCondition(from_date, to_date, req.user);
        const data = await model.getPaymentReport(clause, params);
        return res.send({ result: true, message: 'Payment report data', list: data });
    } catch (error) {
        logger.error('Payment report list error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

// ─── Excel download ──────────────────────────────────────────────────────────
module.exports.paymentReportExcel = async (req, res) => {
    try {
        const { from_date, to_date } = req.body || {};
        const { clause, params } = buildCondition(from_date, to_date, req.user);
        const rows = await model.getPaymentReport(clause, params);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'EasyGo Admin';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Payment Report');

        // ── Column definitions ────────────────────────────────────────────────
        sheet.columns = [
            { header: 'Booking ID',      key: 'b_id',               width: 12 },
            { header: 'Booking Date',    key: 'booking_date',        width: 16 },
            { header: 'Source',          key: 'b_source',            width: 10 },
            { header: 'Franchise',       key: 'franchise_name',      width: 18 },
            { header: 'Customer Name',   key: 'u_name',              width: 20 },
            { header: 'Mobile',          key: 'u_mobile',            width: 14 },
            { header: 'Email',           key: 'u_email',             width: 26 },
            { header: 'Address',         key: 'u_address',           width: 26 },
            { header: 'State',           key: 'u_state',             width: 15 },
            { header: 'District',        key: 'u_district',          width: 15 },
            { header: 'Vehicle Number',  key: 'vehicle_number',      width: 16 },
            { header: 'Bike Name',       key: 'bike_name',           width: 18 },
            { header: 'Duration',        key: 'rent_duration_text',  width: 14 },
            { header: 'Pickup Location', key: 'b_pickup_location',   width: 22 },
            { header: 'Pickup Date',     key: 'b_pickup_date',       width: 14 },
            { header: 'Pickup Time',     key: 'b_picup_time',        width: 14 },
            { header: 'Drop Location',   key: 'b_drop_location',     width: 22 },
            { header: 'Drop Date',       key: 'b_drop_date',         width: 14 },
            { header: 'Drop Time',       key: 'b_drop_time',         width: 14 },
            { header: 'Rent (Rs)',       key: 'b_rent_amount',       width: 12 },
            { header: 'GST 5% (Rs)',     key: 'gst',                 width: 12 },
            { header: 'Deposit (Rs)',    key: 'rent_deposit',        width: 12 },
            { header: 'Fine (Rs)',       key: 'b_fine_amount',       width: 12 },
            { header: 'Total (Rs)',      key: 'b_total_amount',      width: 12 },
            { header: 'Payment Status', key: 'b_payment_status',    width: 16 },
            { header: 'Payment Mode',   key: 'payment_mode',        width: 16 },
            { header: 'Booking Status', key: 'b_status',            width: 16 },
            { header: 'Deposit Returned?', key: 'deposit_returned',  width: 16 },
            { header: 'Deposit Returned (Rs)', key: 'deposit_returned_amount', width: 18 },
            { header: 'GPay Ref',        key: 'deposit_gpay_ref',    width: 22 },
            { header: 'Returned At',     key: 'deposit_returned_at', width: 18 },
            { header: 'Returned By',     key: 'deposit_returned_by', width: 16 },
            { header: 'Manual Pmts (Rs)', key: 'manual_payment_total', width: 16 },
        ];

        // ── Style header row ──────────────────────────────────────────────────
        const headerRow = sheet.getRow(1);
        headerRow.height = 22;
        headerRow.eachCell((cell) => {
            cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
            cell.font   = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = {
                top: { style: 'thin' }, left: { style: 'thin' },
                bottom: { style: 'thin' }, right: { style: 'thin' },
            };
        });

        // ── Data rows ─────────────────────────────────────────────────────────
        rows.forEach((row, i) => {
            const rent = parseFloat(row.b_rent_amount || 0);
            const gst = parseFloat(
                row.rent_gst !== undefined && row.rent_gst !== null
                    ? row.rent_gst
                    : (rent * 0.05).toFixed(2)
            );

            const dataRow = sheet.addRow({
                b_id:               row.b_id,
                booking_date:       row.booking_date  ? moment(row.booking_date).format('DD/MM/YYYY')  : '',
                b_source:           row.b_source || 'app',
                franchise_name:     row.franchise_name || '',
                u_name:             row.u_name        || '',
                u_mobile:           row.u_mobile      || '',
                u_email:            row.u_email       || '',
                u_address:          row.u_address     || '',
                u_state:            row.u_state       || '',
                u_district:         row.u_district    || '',
                vehicle_number:     row.vehicle_number || '',
                bike_name:          row.bike_name     || '',
                rent_duration_text: row.rent_duration_text || '',
                b_pickup_location:  row.b_pickup_location  || '',
                b_pickup_date:      row.b_pickup_date ? moment(row.b_pickup_date).format('DD/MM/YYYY') : '',
                b_picup_time:       row.b_picup_time  || '',
                b_drop_location:    row.b_drop_location    || '',
                b_drop_date:        row.b_drop_date   ? moment(row.b_drop_date).format('DD/MM/YYYY')   : '',
                b_drop_time:        row.b_drop_time   || '',
                b_rent_amount:      rent,
                gst:                gst,
                rent_deposit:       parseFloat(row.rent_deposit   || 0),
                b_fine_amount:      parseFloat(row.b_fine_amount  || 0),
                b_total_amount:     parseFloat(row.b_total_amount || 0),
                b_payment_status:   row.b_payment_status || '',
                payment_mode:       row.b_payment_mode || '',
                b_status:           row.b_status           || '',
                // Deposit return columns (SRS §7)
                deposit_returned:   row.deposit_gpay_ref ? 'Yes' : 'No',
                deposit_returned_amount: parseFloat(row.deposit_returned_amount || 0),
                deposit_gpay_ref:   row.deposit_gpay_ref    || '',
                deposit_returned_at: row.deposit_returned_at ? moment(row.deposit_returned_at).format('DD/MM/YYYY HH:mm') : '',
                deposit_returned_by: row.deposit_returned_by || '',
                manual_payment_total: parseFloat(row.manual_payment_total || 0),
            });

            const fillColor = i % 2 === 0 ? 'FFFFFFFF' : 'FFF1F5FF';
            dataRow.eachCell((cell) => {
                cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
                cell.alignment = { vertical: 'middle' };
                cell.border    = {
                    top:    { style: 'thin', color: { argb: 'FFE0E0E0' } },
                    left:   { style: 'thin', color: { argb: 'FFE0E0E0' } },
                    bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                    right:  { style: 'thin', color: { argb: 'FFE0E0E0' } },
                };
            });

            // Colour payment-status cell
            const payCell = dataRow.getCell('b_payment_status');
            const ps = (row.b_payment_status || '').toLowerCase();
            if (ps === 'paid')         payCell.font = { bold: true, color: { argb: 'FF16A34A' } };
            else if (ps === 'pending') payCell.font = { bold: true, color: { argb: 'FFD97706' } };
            else                       payCell.font = { bold: true, color: { argb: 'FFDC2626' } };
        });

        // ── Totals row ────────────────────────────────────────────────────────
        if (rows.length > 0) {
            const sum = (key) => rows.reduce((s, r) => s + parseFloat(r[key] || 0), 0);
            const totalRent    = sum('b_rent_amount');
            const totalDeposit = sum('rent_deposit');
            const totalFine    = sum('b_fine_amount');
            const totalGst     = rows.reduce(
                (s, r) => s + parseFloat(r.rent_gst !== undefined && r.rent_gst !== null ? r.rent_gst : (parseFloat(r.b_rent_amount || 0) * 0.05).toFixed(2)),
                0
            );
            const grandTotal   = sum('b_total_amount');
            const totalManual  = sum('manual_payment_total');

            const totalsRow = sheet.addRow({
                b_id:          'TOTAL',
                b_rent_amount: parseFloat(totalRent.toFixed(2)),
                gst:           parseFloat(totalGst.toFixed(2)),
                rent_deposit:  parseFloat(totalDeposit.toFixed(2)),
                b_fine_amount: parseFloat(totalFine.toFixed(2)),
                b_total_amount:parseFloat(grandTotal.toFixed(2)),
                manual_payment_total: parseFloat(totalManual.toFixed(2)),
            });
            totalsRow.eachCell((cell) => {
                cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9C3' } };
                cell.font   = { bold: true };
                cell.border = {
                    top:    { style: 'medium' }, bottom: { style: 'medium' },
                    left:   { style: 'thin', color: { argb: 'FFE0E0E0' } },
                    right:  { style: 'thin', color: { argb: 'FFE0E0E0' } },
                };
            });
        }

        // ── Extra sheets: offline collections, penalties, swaps ───────────────
        // Requirement: "All deductions, additional payments and outstanding
        // balances must be reflected in the reports."
        try {
            const manualPaymentModel = require('../model/manualPayment');
            const penaltyModel = require('../model/penalty');
            const swapModel = require('../model/swap');

            const franchiseId = isFranchiseAdmin(req.user)
                ? Number(req.user.franchise_id)
                : null;

            const manualPayments = await manualPaymentModel.listManualPayments({
                from_date: from_date || null,
                to_date: to_date || null,
                franchise_id: franchiseId,
            });
            if (manualPayments.length) {
                addManualPaymentsSheet(workbook, manualPayments);
            }

            const penalties = await penaltyModel.listPenalties({
                from_date: from_date || null,
                to_date: to_date || null,
                franchise_id: franchiseId,
            });
            if (penalties.length) {
                addPenaltiesSheet(workbook, penalties);
            }

            const swaps = await swapModel.listSwaps({
                from_date: from_date || null,
                to_date: to_date || null,
                franchise_id: franchiseId,
            });
            if (swaps.length) {
                addSwapsSheet(workbook, swaps);
            }
        } catch (extraErr) {
            // The main report is still valid without the extra sheets.
            logger.error('Payment report extra sheets failed: %s', extraErr.message);
        }

        const fromLabel = from_date || 'all';
        const toLabel   = to_date   || 'all';
        const filename  = `EasyGo_Payment_Report_${fromLabel}_to_${toLabel}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        logger.error('Payment report excel error: %s', error.message);
        return res.status(500).send({ result: false, message: error.message });
    }
};

module.exports.paymentReportSendNow = async (req, res) => {
    try {
        await sendNightlyPaymentReport();
        return res.send({
            result: true,
            message: 'Payment report email sent successfully',
        });
    } catch (error) {
        logger.error('Payment report send-now error: %s', error.message);
        return res.status(500).send({
            result: false,
            message: error.message,
        });
    }
};
