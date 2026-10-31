/**
 * Environment loader.
 *
 * Loads `.env.local` FIRST (if present) and then `.env`, so a developer can
 * override database connection details for local work without touching the
 * committed `.env` file.
 *
 * dotenv does not overwrite variables that are already set, so the order
 * here defines the precedence:
 *
 *   .env.local  (highest - developer overrides)
 *   .env        (shared defaults)
 *   real environment variables (highest of all - container / CI config)
 *
 * `.env.local` is git-ignored.
 */

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const backendRoot = path.join(__dirname, '..');
const localEnvPath = path.join(backendRoot, '.env.local');
const sharedEnvPath = path.join(backendRoot, '.env');

if (fs.existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath, encoding: 'latin1' });
}

dotenv.config({ path: sharedEnvPath, encoding: 'latin1' });

module.exports = {
    isLocalOverride: fs.existsSync(localEnvPath),
};
