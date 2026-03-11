var db = require("../config/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);
var nodemailer = require('nodemailer')
var { transporter } = require("../util/mailer");
const logger = require('../util/logger');
const notify = require('../util/notification');


module.exports.RazorpayCallback = async (req, res) => {

    let booking_id = req.query.booking_id
    let getUser
    let booking
    if (req.query.razorpay_payment_link_status == 'paid') {

        logger.info("RazorpayCallback: Payment Paid for booking_id %s", booking_id);

        let updateOrder = await UpdateBookingChange(booking_id)

        if (updateOrder.affectedRows > 0) {
            let status = 'Paid'
            let updatePayment = await UpdatePaymentChange(booking_id, status)

            booking = await getBooking(booking_id)

            getUser = await GetUser(booking[0]?.b_u_id)


            await notify.addNotification(
                booking[0]?.b_u_id,
                "1",
                "user",
                "Booking",
                "our ride has been successfully booked.",
                "unread",
                notification_image = null
            );

            await notify.addNotification(
                booking[0]?.b_u_id,
                "1",
                "user",
                "payment",
                "Your payment for the booking is successful!",
                "unread",
                notification_image = null
            );

            await transporter.sendMail({
                from: `EASYGO <${process.env.EMAIL}>`,
                to: getUser[0]?.u_email,
                subject: "MESSAGE FROM EASYGO",
                html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Payment Successful</title>
<style>
    body {
        margin: 0;
        padding: 20px;
        background-color: #eef1f5;
        font-family: Arial, Helvetica, sans-serif;
    }

    .email-wrapper {
        max-width: 620px;
        margin: auto;
        background: #ffffff;
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 8px 25px rgba(0,0,0,0.08);
    }

    .top-bar {
        background: #0d6efd;
        padding: 12px;
        text-align: center;
        color: #fff;
        font-size: 14px;
        font-weight: bold;
        letter-spacing: 0.5px;
    }

    .content {
        padding: 35px 30px;
        color: #333;
    }

    .badge {
        display: inline-block;
        background: #e6f7ee;
        color: #1e7e34;
        padding: 8px 14px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 20px;
    }

    h1 {
        font-size: 26px;
        margin: 0 0 10px 0;
    }

    p {
        font-size: 16px;
        line-height: 1.6;
        margin: 0 0 20px 0;
        color: #555;
    }

    .summary-box {
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 20px;
        background: #fafafa;
        margin-bottom: 25px;
    }

    .row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        font-size: 15px;
        border-bottom: 1px dashed #ddd;
    }

    .row:last-child {
        border-bottom: none;
        font-weight: bold;
        font-size: 16px;
    }

    .label {
        color: #666;
    }

    .value {
        color: #111;
        font-weight: 600;
    }

    .cta {
        display: inline-block;
        background: #0d6efd;
        color: #fff;
        text-decoration: none;
        padding: 14px 32px;
        border-radius: 10px;
        font-size: 16px;
        font-weight: bold;
        margin-top: 10px;
    }

    .cta:hover {
        background: #084298;
    }

    .footer {
        background: #f7f8fa;
        padding: 20px;
        text-align: center;
        font-size: 13px;
        color: #777;
    }

    .footer a {
        color: #0d6efd;
        text-decoration: none;
    }

    @media (max-width: 600px) {
        .content {
            padding: 25px 20px;
        }
        h1 {
            font-size: 22px;
        }
    }
</style>
</head>

<body>

<div class="email-wrapper">
    <div class="top-bar">
        EASYGO BIKE RENTALS
    </div>

    <div class="content">
        <span class="badge">✔ PAYMENT CONFIRMED</span>

        <h1>Hello ${getUser[0]?.u_name},</h1>

        <p>
            Your payment has been successfully processed.
            Your bike rental booking is now confirmed and ready to go!
        </p>

        <div class="summary-box">

            <div class="row">
                <span class="label">Pickup Date :</span>
                <span class="value">${booking[0]?.b_pickup_date}</span>
            </div>

            <div class="row">
                <span class="label">Duration :</span>
                <span class="value">${booking[0]?.b_drop_date}</span>
            </div>

            <div class="row">
                <span class="label">Bike Rent :</span>
                <span class="value">${booking[0]?.b_rent_amount}</span>
            </div>

            ${booking[0]?.b_fine_amount !== null && booking[0]?.b_fine_amount !== 0 ? `
            <div class="row">
                <span class="label">Additional Charge :</span>
                <span class="value">${booking[0]?.b_fine_amount}</span>
            </div>
            ` : ''}

            <div class="row">
                <span class="label">Total Paid :</span>
                <span class="value">${booking[0]?.b_total_amount}</span>
            </div>

        </div>

        <a href="#" class="cta">Open Booking in App</a>

        <p style="margin-top:25px;">
            Thanks for riding with <strong>EasyGo</strong>.
            We wish you a smooth and enjoyable journey!
        </p>
    </div>

    <div class="footer">
        <p>
            Need help? Contact us at
            <a href="mailto:support@easygo.com">support@easygo.com</a>
        </p>
        <p>
            &copy; ${new Date().getFullYear()} EasyGo. All rights reserved.
        </p>
    </div>
</div>

</body>
</html>
`,
            });

            // return res.redirect('https://lozara.shop/');

            return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Payment Successful</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
<style>
    body {
        font-family: 'Poppins', sans-serif;
        margin: 0;
        padding: 0;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #f0f4f8;
        overflow: hidden;
    }

    /* Floating confetti circles */
    .confetti {
        position: absolute;
        width: 10px;
        height: 10px;
        background: #ffca28;
        border-radius: 50%;
        animation: fall 3s infinite linear;
    }

    @keyframes fall {
        0% { transform: translateY(-50px) rotate(0deg); opacity: 1;}
        100% { transform: translateY(600px) rotate(360deg); opacity: 0;}
    }

    .success-card {
        background: #fff;
        border-radius: 25px;
        max-width: 420px;
        width: 90%;
        text-align: center;
        padding: 50px 25px;
        box-shadow: 0 25px 50px rgba(0,0,0,0.1);
        position: relative;
        z-index: 1;
    }

    .checkmark {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: linear-gradient(135deg, #43e97b, #38f9d7);
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 auto 25px auto;
        position: relative;
        animation: pop 0.5s ease forwards;
    }

    .checkmark::after {
        content: '✔';
        font-size: 50px;
        color: white;
        opacity: 0;
        transform: scale(0);
        animation: check 0.5s 0.3s forwards;
    }

    @keyframes pop {
        0% { transform: scale(0); }
        100% { transform: scale(1); }
    }
    @keyframes check {
        0% { opacity: 0; transform: scale(0);}
        100% { opacity: 1; transform: scale(1);}
    }

    h1 {
        font-size: 28px;
        color: #333;
        margin-bottom: 15px;
    }

    p {
        font-size: 16px;
        color: #666;
        margin-bottom: 30px;
    }

    .details {
        background: #f1f5f9;
        padding: 20px;
        border-radius: 15px;
        text-align: left;
        margin-bottom: 30px;
    }
    .details p { margin: 8px 0; }
    .details span { font-weight: 600; }

    .btn {
        padding: 14px 30px;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        color: #fff;
        cursor: pointer;
        transition: transform 0.2s, opacity 0.2s;
    }

    .btn-primary { background: linear-gradient(135deg, #6a11cb, #2575fc); }
    .btn-primary:hover { transform: translateY(-3px); opacity: 0.9; }

    .app-info {
        font-size: 14px;
        color: #999;
        margin-top: 15px;
    }

    @media (max-width: 480px) {
        .success-card { padding: 40px 20px; }
        h1 { font-size: 24px; }
        .btn { width: 100%; }
    }
</style>
</head>
<body>

<!-- Floating confetti -->
<div class="confetti" style="left:10%; animation-delay:0s;"></div>
<div class="confetti" style="left:30%; animation-delay:0.5s;"></div>
<div class="confetti" style="left:50%; animation-delay:1s;"></div>
<div class="confetti" style="left:70%; animation-delay:1.5s;"></div>
<div class="confetti" style="left:90%; animation-delay:2s;"></div>

<div class="success-card">
    <div class="checkmark"></div>
    <h1>Payment Successful!</h1>
    <p>Thank you, ${getUser[0]?.u_name}. Your bike rental booking is confirmed.</p>

    <div class="details">
        <p>📅 <span>Rental Date:</span> ${booking[0]?.b_pickup_date}</p>
        <p>⏳ <span>Duration:</span> ${booking[0]?.b_drop_date}</p>
        <p>💰 <span>Total Paid:</span> ${booking[0]?.b_total_amount}</p>
    </div>

    <button class="btn btn-primary" onclick="openApp()">📱 Continue to App</button>

</div>

<script>
function openApp() {
    const deepLink = "easygo://payment_return?status=success&user_id=${getUser[0]?.u_id}";
    window.location.href = deepLink;
    setTimeout(() => {
        if (!document.hidden) alert('EasyGo app not found. Please install it.');
    }, 2000);
}
</script>
</body>
</html> `)

        }
    } else {

        await notify.addNotification(
            booking[0]?.b_u_id,
            "1",
            "user",
            "payment",
            "Your booking payment has failed.",
            "unread",
            notification_image = null
        );

        logger.warn("RazorpayCallback: Payment Failed for booking_id %s", booking_id);
        await DeleteOrder(booking_id)
        let status = 'Failed'
        let updatePayment = await UpdatePaymentChange(booking_id, status)

        return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Payment Failed</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
<style>
    body {
        font-family: 'Poppins', sans-serif;
        margin: 0;
        padding: 0;
        background: linear-gradient(135deg, #ffe6e6 0%, #fff5f5 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
    }

    /* Container */
    .fail-card {
        background: #fff;
        border-radius: 25px;
        max-width: 450px;
        width: 90%;
        text-align: center;
        padding: 50px 25px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        position: relative;
        animation: fadeIn 0.8s ease forwards;
    }

    @keyframes fadeIn {
        from {opacity: 0; transform: translateY(-20px);}
        to {opacity: 1; transform: translateY(0);}
    }

    /* Animated error icon */
    .fail-icon {
        width: 100px;
        height: 100px;
        margin: 0 auto 25px auto;
        background: #e53935;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        animation: shake 0.5s ease-in-out infinite alternate;
    }

    .fail-icon::after {
        content: "✖";
        color: #fff;
        font-size: 50px;
    }

    @keyframes shake {
        0% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        50% { transform: translateX(5px); }
        75% { transform: translateX(-5px); }
        100% { transform: translateX(5px); }
    }

    h1 {
        font-size: 28px;
        color: #e53935;
        margin-bottom: 15px;
    }

    p {
        font-size: 16px;
        color: #555;
        margin-bottom: 30px;
    }

    .details {
        background: #ffecec;
        border-radius: 15px;
        padding: 20px;
        text-align: left;
        margin-bottom: 30px;
        box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
    }

    .details p {
        margin: 8px 0;
        font-size: 15px;
    }
    .details span {
        font-weight: 600;
        color: #333;
    }

    .btn {
        padding: 14px 30px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        color: #fff;
        cursor: pointer;
        border: none;
        transition: 0.3s;
    }
    .btn-primary {
        background: linear-gradient(135deg, #6a11cb, #2575fc);
    }
    .btn-primary:hover {
        transform: translateY(-3px);
        opacity: 0.9;
    }

    .app-info {
        margin-top: 15px;
        font-size: 14px;
        color: #777;
        font-style: italic;
    }

    @media (max-width: 480px) {
        .fail-card { padding: 40px 20px; }
        h1 { font-size: 24px; }
        .btn { width: 100%; }
    }
</style>
</head>
<body>

<div class="fail-card">
    <div class="fail-icon"></div>
    <h1>Payment Failed</h1>
    <p>Oops! We couldn’t process your payment. You can try again or contact support for assistance.</p>

    <div class="details">
        <p>📅 <span>Rental Date:</span> ${booking[0]?.b_pickup_date}</p>
        <p>⏳ <span>Duration:</span> ${booking[0]?.b_drop_date}</p>
        <p>💰 <span>Amount:</span> ${booking[0]?.b_total_amount}</p>
    </div>

    <button class="btn btn-primary" onclick="openApp()">📱 Continue to App</button>
    <p class="app-info">Tap the button to view your booking in the EasyGo app</p>
</div>

<script>
    function openApp() {
        const deepLink = "easygo://payment_return?status=failed&&user_id=${getUser[0]?.u_id}";
        window.location.href = deepLink;
        setTimeout(() => {
            if (!document.hidden) alert('EasyGo app not found. Please install it.');
        }, 2000);
    }
</script>

</body>
</html>
`)
    }
}

async function DeleteOrder(booking_id) {
    var Query = `delete from bookings where b_id = ?`;
    var data = await query(Query, [booking_id]);
    return data;
};

async function UpdateBookingChange(booking_id) {
    var Query = `update bookings set b_payment_status = ? where b_id = ?`;
    var data = await query(Query, ['paid', booking_id]);
    return data;
};

async function UpdatePaymentChange(ph_booking_id, status) {
    var Query = `update paymentHistory set ph_status = ? where ph_booking_id = ?`;
    var data = await query(Query, [status, ph_booking_id]);
    return data;
};

async function getBooking(booking_id) {
    var Query = `select * from bookings where b_id = ?`;
    var data = await query(Query, [booking_id]);
    return data;
};

async function GetUser(user_id) {
    var Query = `select * from user where u_id = ?`;
    var data = await query(Query, [user_id]);
    return data;
};
