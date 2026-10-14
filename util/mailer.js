let nodemailer = require('nodemailer')


module.exports.transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
    logger: true,
    debug: true
});