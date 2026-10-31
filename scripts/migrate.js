/**
 * Migration runner
 * ----------------
 * Applies every pending SQL file in `db/migrations/` in filename order and
 * records what it applied in the `schema_migrations` table.
 *
 * The repo previously had migration files but no runner — they were applied
 * by hand via throwaway scripts. This makes the process repeatable and safe.
 *
 *   npm run migrate              # apply everything pending
 *   npm run migrate -- --status  # show what is applied / pending, change nothing
 *
 * Notes:
 *   * MySQL/MariaDB DDL is not transactional, so a failure halfway through a
 *     file leaves that file partially applied. Every migration in this repo
 *     is written to be re-runnable (information_schema guards), so the fix is
 *     simply to re-run this script.
 *   * `multipleStatements` is enabled on this dedicated connection only — the
 *     application pool is untouched.
 */

require('../config/env');

const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const logger = require('../util/logger');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'db', 'migrations');
const STATUS_ONLY = process.argv.includes('--status');

function getConnection() {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_USERNAME,
    multipleStatements: true,
    connectTimeout: 30000,
    dateStrings: true,
  });
}

function ensureMigrationsTable(conn) {
  return new Promise((resolve, reject) => {
    conn.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         mig_id INT(11) NOT NULL AUTO_INCREMENT,
         mig_name VARCHAR(255) NOT NULL,
         mig_applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
         PRIMARY KEY (mig_id),
         UNIQUE KEY uq_schema_migrations_name (mig_name)
       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      (err) => (err ? reject(err) : resolve()),
    );
  });
}

function getApplied(conn) {
  return new Promise((resolve, reject) => {
    conn.query('SELECT mig_name FROM schema_migrations', (err, rows) => {
      if (err) return reject(err);
      resolve(rows.map((r) => r.mig_name));
    });
  });
}

function recordApplied(conn, name) {
  return new Promise((resolve, reject) => {
    conn.query(
      'INSERT IGNORE INTO schema_migrations (mig_name) VALUES (?)',
      [name],
      (err) => (err ? reject(err) : resolve()),
    );
  });
}

function runSql(conn, sql) {
  return new Promise((resolve, reject) => {
    conn.query(sql, (err) => (err ? reject(err) : resolve()));
  });
}

/**
 * Read the APPLY_FROM marker.
 *
 * The runner only manages migrations whose filename sorts at or after this
 * prefix. Everything older was applied by hand before the runner existed and
 * must never be re-executed — see the APPLY_FROM file for the details.
 *
 * @returns {string} The marker prefix, e.g. '2026_10_22'. Empty string means
 *                   "manage everything" (used only for a fresh, empty
 *                   database).
 */
function readApplyFrom() {
  const markerPath = path.join(MIGRATIONS_DIR, 'APPLY_FROM');
  if (!fs.existsSync(markerPath)) return '';

  const raw = fs
    .readFileSync(markerPath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

  return raw[0] || '';
}

/**
 * Files the runner is allowed to touch.
 */
function selectManagedFiles(files, applyFrom) {
  if (!applyFrom) return files;
  return files.filter((f) => f >= applyFrom);
}

async function main() {
  const conn = getConnection();

  try {
    await new Promise((resolve, reject) => {
      conn.connect((err) => (err ? reject(err) : resolve()));
    });
    logger.info('Migration runner connected to database');

    await ensureMigrationsTable(conn);
    const applied = new Set(await getApplied(conn));

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.toLowerCase().endsWith('.sql'))
      .sort(); // YYYY_MM_DD_ prefix gives chronological order

    if (files.length === 0) {
      logger.info('No migration files found');
      console.log('No migrations found.');
      return;
    }

    const applyFrom = readApplyFrom();
    const managed = selectManagedFiles(files, applyFrom);
    const skipped = files.filter((f) => !managed.includes(f));

    const pending = managed.filter((f) => !applied.has(f));

    console.log('\nEasyGo migration status');
    console.log('------------------------');
    if (applyFrom) {
      console.log(`  managing migrations from "${applyFrom}" onwards`);
      console.log(`  (${skipped.length} earlier migration(s) are outside the managed range)`);
      console.log('');
    }
    managed.forEach((f) => {
      const isApplied = applied.has(f);
      console.log(`  ${isApplied ? '[applied]' : '[pending]'}  ${f}`);
    });
    if (skipped.length) {
      console.log('');
      console.log('  skipped (outside the managed range, never executed by this tool):');
      skipped.forEach((f) => console.log(`    - ${f}`));
    }
    console.log('');

    if (STATUS_ONLY) {
      console.log(`${pending.length} pending migration(s). Re-run without --status to apply.`);
      return;
    }

    if (pending.length === 0) {
      console.log('Nothing to apply — database is up to date.');
      return;
    }

    console.log(`Applying ${pending.length} migration(s)...\n`);

    for (const file of pending) {
      const fullPath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(fullPath, 'utf8');

      process.stdout.write(`  → ${file} ... `);
      try {
        await runSql(conn, sql);
        await recordApplied(conn, file);
        console.log('OK');
        logger.info('Migration applied', { file });
      } catch (err) {
        console.log('FAILED');
        logger.error('Migration failed', { file, error: err.message });
        console.error(`\nMigration "${file}" failed:\n${err.message}`);
        console.error(
          '\nRe-run `npm run migrate` — every migration in this repo is ' +
            'written to be re-runnable, so a partially applied file will ' +
            'complete on the next attempt.',
        );
        process.exitCode = 1;
        return;
      }
    }

    console.log('\nAll migrations applied successfully.');
  } catch (err) {
    logger.error('Migration runner failed', { error: err.message });
    console.error(`\nMigration runner error: ${err.message}`);
    process.exitCode = 1;
  } finally {
    conn.end();
  }
}

main();
