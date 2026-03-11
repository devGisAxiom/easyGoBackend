var model = require('../model/registration');
var moment = require("moment");
var bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const formidable = require("formidable");
const logger = require('../util/logger');
const path = require('path');
const fs = require('fs');

module.exports.Register = async (req, res) => {
    try {

        var form = new formidable.IncomingForm({ multiples: true });
        form.parse(req, async function (err, fields, files) {
            if (err) {
                return res.send({
                    result: false,
                    message: "File Upload Failed!",
                    data: err,
                });
            }

            var { name, email, password, mobile } = fields
            if (!name || !email || !password || !mobile) {
                return res.send({
                    result: false,
                    message: "all fields are required"
                })
            }

            var date = moment().format('YYYY-MM-DD')

            const checkmail = await model.CheckMail(email);

            if (checkmail[0]?.u_email_verify == 'false') {
                let deleteuser = await model.deleteUserEmailQuery(email)
            }

            let checkmobile = await model.checkmobile(mobile);

            if (checkmobile[0]?.u_email_verify == 'false') {
                let deleteuser = await model.deleteUserMobileQuery(mobile)
            }

            if (checkmobile[0]?.u_email_verify == 'true') {

                return res.send({
                    result: false,
                    message: "Phone number already registered"
                });

            }
            if (checkmail[0]?.u_email_verify == 'true') {

                return res.send({
                    result: false,
                    message: "Email already registered"
                });
            }


            var hashedpasssword = await bcrypt.hash(password, 10);

            var otp = Math.floor(1000 + Math.random() * 9000);
            var otpExpiry = moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss');

            let adduser = await model.AddUser(name, email, hashedpasssword, mobile, date, otp, otpExpiry);

            const userId = adduser.insertId;
            if (adduser.affectedRows > 0) {
                // ✅ Handle Aadhar Upload
                if (files.adharfront) {
                    const oldPath = files.adharfront.filepath;
                    const fileName = files.adharfront.originalFilename;
                    const saveDir = path.join(process.cwd(), "uploads", "adharcard");
                    if (!fs.existsSync(saveDir)) {
                        fs.mkdirSync(saveDir, { recursive: true });
                    }
                    const newPath = path.join(saveDir, fileName);

                    try {

                        const rawData = fs.readFileSync(oldPath);
                        fs.writeFileSync(newPath, rawData);

                        const adharPath = "uploads/adharcard/" + fileName;
                        await model.AddadharfrontQuery(adharPath, userId);
                    } catch (error) {
                        logger.error("Failed to save Aadhar front: ", error);
                        return res.send({
                            result: false,
                            message: "Failed to save Aadhar file.",
                            data: error
                        });
                    }
                }

                if (files.adharback) {
                    const oldPath = files.adharback.filepath;
                    const fileName = files.adharback.originalFilename;
                    const saveDir = path.join(process.cwd(), "uploads", "adharcard");
                    if (!fs.existsSync(saveDir)) {
                        fs.mkdirSync(saveDir, { recursive: true });
                    }
                    const newPath = path.join(saveDir, fileName);

                    try {
                        const rawData = fs.readFileSync(oldPath);
                        fs.writeFileSync(newPath, rawData);

                        const adharPath = "uploads/adharcard/" + fileName;
                        await model.AddadharBackQuery(adharPath, userId);

                    } catch (error) {
                        console.log(error);
                        return res.send({
                            result: false,
                            message: "Failed to save Aadhar file.",
                            data: error
                        });
                    }
                }
            }
            // Send OTP email

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
                subject: "Registration OTP",
                html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Your OTP Code</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding:20px; text-align:center; background:#4F46E5; color:#ffffff; border-radius:8px 8px 0 0;">
              <h2 style="margin:0;">🔐 OTP Verification</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333333;">
              <p style="font-size:16px;">Hello,</p>

              <p style="font-size:15px;">
                Use the following One-Time Password (OTP) to complete your verification.
              </p>

              <div style="text-align:center; margin:30px 0;">
                <span style="font-size:32px; letter-spacing:6px; font-weight:bold; color:#4F46E5;">
                  ${otp}
                </span>
              </div>

              <p style="font-size:14px;">
                This OTP is valid for <strong>10 minutes</strong>.  
                Please do not share this code with anyone.
              </p>

              <p style="font-size:14px; color:#666;">
                If you did not request this, please ignore this email.
              </p>

              <p style="margin-top:30px;">
                Regards,<br>
                <strong>EasyGo</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:15px; text-align:center; font-size:12px; color:#999;">
              © 2025 EasyGo. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
            });

            return res.send({
                result: true,
                message: "Registered successfully",
            })
        })

    } catch (error) {
        logger.error("Error in registration: ", error);

        return res.send({
            result: false,
            message: error.message
        })
    }

}


module.exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        logger.info("Verify OTP request received", { email });

        if (!email || !otp) {
            logger.warn("Missing email or OTP", { email, otpProvided: !!otp });
            return res.status(400).json({
                result: false,
                message: "Email and OTP are required"
            });
        }

        // Fetch token info
        const tokenInfo = await model.ValidateResetToken(email, otp);
        logger.info("Token validation result", {
            email,
            recordCount: tokenInfo?.length || 0
        });

        if (!Array.isArray(tokenInfo) || tokenInfo.length === 0) {
            logger.warn("Invalid OTP attempt", { email });
            return res.status(400).json({
                result: false,
                message: "Invalid OTP"
            });
        }

        const token = tokenInfo[0];

        // Check expiry
        const tokenExpiry = moment(token.u_token_expiry);
        if (!tokenExpiry.isValid() || moment().isAfter(tokenExpiry)) {
            logger.warn("Expired OTP", {
                email,
                expiry: token.u_token_expiry
            });

            return res.status(400).json({
                result: false,
                message: "OTP has expired"
            });
        }

        // Update OTP status
        const updateOtpStatus = await model.updateOtpStatus(email);
        logger.info("OTP status update result", {
            email,
            affectedRows: updateOtpStatus?.affectedRows
        });

        if (!updateOtpStatus || updateOtpStatus.affectedRows === 0) {
            logger.error("Failed to update OTP status", { email });
            return res.status(400).json({
                result: false,
                message: "Failed to update OTP status"
            });
        }

        // Update email verification status
        const updateEmailStatus = await model.updateemail(email);

        logger.info("Email verification update result", {
            email,
            affectedRows: updateEmailStatus?.affectedRows
        });

        if (!updateEmailStatus || updateEmailStatus.affectedRows === 0) {
            logger.error("Failed to update email status", { email });
            return res.status(400).json({
                result: false,
                message: "Failed to update email status"
            });
        }

        logger.info("OTP verified successfully", { email });

        return res.status(200).json({
            result: true,
            message: "OTP verified successfully"
        });

    } catch (error) {
        logger.error("Error verifying OTP", {
            error: error.message,
            stack: error.stack
        });

        return res.status(500).json({
            result: false,
            message: "Internal server error"
        });
    }
};

