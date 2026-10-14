-- Migration: Add rejection_reason column to bookings table
-- Date: 2026-08-12
-- Purpose: Required for DLT SMS template 1707178256004172786 (Booking Rejected)
--          which has 4 variables: [name, vehicle_no, booking_date, rejection_reason]

ALTER TABLE `bookings`
    ADD COLUMN `rejection_reason` VARCHAR(500) NULL DEFAULT NULL
    AFTER `extend_reason`;
