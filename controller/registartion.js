var model = require("../model/registration");
var moment = require("moment");
var bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const formidable = require("formidable");
const logger = require("../util/logger");
const path = require("path");
const fs = require("fs");
// FIX: Use the shared Gmail mailer (works in ~1s) instead of broken smtp.hostinger.com
const { transporter } = require("../util/mailer");

module.exports.Register = async (req, res) => {
  try {
    var form = new formidable.IncomingForm({ multiples: true });
    form.parse(req, async function (err, fields, files) {
      // FIX: safeSend prevents double-send and ensures response is always sent
      let responseSent = false;
      const safeSend = (status, obj) => {
        if (responseSent) return;
        responseSent = true;
        try {
          return res.status(status).send(obj);
        } catch (e) {
          logger.error("res.send failed:", e);
        }
      };

      try {
        if (err) {
          return safeSend(400, {
            result: false,
            message: "File Upload Failed!",
            data: err,
          });
        }

        var { name, email, password, mobile, address, state, district, pincode } = fields;
        if (!name || !email || !password || !mobile) {
          return safeSend(400, {
            result: false,
            message: "all fields are required",
          });
        }
        // Address fields (SRS §8.2) - default if missing
        const u_address = (address || '').toString().trim().substring(0, 500);
        const u_state = (state || 'Kerala').toString().trim().substring(0, 100);
        const u_district = (district || '').toString().trim().substring(0, 100);
        const u_pincode = (pincode || '').toString().trim().substring(0, 6);

        var date = moment().format("YYYY-MM-DD");

        const checkmail = await model.CheckMail(email);

        if (checkmail[0]?.u_email_verify == "false") {
          let deleteuser = await model.deleteUserEmailQuery(email);
        }

        let checkmobile = await model.checkmobile(mobile);

        if (checkmobile[0]?.u_email_verify == "false") {
          let deleteuser = await model.deleteUserMobileQuery(mobile);
        }

        if (checkmobile[0]?.u_email_verify == "true") {
          return safeSend(400, {
            result: false,
            message: "Phone number already registered",
          });
        }
        if (checkmail[0]?.u_email_verify == "true") {
          return safeSend(400, {
            result: false,
            message: "Email already registered",
          });
        }

        var hashedpasssword = await bcrypt.hash(password, 10);

        var otp = Math.floor(1000 + Math.random() * 9000);
        var otpExpiry = moment()
          .add(10, "minutes")
          .format("YYYY-MM-DD HH:mm:ss");

        let adduser = await model.AddUser(
          name,
          email,
          hashedpasssword,
          mobile,
          date,
          otp,
          otpExpiry,
          u_address,
          u_state,
          u_district,
          u_pincode,
        );

        const userId = adduser.insertId;
        if (adduser.affectedRows > 0) {
          // Handle Aadhar Upload (errors don't block registration)
          if (files.adharfront) {
            try {
              const oldPath = files.adharfront.filepath;
              const fileName = files.adharfront.originalFilename;
              const saveDir = path.join(process.cwd(), "uploads", "adharcard");
              if (!fs.existsSync(saveDir)) {
                fs.mkdirSync(saveDir, { recursive: true });
              }
              const newPath = path.join(saveDir, fileName);
              const rawData = fs.readFileSync(oldPath);
              fs.writeFileSync(newPath, rawData);
              const adharPath = "uploads/adharcard/" + fileName;
              await model.AddadharfrontQuery(adharPath, userId);
            } catch (error) {
              logger.error("Failed to save Aadhar front: ", error);
              // FIX: don't fail registration, just log
            }
          }

          if (files.adharback) {
            try {
              const oldPath = files.adharback.filepath;
              const fileName = files.adharback.originalFilename;
              const saveDir = path.join(process.cwd(), "uploads", "adharcard");
              if (!fs.existsSync(saveDir)) {
                fs.mkdirSync(saveDir, { recursive: true });
              }
              const newPath = path.join(saveDir, fileName);
              const rawData = fs.readFileSync(oldPath);
              fs.writeFileSync(newPath, rawData);
              const adharPath = "uploads/adharcard/" + fileName;
              await model.AddadharBackQuery(adharPath, userId);
            } catch (error) {
              logger.error("Failed to save Aadhar back: ", error);
              // FIX: don't fail registration, just log
            }
          }
        }

        // FIX: Send HTTP response FIRST so client doesn't wait for email
        safeSend(200, {
          result: true,
          message: "Registered successfully",
        });

        // FIX: Send OTP email in background (errors are logged but don't affect response)
        setImmediate(async () => {
          try {
            await transporter.sendMail({
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
          <tr>
            <td style="padding:20px; text-align:center; background:#4F46E5; color:#ffffff; border-radius:8px 8px 0 0;">
              <h2 style="margin:0;">OTP Verification</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:30px; color:#333333;">
              <p style="font-size:16px;">Hello,</p>
              <p style="font-size:15px;">Use the following One-Time Password (OTP) to complete your verification.</p>
              <div style="text-align:center; margin:30px 0;">
                <span style="font-size:32px; letter-spacing:6px; font-weight:bold; color:#4F46E5;">${otp}</span>
              </div>
              <p style="font-size:14px;">This OTP is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
              <p style="font-size:14px; color:#666;">If you did not request this, please ignore this email.</p>
              <p style="margin-top:30px;">Regards,<br><strong>EasyGo</strong></p>
            </td>
          </tr>
          <tr>
            <td style="padding:15px; text-align:center; font-size:12px; color:#999;">2025 EasyGo. All rights reserved.</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
            });
            logger.info("OTP email sent to " + email);
          } catch (mailErr) {
            logger.error("OTP email FAILED for " + email + ": ", mailErr);
          }
        });
      } catch (innerErr) {
        logger.error("Register inner error: ", innerErr);
        safeSend(500, {
          result: false,
          message: innerErr.message || "Server error",
        });
      }
    });
  } catch (error) {
    logger.error("Error in registration: ", error);
    return res.send({
      result: false,
      message: error.message,
    });
  }
};

module.exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    logger.info("Verify OTP request received", { email });

    if (!email || !otp) {
      logger.warn("Missing email or OTP", { email, otpProvided: !!otp });
      return res.status(400).json({
        result: false,
        message: "Email and OTP are required",
      });
    }

    // Fetch token info
    const tokenInfo = await model.ValidateResetToken(email, otp);
    logger.info("Token validation result", {
      email,
      recordCount: tokenInfo?.length || 0,
    });

    if (!Array.isArray(tokenInfo) || tokenInfo.length === 0) {
      logger.warn("Invalid OTP attempt", { email });
      return res.status(400).json({
        result: false,
        message: "Invalid OTP",
      });
    }

    const token = tokenInfo[0];

    // Check expiry
    const tokenExpiry = moment(token.u_token_expiry);
    if (!tokenExpiry.isValid() || moment().isAfter(tokenExpiry)) {
      logger.warn("Expired OTP", {
        email,
        expiry: token.u_token_expiry,
      });

      return res.status(400).json({
        result: false,
        message: "OTP has expired",
      });
    }

    // Update OTP status
    const updateOtpStatus = await model.updateOtpStatus(email);
    logger.info("OTP status update result", {
      email,
      affectedRows: updateOtpStatus?.affectedRows,
    });

    if (!updateOtpStatus || updateOtpStatus.affectedRows === 0) {
      logger.error("Failed to update OTP status", { email });
      return res.status(400).json({
        result: false,
        message: "Failed to update OTP status",
      });
    }

    // Update email verification status
    const updateEmailStatus = await model.updateemail(email);

    logger.info("Email verification update result", {
      email,
      affectedRows: updateEmailStatus?.affectedRows,
    });

    if (!updateEmailStatus || updateEmailStatus.affectedRows === 0) {
      logger.error("Failed to update email status", { email });
      return res.status(400).json({
        result: false,
        message: "Failed to update email status",
      });
    }

    logger.info("OTP verified successfully", { email });

    return res.status(200).json({
      result: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    logger.error("Error verifying OTP", {
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      result: false,
      message: "Internal server error",
    });
  }
};
