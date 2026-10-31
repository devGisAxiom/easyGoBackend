const axios = require('axios');
const logger = require('./logger');

/**
 * WhatsApp integration.
 *
 * Provider-agnostic on purpose: the transport details all come from .env so
 * we can switch between Meta WhatsApp Cloud and an aggregator (Wati /
 * Interakt / AiSensy) without touching any calling code.
 *
 * Config (.env):
 *   WHATSAPP_ENABLED=true
 *   WHATSAPP_API_URL=https://graph.facebook.com
 *   WHATSAPP_API_VERSION=v18.0
 *   WHATSAPP_TOKEN=<meta graph token>
 *   WHATSAPP_FROM_NUMBER=8137064464
 *   WHATSAPP_TPL_<KEY>=<approved template name>
 *
 * When WhatsApp is disabled the helper logs and returns a "skipped" result —
 * SMS remains the fallback channel, so nothing downstream has to care.
 */

const ENABLED = String(process.env.WHATSAPP_ENABLED || 'false').toLowerCase() === 'true';
const API_URL = (process.env.WHATSAPP_API_URL || 'https://graph.facebook.com').replace(/\/$/, '');
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const TOKEN = process.env.WHATSAPP_TOKEN || '';
const FROM_NUMBER = process.env.WHATSAPP_FROM_NUMBER || '';

/**
 * Approved WhatsApp template names, keyed by our internal template key.
 * These must match templates registered and approved in the Meta Business
 * Manager (or the chosen aggregator).
 */
const TEMPLATE_NAMES = {
    BOOKING_CONFIRMED: process.env.WHATSAPP_TPL_BOOKING_CONFIRMED || 'easygo_booking_confirmed',
    BOOKING_REJECTED: process.env.WHATSAPP_TPL_BOOKING_REJECTED || 'easygo_booking_rejected',
    PAYMENT_SUCCESS: process.env.WHATSAPP_TPL_PAYMENT_SUCCESS || 'easygo_payment_success',
    ACCOUNT_DELETE_OTP: process.env.WHATSAPP_TPL_ACCOUNT_DELETE_OTP || 'easygo_account_delete_otp',
    SWAP_APPROVED: process.env.WHATSAPP_TPL_SWAP_APPROVED || 'easygo_swap_approved',
    SWAP_REQUESTED: process.env.WHATSAPP_TPL_SWAP_REQUESTED || 'easygo_swap_requested',
};

const TIMEOUT_MS = 10000;
const MAX_RETRIES = 1;

/**
 * Normalise a phone number to the international format WhatsApp expects
 * (digits only, no leading + or 00).
 */
function normalizeMobile(mobile) {
    if (!mobile) return null;
    const digits = String(mobile).replace(/\D/g, '');
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return digits;
    if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
    return digits.length >= 10 ? digits : null;
}

/**
 * Send a WhatsApp template message.
 *
 * @param {object} opts
 * @param {string} opts.to         Recipient phone number
 * @param {string} opts.template   One of the keys in TEMPLATE_NAMES
 * @param {string[]} opts.variables Ordered template variables
 * @param {string} [opts.refId]    Correlation id for our own logging
 * @returns {Promise<{success: boolean, skipped?: boolean, reason?: string, messageId?: string}>}
 */
async function sendWhatsApp({ to, template, variables = [], refId = null }) {
    if (!ENABLED) {
        logger.info('WhatsApp disabled (template=%s)', template);
        return { success: false, skipped: true, reason: 'disabled' };
    }

    if (!TOKEN || !FROM_NUMBER) {
        logger.warn('WhatsApp skipped: WHATSAPP_TOKEN / WHATSAPP_FROM_NUMBER not configured');
        return { success: false, skipped: true, reason: 'not_configured' };
    }

    const templateName = TEMPLATE_NAMES[template];
    if (!templateName) {
        logger.warn('WhatsApp skipped: unknown template key %s', template);
        return { success: false, skipped: true, reason: 'unknown_template' };
    }

    const toNumber = normalizeMobile(to);
    if (!toNumber) {
        logger.warn('WhatsApp skipped: invalid mobile %s', to);
        return { success: false, skipped: true, reason: 'invalid_mobile' };
    }

    const payload = {
        messaging_product: 'whatsapp',
        to: toNumber,
        type: 'template',
        template: {
            name: templateName,
            language: { code: process.env.WHATSAPP_LANGUAGE || 'en' },
            components: [
                {
                    type: 'body',
                    parameters: variables.map((v) => ({ type: 'text', text: String(v ?? '') })),
                },
            ],
        },
    };

    const url = `${API_URL}/${API_VERSION}/${FROM_NUMBER}/messages`;

    let result = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const resp = await axios.post(url, payload, {
                timeout: TIMEOUT_MS,
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });

            const messageId = resp.data?.messages?.[0]?.id || null;
            result = { success: true, messageId };
            logger.info('WhatsApp sent OK', { template, to: toNumber, refId, messageId });
            break;
        } catch (err) {
            const status = err.response?.status;
            const body = err.response?.data;
            logger.error('WhatsApp send failed', {
                template,
                to: toNumber,
                refId,
                status: status || null,
                reason: body?.error?.message || err.message,
            });

            // 5xx / 429 are worth one retry.
            const retryable = !status || status === 429 || status >= 500;
            if (retryable && attempt < MAX_RETRIES) {
                await new Promise((r) => setTimeout(r, 1000));
                continue;
            }
            result = {
                success: false,
                reason: body?.error?.message || err.message,
                status: status || null,
            };
            break;
        }
    }

    return result || { success: false, reason: 'unknown' };
}

module.exports = {
    sendWhatsApp,
    normalizeMobile,
    TEMPLATE_NAMES,
    isEnabled: () => ENABLED,
};
