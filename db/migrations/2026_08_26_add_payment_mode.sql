-- Migration: Add payment_mode column to bookings table
-- Date: 2026-08-26
-- Purpose: Track the payment method (UPI / Card / Netbanking / Wallet / etc.)
--          used by customers via Razorpay, and surface it in admin
--          payment reports, Excel export, and nightly email report.

ALTER TABLE `bookings`
    ADD COLUMN `b_payment_mode` VARCHAR(50) NULL DEFAULT NULL
    AFTER `b_payment_status`;