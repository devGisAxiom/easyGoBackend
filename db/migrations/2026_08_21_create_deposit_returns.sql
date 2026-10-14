-- Migration: Create deposit_returns table for SRS §7
-- Date: 2026-08-21
-- Purpose: Track GPay deposit returns per booking (manual entry by admin)
-- Safe to run multiple times — uses IF NOT EXISTS

CREATE TABLE IF NOT EXISTS `deposit_returns` (
  `dr_id` INT(11) NOT NULL AUTO_INCREMENT,
  `dr_booking_id` INT(11) NOT NULL,
  `dr_gpay_ref_number` VARCHAR(100) NOT NULL,
  `dr_gpay_screenshot_url` VARCHAR(500) NULL DEFAULT NULL,
  `dr_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `dr_returned_by` INT(11) NOT NULL,
  `dr_returned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dr_notes` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`dr_id`),
  INDEX `idx_dr_booking_id` (`dr_booking_id`),
  INDEX `idx_dr_returned_at` (`dr_returned_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;