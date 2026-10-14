const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('../util/logger'); // adjust path if needed

module.exports.GenerateToken = (data) => {
    try {
        if (!process.env.SECRET_KEY) {
            logger.error("JWT secret key is missing");
            throw new Error("JWT secret key not configured");
        }

        // Add a unique JWT ID so two logins in the same second don't produce
        // identical tokens (which would collide on the (ut_u_id, ut_token)
        // UNIQUE index now that we allow multi-session).
        const payload = { ...data, jti: crypto.randomBytes(16).toString('hex') };

        const token = jwt.sign(
            payload,
            process.env.SECRET_KEY,
            { expiresIn: "2h" }
        );

        // Log only safe, non-sensitive info
        logger.info("JWT token generated", {
            userId: data?.u_id || null,
            expiresIn: "2h"
        });

        return token;

    } catch (error) {
        logger.error("JWT token generation failed", {
            error: error.message
        });
        throw error;
    }
};
