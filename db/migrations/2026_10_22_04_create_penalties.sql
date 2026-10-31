-- Migration: Penalties / fines / damages
-- Date: 2026-10-22
-- Purpose: Record deductions made against a booking's security deposit
--          (vehicle damage, traffic fines, missing helmet, other). These feed
--          the final-bill calculation and appear as their own section in the
--          payment reports.
--
-- Re-runnable: CREATE TABLE IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS `penalties` (
  `pn_id` INT(11) NOT NULL AUTO_INCREMENT,
  `pn_booking_id` INT(11) NOT NULL,
  `pn_type` VARCHAR(50) NOT NULL DEFAULT 'other',
  `pn_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `pn_notes` TEXT DEFAULT NULL,
  `pn_added_by` INT(11) NOT NULL,
  `pn_added_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`pn_id`),
  INDEX `idx_pn_booking` (`pn_booking_id`),
  INDEX `idx_pn_type` (`pn_type`),
  INDEX `idx_pn_added_at` (`pn_added_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
