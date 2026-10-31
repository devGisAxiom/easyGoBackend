-- Migration: Relax user.u_mobile to nullable
-- Date: 2026-10-29
-- Purpose: Account deletion (Apple requirement) anonymises the user row by
--          clearing the phone number. `u_mobile` is currently BIGINT NOT NULL,
--          so `SET u_mobile = NULL` fails with ER_BAD_NULL_ERROR.
--
--          This mirrors the pattern already used in this schema, where the
--          other personally-identifiable columns on `user` were relaxed to
--          nullable (u_address, u_state, u_district, u_pincode, u_profile_pic,
--          u_adharfront, u_addarback, u_licensefront, u_licenseback,
--          u_email_verify, u_otp_status, u_role).
--
--          No data is changed — only the nullability of the column.

SET @col_nullable := (
  SELECT IS_NULLABLE FROM information_schema.COLUMNS
  WHERE table_schema = DATABASE() AND table_name = 'user' AND column_name = 'u_mobile'
);

SET @sql := IF(@col_nullable = 'NO',
  'ALTER TABLE `user` MODIFY COLUMN `u_mobile` BIGINT NULL DEFAULT NULL',
  'SELECT "user.u_mobile is already nullable" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
