// ============================================================
// FIXED for EG-FE-004: controller/editprofile.js
// Replaces Formidable 2.x with raw-body + manual multipart parser.
// Bug: Formidable 2.x hangs on multipart parsing when body comes
// from nginx (with or without proxy_request_buffering), causing
// 504 Gateway Timeouts. This rewrite is dependency-free.
// ============================================================

var model = require("../model/editprofile");
var fs = require("fs");
const logger = require("../util/logger");
let path = require("path");

// ---------- helpers ----------

/**
 * Parse a multipart/form-data body from a Buffer.
 * Returns: { fields: {name: value, ...}, files: [{fieldName, originalFilename, filepath, contentType, size}, ...] }
 */
function parseMultipart(buffer, boundary) {
  const fields = {};
  const files = [];

  const dashBoundary = "--" + boundary;
  const text = buffer.toString("binary");
  const parts = text.split(dashBoundary);

  for (let i = 1; i < parts.length; i++) {
    let part = parts[i];
    if (part.startsWith("--")) break;
    if (part.startsWith("\r\n")) part = part.slice(2);
    if (part.endsWith("\r\n")) part = part.slice(0, -2);

    const headerEnd = part.indexOf("\r\n\r\n");
    if (headerEnd < 0) continue;
    const headerSection = part.slice(0, headerEnd);
    const bodySection = part.slice(headerEnd + 4);

    const cdMatch = headerSection.match(
      /Content-Disposition:\s*form-data;\s*name="([^"]*)"(?:;\s*filename="([^"]*)")?/i,
    );
    if (!cdMatch) continue;
    const fieldName = cdMatch[1];
    const fileName = cdMatch[2];

    if (fileName) {
      const contentTypeMatch = headerSection.match(
        /Content-Type:\s*([^\r\n]+)/i,
      );
      const contentType = contentTypeMatch
        ? contentTypeMatch[1].trim()
        : "application/octet-stream";

      const fileBuf = Buffer.from(bodySection, "binary");
      files.push({
        fieldName: fieldName,
        originalFilename: fileName,
        contentType: contentType,
        size: fileBuf.length,
        buffer: fileBuf,
      });
    } else {
      fields[fieldName] = bodySection;
    }
  }

  return { fields, files };
}

// ---------- main controller ----------

module.exports.EditPersonalInfo = async (req, res) => {
  try {
    logger.info("EditPersonalInfo API called", { userId: req.user?.u_id });

    // Hard 10s cap on body read so we never hang forever (fix for 504s)
    const timeoutMs = 10000;
    let timer;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
    };

    const chunks = [];
    let totalSize = 0;
    const MAX_BODY = 50 * 1024 * 1024; // 50 MB

    const finishWithError = (msg) => {
      cleanup();
      if (!res.headersSent) {
        logger.error("EditPersonalInfo body read error", { error: msg });
        return res.send({ result: false, message: msg });
      }
    };

    timer = setTimeout(
      () => finishWithError("Request body read timeout"),
      timeoutMs,
    );

    req.on("data", (chunk) => {
      totalSize += chunk.length;
      if (totalSize > MAX_BODY) {
        finishWithError("Request body too large");
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", async () => {
      cleanup();

      const contentType = (req.headers["content-type"] || "").toLowerCase();
      let fields = {};
      let files = [];

      try {
        if (contentType.indexOf("multipart/form-data") !== -1) {
          const m = contentType.match(/boundary=(?:"([^"]+)"|([^;\s]+))/i);
          if (!m) {
            logger.error("No boundary in multipart content-type", {
              contentType,
            });
            return res.send({
              result: false,
              message: "Invalid multipart: no boundary",
            });
          }
          const boundary = m[1] || m[2];
          const buffer = Buffer.concat(chunks);
          const parsed = parseMultipart(buffer, boundary);
          fields = parsed.fields;
          files = parsed.files;
        } else if (
          contentType.indexOf("application/x-www-form-urlencoded") !== -1
        ) {
          const raw = Buffer.concat(chunks).toString("utf8");
          const params = new URLSearchParams(raw);
          for (const [k, v] of params.entries()) {
            fields[k] = v;
          }
        } else if (contentType.indexOf("application/json") !== -1) {
          fields = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        } else {
          const raw = Buffer.concat(chunks).toString("utf8");
          const params = new URLSearchParams(raw);
          for (const [k, v] of params.entries()) {
            fields[k] = v;
          }
        }
      } catch (parseErr) {
        logger.error("Body parse failed", {
          error: parseErr.message,
          contentType,
        });
        return res.send({
          result: false,
          message: "Body parse failed: " + parseErr.message,
        });
      }

      const norm = (v) => (Array.isArray(v) ? v[0] : v);
      const name = norm(fields.name);
      const email = norm(fields.email);
      const mobile = norm(fields.mobile);
      const dob = norm(fields.dob);
      const uState = norm(fields.state);
      const uDistrict = norm(fields.district);
      const uPincode = norm(fields.pincode);
      // Address is multi-line — keep raw value (escape single quotes)
      const addressRaw = norm(fields.address);
      const addressEscaped = addressRaw ? String(addressRaw).replace(/'/g, "''").substring(0, 500) : null;

      let { u_id } = req.user;

      try {
        // 1) duplicate email
        if (email) {
          const checkmail = await model.CheckEmailQuery(email, u_id);
          if (checkmail && checkmail.length > 0) {
            logger.warn("Duplicate email attempt", { u_id, email });
            return res.send({
              result: false,
              message: "Email already registered",
            });
          }
        }

        // 2) duplicate mobile
        if (mobile) {
          const checkmobile = await model.CheckMobileQuery(mobile, u_id);
          if (checkmobile && checkmobile.length > 0) {
            logger.warn("Duplicate mobile attempt", { u_id, name });
            return res.send({
              result: false,
              message: "Mobile already registered",
            });
          }
        }

        const checkprofile = await model.CheckUserQuery(u_id);
        if (!checkprofile || !checkprofile.length) {
          logger.warn("EditPersonalInfo failed: user not found", { u_id });
          return res.send({ result: false, message: "user not found" });
        }

        // Build UPDATE
        let condition = ``;
        if (name)
          condition += condition ? `,u_name='${name}'` : `set u_name='${name}'`;
        if (email)
          condition += condition
            ? `,u_email='${email}'`
            : `set u_email='${email}'`;
        if (mobile)
          condition += condition
            ? `,u_mobile='${mobile}'`
            : `set u_mobile='${mobile}'`;
        if (dob)
          condition += condition ? `,u_dob='${dob}'` : `set u_dob='${dob}'`;
        // Address fields (SRS §8.2)
        if (addressEscaped)
          condition += condition ? `,u_address='${addressEscaped}'` : `set u_address='${addressEscaped}'`;
        if (uState)
          condition += condition ? `,u_state='${String(uState).replace(/'/g, "''").substring(0, 100)}'` : `set u_state='${String(uState).replace(/'/g, "''").substring(0, 100)}'`;
        if (uDistrict)
          condition += condition ? `,u_district='${String(uDistrict).replace(/'/g, "''").substring(0, 100)}'` : `set u_district='${String(uDistrict).replace(/'/g, "''").substring(0, 100)}'`;
        if (uPincode)
          condition += condition ? `,u_pincode='${String(uPincode).replace(/'/g, "''").substring(0, 6)}'` : `set u_pincode='${String(uPincode).replace(/'/g, "''").substring(0, 6)}'`;

        if (condition) {
          const EditpersonalInfo = await model.ChangeUserInfo(condition, u_id);
          logger.info("User personal info updated", { u_id });
          if (!EditpersonalInfo) {
            logger.error("Failed to update personal info", { u_id });
            return res.send({
              result: false,
              message: "failed to update profile",
            });
          }
        }

        // 3) profile image
        if (files && files.length > 0) {
          const img = files[0];
          try {
            const newPath = path.join(
              process.cwd(),
              "/uploads/profile/",
              img.originalFilename,
            );
            await new Promise((resolve, reject) => {
              const ws = fs.createWriteStream(newPath);
              ws.on("error", reject);
              ws.on("finish", resolve);
              ws.end(img.buffer);
            });
            const imagePath = "/uploads/profile/" + img.originalFilename;
            const Insertprofileimage = await model.Updateimage(imagePath, u_id);
            if (Insertprofileimage && Insertprofileimage.affectedRows > 0) {
              logger.info("Profile image updated", { u_id, imagePath });
              return res.send({
                result: true,
                message: "profile updated successfully",
              });
            } else {
              logger.error("Profile image DB update failed", { u_id });
              return res.send({
                result: false,
                message: "failed to update profile",
              });
            }
          } catch (imgErr) {
            logger.error("Profile image upload error", {
              u_id,
              error: imgErr.message,
            });
            return res.send({ result: false, message: "Image upload failed" });
          }
        }

        return res.send({
          result: true,
          message: "profile updated successfully",
        });
      } catch (dbErr) {
        logger.error("DB error in EditPersonalInfo", {
          u_id,
          error: dbErr.message,
        });
        return res.send({
          result: false,
          message: "DB error: " + dbErr.message,
        });
      }
    });

    req.on("error", (err) => {
      cleanup();
      finishWithError("Request stream error: " + err.message);
    });
  } catch (error) {
    logger.error("EditPersonalInfo unexpected error", { error: error.message });
    return res.send({ result: false, message: error.message });
  }
};
