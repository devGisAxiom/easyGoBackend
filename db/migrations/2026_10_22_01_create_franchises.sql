-- Migration: Franchise module foundation
-- Date: 2026-10-22
-- Purpose: Multi-tenant "franchise" discriminator so each franchise (e.g.
--          Nedumbassery) operates its own bookings / bikes / revenue inside
--          the same database and backend.
--
-- Design:
--   * franchises            -> the tenant record (one row per franchise)
--   * user.u_franchise_id   -> which franchise a franchise-admin belongs to
--                              (NULL for the super-admin who sees everything)
--   * location_center       -> a pickup/drop location belongs to a franchise
--   * bikes                 -> a vehicle belongs to a franchise
--   * bookings              -> a booking inherits the franchise of its
--                              pickup location
--
-- Re-runnable: every statement is guarded with an information_schema check.

-- ---------------------------------------------------------------------------
-- 1. franchises table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `franchises` (
  `fr_id` INT(11) NOT NULL AUTO_INCREMENT,
  `fr_code` VARCHAR(50) NOT NULL,
  `fr_name` VARCHAR(200) NOT NULL,
  `fr_location` VARCHAR(500) DEFAULT NULL,
  `fr_district` VARCHAR(500) DEFAULT NULL,
  `fr_contact_name` VARCHAR(200) DEFAULT NULL,
  `fr_contact_phone` VARCHAR(50) DEFAULT NULL,
  `fr_contact_email` VARCHAR(200) DEFAULT NULL,
  `fr_status` VARCHAR(50) NOT NULL DEFAULT 'active',
  `fr_created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`fr_id`),
  UNIQUE KEY `uq_franchises_code` (`fr_code`),
  INDEX `idx_franchises_status` (`fr_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 2. user.u_franchise_id
-- ---------------------------------------------------------------------------
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE table_schema = DATABASE() AND table_name = 'user' AND column_name = 'u_franchise_id'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `user` ADD COLUMN `u_franchise_id` INT(11) NULL DEFAULT NULL',
  'SELECT "user.u_franchise_id already present" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE table_schema = DATABASE() AND table_name = 'user' AND index_name = 'idx_user_franchise'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE `user` ADD INDEX `idx_user_franchise` (`u_franchise_id`)',
  'SELECT "idx_user_franchise already present" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- 3. location_center.l_franchise_id
-- ---------------------------------------------------------------------------
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE table_schema = DATABASE() AND table_name = 'location_center' AND column_name = 'l_franchise_id'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `location_center` ADD COLUMN `l_franchise_id` INT(11) NULL DEFAULT NULL',
  'SELECT "location_center.l_franchise_id already present" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE table_schema = DATABASE() AND table_name = 'location_center' AND index_name = 'idx_location_franchise'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE `location_center` ADD INDEX `idx_location_franchise` (`l_franchise_id`)',
  'SELECT "idx_location_franchise already present" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- 4. bikes.b_franchise_id
-- ---------------------------------------------------------------------------
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE table_schema = DATABASE() AND table_name = 'bikes' AND column_name = 'b_franchise_id'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `bikes` ADD COLUMN `b_franchise_id` INT(11) NULL DEFAULT NULL',
  'SELECT "bikes.b_franchise_id already present" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE table_schema = DATABASE() AND table_name = 'bikes' AND index_name = 'idx_bikes_franchise'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE `bikes` ADD INDEX `idx_bikes_franchise` (`b_franchise_id`)',
  'SELECT "idx_bikes_franchise already present" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- 5. bookings.b_franchise_id
-- ---------------------------------------------------------------------------
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE table_schema = DATABASE() AND table_name = 'bookings' AND column_name = 'b_franchise_id'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `bookings` ADD COLUMN `b_franchise_id` INT(11) NULL DEFAULT NULL',
  'SELECT "bookings.b_franchise_id already present" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE table_schema = DATABASE() AND table_name = 'bookings' AND index_name = 'idx_bookings_franchise'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE `bookings` ADD INDEX `idx_bookings_franchise` (`b_franchise_id`)',
  'SELECT "idx_bookings_franchise already present" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- 6. Seed the default franchise + backfill existing rows.
--    Existing data belongs to the house franchise (fr_code = 'EASYGO').
-- ---------------------------------------------------------------------------
INSERT INTO `franchises` (`fr_code`, `fr_name`, `fr_status`)
SELECT 'EASYGO', 'EasyGo (Head Office)', 'active'
WHERE NOT EXISTS (SELECT 1 FROM `franchises` WHERE `fr_code` = 'EASYGO');

SET @default_fr := (
  SELECT `fr_id` FROM `franchises` WHERE `fr_code` = 'EASYGO' LIMIT 1
);

UPDATE `location_center` SET `l_franchise_id` = @default_fr WHERE `l_franchise_id` IS NULL;
UPDATE `bikes`          SET `b_franchise_id` = @default_fr WHERE `b_franchise_id` IS NULL;
UPDATE `bookings`       SET `b_franchise_id` = @default_fr WHERE `b_franchise_id` IS NULL;
