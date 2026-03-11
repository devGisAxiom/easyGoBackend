const { error } = require('console');
var model = require('../model/documents')
var formidable = require("formidable");
var fs = require("fs");
var path = require("path");
var moment = require('moment')
const logger = require('../util/logger');


module.exports.documents = async (req, res) => {
    try {
        var form = new formidable.IncomingForm({ multiplies: true })
        form.parse(req, async function (err, fields, files) {
            if (err) {
                return res.send({
                    result: false,
                    message: "file upload failed!",
                    data: err,

                });
            }

            let date = moment().format('yyyy-mm-dd-hh-mm-ss')
            let { u_id } = fields;

            if (!u_id) {
                return res.send({
                    result: false,
                    message: "User ID is required.",
                });
            }


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
                    await model.AddadharfrontQuery(adharPath, u_id);
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
                    await model.AddadharBackQuery(adharPath, u_id);
                } catch (error) {
                    console.log(error);
                    return res.send({
                        result: false,
                        message: "Failed to save Aadhar file.",
                        data: error
                    });
                }
            }

            // ✅ Handle License Upload
            if (files.licensefront) {
                const oldPath = files.licensefront.filepath;
                const fileName = files.licensefront.originalFilename;
                const saveDir = path.join(process.cwd(), "uploads", "licensecard");
                if (!fs.existsSync(saveDir)) {
                    fs.mkdirSync(saveDir, { recursive: true });
                }
                const newPath = path.join(saveDir, fileName);

                try {

                    const rawData = fs.readFileSync(oldPath);
                    fs.writeFileSync(newPath, rawData);

                    const licensePath = "uploads/licensecard/" + fileName;
                    await model.AddlicenseFrontQuery(licensePath, u_id);
                } catch (error) {
                    console.log(error);
                    return res.send({
                        result: false,
                        message: "Failed to save License file.",
                        data: error

                    });
                }
            }
            if (files.licenseback) {
                const oldPath = files.licenseback.filepath;
                const fileName = files.licenseback.originalFilename;
                const saveDir = path.join(process.cwd(), "uploads", "licensecard");
                if (!fs.existsSync(saveDir)) {
                    fs.mkdirSync(saveDir, { recursive: true });
                }
                const newPath = path.join(saveDir, fileName);
                try {
                    const rawData = fs.readFileSync(oldPath);
                    fs.writeFileSync(newPath, rawData);

                    const licensePath = "uploads/licensecard/" + fileName;
                    await model.AddlicenseBackQuery(licensePath, u_id);
                } catch (error) {
                    console.log(error);
                    return res.send({
                        result: false,
                        message: "Failed to save License file.",
                        data: error

                    });
                }
            }

            return res.send({
                result: true,
                message: "Documents uploaded successfully"
            });
        });

    } catch (error) {
        logger.error("Error in documents: ", error);
        return res.send({
            result: false,
            message: error.message
        });
    }
};



