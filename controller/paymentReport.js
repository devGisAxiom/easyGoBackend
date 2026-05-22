const model = require('../model/paymentReport');
const ExcelJS = require('exceljs');
const moment = require('moment');
const logger = require('../util/logger');

function buildCondition(from_date, to_date) {
    const parts = [];
    if (from_date) parts.push(`DATE(b.booking_date) >= '${from_date}'`);
    if (to_date)   parts.push(`DATE(b.booking_date) <= '${to_date}'`);
    return parts.length ? `WHERE ${parts.join(' AND ')}` : '';
}

// ─── JSON list (for the admin table view) ────────────────────────────────────
module.exports.paymentReportList = async (req, res) => {
    try {
        const { from_date, to_date } = req.body || {};
        const condition = buildCondition(from_date, to_date);
        const data = await model.getPaymentReport(condition);
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
        const condition = buildCondition(from_date, to_date);
        const rows = await model.getPaymentReport(condition);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'EasyGo Admin';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Payment Report');

        // ── Column definitions ────────────────────────────────────────────────
        sheet.columns = [
            { header: 'Booking ID',      key: 'b_id',               width: 12 },
            { header: 'Booking Date',    key: 'booking_date',        width: 16 },
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
            { header: 'Booking Status', key: 'b_status',            width: 16 },
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
            const gst  = parseFloat((rent * 0.05).toFixed(2));

            const dataRow = sheet.addRow({
                b_id:               row.b_id,
                booking_date:       row.booking_date  ? moment(row.booking_date).format('DD/MM/YYYY')  : '',
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
                b_status:           row.b_status           || '',
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
            const grandTotal   = sum('b_total_amount');

            const totalsRow = sheet.addRow({
                b_id:          'TOTAL',
                b_rent_amount: parseFloat(totalRent.toFixed(2)),
                gst:           parseFloat((totalRent * 0.05).toFixed(2)),
                rent_deposit:  parseFloat(totalDeposit.toFixed(2)),
                b_fine_amount: parseFloat(totalFine.toFixed(2)),
                b_total_amount:parseFloat(grandTotal.toFixed(2)),
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
