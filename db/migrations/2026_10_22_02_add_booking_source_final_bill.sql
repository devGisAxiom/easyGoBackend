-- Migration: Booking source + final bill snapshot
-- Date: 2026-10-22
-- Purpose:
--   * bookings.b_source      -> 'app' (default) | 'web'. Lets us tell app
--                               bookings apart from website bookings in every
--                               report (daily / weekly / income).
--   * bookings.b_final_bill  -> JSON snapshot of the final-bill calculation
--                               taken at ride-completion time. Snapshotted so
--                               later edits to penalties or manual payments
--                               never rewrite historical figures.
--
-- Re-runnable: guarded with information_schema checks.

-- ---------------------------------------------------------------------------
-- 1. bookings.b_source
-- ---------------------------------------------------------------------------
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE table_schema = DATABASE() AND table_name = 'bookings' AND column_name = 'b_source'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `bookings` ADD COLUMN `b_source` VARCHAR(20) NULL DEFAULT ''app''',
  'SELECT "bookings.b_source already present" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE table_schema = DATABASE() AND table_name = 'bookings' AND index_name = 'idx_bookings_source'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE `bookings` ADD INDEX `idx_bookings_source` (`b_source`)',
  'SELECT "idx_bookings_source already present" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE `bookings` SET `b_source` = 'app' WHERE `b_source` IS NULL OR `b_source` = '';

-- ---------------------------------------------------------------------------
-- 2. bookings.b_final_bill
-- ---------------------------------------------------------------------------
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE table_schema = DATABASE() AND table_name = 'bookings' AND column_name = 'b_final_bill'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `bookings` ADD COLUMN `b_final_bill` JSON NULL DEFAULT NULL',
  'SELECT "bookings.b_final_bill already present" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
