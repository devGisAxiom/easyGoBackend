-- Multi-session support for user_token table.
--
-- Background:
--   - On 22-Aug a UNIQUE constraint (uq_user_token_uid) was added so each user
--     has only one token row. Combined with the login controller's
--     "overwrite-on-login" behaviour this made the system single-session only:
--     a second login kills the first session (admin tabs close, second user
--     can't share an account with the first).
--
-- This migration:
--   1. Adds an ut_expires_at column so we can clean up expired tokens cheaply.
--   2. Drops the old "one token per user" UNIQUE.
--   3. Adds a composite UNIQUE on (ut_u_id, ut_token) so a user can have many
--      rows but never a literal duplicate.
--   4. Adds an index on ut_expires_at so the nightly DELETE is fast.

-- 1. Add expiry column. Existing rows get NULL and are ignored by cleanup.
ALTER TABLE user_token
  ADD COLUMN ut_expires_at DATETIME NULL AFTER ut_token;

-- 2. Drop the old single-session constraint (safe if it doesn't exist).
SET @drop_old := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name   = 'user_token'
    AND index_name   = 'uq_user_token_uid'
);
SET @sql := IF(@drop_old > 0,
  'ALTER TABLE user_token DROP INDEX uq_user_token_uid',
  'SELECT "uq_user_token_uid already absent" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. Add composite UNIQUE so duplicates of the same (user, token) can't sneak in.
SET @has_new := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name   = 'user_token'
    AND index_name   = 'uq_user_token_uid_tok'
);
SET @sql := IF(@has_new = 0,
  'ALTER TABLE user_token ADD UNIQUE KEY uq_user_token_uid_tok (ut_u_id, ut_token)',
  'SELECT "uq_user_token_uid_tok already present" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. Index for the nightly cleanup DELETE.
SET @has_idx := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name   = 'user_token'
    AND index_name   = 'idx_user_token_expires'
);
SET @sql := IF(@has_idx = 0,
  'ALTER TABLE user_token ADD INDEX idx_user_token_expires (ut_expires_at)',
  'SELECT "idx_user_token_expires already present" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
