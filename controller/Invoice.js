const model = require("../model/invoice");
const moment = require("moment");
const nodemailer = require("nodemailer");
const logger = require('../util/logger');

module.exports.Invoice = async (req, res) => {
    try {
        const { b_id } = req.body;

        if (!b_id) {
            return res.send({
                result: false,
                message: "Booking id is required",
            });
        }

        var today = moment().format('MMM_DD_YYYY')
        const bookinglist = await model.getBooking(b_id);

        if (!bookinglist || bookinglist.length === 0) {
            return res.send({
                result: false,
                message: "Booking details not found",
            });
        }
        const booking = bookinglist[0];

        const userlist = await model.getUser(booking.b_u_id);

        if (!userlist || userlist.length === 0) {
            return res.send({
                result: false,
                message: "User details not found",
            });
        }

        const user = userlist[0];

        if (booking.b_status?.toLowerCase() !== "completed") {
            return res.send({
                result: false,
                message: "Cannot generate Invoice. This booking is not completed.",
            });
        }

        // ✅ Email HTML
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Bike Rental Invoice</title>

<style>
/* ======================
   Base
====================== */
* { box-sizing: border-box; }

body {
    margin: 0;
    padding: 12px;
    background: #f3fdf6;
    font-family: Arial, Helvetica, sans-serif;
    color: #1f2937;
}

.invoice-wrapper {
    max-width: 860px;
    margin: auto;
    background: #ffffff;
    border-radius: 18px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    overflow: hidden;
}

/* ======================
   HEADER (GREEN)
====================== */
.invoice-header {
    background: linear-gradient(135deg, #4ade80, #22c55e);
    color: #ffffff;
    padding: 28px 20px;
    text-align: center;
}

.brand h1 {
    margin: 0;
    font-size: 30px;
    letter-spacing: 1.5px;
}

.brand small {
    display: block;
    margin-top: 4px;
    font-size: 14px;
    opacity: 0.95;
}

.invoice-meta {
    margin-top: 12px;
    font-size: 15px;
}

.invoice-meta strong {
    display: block;
    font-size: 20px;
    letter-spacing: 1px;
}

/* ======================
   Body
====================== */
.invoice-body {
    padding: 26px;
}

.section {
    margin-bottom: 34px;
}

.section h3 {
    color: #16a34a;
    font-size: 15px;
    letter-spacing: 1px;
    border-bottom: 2px solid #dcfce7;
    padding-bottom: 8px;
}

/* ======================
   Customer Info
====================== */
.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    margin-top: 16px;
}

.info-box p {
    margin: 6px 0;
    font-size: 15px;
    color: #374151;
}

.info-box strong {
    color: #14532d;
}

/* ======================
   Table (Desktop)
====================== */
table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 18px;
}

thead {
    background: #dcfce7;
}

th, td {
    padding: 14px;
    border-bottom: 1px solid #e5e7eb;
}

th {
    text-align: left;
    color: #14532d;
}

th:last-child,
td:last-child {
    text-align: right;
}

/* Hide labels inside table cells on desktop */
.label {
    display: none;
}

/* ======================
   Total
====================== */
.amount-summary {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
}

.total-box {
    background: #ecfdf5;
    border-radius: 14px;
    padding: 18px 24px;
    min-width: 280px;
    border: 1px solid #bbf7d0;
}

.total-box p {
    margin: 0;
    display: flex;
    justify-content: space-between;
    font-size: 18px;
    font-weight: 700;
    color: #16a34a;
}

/* ======================
   Footer
====================== */
.invoice-footer {
    text-align: center;
    padding: 20px;
    font-size: 13px;
    color: #4b5563;
    border-top: 1px solid #dcfce7;
}

/* ======================
   MOBILE FIX
====================== */
@media (max-width: 600px) {

    .invoice-body {
        padding: 16px;
    }

    .info-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    /* Show labels on mobile */
    .label {
        display: block;
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        font-weight: 600;
        position: relative;
        padding-right: 10px;
    }

    /* Add colon after label */
    .label::after {
        content: ":";
        position: absolute;
        right: 0;
        top: 0;
        font-weight: 600;
    }

    .value {
        font-size: 15px;
        color: #14532d;
        padding-left: 10px;
        display: inline-block;
    }

    .value.strong {
        font-size: 20px;
        font-weight: 700;
        color: #16a34a;
    }

    /* TABLE → CARD style on mobile */
    thead {
        display: none;
    }

    table, tbody, tr {
        display: block;
        width: 100%;
    }

    tr.mobile-card {
        background: #f0fdf4;
        border-radius: 16px;
        padding: 18px 20px;
        margin-top: 16px;
        border: 1px solid #bbf7d0;
    }

    td {
        display: flex;
        justify-content: flex-start;
        align-items: baseline;
        border: none;
        padding: 14px 0;
    }

    .amount-summary {
        justify-content: center;
    }

    /* Total Paid label and value as block with colon on mobile */
    .total-box p.total-paid {
        display: block;
        font-weight: 700;
        font-size: 18px;
        color: #16a34a;
    }

    .total-paid .label {
        display: inline-block;
        position: relative;
        padding-right: 8px;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        font-weight: 700;
    }

    .total-paid .label::after {
        content: ":";
        position: absolute;
        right: 0;
        top: 0;
        font-weight: 700;
    }

    .total-paid .value {
        padding-left: 12px;
        font-size: 18px;
        color: #16a34a;
        font-weight: 700;
        display: inline-block;
    }

    .total-box {
        width: 100%;
    }
}
</style>
</head>

<body>

<div class="invoice-wrapper">

    <!-- HEADER -->
    <div class="invoice-header">
        <div class="brand">
            <h1>EASYGO</h1>
            <small>Bike Rental Services</small>
        </div>
        <div class="invoice-meta">
            <strong>INVOICE</strong>
            Date: ${today}
        </div>
    </div>

    <div class="invoice-body">

        <!-- CUSTOMER -->
        <div class="section">
            <h3>CUSTOMER DETAILS</h3>
            <div class="info-grid">
                <div class="info-box">
                    <p><strong>Name:</strong> ${user.u_name}</p>
                    <p><strong>Email:</strong> ${user.u_email}</p>
                    <p><strong>Phone:</strong> ${user.u_mobile}</p>
                </div>

                ${user.u_address ? `
                <div class="info-box">
                    <p><strong>Address:</strong></p>
                    <p>${user.u_address}<br>${user.u_district} – ${user.u_pincode}</p>
                </div>
                ` : ``}

                <div class="info-box">
                    <p><strong>Vehicle:</strong> ${booking.vehicle_number || '—'}</p>
                    <p><strong>Bike:</strong> ${booking.bike_name || '—'}</p>
                    <p><strong>Duration:</strong> ${booking.rent_duration_text || '—'}</p>
                </div>
            </div>
        </div>

        <!-- RENTAL -->
        <div class="section">
            <h3>RENTAL SUMMARY</h3>

            <table>
                <thead>
                    <tr>
                        <th>Booking Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="mobile-card">
                        <td rowspan="5" style="vertical-align:top;">
                            <span class="label">Booking Date</span>
                            <span class="value">${booking.booking_date}</span>
                        </td>
                        <td>
                            <span class="label">Description</span>
                            <span class="value">Rental Fee (${booking.rent_duration_text || ''})</span>
                        </td>
                        <td>
                            <span class="label">Amount</span>
                            <span class="value">₹${parseFloat(booking.rd_rent_amount || booking.b_rent_amount).toFixed(2)}</span>
                        </td>
                    </tr>
                    <tr class="mobile-card">
                        <td>
                            <span class="label">Description</span>
                            <span class="value">GST (5%)</span>
                        </td>
                        <td>
                            <span class="label">Amount</span>
                            <span class="value">₹${parseFloat(booking.rd_rent_gst || 0).toFixed(2)}</span>
                        </td>
                    </tr>
                    <tr class="mobile-card">
                        <td>
                            <span class="label">Description</span>
                            <span class="value">Refundable Deposit</span>
                        </td>
                        <td>
                            <span class="label">Amount</span>
                            <span class="value">₹${parseFloat(booking.rd_rent_deposit || 0).toFixed(2)}</span>
                        </td>
                    </tr>
                    ${booking.b_fine_amount && parseFloat(booking.b_fine_amount) > 0 ? `
                    <tr class="mobile-card">
                        <td>
                            <span class="label">Description</span>
                            <span class="value">Fine / Extra Charges</span>
                        </td>
                        <td>
                            <span class="label">Amount</span>
                            <span class="value">₹${parseFloat(booking.b_fine_amount).toFixed(2)}</span>
                        </td>
                    </tr>
                    ` : ``}
                    <tr class="mobile-card" style="font-weight:bold;">
                        <td>
                            <span class="label">Description</span>
                            <span class="value strong">Total</span>
                        </td>
                        <td>
                            <span class="label">Amount</span>
                            <span class="value strong">₹${parseFloat(booking.b_total_amount).toFixed(2)}</span>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="amount-summary">
                <div class="total-box">
                    <p class="total-paid">
                        <span class="label">Total Paid</span>
                        <span class="value">₹${parseFloat(booking.b_total_amount).toFixed(2)}</span>
                    </p>
                </div>
            </div>
        </div>

    </div>

    <div class="invoice-footer">
        Thank you for choosing <strong>EasyGo</strong> 🚴‍♂️
    </div>

</div>

</body>
</html>
`;


        // ✅ Email setup
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        // ✅ Send the mail
        await transporter.sendMail({
            from: `EASYGO <${process.env.EMAIL}>`,
            to: booking.u_email,
            subject: "EasyGo Invoice",
            html: htmlContent,
        });

        logger.info("Invoice email sent successfully to %s", booking.u_email);

        return res.send({
            result: true,
            message: "Invoice email sent successfully.",
        });

    } catch (error) {
        logger.error("Error sending invoice email:", error);
        return res.send({
            result: false,
            message: error.message,
        });
    }
};
