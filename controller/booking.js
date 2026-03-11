var model = require('../model/booking');
const logger = require('../util/logger');
var moment = require("moment");
const notify = require('../util/notification');
var formidable = require("formidable");
var fs = require("fs");
var path = require("path");
const axios = require("axios");
const { log } = require('console');

module.exports.bookings = async (req, res) => {
    try {
        const form = new formidable.IncomingForm({ multiples: true });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                logger.error("Booking file upload failed: %s", err.message);
                return res.send({
                    result: false,
                    message: "File upload failed!",
                    error: err.message,
                });
            }

            let { u_id } = req.user;

            let { pickup_location, pickup_date, pickup_time, drop_location, drop_date, drop_time, price_id, fine_amount } = fields;

            // Validate required fields
            if (!pickup_location || !pickup_date || !pickup_time || !drop_location || !drop_date || !drop_time || !price_id) {
                logger.warn("Booking failed: Insufficient parameters");
                return res.send({ result: false, message: "Insufficient parameters" });
            }

            if (!files.selfie) {
                logger.warn("Booking failed: Selfie image not uploaded");
                return res.send({ result: false, message: "Selfie image not uploaded" });
            }

            // Check if user exists
            const checkUser = await model.CheckUser(u_id);
            if (!checkUser || checkUser.length === 0) {
                logger.warn("Booking failed: User not found (ID: %s)", u_id);
                return res.send({ result: false, message: "User not found" });
            }

            // Get price details using price_id
            const priceDetails = await model.GetPriceDetails(price_id);
            if (!priceDetails || priceDetails.length === 0) {
                logger.warn("Booking failed: Invalid price ID");
                return res.send({ result: false, message: "Invalid price ID" });
            }

            const priceInfo = priceDetails[0];
            // const durationHours = Number(priceInfo.rent_duration);
            const rent_amount = Number(priceInfo.rent_total);
            let total_amount
            if (fine_amount) {
                fine_amount = Number(fine_amount);
                total_amount = rent_amount + fine_amount;
            } else {
                total_amount = rent_amount
            }
            // // Calculate drop date & time using moment
            // const pickupDateTime = moment(`${pickup_date} ${pickup_time}`, "YYYY-MM-DD HH:mm");
            // const dropDateTime = pickupDateTime.clone().add(durationHours, "hours");

            // const drop_date = dropDateTime.format("YYYY-MM-DD");
            // const drop_time = dropDateTime.format("HH:mm");

            const booking_date = moment().format("YYYY-MM-DD");

            // Add booking to DB
            const booking = await model.Addbooking(
                u_id,
                rent_amount,
                fine_amount,
                total_amount,
                price_id,
                pickup_location,
                pickup_date,
                pickup_time,
                drop_location,
                drop_date,
                drop_time,
                booking_date
            );

            if (booking.affectedRows === 0) {
                logger.error("Booking failed: Database insertion failed");
                return res.send({ result: false, message: "Booking could not be created" });
            }

            const booking_id = booking.insertId;

            // Handle selfie upload
            if (files && files.selfie) {
                const imageFiles = Array.isArray(files.selfie) ? files.selfie : [files.selfie];
                for (const file of imageFiles) {
                    if (!file?.filepath || !file?.originalFilename) continue;

                    const newPath = path.join(process.cwd(), "/uploads/booking", file.originalFilename);
                    fs.writeFileSync(newPath, fs.readFileSync(file.filepath));

                    const selfiePath = "/uploads/booking/" + file.originalFilename;
                    await model.AddBookingImageQuery(selfiePath, booking_id);
                }
            }

            // Create Razorpay payment link

            //test rzp key
            // const key_id = process.env.RZP_TEST_KEY_ID;
            // const key_secret = process.env.RZP_TEST_KEY_SECRET;

            //live rzp key
            const key_id = process.env.RZP_LIVE_KEY_ID;
            const key_secret = process.env.RZP_LIVE_KEY_SECRET;

            const callback_url = `https://lunarsenterprises.com:7006/easygo/razorpay/callback?booking_id=${booking_id}`;
            const authHeader = { auth: { username: key_id, password: key_secret } };

            const paymentLinkData = {
                amount: Math.round(total_amount * 100), // in paise
                currency: "INR",
                description: "Payment for rent bike",
                customer: {
                    name: checkUser[0]?.u_name,
                    email: checkUser[0]?.u_email,
                    phone: checkUser[0]?.u_mobile,
                },
                callback_url,
            };
            // console.log("paymentLinkData", paymentLinkData);
            // console.log("total_amount", total_amount);


            let paymentLink;
            try {
                const response = await axios.post(
                    "https://api.razorpay.com/v1/payment_links",
                    paymentLinkData,
                    authHeader
                );
                paymentLink = response.data.short_url;
            } catch (error) {
                logger.error("Error creating payment link:", error.response?.data || error.message);
                console.log("Error creating payment link:", error.response?.data || error.message);
                return res.send({ result: false, message: "Failed to generate payment link" });
            }

            // Send notification
            const getAdmin = await model.GetAdmin();
            const notification_image = null;

            let addpaymenthistory = await model.AddPaymentHistory(u_id, booking_id, rent_amount, fine_amount, total_amount, price_id, booking_date);

            if (addpaymenthistory.affectedRows > 0) {

                return res.send({
                    result: true,
                    message: "You successfully booked a ride, wait for confirmation",
                    booking_id,
                    paymentLinkUrl: paymentLink,
                });
            } else {
                logger.error("Booking failed: Payment history insertion failed");
                return res.send({ result: false, message: "Failed to add payment history" });
            }
        });
    } catch (error) {
        logger.error("Booking error: %s", error.message);
        console.log(error);
        return res.send({ result: false, message: error.message });
    }
};



module.exports.listbooking = async (req, res) => {
    try {
        const { u_id, role } = req.user || {};
        const { status, u_id: bodyUserId } = req.body || {};

        let conditions = [];

        // Non-admin users → only their own data
        if (role !== 'admin') {
            conditions.push(`b.b_u_id = '${u_id}' and b.b_payment_status = 'paid'`);
        }

        // Admin + user_id passed → filter by that user
        if (role === 'admin' && bodyUserId) {
            conditions.push(`b.b_u_id = '${bodyUserId}'`);
        }

        // Status filter (for all roles)
        if (status) {
            conditions.push(`b.b_status = '${status}'`);
        }

        // Build WHERE clause
        const condition = conditions.length
            ? `WHERE ${conditions.join(' AND ')}`
            : '';

        const listbooking = await model.listbookingQuery(condition);

        if (listbooking?.length > 0) {
            return res.send({
                result: true,
                message: "Data retrieved",
                list: listbooking
            });
        }

        logger.warn("List booking: Data not found");
        return res.send({
            result: false,
            message: "Data not found"
        });

    } catch (error) {
        logger.error("List booking error: %s", error.message);
        return res.send({
            result: false,
            message: error.message,
        });
    }
};


module.exports.extendbooking = async (req, res) => {
    try {
        let { b_id, new_drop_date, new_drop_time, new_drop_location, extend_reason } = req.body;
        if (!b_id || !new_drop_date || !new_drop_time || !new_drop_location) {

            logger.warn("Extend booking failed: All fields are required");
            return res.send({
                result: false,
                message: "All fields are required"
            })
        }
        let booking = await model.getUserIdByBooking(b_id);
        if (booking.length == 0) {
            logger.warn("Extend booking failed: Booking not found (ID: %s)", b_id);
            return res.send({
                result: false,
                message: "Booking not found "
            });
        }

        let u_id = booking[0].b_u_id

        const result = await model.extendbookingQuery(b_id, new_drop_date, new_drop_time, new_drop_location, extend_reason);

        if (result.affectedRows > 0) {
            let getadmin = await model.GetAdmin();

            await notify.addNotification(
                u_id,                       // sender (user)
                getadmin[0]?.u_id,             // receiver (admin)
                "user",
                "Booking",
                `Booking #${b_id} extended until ${new_drop_date} ${new_drop_time} at ${new_drop_location}`,
                "unread"
            );

            return res.send({
                result: true,
                message: "Booking extended successfully & notifications sent",
                updated: {
                    drop_date: new_drop_date,
                    drop_time: new_drop_time,
                    drop_location: new_drop_location,
                    extend_reason: extend_reason,
                    status: "extendedreq"
                }
            });

        }
        else {
            logger.warn("Extend booking failed: Booking not found or not updated (ID: %s)", b_id);
            return res.send({
                result: false,
                message: "Booking not found or not updated"
            });
        }

    } catch (error) {

        logger.error("Extend booking error: %s", error.message);
        return res.send({
            result: false,
            message: error.message,
        });
    }

}




