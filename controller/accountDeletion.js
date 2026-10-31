const model = require('../model/accountDeletion');
const logger = require('../util/logger');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const { transporter } = require('../util/mailer');
const { sendWhatsApp } = require('../util/whatsapp');

const OTP_VALID_MINUTES = 10;

/**
 * Step 1 — send a one-time password so the customer re-authenticates before
 * the account is deleted. Apple expects re-authentication for destructive
 * account actions, and it stops someone with a stolen unlocked phone from
 * deleting the account.
 */
module.exports.requestDeleteOtp = async (req, res) => {
    try {
        const { u_id } = req.user || {};

        if (!u_id) {
            return res.send({ result: false, message: 'User not found' });
        }

        const user = await model.getDeleteOtp(u_id);
        if (!user) {
            return res.send({ result: false, message: 'User not found' });
        }

        if (String(user.u_status || '').toLowerCase() === 'deleted') {
            return res.send({
                result: false,
                code: 'ACCOUNT_DELETED',
                message: 'This account has already been deleted',
            });
        }

        // Generate a 6-digit OTP.
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const expiry = moment().add(OTP_VALID_MINUTES, 'minutes').format('YYYY-MM-DD HH:mm:ss');

        await model.setDeleteOtp(u_id, otp, expiry);
        logger.info('Account deletion OTP issued', { u_id });

        const impact = await model.getDeletionImpact(u_id);

        // Send by email (and WhatsApp when configured). Failures must not
        // block the request — the customer can still ask support.
        const send = async () => {
            try {
                const emailRow = await require('../model/registration').CheckUserWithId(u_id);
                const email = emailRow?.[0]?.u_email;
                if (email) {
                    await transporter.sendMail({
                        from: `EASYGO <${process.env.EMAIL}>`,
                        to: email,
                        subject: 'Confirm account deletion - EasyGo',
                        html: `
                            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px">
                                <h2 style="color:#052838">Confirm your EasyGo account deletion</h2>
                                <p>Hi ${emailRow?.[0]?.u_name || 'Customer'},</p>
                                <p>Use the code below to confirm that you want to permanently delete your EasyGo account.</p>
                                <div style="font-size:30px;letter-spacing:6px;font-weight:bold;color:#052838;margin:24px 0">
                                    ${otp}
                                </div>
                                <p style="color:#666">This code is valid for ${OTP_VALID_MINUTES} minutes.</p>
                                <p>Your bookings, payments and deposit records will be retained for accounting and legal purposes. Your personal details, ID documents and profile photo will be permanently removed.</p>
                                <p>If you did not request this, please ignore this email.</p>
                            </div>
                        `,
                    });
                }
            } catch (err) {
                logger.error('Account deletion OTP email failed: %s', err.message);
            }

            try {
                const phoneRow = await require('../model/registration').CheckUserWithId(u_id);
                const mobile = phoneRow?.[0]?.u_mobile;
                if (mobile) {
                    await sendWhatsApp({
                        to: mobile,
                        template: 'ACCOUNT_DELETE_OTP',
                        variables: [otp],
                    });
                }
            } catch (err) {
                logger.error('Account deletion OTP WhatsApp failed: %s', err.message);
            }
        };

        // Fire and forget — respond immediately.
        setImmediate(send);

        return res.send({
            result: true,
            message: `A verification code has been sent. It is valid for ${OTP_VALID_MINUTES} minutes.`,
            expires_in_minutes: OTP_VALID_MINUTES,
            impact,
        });
    } catch (error) {
        logger.error('requestDeleteOtp error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * Step 2 — verify the OTP and delete the account.
 */
module.exports.deleteAccount = async (req, res) => {
    try {
        const { u_id } = req.user || {};
        const { otp } = req.body || {};

        if (!u_id) {
            return res.send({ result: false, message: 'User not found' });
        }

        if (!otp) {
            return res.send({
                result: false,
                message: 'The verification code is required',
            });
        }

        const user = await model.getDeleteOtp(u_id);
        if (!user) {
            return res.send({ result: false, message: 'User not found' });
        }

        if (String(user.u_status || '').toLowerCase() === 'deleted') {
            return res.send({
                result: false,
                code: 'ACCOUNT_DELETED',
                message: 'This account has already been deleted',
            });
        }

        if (!user.u_token) {
            return res.send({
                result: false,
                code: 'NO_OTP',
                message: 'Please request a verification code first',
            });
        }

        if (String(user.u_token).trim() !== String(otp).trim()) {
            logger.warn('Account deletion failed: invalid OTP for user %s', u_id);
            return res.send({
                result: false,
                code: 'INVALID_OTP',
                message: 'The verification code is incorrect',
            });
        }

        const expiry = moment(user.u_token_expiry);
        if (!expiry.isValid() || moment().isAfter(expiry)) {
            return res.send({
                result: false,
                code: 'OTP_EXPIRED',
                message: 'The verification code has expired. Please request a new one.',
            });
        }

        // Collect the uploaded document paths before anonymising the row.
        const documentPaths = await model.getUserDocumentPaths(u_id);
        const impact = await model.getDeletionImpact(u_id);

        await model.anonymizeUser(u_id);
        await model.deleteUserTokens(u_id);

        // Remove the physical ID/profile files. Failures here are logged but
        // do not fail the deletion — the database references are already gone.
        try {
            for (const docPath of documentPaths) {
                if (!docPath || typeof docPath !== 'string') continue;
                const relative = docPath.replace(/^\/+/, '');
                const absolute = path.join(process.cwd(), 'uploads', relative);
                // Guard against path traversal — only delete inside uploads/.
                if (!absolute.startsWith(path.join(process.cwd(), 'uploads'))) {
                    logger.warn('Skipped file deletion outside uploads/: %s', docPath);
                    continue;
                }
                if (fs.existsSync(absolute)) {
                    fs.unlinkSync(absolute);
                    logger.info('Deleted user document on account deletion: %s', absolute);
                }
            }
        } catch (fileErr) {
            logger.error('Account deletion file cleanup failed: %s', fileErr.message);
        }

        logger.info('Account deleted', { u_id, impact });
        return res.send({
            result: true,
            message: 'Your account has been deleted. All sessions have been signed out.',
            deleted: true,
            impact,
        });
    } catch (error) {
        logger.error('deleteAccount error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * What will happen to the user's data — shown on the confirmation screen
 * before the OTP is requested.
 */
module.exports.getDeletionPreview = async (req, res) => {
    try {
        const { u_id } = req.user || {};
        if (!u_id) {
            return res.send({ result: false, message: 'User not found' });
        }

        const impact = await model.getDeletionImpact(u_id);
        return res.send({
            result: true,
            message: 'Deletion preview',
            will_be_removed: [
                'Your name, email address and phone number',
                'Your saved ID documents (Aadhaar, driving licence)',
                'Your profile photo and address',
                'All active sessions',
            ],
            will_be_retained: [
                `${impact.bookings} booking record(s)`,
                `${impact.payments} payment record(s)`,
                `${impact.deposit_returns} deposit refund record(s)`,
                'These are retained for accounting and legal purposes.',
            ],
            impact,
        });
    } catch (error) {
        logger.error('getDeletionPreview error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};
