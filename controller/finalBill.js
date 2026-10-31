const bookingModel = require('../model/booking');
const penaltyModel = require('../model/penalty');
const manualPaymentModel = require('../model/manualPayment');
const swapModel = require('../model/swap');
const depositReturnModel = require('../model/depositReturn');
const logger = require('../util/logger');
const { assertFranchiseAccess } = require('../util/franchiseScope');

const round2 = (n) => Number(Number(n || 0).toFixed(2));

/**
 * Calculate the final bill for a booking.
 *
 * How the money flows
 * -------------------
 * The customer pays `rent_total` (base rent + GST + security deposit) online
 * through Razorpay, plus any offline/manual collections. The security
 * deposit is held and refunded once the vehicle comes back.
 *
 * Penalties and swap fees are charged against that deposit:
 *
 *   refund_to_customer = deposit − (penalties + swap fees)
 *   additional_due     = max(0, (penalties + swap fees) − deposit)
 *   net_revenue        = total paid − refund given back
 *
 * Everything is returned as explicit components so the admin screen can
 * show the full working rather than a single opaque number.
 */
async function calculateFinalBill(b_id) {
    const booking = await bookingModel.getBookingFullDetails(b_id);
    if (!booking) return null;

    const priceId = booking.b_price_id;

    // Security deposit + base rent + GST come from the pricing tier.
    // A booking can reference a tier that no longer exists, so fall back to
    // zeroes rather than crashing on an undefined row.
    const priceRows = await require('../model/priceDetails').checkPriceDetails(priceId);
    const price = (Array.isArray(priceRows) && priceRows[0]) ? priceRows[0] : {};

    if (!price.rent_id) {
        logger.warn(
            'calculateFinalBill: booking %s references unknown price tier %s',
            b_id, priceId,
        );
    }

    const securityDeposit = round2(price.rent_deposit);
    const baseRent = round2(price.rent_amount);
    const gst = round2(price.rent_gst);

    // b_fine_amount holds the "different location fee" charged at booking.
    const locationFee = round2(booking.b_fine_amount);

    const penaltiesTotal = round2(await penaltyModel.getTotalForBooking(b_id));
    const swapCharges = round2(await swapModel.getTotalCharges(b_id));
    const manualPaid = round2(await manualPaymentModel.getTotalForBooking(b_id));
    const onlinePaid = round2(booking.b_total_amount);

    const totalPaid = round2(onlinePaid + manualPaid);

    const penalties = await penaltyModel.listForBooking(b_id);
    const swaps = await swapModel.listForBooking(b_id);
    const manualPayments = await manualPaymentModel.listManualPayments({ booking_id: b_id });

    const depositReturnRows = await depositReturnModel.getDepositReturnByBooking(b_id);
    const depositReturn = Array.isArray(depositReturnRows) ? depositReturnRows[0] : null;

    // Deductions charged against the security deposit.
    const deductions = round2(penaltiesTotal + swapCharges);

    const refundToCustomer = round2(Math.max(0, securityDeposit - deductions));
    const additionalDue = round2(Math.max(0, deductions - securityDeposit));

    // Everything the ride should have cost the customer, excluding the
    // (refundable) deposit.
    const totalCharges = round2(baseRent + gst + locationFee + penaltiesTotal + swapCharges);

    // Money the business actually keeps.
    const netRevenue = round2(totalPaid - refundToCustomer);

    return {
        booking_id: Number(b_id),
        booking_status: booking.b_status,
        payment_status: booking.b_payment_status,
        customer_name: booking.u_name,
        vehicle_number: booking.vehicle_number,
        bike_name: booking.bike_name,
        pickup_location: booking.b_pickup_location,
        pickup_date: booking.b_pickup_date,
        drop_date: booking.b_drop_date,
        duration: price.rent_duration_text || null,

        // Components
        security_deposit: securityDeposit,
        base_rent: baseRent,
        gst: gst,
        location_fee: locationFee,
        penalties_total: penaltiesTotal,
        swap_charges_total: swapCharges,
        total_charges: totalCharges,

        // What was paid
        online_paid: onlinePaid,
        manual_paid: manualPaid,
        total_paid: totalPaid,

        // Outcome
        deductions_from_deposit: deductions,
        refund_to_customer: refundToCustomer,
        additional_due: additionalDue,
        net_revenue: netRevenue,
        final_amount_due: round2(Math.max(0, totalCharges - totalPaid)),
        is_settled: additionalDue === 0,

        // Deposit refund actually recorded (GPay)
        deposit_returned: !!depositReturn,
        deposit_returned_amount: depositReturn ? round2(depositReturn.dr_amount) : 0,
        deposit_gpay_ref: depositReturn?.dr_gpay_ref_number || null,
        deposit_returned_at: depositReturn?.dr_returned_at || null,

        // Detail rows
        penalties,
        swaps,
        manual_payments: manualPayments,
    };
}

/**
 * GET-style final bill for a booking (live figures, not the snapshot).
 */
module.exports.getFinalBill = async (req, res) => {
    try {
        const { b_id } = req.body || {};

        if (!b_id) {
            return res.send({ result: false, message: 'b_id is required' });
        }

        const booking = await bookingModel.getUserIdByBooking(Number(b_id));
        if (!booking || booking.length === 0) {
            return res.send({ result: false, message: 'Booking not found' });
        }

        const access = assertFranchiseAccess(req.user, booking[0].b_franchise_id);
        if (!access.allowed) {
            return res.send({
                result: false,
                code: 'FRANCHISE_FORBIDDEN',
                message: access.message,
            });
        }

        const bill = await calculateFinalBill(Number(b_id));
        if (!bill) {
            return res.send({ result: false, message: 'Booking not found' });
        }

        // Attach the stored snapshot (if any) so the caller can see whether
        // the bill was already closed.
        const snapshot = await bookingModel.getFinalBill(Number(b_id));
        if (snapshot) {
            try {
                bill.saved_final_bill = typeof snapshot === 'string'
                    ? JSON.parse(snapshot)
                    : snapshot;
            } catch (parseErr) {
                logger.warn('getFinalBill: could not parse saved snapshot: %s', parseErr.message);
            }
        }

        return res.send({
            result: true,
            message: 'Final bill calculated',
            final_bill: bill,
        });
    } catch (error) {
        logger.error('getFinalBill error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

/**
 * Snapshot the final bill onto the booking ("Close & Bill").
 */
module.exports.saveFinalBill = async (req, res) => {
    try {
        const { b_id } = req.body || {};

        if (!b_id) {
            return res.send({ result: false, message: 'b_id is required' });
        }

        const booking = await bookingModel.getUserIdByBooking(Number(b_id));
        if (!booking || booking.length === 0) {
            return res.send({ result: false, message: 'Booking not found' });
        }

        const access = assertFranchiseAccess(req.user, booking[0].b_franchise_id);
        if (!access.allowed) {
            return res.send({
                result: false,
                code: 'FRANCHISE_FORBIDDEN',
                message: access.message,
            });
        }

        const bill = await calculateFinalBill(Number(b_id));
        if (!bill) {
            return res.send({ result: false, message: 'Booking not found' });
        }

        bill.saved_at = new Date().toISOString();
        bill.saved_by = Number(req.user?.u_id || null);

        await bookingModel.saveFinalBill(Number(b_id), bill);

        logger.info('Final bill snapshot saved', {
            b_id,
            refund_to_customer: bill.refund_to_customer,
            additional_due: bill.additional_due,
        });

        return res.send({
            result: true,
            message: 'Final bill saved successfully',
            final_bill: bill,
        });
    } catch (error) {
        logger.error('saveFinalBill error: %s', error.message);
        return res.send({ result: false, message: error.message });
    }
};

module.exports.calculateFinalBill = calculateFinalBill;
