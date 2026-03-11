const jwt = require('jsonwebtoken');
const logger = require('../util/logger'); // adjust path if needed

module.exports.GenerateToken = (data) => {
    try {
        if (!process.env.SECRET_KEY) {
            logger.error("JWT secret key is missing");
            throw new Error("JWT secret key not configured");
        }

        const token = jwt.sign(
            data,
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
