#!/usr/bin/env node
/**
 * supabase/migrate.cjs
 *
 * Applies all SQL migrations in supabase/migrations/ in filename order.
 * Requires a direct Postgres connection string in DATABASE_URL.
 *
 * Supabase connection string format:
 *   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
 *
 * Usage:
 *   DATABASE_URL="..." node supabase/migrate.cjs
 *   pnpm migrate
 *
 * On Railway:
 *   Set DATABASE_URL in Railway environment variables.
 *   Add "node supabase/migrate.cjs &&" to the build command or use a release phase.
 */

'use strict';

const { Client } = require('pg');
const fs = require('node:fs');
const path = require('node:path');

// Load .env if it exists (local development)
try {
  require('dotenv').config();
} catch {
  // dotenv not available — rely on real env vars
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error(
    '\n❌  DATABASE_URL is not set.\n' +
    '    Set it to your Supabase direct connection string:\n' +
    '    postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres\n',
  );
  process.exit(1);
}

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function run() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('✓ Connected to database\n');

  // Create a simple migration tracking table so we never re-apply a file
  await client.query(`
    CREATE TABLE IF NOT EXISTS public._migrations (
      filename   text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    // Check if already applied
    const { rows } = await client.query(
      'SELECT filename FROM public._migrations WHERE filename = $1',
      [file],
    );
    if (rows.length > 0) {
      console.log(`⟳  ${file} (already applied, skipping)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    console.log(`⟶  Applying ${file}…`);

    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO public._migrations (filename) VALUES ($1)',
        [file],
      );
      await client.query('COMMIT');
      console.log(`✓  ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`\n❌  ${file} failed:\n   ${err.message}\n`);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  console.log('\n✅  All migrations applied.\n');
}

run().catch((err) => {
  console.error('Migration runner crashed:', err);
  process.exit(1);
});
