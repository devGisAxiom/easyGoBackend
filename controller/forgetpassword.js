var model = require('../model/forgetpassword');
var nodemailer = require('nodemailer');
var moment = require('moment')
var bcrypt = require('bcrypt')
const logger = require('../util/logger');

module.exports.forgotpassword = async (req, res) => {
    try {
        var email = req.body.email;
        var u_role = req.body.u_role
        if (!email || !u_role) {
            logger.warn("forgotpassword failed: insufficient parameters");
            return res.send({
                return: false,
                message: "insufficient parameters"

            })
        }

        let checkemail = await model.CheckEmailQuery(email, u_role)
        if (checkemail.length > 0) {
            let u_id = checkemail[0]?.u_id
            const otp = Math.floor(1000 + Math.random() * 9000);
            const expirationDate = moment().add(5, 'minutes').format('YYYY-MM-DD-HH:mm:ss');

            let storetoken = await model.StoreResetToken(otp, expirationDate, u_id);

            let transporter = nodemailer.createTransport({
                host: "smtp.hostinger.com",
                port: 587,
                auth: {
                    type: 'Custom',
                    method: 'PLAIN',
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD,
                },
            });
            let infos = await transporter.sendMail({
                from: "EasyGo<" + process.env.EMAIL + ">",
                to: email,
                subject: "Change Password",
                html: `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Change Password Email</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 5px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        max-width: 600px;
                        margin: auto;
                    }
                    h1 {
                        color: #333;
                    }
                    p {
                        color: #555;
                    }
                    .button {
                        background-color: #007bff;
                        color: white;
                        padding: 10px 15px;
                        text-decoration: none;
                        border-radius: 5px;
                        display: inline-block;
                    }
                    .button:hover {
                        background-color: #0056b3;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Change Your Password</h1>
                    <p>We received a request to change your password. If you did not request this, please ignore this email.</p>
                    <h1>${otp}</h1>
                    <p>This is your OTP to change the password</p>
                    <p>This OTP will expire in 5 minutes</p>
                    <p>Thank you!</p>
                </div>
            </body>
            </html>
            
            `
            });
            nodemailer.getTestMessageUrl(infos);

            return res.send({
                result: true,
                message: "Password reset email sent "
            })
        } else {
            return res.send({
                result: false,
                message: "email not found"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}



module.exports.verifyOtp = async (req, res) => {
    try {
        let { email, otp } = req.body;

        // Basic validation
        if (!email || !otp) {
            return res.status(400).json({
                result: false,
                message: "Email and OTP are required"
            });
        }

        email = email.trim().toLowerCase();
        otp = String(otp).trim();

        // Validate OTP against DB
        const tokenInfo = await model.ValidateResetToken(email, otp);
        console.log("tokenInfo", tokenInfo, tokenInfo.length);

        if (tokenInfo.length == 0) {
            return res.status(400).json({
                result: false,
                message: "Invalid OTP"
            });
        }

        const token = tokenInfo[0];

        // Check expiry
        const tokenExpiry = moment(token.u_token_expiry);
        if (!tokenExpiry.isValid() || moment().isAfter(tokenExpiry)) {
            return res.status(400).json({
                result: false,
                message: "OTP has expired"
            });
        }

        // Mark OTP as used
        await model.updateOtpStatus(email, otp);

        return res.status(200).json({
            result: true,
            message: "OTP verified successfully"
        });

    } catch (error) {
        logger.error("Error verifying OTP:", error);
        return res.status(500).json({
            result: false,
            message: "Internal server error"
        });
    }
};




module.exports.ResetPassword = async (req, res) => {
    try {
        let { email, old_password, new_password, loggedin } = req.body

        var html = `<!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1.0">
        <title>Password Changed Successfully</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: auto;
        }
        h1 {
            color: #333;
            text-align: center;
        }
        p {
            color: #555;
            line-height: 1.5;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 0.9em;
            color: #555;
        }
        .button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 15px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
        }
        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Password Changed Successfully</h1>
        <p>Dear User,</p>
        <p>Your password has been successfully changed. If you did not make this change, please contact our support team immediately.</p>
       
        <div class="footer">
            <p>Thank you for being a valued user!</p>
            <p>If you have any questions, feel free to reach out to us.</p>
        </div>
    </div>
</body>
</html>
`
        logger.info("ResetPassword body: %o", req.body);

        if (!email || !new_password) {
            return res.send({
                result: false,
                message: "email and new password are required"
            });
        }

        const checkUser = await model.CheckEmailQuery(email, 'user');


        if (checkUser.length == 0) {
            return res.status(404).json({
                result: false,
                message: 'User not found',
            });
        }

        if (loggedin) {
            const isPasswordValid = await bcrypt.compare(old_password, checkUser[0].u_password);
            if (!isPasswordValid) {
                logger.warn("Login failed: Invalid credentials for user %s", email);

                return res.status(400).json({
                    result: false,
                    message: 'Old password is incorrect',
                });
            }

            // Check if old password and new password are the same
            const isSamePassword = await bcrypt.compare(new_password, checkUser[0].u_password);
            if (isSamePassword) {
                logger.warn("New password cannot be the same as old password for user %s", email);

                return res.status(400).json({
                    result: false,
                    message: 'New password cannot be the same as old password',
                });
            }
        }

        var hashedpassword = await bcrypt.hash(new_password, 10)

        let ChangePassword = await model.updatepassword(hashedpassword, email);

        if (ChangePassword.affectedRows > 0) {
            let transporter = nodemailer.createTransport({
                host: "smtp.hostinger.com",
                port: 587,
                auth: {
                    type: 'custom',
                    method: 'PLAIN',
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD,
                },

            });
            let infos = await transporter.sendMail({
                from: "EasyGo<" + process.env.EMAIL + ">",
                to: email,
                subject: "changed password",
                html: html
            })
            nodemailer.getTestMessageUrl(infos);
            return res.send({
                result: true,
                message: "Password changed successfully,please relogin",
            });

        } else {
            return res.send({
                result: false,
                message: "failed to change password "
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message

        })
    }
}
