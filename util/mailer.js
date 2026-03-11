let nodemailer = require('nodemailer')


module.exports.transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 587,
    auth: {
        type: 'custom',
        method: 'PLAIN',
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
    logger: true,
    debug: true
});