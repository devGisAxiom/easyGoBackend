const cron = require('node-cron');
const ExcelJS = require('exceljs');
const moment = require('moment');
const model = require('../model/paymentReport');
const loginModel = require('../model/login');
const { transporter } = require('./mailer');
const logger = require('./logger');

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

function getDateRangeForDailyReport(reportDate) {
    const date = reportDate || moment().subtract(1, 'day').format('YYYY-MM-DD');
    return {
        reportDate: date,
        condition: `WHERE DATE(b.booking_date) = '${date}'`,
    };
}

async function buildWorkbook(reportDate, rows) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'EasyGo Backend';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Daily Payment Report');
    sheet.columns = [
        { header: 'Booking ID', key: 'b_id', width: 12 },
        { header: 'Booking Date', key: 'booking_date', width: 16 },
        { header: 'Customer Name', key: 'u_name', width: 20 },
        { header: 'Mobile', key: 'u_mobile', width: 14 },
        { header: 'Email', key: 'u_email', width: 26 },
        { header: 'Vehicle Number', key: 'vehicle_number', width: 16 },
        { header: 'Bike Name', key: 'bike_name', width: 18 },
        { header: 'Duration', key: 'rent_duration_text', width: 14 },
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
    ];

    const header = sheet.getRow(1);
    header.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    rows.forEach((row) => {
        const rent = parseFloat(row.b_rent_amount || 0);
        const gst = parseFloat(
            row.rent_gst !== undefined && row.rent_gst !== null
                ? row.rent_gst
                : (rent * 0.05).toFixed(2)
        );

        sheet.addRow({
            b_id: row.b_id,
            booking_date: row.booking_date ? moment(row.booking_date).format('DD/MM/YYYY') : '',
            u_name: row.u_name || '',
            u_mobile: row.u_mobile || '',
            u_email: row.u_email || '',
            vehicle_number: row.vehicle_number || '',
            bike_name: row.bike_name || '',
            rent_duration_text: row.rent_duration_text || '',
            b_rent_amount: rent,
            gst,
            rent_deposit: parseFloat(row.rent_deposit || 0),
            b_fine_amount: parseFloat(row.b_fine_amount || 0),
            b_total_amount: parseFloat(row.b_total_amount || 0),
            b_payment_status: row.b_payment_status || '',
            payment_mode: row.b_payment_mode || '',
            b_status: row.b_status || '',
            // Deposit return columns (SRS §7)
            deposit_returned: row.deposit_gpay_ref ? 'Yes' : 'No',
            deposit_returned_amount: parseFloat(row.deposit_returned_amount || 0),
            deposit_gpay_ref: row.deposit_gpay_ref || '',
            deposit_returned_at: row.deposit_returned_at ? moment(row.deposit_returned_at).format('DD/MM/YYYY HH:mm') : '',
        });
    });

    sheet.addRow({});
    sheet.addRow({
        b_id: 'Report Date',
        booking_date: moment(reportDate).format('DD/MM/YYYY'),
    });

    return workbook.xlsx.writeBuffer();
}

async function sendNightlyPaymentReport() {
    const { reportDate, condition } = getDateRangeForDailyReport();
    const recipients = getRecipientList();

    if (recipients.length === 0) {
        logger.warn('Nightly payment report skipped: no recipients configured');
        return;
    }

    try {
        const rows = await model.getPaymentReport(condition);
        const fileBuffer = await buildWorkbook(reportDate, rows);
        const fileName = `EasyGo_Daily_Payment_Report_${reportDate}.xlsx`;

        await transporter.sendMail({
            from: `EASYGO <${process.env.EMAIL}>`,
            to: recipients.join(','),
            subject: `EasyGo Daily Payment Report - ${reportDate}`,
            text: `Attached is the EasyGo payment report for ${reportDate}. Total bookings: ${rows.length}.`,
            attachments: [
                {
                    filename: fileName,
                    content: fileBuffer,
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                },
            ],
        });

        logger.info('Nightly payment report sent successfully', {
            reportDate,
            recipients,
            bookingsCount: rows.length,
        });
    } catch (error) {
        logger.error('Nightly payment report failed: %s', error.message);
        throw error;
    }
}

function scheduleNightlyPaymentReport() {
    const timezone = process.env.REPORT_TIMEZONE || 'Asia/Kolkata';

    cron.schedule(
        '0 0 * * *',
        async () => {
            try {
                await sendNightlyPaymentReport();
            } catch (err) {
                logger.error('Nightly payment report failed: %s', err.message);
            }

            // Clean up JWT rows whose expiry has already passed. Keeps the
            // user_token table from growing forever now that we allow
            // multiple sessions per user.
            try {
                const result = await loginModel.CleanupExpiredTokens();
                logger.info('Expired token cleanup deleted %d rows', result.affectedRows || 0);
            } catch (err) {
                logger.error('Expired token cleanup failed: %s', err.message);
            }
        },
        { timezone }
    );

    logger.info('Nightly payment report scheduler initialized', {
        schedule: '0 0 * * *',
        timezone,
    });
}

module.exports = {
    scheduleNightlyPaymentReport,
    sendNightlyPaymentReport,
};
