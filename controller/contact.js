const model = require('../model/contact');
var nodemailer = require("nodemailer");
var formidable = require("formidable");
var fs = require("fs");
var path = require("path");
const logger = require('../util/logger');
const { v4: uuidv4 } = require("uuid"); // npm install uuid

// module.exports.ContactUs = async (req, res) => {
//     try {
//         logger.info("ContactUs API called");

//         const form = new formidable.IncomingForm({ multiples: false });

//         form.parse(req, async (err, fields, files) => {
//             if (err) {
//                 logger.error("ContactUs file upload failed", { error: err.message });
//                 return res.send({
//                     result: false,
//                     message: 'File upload failed!',
//                 });
//             }

//             let { name, email, message, phonenumber, issuetype } = fields;

//             if (!name || !email || !phonenumber || !issuetype) {
//                 logger.warn("ContactUs validation failed", { fields });
//                 return res.send({
//                     result: false,
//                     message: "insufficient parameters",
//                 });
//             }

//             message = message || "no message";

//             const contactInsert = await model.addcontactQuery(
//                 name,
//                 email,
//                 message,
//                 phonenumber,
//                 issuetype
//             );

//             const c_id = contactInsert.insertId;
//             logger.info("Contact created successfully", { contactId: c_id, email });

//             // -----------------------------
//             // Image upload + Mail attachment
//             // -----------------------------
//             let mailAttachments = [];

//             if (files?.image) {
//                 const imageFiles = Array.isArray(files.image)
//                     ? files.image
//                     : [files.image];

//                 for (const file of imageFiles) {
//                     if (!file?.filepath || !file?.originalFilename) continue;

//                     try {
//                         const uploadDir = path.join(process.cwd(), "uploads/contact");

//                         // Ensure directory exists
//                         if (!fs.existsSync(uploadDir)) {
//                             fs.mkdirSync(uploadDir, { recursive: true });
//                         }

//                         const newPath = path.join(uploadDir, file.originalFilename);

//                         fs.writeFileSync(newPath, fs.readFileSync(file.filepath));

//                         const imagePath = "/uploads/contact/" + file.originalFilename;
//                         await model.AddcontactimageQuery(c_id, imagePath);

//                         // ✅ Push image as email attachment
//                         mailAttachments.push({
//                             filename: file.originalFilename,
//                             path: newPath
//                         });

//                         logger.info("Contact image saved", {
//                             contactId: c_id,
//                             image: file.originalFilename
//                         });
//                     } catch (imgErr) {
//                         logger.error("Contact image upload failed", {
//                             contactId: c_id,
//                             error: imgErr.message
//                         });
//                     }
//                 }
//             }

//             // -----------------------------
//             // Email HTML Content
//             // -----------------------------
//             let htmlcontent = `<!DOCTYPE html>
// <html>
// <head>
//     <meta charset="UTF-8">
//     <title>New Contact Support Request</title>
// </head>
// <body style="margin:0; padding:0; background-color:#f2f4f6; font-family:Arial, Helvetica, sans-serif;">

// <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
// <tr>
// <td align="center">

// <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

// <tr>
// <td style="background:#4f46e5; color:#ffffff; padding:20px;">
// <h2 style="margin:0;">EasyGo – Contact Support</h2>
// <p style="margin:5px 0 0; font-size:14px;">
// New support request received
// </p>
// </td>
// </tr>

// <tr>
// <td style="padding:20px; color:#333333; font-size:14px; line-height:1.6;">
// <p>Hello,</p>
// <p>A user has contacted EasyGo support. Below are the details:</p>
// </td>
// </tr>

// <tr>
// <td style="padding:0 20px 20px; color:#333333; font-size:14px;">
// <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse:collapse;">
// <tr><td style="background:#f9fafb;font-weight:bold;">Name</td><td>${name}</td></tr>
// <tr><td style="background:#f9fafb;font-weight:bold;">Email</td><td>${email}</td></tr>
// <tr><td style="background:#f9fafb;font-weight:bold;">Phone</td><td>${phonenumber}</td></tr>
// <tr><td style="background:#f9fafb;font-weight:bold;">Issue Type</td><td>${issuetype}</td></tr>
// <tr>
// <td style="background:#f9fafb;font-weight:bold;vertical-align:top;">Message</td>
// <td>${message}</td>
// </tr>
// </table>
// </td>
// </tr>

// <tr>
// <td style="padding:0 20px 20px;">
// <p>Best regards,<br><strong>EasyGo Team</strong></p>
// </td>
// </tr>

// <tr>
// <td style="background:#f9fafb; padding:15px; text-align:center; font-size:12px; color:#666;">
// © EasyGo. All rights reserved.
// </td>
// </tr>

// </table>
// </td>
// </tr>
// </table>

// </body>
// </html>`;

//             // -----------------------------
//             // Mail Transporter
//             // -----------------------------
//             let transporter = nodemailer.createTransport({
//                 host: "smtp.hostinger.com",
//                 port: 587,
//                 secure: false,
//                 auth: {
//                     user: process.env.EMAIL,
//                     pass: process.env.PASSWORD,
//                 },
//             });

//             try {
//                 await transporter.sendMail({
//                     from: `EASYGO <${process.env.EMAIL}>`,
//                     to: process.env.ADMIN_EMAIL,
//                     subject: `New Enquiry From: ${name}`,
//                     html: htmlcontent,
//                     attachments: mailAttachments // ✅ attached images
//                 });

//                 logger.info("Contact email sent", {
//                     to: process.env.ADMIN_EMAIL,
//                     contactId: c_id
//                 });
//             } catch (mailErr) {
//                 logger.error("Email sending failed", {
//                     error: mailErr.message
//                 });
//             }

//             return res.send({
//                 status: true,
//                 message: "Mail sent successfully",
//             });
//         });

//     } catch (error) {
//         logger.error("ContactUs unexpected error", { error: error.message });
//         return res.send({
//             result: false,
//             message: error.message,
//         });
//     }
// };



module.exports.ContactUs = async (req, res) => {
    try {
        logger.info("ContactUs API called");

        const form = new formidable.IncomingForm({ multiples: true }); // allow multiple files

        form.parse(req, async (err, fields, files) => {
            if (err) {
                logger.error("ContactUs file upload failed", { error: err.message });
                return res.send({
                    result: false,
                    message: 'File upload failed!',
                });
            }

            let { name, email, message, phonenumber, issuetype } = fields;

            if (!name || !email || !phonenumber || !issuetype) {
                logger.warn("ContactUs validation failed", { fields });
                return res.send({
                    result: false,
                    message: "insufficient parameters",
                });
            }

            message = message || "no message";

            // -----------------------------
            // Save contact in DB
            // -----------------------------
            const contactInsert = await model.addcontactQuery(
                name,
                email,
                message,
                phonenumber,
                issuetype
            );

            const c_id = contactInsert.insertId;
            logger.info("Contact created successfully", { contactId: c_id, email });

            // -----------------------------
            // Image upload + prepare mail attachments
            // -----------------------------
            let mailAttachments = [];

            if (files?.image) {
                const imageFiles = Array.isArray(files.image)
                    ? files.image
                    : [files.image];

                for (const file of imageFiles) {
                    if (!file?.filepath || !file?.originalFilename) continue;

                    try {
                        const uploadDir = path.join(process.cwd(), "uploads/contact");

                        // Ensure upload directory exists
                        if (!fs.existsSync(uploadDir)) {
                            fs.mkdirSync(uploadDir, { recursive: true });
                        }

                        const newPath = path.join(uploadDir, file.originalFilename);

                        fs.writeFileSync(newPath, fs.readFileSync(file.filepath));

                        const imagePath = "/uploads/contact/" + file.originalFilename;
                        await model.AddcontactimageQuery(c_id, imagePath);

                        // Generate a unique cid for inline embedding
                        const cid = uuidv4();

                        mailAttachments.push({
                            filename: file.originalFilename,
                            path: newPath,
                            cid: cid
                        });

                        logger.info("Contact image saved", {
                            contactId: c_id,
                            image: file.originalFilename
                        });
                    } catch (imgErr) {
                        logger.error("Contact image upload failed", {
                            contactId: c_id,
                            error: imgErr.message
                        });
                    }
                }
            }

            // -----------------------------
            // Prepare email HTML content
            // -----------------------------
            let imagesHtml = "";
            if (mailAttachments.length > 0) {
                imagesHtml = `<p><strong>Attached Images:</strong></p>` +
                    mailAttachments.map(att => `<img src="cid:${att.cid}" style="max-width:300px; margin:10px 0;"/>`).join('');
            }

            let htmlcontent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>New Contact Support Request</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background:#f2f4f6;">

<table width="100%" cellpadding="20" cellspacing="0">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

<tr>
<td style="background:#4f46e5; color:#ffffff; padding:20px;">
<h2 style="margin:0;">EasyGo – Contact Support</h2>
<p style="margin:5px 0 0; font-size:14px;">New support request received</p>
</td>
</tr>

<tr>
<td style="padding:20px; color:#333; font-size:14px; line-height:1.6;">
<p>Hello Sir,</p>
<p>A user has contacted EasyGo support. Below are the details:</p>
</td>
</tr>

<tr>
<td style="padding:0 20px 20px; color:#333; font-size:14px;">
<table width="100%" cellpadding="10" cellspacing="0" style="border-collapse:collapse;">
<tr><td style="background:#f9fafb;font-weight:bold;">Name</td><td>${name}</td></tr>
<tr><td style="background:#f9fafb;font-weight:bold;">Email</td><td>${email}</td></tr>
<tr><td style="background:#f9fafb;font-weight:bold;">Phone Number</td><td>${phonenumber}</td></tr>
<tr><td style="background:#f9fafb;font-weight:bold;">Issue Type</td><td>${issuetype}</td></tr>
<tr><td style="background:#f9fafb;font-weight:bold;vertical-align:top;">Message</td><td>${message}</td></tr>
</table>
${imagesHtml}
</td>
</tr>

<tr>
<td style="padding:0 20px 20px;">
<p>Best regards,<br/><strong>EasyGo Team</strong></p>
</td>
</tr>

<tr>
<td style="background:#f9fafb; padding:15px; text-align:center; font-size:12px; color:#666;">
© EasyGo. All rights reserved.
</td>
</tr>

</table>
</td>
</tr>
</table>

</body>
</html>`;

            // -----------------------------
            // Nodemailer transporter
            // -----------------------------
            let transporter = nodemailer.createTransport({
                host: "smtp.hostinger.com",
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD,
                },
            });

            try {
                await transporter.sendMail({
                    from: `EASYGO <${process.env.EMAIL}>`,
                    to: process.env.ADMIN_EMAIL,
                    subject: `New Enquiry From: ${name}`,
                    html: htmlcontent,
                    attachments: mailAttachments // ✅ images embedded inline
                });

                logger.info("Contact email sent", {
                    to: process.env.ADMIN_EMAIL,
                    contactId: c_id
                });
            } catch (mailErr) {
                logger.error("Email sending failed", {
                    error: mailErr.message
                });
            }

            return res.send({
                status: true,
                message: "Mail sent successfully",
            });
        });

    } catch (error) {
        logger.error("ContactUs unexpected error", { error: error.message });
        return res.send({
            result: false,
            message: error.message,
        });
    }
};



module.exports.listcontact = async (req, res) => {
    try {
        const { role } = req.user || {};
        logger.info("ListContact API called", { role });

        if (role !== "admin") {
            logger.warn("Unauthorized contact list access attempt");
            return res.send({
                result: false,
                message: "you are not authorized",
            });
        }

        let listcontact = await model.listcontactQuery();

        if (listcontact.length > 0) {
            logger.info("Contact list retrieved", { count: listcontact.length });
            return res.send({
                result: true,
                message: "data retrieved",
                list: listcontact,
            });
        }

        logger.warn("Contact list empty");
        return res.send({
            result: false,
            messsage: "data not found",
        });

    } catch (error) {
        logger.error("ListContact error", { error: error.message });
        return res.send({
            result: false,
            message: error.message,
        });
    }
};

module.exports.deletecontact = async (req, res) => {
    try {
        const { c_id } = req.body;
        logger.info("DeleteContact API called", { c_id });

        if (!c_id) {
            logger.warn("DeleteContact failed: missing c_id");
            return res.send({
                result: false,
                message: "failed to delete contact",
            });
        }

        let checkcontact = await model.checkcontactQuery(c_id);

        if (checkcontact.length === 0) {
            logger.warn("DeleteContact failed: contact not found", { c_id });
            return res.send({
                result: false,
                message: "missing contact id",
            });
        }

        let deletesection = await model.removecontactQuery(c_id);

        if (deletesection.affectedRows > 0) {
            logger.info("Contact deleted successfully", { c_id });
            return res.send({
                result: true,
                message: "contact deleted successfully"
            });
        }

        logger.error("DeleteContact DB failure", { c_id });
        return res.send({
            result: false,
            message: "failed to delete contact",
        });

    } catch (error) {
        logger.error("DeleteContact error", { error: error.message });
        return res.send({
            result: false,
            message: error.message,
        });
    }
};

