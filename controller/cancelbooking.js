var model = require('../model/cancelbooking')
const notify = require('../util/notification');
const logger = require('../util/logger');
const moment = require("moment");

module.exports.cancelBooking = async (req, res) => {
    try {
        let { u_id } = req.user;

        let { b_id, view_reason } = req.body;

        if (!b_id || !view_reason) {
            logger.warn("Cancel Booking failed: All fields are required");
            return res.send({
                result: false,
                message: "All fields are required"
            });
        }

        const booking = await model.findBooking(b_id, u_id);
        if (booking.length === 0) {
            logger.warn("Cancel Booking failed: Booking not found (ID: %s)", b_id);
            return res.send({
                result: false,
                message: "Booking not found"
            });
        }

        // Check if pickup date is more than 7 days ago
        const pickupDate = moment(booking[0].pickup_date, "YYYY-MM-DD");
        const now = moment();
        const diffDays = now.diff(pickupDate, "days");

        if (diffDays < 7 ) {
            logger.warn("Cancel Booking failed: Condition not met (Diff: %d, Status: %s)", diffDays, booking[0].b_status);
            return res.send({
                result: false,
                message: "Booking cannot be cancelled! ,contact Adminstrator"
            });
        }
        if (booking[0].b_status == 'approved') {
            logger.warn("Cancel Booking request: Booking already approved sended request (ID: %s)", b_id);
        const cancelResult = await model.cancelBookingreq(b_id, u_id, view_reason);

            return res.send({
                result: true,
                message: "This booking cannot be cancelled as it has already been approved. A cancellation request has been sent. Please contact the administrator for quick assistance."
            });
        }

        const cancelResult = await model.cancelBookingById(b_id, u_id, view_reason);

        if (cancelResult.affectedRows > 0) {
            let getadmin = await model.GetAdmin();

            await notify.addNotification(u_id, getadmin[0]?.u_id,
                "user",
                "Booking",
                "Your booking has been cancelled successfully.",
                "unread"
            );

            return res.send({
                result: true,
                message: "Booking cancelled successfully"
            });
        } else {
            logger.warn("Cancel Booking failed: Update failed or already cancelled (ID: %s)", b_id);
            return res.send({
                result: false,
                message: "Booking not found or already cancelled"
            });
        }

    } catch (error) {
        logger.error("Cancel Booking error: %s", error.message);
        return res.send({
            result: false,
            message: error.message
        });
    }
};



// module.exports.CancelOrder = async (req, res) => { //BHAKSHANAGL CODE
//     try {
//         const { user_id } = req?.user || req?.headers
//         var order_id = req.body.order_id;
//         if (!user_id || !order_id) {
//             logger.warn("Cancel Order failed: All fields are required");
//             return res.send({
//                 result: false,
//                 message: "All fields are required"
//             })
//         }
//         let checkuser = await model.CheckUser(user_id);
//         if (checkuser.length > 0) {
//             let checkorder = await model.CheckOrder(order_id, user_id);
//             let getaddress = await model.Getaddress(checkorder[0]?.address_id);

//             var order_date = checkorder[0]?.created_at
//             logger.info("Order details: %o", checkorder)
//             if (checkorder.length > 0) {
//                 if (checkorder[0].order_payment_method !== 'Cash on Delivery') {
//                     var paymentId = checkorder[0].payment_id; // Replace PAYMENT_ID with the actual payment ID
//                     let key_id = "rzp_test_4JJAaipsPAqRRJ"
//                     let key_secret = "Gw6kdV3PCewFzn9kpvWU5zJH"
//                     var requestData = {
//                         "amount": Number(checkorder[0].order_amount) * 100,
//                         "speed": "optimum",
//                         "receipt": "Receipt No." + " " + generateOrderId()
//                     }
//                     var authHeader = {
//                         auth: {
//                             username: key_id,
//                             password: key_secret,
//                         },
//                     };

//                     axios.post(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, requestData, authHeader)
//                         .then(async response => {
//                             let removeorder = await model.RemoveOrder(order_id);

//                             logger.info('Refund successful: %o', response?.data);
//                             res.send({
//                                 result: true,
//                                 message: response?.data
//                             })
//                         })
//                         .catch(error => {

//                             logger.error("Refund failed: %s", error?.response?.data?.error?.description);
//                             res.send({
//                                 result: false,
//                                 message: error.response ? error.response?.data?.error?.description : error?.message
//                             })

//                         });
//                 } else {
//                     let removeorder = await model.RemoveOrder(order_id);


//                     let transporter = nodemailer.createTransport({
//                         host: "smtp.hostinger.com",
//                         port: 587,
//                         auth: {
//                             type: 'custom',
//                             method: 'PLAIN',
//                             user: process.env.EMAIL,
//                             pass: process.env.PASSWORD,
//                         },
//                     });

//                     let data = [{
//                         email: ` ${checkuser[0]?.user_email}`,
//                         subject: "EasyGo CANCEL ORDER CONFIRMED",
//                         html: `<!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Order Cancellation Confirmation</title>
//     <style>
//         body {
//             font-family: Arial, sans-serif;
//             background-color: #f4f4f4;
//             margin: 0;
//             padding: 20px;
//         }
//         .container {
//             background-color: #ffffff;
//             padding: 20px;
//             border-radius: 5px;
//             box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
//             max-width: 600px;
//             margin: auto;
//         }
//         h1 {
//             color: #333;
//             text-align: center;
//         }
//         p {
//             color: #555;
//         }
//         .footer {
//             margin-top: 20px;
//             text-align: center;
//             font-size: 0.9em;
//             color: #555;
//         }
//         .success-message {
//             font-size: 1.2em;
//             color: green;
//             text-align: center;
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <h1>Order Cancellation Successful</h1>
//         <p class="success-message">Dear ${checkuser[0]?.user_name}, your order has been successfully canceled.</p>
        
//        <p>We are writing to confirm that your order cancellation request has been successfully processed.</p>
//                 <p>Your order has been cancelled, and any applicable refunds will be processed shortly. You will receive a separate notification once the refund has been completed.</p>
//                 <p>If you have any further questions or concerns, feel free to reach out to our support team. We're here to assist you.</p>
//                 <p>Thank you for your understanding and cooperation.</p>
//                 <p>Order Id :${order_id}</p>
//         <div class="footer">
//             <p>Thank you for being with us!</p>
//             <p>BHAKSHANAGAL</p>
//         </div>
//     </div>
// </body>
// </html>
// `
//                     },
//                     {
//                         email: 'easygo@gmail.com',
//                         subject: `EASYGO CANCEL ORDER FROM : ${checkuser[0]?.user_name}`,
//                         html: `<!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Order Cancellation Notification</title>
//     <style>
//         body {
//             font-family: Arial, sans-serif;
//             background-color: #f4f4f4;
//             margin: 0;
//             padding: 20px;
//         }
//         .container {
//             background-color: #ffffff;
//             padding: 20px;
//             border-radius: 5px;
//             box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
//             max-width: 600px;
//             margin: auto;
//         }
//         h1 {
//             color: #333;
//         }
//         .order-details {
//             margin: 20px 0;
//             font-size: 1.1em;
//         }
//         .footer {
//             margin-top: 20px;
//             text-align: center;
//             font-size: 0.9em;
//             color: #555;
//         }
//         .important {
//             color: red;
//             font-weight: bold;
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <h1>Order Cancellation Notification</h1>
//         <p>Sir,</p>
//         <p class="order-details">We wanted to inform you that the following order has been cancelled:</p>

//         <table>
//             <tr>
//                 <td><strong>User Name:</strong></td>
//                 <td>${checkuser[0]?.user_name}</td>
//             </tr>
//             <tr>
//                 <td><strong>Order ID:</strong></td>
//                 <td>${order_id}</td>
//             </tr>
//             <tr>
//                 <td><strong>Order Date:</strong></td>
//                 <td>${order_date}</td>
//             </tr>
            
//             <tr>
//                 <td><strong>Phone Number:</strong></td>
//                 <td>${getaddress[0]?.address_phone_number}</td>
//             </tr>
//         </table>
        
//         <p>If you need further assistance, please reach out to the customer directly for more information.</p>

//         <div class="footer">
//             <p>Thank you </p>
//             <p>BHAKSHANAGAL TEAM</p>
//         </div>
//     </div>
// </body>
// </html>
// `
//                     }]


//                     data.forEach(async (el) => {
//                         let infos = await transporter.sendMail({
//                             from: "EASYGO <" + process.env.EMAIL + ">",
//                             to: el.email,
//                             subject: el.subject,
//                             html: el.html
//                         });
//                         nodemailer.getTestMessageUrl(infos);

//                     });



//                     res.send({
//                         result: true,
//                         message: "order cancelled successfully"
//                     })
//                 }
//                 logger.info("Payment method: %s", checkorder[0].order_payment_method);

//             } else {
//                 logger.warn("Cancel Order failed: Order not found (ID: %s)", order_id);
//                 return res.send({
//                     result: false,
//                     message: language.Order_not_found
//                 })
//             }
//         } else {
//             logger.warn("Cancel Order failed: User not found (ID: %s)", user_id);
//             return res.send({
//                 result: false,
//                 message: language.User_not_found
//             })
//         }
//     } catch (error) {
//         logger.error("Cancel Order error: %s", error.message);
//         return res.send({
//             result: false,
//             message: error.message
//         })
//     }
// };

// const generateOrderId = () => {
//     return randtoken.generate(4, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
// };





