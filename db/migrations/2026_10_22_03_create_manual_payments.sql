-- Migration: Manual payments (offline collections)
-- Date: 2026-10-22
-- Purpose: Track money collected outside Razorpay — cash, in-person UPI
--          (PhonePe / GPay) and bank transfers — against a booking.
--
--          Manual payments are kept in their own table (NOT merged into
--          bookings.b_total_amount) so that online and offline income stay
--          separately reportable, and so we always have an audit trail of
--          who collected what, when and how.
--
-- Re-runnable: CREATE TABLE IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS `manual_payments` (
  `mp_id` INT(11) NOT NULL AUTO_INCREMENT,
  `mp_booking_id` INT(11) NOT NULL,
  `mp_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `mp_mode` VARCHAR(50) NOT NULL DEFAULT 'cash',
  `mp_reference` VARCHAR(200) DEFAULT NULL,
  `mp_collected_by` INT(11) NOT NULL,
  `mp_collected_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mp_notes` TEXT DEFAULT NULL,
  `mp_screenshot_url` VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (`mp_id`),
  INDEX `idx_mp_booking` (`mp_booking_id`),
  INDEX `idx_mp_collected_at` (`mp_collected_at`),
  INDEX `idx_mp_mode` (`mp_mode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
