-- Enforce one token row per user.
-- Collapse any existing duplicates (keep the latest row by ut_id) before adding the constraint.
DELETE t1 FROM user_token t1
INNER JOIN user_token t2
  ON t1.ut_u_id = t2.ut_u_id AND t1.ut_id < t2.ut_id;

ALTER TABLE user_token
  ADD UNIQUE KEY uq_user_token_uid (ut_u_id);