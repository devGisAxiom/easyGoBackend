var model = require('../model/editprofile')
var formidable = require('formidable')
var fs = require('fs')
const logger = require('../util/logger');
let path = require('path')

module.exports.EditPersonalInfo = async (req, res) => {
    try {
        logger.info("EditPersonalInfo API called", { userId: req.user?.u_id });

        var form = new formidable.IncomingForm({ multiples: true });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                logger.error("EditPersonalInfo file upload failed", {
                    error: err.message
                });
                return res.send({
                    result: false,
                    message: "File Upload Failed!",
                    data: err.message,
                });
            }

            let { u_id } = req.user;
            let { name, email, mobile, dob } = fields;

            // 1️⃣ Check duplicate email
            if (email) {
                const checkmail = await model.CheckEmailQuery(email, u_id);
                if (checkmail?.length > 0) {
                    logger.warn("Duplicate email attempt", { u_id, email });
                    return res.send({
                        result: false,
                        message: "Email already registered"
                    });
                }
            }

            // 2️⃣ Check duplicate mobile
            if (mobile) {
                const checkmobile = await model.CheckMobileQuery(mobile, u_id);
                if (checkmobile?.length > 0) {
                    logger.warn("Duplicate mobile attempt", { u_id, mobile });
                    return res.send({
                        result: false,
                        message: "Mobile already registered"
                    });
                }
            }

            const checkprofile = await model.CheckUserQuery(u_id);

            if (!checkprofile?.length) {
                logger.warn("EditPersonalInfo failed: user not found", { u_id });
                return res.send({
                    result: false,
                    message: "user not found"
                });
            }

            let condition = ``;

            if (name) condition += condition ? `,u_name='${name}'` : `set u_name='${name}'`;
            if (email) condition += condition ? `,u_email='${email}'` : `set u_email='${email}'`;
            if (mobile) condition += condition ? `,u_mobile='${mobile}'` : `set u_mobile='${mobile}'`;
            if (dob) condition += condition ? `,u_dob='${dob}'` : `set u_dob='${dob}'`;

            let EditpersonalInfo;
            if (condition) {
                EditpersonalInfo = await model.ChangeUserInfo(condition, u_id);
                logger.info("User personal info updated", { u_id });
                if (!EditpersonalInfo) {
                    logger.error("Failed to update personal info", { u_id });
                    return res.send({
                        result: false,
                        message: "failed to update profile"
                    });
                }
            }


            // 3️⃣ Profile image update
            if (files?.image) {
                try {
                    const oldPath = files.image.filepath;
                    const newPath = path.join(
                        process.cwd(),
                        "/uploads/profile/",
                        files.image.originalFilename
                    );

                    fs.writeFileSync(newPath, fs.readFileSync(oldPath));

                    const image = "/uploads/profile/" + files.image.originalFilename;
                    const Insertprofileimage = await model.Updateimage(image, u_id);

                    if (Insertprofileimage.affectedRows > 0) {
                        logger.info("Profile image updated", { u_id, image });
                        return res.send({
                            result: true,
                            message: "profile updated successfully"
                        });
                    } else {
                        logger.error("Profile image DB update failed", { u_id });
                        return res.send({
                            result: false,
                            message: "failed to update profile"
                        });
                    }
                } catch (imgErr) {
                    logger.error("Profile image upload error", {
                        u_id,
                        error: imgErr.message
                    });
                    return res.send({
                        result: false,
                        message: "Image upload failed"
                    });
                }
            }

            return res.send({
                result: true,
                message: "profile updated successfully"
            });
        });

    } catch (error) {
        logger.error("EditPersonalInfo unexpected error", {
            error: error.message
        });
        return res.send({
            result: false,
            message: error.message
        });
    }
};


