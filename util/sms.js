const axios = require('axios');
const logger = require('./logger');

const API_URL = process.env.SMSBUDDY_API_URL || 'https://thesmsbuddy.com/api/v1/sms/send/json';
const API_KEY = process.env.SMSBUDDY_API_KEY || '';
const DEFAULT_SENDER = process.env.SMSBUDDY_DEFAULT_SENDER || 'ESYGOO';
const ENABLED = process.env.SMSBUDDY_ENABLED !== 'false';

const TEMPLATE_IDS = {
    BOOKING_CONFIRMED: process.env.SMSBUDDY_TPL_BOOKING_CONFIRMED || '1707178255997402259',
    BOOKING_REJECTED: process.env.SMSBUDDY_TPL_BOOKING_REJECTED || '1707178256004172786',
};

const TIMEOUT_MS = 8000;
const MAX_RETRIES = 1;

function normalizeMobile(mobile) {
    if (!mobile) return null;
    const digits = String(mobile).replace(/\D/g, '');
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return digits;
    return digits.length >= 10 ? digits : null;
}

function buildMessage(templateId, variables) {
    const placeholders = variables.map((v) => `{#var#}`);
    return placeholders.join(' ');
}

function buildPayload(templateId, mobile, variables, refId) {
    const node = {
        to: mobile,
        message: buildMessage(templateId, variables),
    };
    if (refId !== undefined && refId !== null) {
        node.refid = String(refId);
    }
    return {
        root: {
            type: '1',
            flash: '0',
            sender: DEFAULT_SENDER,
            message: 'EasyGo notification',
            key: API_KEY,
            template_id: templateId,
        },
        nodes: [node],
    };
}

function describeFailure(status, message) {
    switch (status) {
        case 400: return 'BAD_REQUEST - missing/invalid fields';
        case 401: return 'INVALID_API_KEY - check SMSBUDDY_API_KEY';
        case 409: return 'INSUFFICIENT_BALANCE';
        case 412: return 'INVALID_SENDER_ID';
        case 451: return 'OUTSIDE_SENDING_HOURS - SMS restricted to 10AM-9PM by DLT';
        case 429: return 'RATE_LIMIT - 1000 SMS/min exceeded';
        case 500: return 'SMSBUDDY_SERVER_ERROR';
        default: return message || 'unknown error';
    }
}

async function attemptSend(templateId, mobile, variables, refId) {
    const payload = buildPayload(templateId, mobile, variables, refId);

    try {
        const resp = await axios.post(API_URL, payload, {
            timeout: TIMEOUT_MS,
            headers: { 'Content-Type': 'application/json' },
        });

        const body = resp.data || {};
        const status = String(body.status);

        if (status === '200' || status === 200) {
            const deliveryId = Array.isArray(body.data) && body.data[0] ? body.data[0].id : null;
            return {
                success: true,
                skipped: false,
                deliveryId,
                status,
                raw: body,
            };
        }

        return {
            success: false,
            skipped: false,
            status,
            reason: describeFailure(status, body.message),
            raw: body,
        };
    } catch (err) {
        const status = err.response?.status;
        const body = err.response?.data;
        return {
            success: false,
            skipped: false,
            status: status ? String(status) : null,
            reason: status ? describeFailure(status, body?.message) : err.message,
            raw: body || { error: err.message },
        };
    }
}

async function sendSMS(templateKey, mobile, variables, refId) {
    if (!ENABLED) {
        logger.info('SMS disabled via SMSBUDDY_ENABLED=false (template=%s)', templateKey);
        return { success: false, skipped: true, reason: 'disabled' };
    }

    const templateId = TEMPLATE_IDS[templateKey];
    if (!templateId) {
        logger.warn('SMS skipped: unknown template key %s', templateKey);
        return { success: false, skipped: true, reason: 'unknown_template_key' };
    }

    if (!API_KEY) {
        logger.warn('SMS skipped: SMSBUDDY_API_KEY not configured');
        return { success: false, skipped: true, reason: 'api_key_missing' };
    }

    const normalized = normalizeMobile(mobile);
    if (!normalized) {
        logger.warn('SMS skipped: invalid mobile %s (template=%s)', mobile, templateKey);
        return { success: false, skipped: true, reason: 'invalid_mobile' };
    }

    if (!Array.isArray(variables) || variables.length === 0) {
        logger.warn('SMS skipped: no variables provided (template=%s)', templateKey);
        return { success: false, skipped: true, reason: 'no_variables' };
    }

    let result = await attemptSend(templateId, normalized, variables, refId);

    if (!result.success && !result.skipped && result.status === '429' && MAX_RETRIES > 0) {
        logger.info('SMS rate-limited, retrying after 1s (template=%s)', templateKey);
        await new Promise((r) => setTimeout(r, 1000));
        result = await attemptSend(templateId, normalized, variables, refId);
    }

    if (result.success) {
        logger.info('SMS sent OK', {
            template: templateKey,
            mobile: normalized,
            refId,
            deliveryId: result.deliveryId,
            status: result.status,
        });
    } else if (result.status === '451') {
        logger.warn('SMS skipped (outside 10AM-9PM window or Service Implicit restriction)', {
            template: templateKey,
            mobile: normalized,
            refId,
            reason: result.reason,
        });
    } else {
        logger.error('SMS send failed', {
            template: templateKey,
            mobile: normalized,
            refId,
            status: result.status,
            reason: result.reason,
        });
    }

    return result;
}

module.exports = {
    sendSMS,
    TEMPLATE_IDS,
    normalizeMobile,
};
