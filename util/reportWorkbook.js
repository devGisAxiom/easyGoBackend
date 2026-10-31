const ExcelJS = require('exceljs');
const moment = require('moment');

/**
 * Shared Excel report builders.
 *
 * Used by:
 *   * controller/paymentReport.js  — the admin "Export Excel" button
 *   * util/weeklyReport.js         — the Monday-morning weekly email
 *
 * Keeping them in one place means every report shows the same columns and
 * the same totals, which is what makes the numbers comparable.
 */

const BRAND_BLUE = 'FF2563EB';
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
const CELL_BORDER = {
    top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
    left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
    bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
    right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
};

function styleHeader(row) {
    row.height = 22;
    row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_BLUE } };
        cell.font = HEADER_FONT;
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' },
        };
    });
}

function styleDataRow(row, index) {
    const fillColor = index % 2 === 0 ? 'FFFFFFFF' : 'FFF1F5FF';
    row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
        cell.alignment = { vertical: 'middle' };
        cell.border = CELL_BORDER;
    });
}

const num = (v) => parseFloat(v || 0);
const fmtDate = (d) => (d ? moment(d).format('DD/MM/YYYY') : '');
const fmtDateTime = (d) => (d ? moment(d).format('DD/MM/YYYY HH:mm') : '');

/**
 * The main bookings sheet — identical to the existing payment report export
 * plus the new columns (source, franchise, manual payment total).
 */
function addBookingsSheet(workbook, rows, { title = 'Payment Report' } = {}) {
    const sheet = workbook.addWorksheet(title);

    sheet.columns = [
        { header: 'Booking ID', key: 'b_id', width: 12 },
        { header: 'Booking Date', key: 'booking_date', width: 16 },
        { header: 'Source', key: 'b_source', width: 10 },
        { header: 'Franchise', key: 'franchise_name', width: 18 },
        { header: 'Customer Name', key: 'u_name', width: 20 },
        { header: 'Mobile', key: 'u_mobile', width: 14 },
        { header: 'Email', key: 'u_email', width: 26 },
        { header: 'Address', key: 'u_address', width: 26 },
        { header: 'State', key: 'u_state', width: 15 },
        { header: 'District', key: 'u_district', width: 15 },
        { header: 'Vehicle Number', key: 'vehicle_number', width: 16 },
        { header: 'Bike Name', key: 'bike_name', width: 18 },
        { header: 'Duration', key: 'rent_duration_text', width: 14 },
        { header: 'Pickup Location', key: 'b_pickup_location', width: 22 },
        { header: 'Pickup Date', key: 'b_pickup_date', width: 14 },
        { header: 'Pickup Time', key: 'b_picup_time', width: 14 },
        { header: 'Drop Location', key: 'b_drop_location', width: 22 },
        { header: 'Drop Date', key: 'b_drop_date', width: 14 },
        { header: 'Drop Time', key: 'b_drop_time', width: 14 },
        { header: 'Rent (Rs)', key: 'b_rent_amount', width: 12 },
        { header: 'GST 5% (Rs)', key: 'gst', width: 12 },
        { header: 'Deposit (Rs)', key: 'rent_deposit', width: 12 },
        { header: 'Fine (Rs)', key: 'b_fine_amount', width: 12 },
        { header: 'Total (Rs)', key: 'b_total_amount', width: 12 },
        { header: 'Payment Status', key: 'b_payment_status', width: 16 },
        { header: 'Payment Mode', key: 'payment_mode', width: 16 },
        { header: 'Booking Status', key: 'b_status', width: 16 },
        { header: 'Deposit Returned?', key: 'deposit_returned', width: 16 },
        { header: 'Deposit Returned (Rs)', key: 'deposit_returned_amount', width: 18 },
        { header: 'GPay Ref', key: 'deposit_gpay_ref', width: 22 },
        { header: 'Returned At', key: 'deposit_returned_at', width: 18 },
        { header: 'Returned By', key: 'deposit_returned_by', width: 16 },
        { header: 'Manual Pmts (Rs)', key: 'manual_payment_total', width: 16 },
    ];

    styleHeader(sheet.getRow(1));

    rows.forEach((row, i) => {
        const rent = num(row.b_rent_amount);
        const gst = num(
            row.rent_gst !== undefined && row.rent_gst !== null
                ? row.rent_gst
                : (rent * 0.05).toFixed(2),
        );

        const dataRow = sheet.addRow({
            b_id: row.b_id,
            booking_date: fmtDate(row.booking_date),
            b_source: row.b_source || 'app',
            franchise_name: row.franchise_name || '',
            u_name: row.u_name || '',
            u_mobile: row.u_mobile || '',
            u_email: row.u_email || '',
            u_address: row.u_address || '',
            u_state: row.u_state || '',
            u_district: row.u_district || '',
            vehicle_number: row.vehicle_number || '',
            bike_name: row.bike_name || '',
            rent_duration_text: row.rent_duration_text || '',
            b_pickup_location: row.b_pickup_location || '',
            b_pickup_date: fmtDate(row.b_pickup_date),
            b_picup_time: row.b_picup_time || '',
            b_drop_location: row.b_drop_location || '',
            b_drop_date: fmtDate(row.b_drop_date),
            b_drop_time: row.b_drop_time || '',
            b_rent_amount: rent,
            gst,
            rent_deposit: num(row.rent_deposit),
            b_fine_amount: num(row.b_fine_amount),
            b_total_amount: num(row.b_total_amount),
            b_payment_status: row.b_payment_status || '',
            payment_mode: row.b_payment_mode || '',
            b_status: row.b_status || '',
            deposit_returned: row.deposit_gpay_ref ? 'Yes' : 'No',
            deposit_returned_amount: num(row.deposit_returned_amount),
            deposit_gpay_ref: row.deposit_gpay_ref || '',
            deposit_returned_at: fmtDateTime(row.deposit_returned_at),
            deposit_returned_by: row.deposit_returned_by || '',
            manual_payment_total: num(row.manual_payment_total),
        });

        styleDataRow(dataRow, i);

        const payCell = dataRow.getCell('b_payment_status');
        const ps = String(row.b_payment_status || '').toLowerCase();
        if (ps === 'paid') payCell.font = { bold: true, color: { argb: 'FF16A34A' } };
        else if (ps === 'pending') payCell.font = { bold: true, color: { argb: 'FFD97706' } };
        else payCell.font = { bold: true, color: { argb: 'FFDC2626' } };
    });

    if (rows.length > 0) {
        const sum = (key) => rows.reduce((s, r) => s + num(r[key]), 0);
        const totalGst = rows.reduce(
            (s, r) => s + num(
                r.rent_gst !== undefined && r.rent_gst !== null
                    ? r.rent_gst
                    : (num(r.b_rent_amount) * 0.05).toFixed(2),
            ),
            0,
        );
        const totalManual = rows.reduce((s, r) => s + num(r.manual_payment_total), 0);

        const totalsRow = sheet.addRow({
            b_id: 'TOTAL',
            b_rent_amount: Number(sum('b_rent_amount').toFixed(2)),
            gst: Number(totalGst.toFixed(2)),
            rent_deposit: Number(sum('rent_deposit').toFixed(2)),
            b_fine_amount: Number(sum('b_fine_amount').toFixed(2)),
            b_total_amount: Number(sum('b_total_amount').toFixed(2)),
            manual_payment_total: Number(totalManual.toFixed(2)),
        });

        totalsRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9C3' } };
            cell.font = { bold: true };
            cell.border = {
                top: { style: 'medium' }, bottom: { style: 'medium' },
                left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            };
        });
    }

    return sheet;
}

/**
 * Manual (offline) collections.
 */
function addManualPaymentsSheet(workbook, rows) {
    const sheet = workbook.addWorksheet('Manual Collections');

    sheet.columns = [
        { header: 'Collected At', key: 'mp_collected_at', width: 18 },
        { header: 'Booking ID', key: 'booking_id', width: 12 },
        { header: 'Customer', key: 'customer_name', width: 20 },
        { header: 'Mobile', key: 'customer_mobile', width: 14 },
        { header: 'Pickup Location', key: 'b_pickup_location', width: 22 },
        { header: 'Franchise', key: 'franchise_name', width: 18 },
        { header: 'Mode', key: 'mp_mode', width: 16 },
        { header: 'Amount (Rs)', key: 'mp_amount', width: 14 },
        { header: 'Reference', key: 'mp_reference', width: 22 },
        { header: 'Collected By', key: 'collected_by_name', width: 18 },
        { header: 'Notes', key: 'mp_notes', width: 30 },
    ];

    styleHeader(sheet.getRow(1));

    rows.forEach((row, i) => {
        const dataRow = sheet.addRow({
            mp_collected_at: fmtDateTime(row.mp_collected_at),
            booking_id: row.booking_id,
            customer_name: row.customer_name || '',
            customer_mobile: row.customer_mobile || '',
            b_pickup_location: row.b_pickup_location || '',
            franchise_name: row.franchise_name || '',
            mp_mode: row.mp_mode || '',
            mp_amount: num(row.mp_amount),
            mp_reference: row.mp_reference || '',
            collected_by_name: row.collected_by_name || '',
            mp_notes: row.mp_notes || '',
        });
        styleDataRow(dataRow, i);
    });

    if (rows.length > 0) {
        const total = rows.reduce((s, r) => s + num(r.mp_amount), 0);
        const totalsRow = sheet.addRow({
            customer_name: 'TOTAL',
            mp_amount: Number(total.toFixed(2)),
        });
        totalsRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9C3' } };
            cell.font = { bold: true };
        });
    }

    return sheet;
}

/**
 * Penalties / fines / damages.
 */
function addPenaltiesSheet(workbook, rows) {
    const sheet = workbook.addWorksheet('Penalties & Fines');

    sheet.columns = [
        { header: 'Recorded At', key: 'pn_added_at', width: 18 },
        { header: 'Booking ID', key: 'booking_id', width: 12 },
        { header: 'Customer', key: 'customer_name', width: 20 },
        { header: 'Pickup Location', key: 'b_pickup_location', width: 22 },
        { header: 'Franchise', key: 'franchise_name', width: 18 },
        { header: 'Type', key: 'pn_type', width: 18 },
        { header: 'Amount (Rs)', key: 'pn_amount', width: 14 },
        { header: 'Notes', key: 'pn_notes', width: 34 },
        { header: 'Added By', key: 'added_by_name', width: 18 },
    ];

    styleHeader(sheet.getRow(1));

    rows.forEach((row, i) => {
        const dataRow = sheet.addRow({
            pn_added_at: fmtDateTime(row.pn_added_at),
            booking_id: row.booking_id,
            customer_name: row.customer_name || '',
            b_pickup_location: row.b_pickup_location || '',
            franchise_name: row.franchise_name || '',
            pn_type: row.pn_type || '',
            pn_amount: num(row.pn_amount),
            pn_notes: row.p_notes || row.pn_notes || '',
            added_by_name: row.added_by_name || '',
        });
        styleDataRow(dataRow, i);
    });

    if (rows.length > 0) {
        const total = rows.reduce((s, r) => s + num(r.pn_amount), 0);
        const totalsRow = sheet.addRow({
            customer_name: 'TOTAL',
            pn_amount: Number(total.toFixed(2)),
        });
        totalsRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9C3' } };
            cell.font = { bold: true };
        });
    }

    return sheet;
}

/**
 * Vehicle swaps and the fee collected for them.
 */
function addSwapsSheet(workbook, rows) {
    const sheet = workbook.addWorksheet('Vehicle Swaps');

    sheet.columns = [
        { header: 'Swapped At', key: 'sw_swap_at', width: 18 },
        { header: 'Booking ID', key: 'booking_id', width: 12 },
        { header: 'Customer', key: 'customer_name', width: 20 },
        { header: 'Pickup Location', key: 'b_pickup_location', width: 22 },
        { header: 'Swap #', key: 'sw_swap_number', width: 10 },
        { header: 'Old Vehicle', key: 'old_vehicle_number', width: 18 },
        { header: 'Old Model', key: 'old_bike_name', width: 18 },
        { header: 'New Vehicle', key: 'new_vehicle_number', width: 18 },
        { header: 'New Model', key: 'new_bike_name', width: 18 },
        { header: 'Free?', key: 'sw_is_free', width: 10 },
        { header: 'Charge (Rs)', key: 'sw_charge', width: 14 },
        { header: 'Reason', key: 'sw_reason', width: 30 },
    ];

    styleHeader(sheet.getRow(1));

    rows.forEach((row, i) => {
        const dataRow = sheet.addRow({
            sw_swap_at: fmtDateTime(row.sw_swap_at),
            booking_id: row.booking_id,
            customer_name: row.customer_name || '',
            b_pickup_location: row.b_pickup_location || '',
            sw_swap_number: row.sw_swap_number,
            old_vehicle_number: row.old_vehicle_number || '',
            old_bike_name: row.old_bike_name || '',
            new_vehicle_number: row.new_vehicle_number || '',
            new_bike_name: row.new_bike_name || '',
            sw_is_free: Number(row.sw_is_free) === 1 ? 'Yes' : 'No',
            sw_charge: num(row.sw_charge),
            sw_reason: row.sw_reason || '',
        });
        styleDataRow(dataRow, i);
    });

    if (rows.length > 0) {
        const total = rows.reduce((s, r) => s + num(r.sw_charge), 0);
        const totalsRow = sheet.addRow({
            customer_name: 'TOTAL CHARGES',
            sw_charge: Number(total.toFixed(2)),
        });
        totalsRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9C3' } };
            cell.font = { bold: true };
        });
    }

    return sheet;
}

module.exports = {
    addBookingsSheet,
    addManualPaymentsSheet,
    addPenaltiesSheet,
    addSwapsSheet,
};
