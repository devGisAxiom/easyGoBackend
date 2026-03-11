const mysql = require("mysql");
const logger = require("../util/logger"); // adjust path if needed

// initialize pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_USERNAME,
    connectTimeout: 30000, // 30 seconds
    dateStrings: true
});

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        logger.error("MySQL connection failed", {
            error: err.message,
            code: err.code
        });
        return;
    }

    logger.info("MySQL database connected successfully");
    connection.release();
});

// Optional: log pool errors
pool.on("error", (err) => {
    logger.error("MySQL pool error", {
        error: err.message,
        code: err.code
    });
});

module.exports = pool;
