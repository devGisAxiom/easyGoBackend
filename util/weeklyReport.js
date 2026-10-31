const cron = require('node-cron');
const ExcelJS = require('exceljs');
const moment = require('moment');
const paymentModel = require('../model/paymentReport');
const manualPaymentModel = require('../model/manualPayment');
const penaltyModel = require('../model/penalty');
const swapModel = require('../model/swap');
const { transporter } = require('./mailer');
const logger = require('./logger');
const {
    addBookingsSheet,
    addManualPaymentsSheet,
    addPenaltiesSheet,
    addSwapsSheet,
} = require('./reportWorkbook');

/**
 * Weekly payment report.
 *
 * Runs every Monday morning and emails a workbook covering the previous
 * seven days, broken down date-wise. The same workbook can be downloaded
 * on demand from the admin panel.
 *
 * The report contains four sheets:
 *   1. Date-wise summary  — one row per day (bookings, income)
 *   2. Bookings           — every booking in the period
 *   3. Manual Collections — offline payments collected
 *   4. Penalties & Fines  — deductions raised
 *   5. Vehicle Swaps      — swaps performed and the fee charged
 */

const DAYS_IN_WEEK = 7;

function getRecipientList() {
    const configured = process.env.REPORT_EMAIL_TO;
    if (configured && configured.trim()) {
        return configured
            .split(',')
            .map((email) => email.trim())
            .filter(Boolean);
    }
    return ['sales@tgelectric.in', 'accounts@tgelectric.in'];
}

/**
 * The reporting window: the 7 days ending on `reportDate`.
 *
 * @param {string} [reportDate] YYYY-MM-DD. Defaults to yesterday.
 */
function getDateRangeForWeeklyReport(reportDate) {
    const end = reportDate
        ? moment(reportDate, 'YYYY-MM-DD')
        : moment().subtract(1, 'day');
    const start = end.clone().subtract(DAYS_IN_WEEK - 1, 'days');

    return {
        start_date: start.format('YYYY-MM-DD'),
        end_date: end.format('YYYY-MM-DD'),
        condition: 'WHERE DATE(b.booking_date) BETWEEN ? AND ?',
        params: [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')],
    };
}

/**
 * Per-day summary rows.
 */
function buildDateWiseSummary(rows) {
    const byDate = new Map();

    for (const row of rows) {
        const key = row.booking_date
            ? moment(row.booking_date).format('YYYY-MM-DD')
            : 'Unknown';

        if (!byDate.has(key)) {
            byDate.set(key, {
                date: key,
                bookings: 0,
                paid_bookings: 0,
                rent: 0,
                gst: 0,
                deposit: 0,
                fines: 0,
                total: 0,
            });
        }

        const bucket = byDate.get(key);
        bucket.bookings += 1;

        const paymentStatus = String(row.b_payment_status || '').toLowerCase();
        if (paymentStatus === 'paid') bucket.paid_bookings += 1;

        const rent = parseFloat(row.b_rent_amount || 0);
        const gst = parseFloat(
            row.rent_gst !== undefined && row.rent_gst !== null
                ? row.rent_gst
                : (rent * 0.05).toFixed(2),
        );

        bucket.rent += rent;
        bucket.gst += gst;
        bucket.deposit += parseFloat(row.rent_deposit || 0);
        bucket.fines += parseFloat(row.b_fine_amount || 0);
        bucket.total += parseFloat(row.b_total_amount || 0);
    }

    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function addDateWiseSheet(workbook, summaryRows, range) {
    const sheet = workbook.addWorksheet('Date-wise Summary');

    sheet.columns = [
        { header: 'Date', key: 'date', width: 14 },
        { header: 'Bookings', key: 'bookings', width: 12 },
        { header: 'Paid Bookings', key: 'paid_bookings', width: 16 },
        { header: 'Rent (Rs)', key: 'rent', width: 14 },
        { header: 'GST (Rs)', key: 'gst', width: 12 },
        { header: 'Deposit (Rs)', key: 'deposit', width: 14 },
        { header: 'Fines (Rs)', key: 'fines', width: 12 },
        { header: 'Total (Rs)', key: 'total', width: 14 },
    ];

    const header = sheet.getRow(1);
    header.height = 22;
    header.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });

    summaryRows.forEach((r, i) => {
        const row = sheet.addRow({
            date: moment(r.date).format('DD/MM/YYYY'),
            bookings: r.bookings,
            paid_bookings: r.paid_bookings,
            rent: Number(r.rent.toFixed(2)),
            gst: Number(r.gst.toFixed(2)),
            deposit: Number(r.deposit.toFixed(2)),
            fines: Number(r.fines.toFixed(2)),
            total: Number(r.total.toFixed(2)),
        });

        const fillColor = i % 2 === 0 ? 'FFFFFFFF' : 'FFF1F5FF';
        row.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
            cell.alignment = { vertical: 'middle' };
        });
    });

    if (summaryRows.length > 0) {
        const totalsRow = sheet.addRow({
            date: 'TOTAL',
            bookings: summaryRows.reduce((s, r) => s + r.bookings, 0),
            paid_bookings: summaryRows.reduce((s, r) => s + r.paid_bookings, 0),
            rent: Number(summaryRows.reduce((s, r) => s + r.rent, 0).toFixed(2)),
            gst: Number(summaryRows.reduce((s, r) => s + r.gst, 0).toFixed(2)),
            deposit: Number(summaryRows.reduce((s, r) => s + r.deposit, 0).toFixed(2)),
            fines: Number(summaryRows.reduce((s, r) => s + r.fines, 0).toFixed(2)),
            total: Number(summaryRows.reduce((s, r) => s + r.total, 0).toFixed(2)),
        });
        totalsRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9C3' } };
            cell.font = { bold: true };
        });
    }

    // Period label under the table.
    sheet.addRow({});
    sheet.addRow({
        date: 'Period',
        bookings: `${range.start_date} to ${range.end_date}`,
    });

    return sheet;
}

/**
 * Build the weekly workbook.
 */
async function buildWeeklyWorkbook(range, rows) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'EasyGo Backend';
    workbook.created = new Date();

    const summaryRows = buildDateWiseSummary(rows);
    addDateWiseSheet(workbook, summaryRows, range);
    addBookingsSheet(workbook, rows, { title: 'Bookings' });

    // Manual collections, penalties and swaps for the same window.
    const manualPayments = await manualPaymentModel.listManualPayments({
        from_date: range.start_date,
        to_date: range.end_date,
    });
    if (manualPayments.length) {
        addManualPaymentsSheet(workbook, manualPayments);
    }

    const penalties = await penaltyModel.listPenalties({
        from_date: range.start_date,
        to_date: range.end_date,
    });
    if (penalties.length) {
        addPenaltiesSheet(workbook, penalties);
    }

    const swaps = await swapModel.listSwaps({
        from_date: range.start_date,
        to_date: range.end_date,
    });
    if (swaps.length) {
        addSwapsSheet(workbook, swaps);
    }

    return workbook.xlsx.writeBuffer();
}

/**
 * Send the weekly report by email.
 */
async function sendWeeklyPaymentReport(reportDate = null) {
    const range = getDateRangeForWeeklyReport(reportDate);
    const recipients = getRecipientList();

    if (recipients.length === 0) {
        logger.warn('Weekly payment report skipped: no recipients configured');
        return;
    }

    try {
        const rows = await paymentModel.getPaymentReport(range.condition, range.params);
        const buffer = await buildWeeklyWorkbook(range, rows);
        const fileName = `EasyGo_Weekly_Payment_Report_${range.start_date}_to_${range.end_date}.xlsx`;

        await transporter.sendMail({
            from: `EASYGO <${process.env.EMAIL}>`,
            to: recipients.join(','),
            subject: `EasyGo Weekly Payment Report - ${range.start_date} to ${range.end_date}`,
            text: `Attached is the EasyGo weekly payment report for ${range.start_date} to ${range.end_date}. Total bookings: ${rows.length}.`,
            attachments: [
                {
                    filename: fileName,
                    content: buffer,
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                },
            ],
        });

        logger.info('Weekly payment report sent successfully', {
            start_date: range.start_date,
            end_date: range.end_date,
            recipients,
            bookingsCount: rows.length,
        });

        return { rows: rows.length, range };
    } catch (error) {
        logger.error('Weekly payment report failed: %s', error.message);
        throw error;
    }
}

/**
 * Register the Monday 6 AM IST cron.
 */
function scheduleWeeklyPaymentReport() {
    const timezone = process.env.REPORT_TIMEZONE || 'Asia/Kolkata';

    cron.schedule(
        '0 6 * * 1',
        async () => {
            try {
                await sendWeeklyPaymentReport();
            } catch (err) {
                logger.error('Weekly payment report failed: %s', err.message);
            }
        },
        { timezone },
    );

    logger.info('Weekly payment report scheduler initialized', {
        schedule: '0 6 * * 1',
        timezone,
    });
}

module.exports = {
    scheduleWeeklyPaymentReport,
    sendWeeklyPaymentReport,
    getDateRangeForWeeklyReport,
    buildWeeklyWorkbook,
    buildDateWiseSummary,
    DAYS_IN_WEEK,
};
