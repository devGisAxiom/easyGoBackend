-- Migration: Customer feedback
-- Date: 2026-10-22
-- Purpose: A dedicated feedback channel from the customer app (app issues,
--          service feedback, suggestions, complaints). This is separate from
--          bike_reviews, which only captures star ratings left against a
--          specific vehicle.
--
-- Re-runnable: CREATE TABLE IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS `feedback` (
  `fb_id` INT(11) NOT NULL AUTO_INCREMENT,
  `fb_u_id` INT(11) DEFAULT NULL,
  `fb_booking_id` INT(11) DEFAULT NULL,
  `fb_type` VARCHAR(50) NOT NULL DEFAULT 'suggestion',
  `fb_message` TEXT NOT NULL,
  `fb_rating` DECIMAL(2,1) DEFAULT NULL,
  `fb_status` VARCHAR(50) NOT NULL DEFAULT 'open',
  `fb_created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`fb_id`),
  INDEX `idx_fb_u_id` (`fb_u_id`),
  INDEX `idx_fb_booking` (`fb_booking_id`),
  INDEX `idx_fb_status` (`fb_status`),
  INDEX `idx_fb_created_at` (`fb_created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
