const model = require('../../model/user/matches')
const { sanitizeUserList, getAge } = require("../../util/sanitize");

module.exports.FindMatchingUsers = async (req, res) => {
    try {
        //------live--------------//

        // let key_id = process.env.KEY_ID
        // let key_secret =process.env.KEY_SECRET

        //-------test -----------//

        const key_id = process.env.TEST_KEY_ID
        const key_secret = process.env.TEST_KEY_SECRET
        console.log("api key", key_id, key_secret);

        let callback_url = `https://lunarsenterprises.com:6032/getbike/razorpay/callback?order_id=${addorder.insertId}`
        const authHeader = {
            auth: {
                username: key_id,
                password: key_secret,
            },
        };
        const paymentLinkData = {
            amount: Number(amount) * 100, // Amount in paisa
            currency: 'INR',
            description: 'payment for product', // You can use the merchantReference or any appropriate description here
            customer: {
                name: user_name,
                email: user_email,
                phone: user_mobile_no // Assuming user is an object with name, contact, and email properties
            },
            callback_url,
        };

        axios.post('https://api.razorpay.com/v1/payment_links', paymentLinkData, authHeader)
            .then(response => {
                console.log('Payment link created successfully:', response.data);
                return res.json({
                    result: true,
                    message: 'Payment link created successfully',
                    paymentLinkUrl: response.data.short_url
                });
                // Handle response data as needed
            })
            .catch(error => {
                console.error('Error creating payment link:', error.response.data.error);
                return res.json({
                    result: false,
                    message: 'failed to generate payment link',
                });
                // Handle error response
            });

    } catch (error) {
        console.error("Error in FindMatchingUsers:", error);
        return res
            .status(500)
            .send({ result: false, message: error.message || "Server error" });
    }
};