const jwt = require('jsonwebtoken');
const userModel = require('../model/registration')

const verifyToken = async (req, res, next) => {
    try {

        const SECRET_KEY = process.env.SECRET_KEY;
        if (!SECRET_KEY) {
            return res.status(500).json({ error: "Server error: SECRET_KEY missing" });
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No token provided or bad format" });
        }

        const token = authHeader.split(" ")[1];

        // Verify JWT validity
        let decoded;

        try {
            decoded = jwt.verify(token, SECRET_KEY);

        } catch (err) {
            return res.status(498).json({
                result: false,
                code: 'TOKEN_EXPIRED',
                message: "Authentication failed: Token expired"
            });
        }

        // Check token in DB
        const checkToken = await userModel.CheckJwtToken(token, decoded.u_id);

        if (!checkToken || checkToken.length === 0) {
            return res.status(401).json({
                result: false,
                code: 'INVALID_TOKEN',
                message: "Invalid Token",
            });
        }

        // Check user exists
        const userData = await userModel.CheckUserWithId(decoded.u_id);

        if (!userData || userData.length === 0) {
            return res.status(401).json({
                result: false,
                code: 'USER_NOT_FOUND',
                message: "User not found. Invalid user id",
            });
        }

        // Deleted accounts (Apple account-deletion requirement) keep their
        // booking/payment rows for accounting, but must not be able to act.
        if (String(userData[0].u_status || '').toLowerCase() === 'deleted') {
            return res.status(401).json({
                result: false,
                code: 'ACCOUNT_DELETED',
                message: "This account has been deleted.",
            });
        }

        // Attach user to request.
        //
        // Role and franchise are re-read from the database rather than trusted
        // from the token, so that (a) tokens issued before the franchise
        // feature existed still get correct scoping, and (b) revoking a
        // franchise-admin's franchise takes effect immediately instead of
        // when their 2-hour token happens to expire.
        req.user = {
            ...decoded,
            role: userData[0].u_role,
            franchise_id: userData[0].u_franchise_id || null,
        };
        next();

    } catch (err) {
        console.error("verifyToken error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Authorization middleware (Role-based)
const Userauthorize = (allowedRoles = ['user']) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user || !user.role) {
            return res.status(403).send({ error: "Access denied: No role assigned" });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).send({ error: "Access denied: Insufficient permissions" });
        }

        next();
    };
};

const Adminauthorize = (allowedRoles = ['admin']) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user || !user.role) {
            return res.status(403).send({ error: "Access denied: No role assigned" });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).send({ error: "Access denied: Insufficient permissions" });
        }

        next();
    };
};

const ActiveAccount = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user || !user.u_id) {
            return res.status(400).json({
                result: false,
                message: "Invalid token or user data missing"
            });
        }

        console.log("ActiveAccount check for user:", user.u_id);

        const userData = await userModel.CheckUserWithId(user.u_id);

        if (!userData || userData.length === 0) {
            return res.status(401).json({
                result: false,
                message: "User not found. Invalid user id/token",
            });
        }

        if (userData[0].u_status !== "active") {
            return res.status(403).json({
                result: false,
                message: "You need to activate your account first to continue",
            });
        }

        // User is active → proceed
        next();

    } catch (err) {
        console.error("ActiveAccount error:", err);
        return res.status(500).json({
            result: false,
            message: "Internal server error",
        });
    }
};


/**
 * Franchise-aware authorisation.
 *
 * Guards endpoints that operate on franchise data. A franchise-admin must
 * have a franchise bound to their account — otherwise their requests would
 * silently widen to "all franchises".
 */
const Franchiseauthorize = (allowedRoles = ['admin', 'franchise_admin']) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user || !user.role) {
            return res.status(403).send({
                result: false,
                code: 'NO_ROLE',
                error: 'Access denied: No role assigned',
            });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).send({
                result: false,
                code: 'INSUFFICIENT_PERMISSIONS',
                error: 'Access denied: Insufficient permissions',
            });
        }

        if (user.role === 'franchise_admin' && !user.franchise_id) {
            return res.status(403).send({
                result: false,
                code: 'NO_FRANCHISE',
                message: 'Access denied: Your account is not assigned to a franchise',
            });
        }

        next();
    };
};

module.exports = { verifyToken, Userauthorize, Adminauthorize, ActiveAccount, Franchiseauthorize };
