-- Migration: Vehicle swaps (request + approval) and swap charges
-- Date: 2026-10-22
-- Purpose: Support swapping the vehicle assigned to an active ride.
--
--          Business rule: the FIRST swap on a booking is free, every swap
--          from the second onwards costs Rs.100.
--
--          swap_requests  -> customer raises a request, admin approves
--          swaps          -> the executed swap (old bike, new bike, charge)
--
-- Re-runnable: CREATE TABLE IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS `swap_requests` (
  `sr_id` INT(11) NOT NULL AUTO_INCREMENT,
  `sr_booking_id` INT(11) NOT NULL,
  `sr_reason` TEXT DEFAULT NULL,
  `sr_status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `sr_requested_by` INT(11) NOT NULL,
  `sr_created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sr_resolved_at` DATETIME DEFAULT NULL,
  `sr_resolved_by` INT(11) DEFAULT NULL,
  `sr_remarks` TEXT DEFAULT NULL,
  PRIMARY KEY (`sr_id`),
  INDEX `idx_sr_booking` (`sr_booking_id`),
  INDEX `idx_sr_status` (`sr_status`),
  INDEX `idx_sr_created_at` (`sr_created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `swaps` (
  `sw_id` INT(11) NOT NULL AUTO_INCREMENT,
  `sw_booking_id` INT(11) NOT NULL,
  `sw_swap_number` INT(11) NOT NULL DEFAULT 1,
  `sw_is_free` TINYINT(1) NOT NULL DEFAULT 1,
  `sw_charge` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `sw_old_bk_id` INT(11) DEFAULT NULL,
  `sw_new_bk_id` INT(11) DEFAULT NULL,
  `sw_reason` TEXT DEFAULT NULL,
  `sw_requested_by` INT(11) DEFAULT NULL,
  `sw_approved_by` INT(11) DEFAULT NULL,
  `sw_status` VARCHAR(50) NOT NULL DEFAULT 'approved',
  `sw_swap_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`sw_id`),
  INDEX `idx_sw_booking` (`sw_booking_id`),
  INDEX `idx_sw_swap_number` (`sw_booking_id`, `sw_swap_number`),
  INDEX `idx_sw_swap_at` (`sw_swap_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
