/**
 * =============================================================================
 * src/config/db.js
 * =============================================================================
 * Creates and exports ONE shared PostgreSQL connection pool using the `pg`
 * package. This file does NOT create tables, run migrations, or contain any
 * DDL — the schema lives entirely in database/schema.sql and is applied by
 * hand with `psql` (see README.md). This file only manages connections.
 * =============================================================================
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('error', (err) => {
  // Errors on idle clients (e.g. connection dropped by the server) are fatal
  // for that client but shouldn't crash requests in flight elsewhere.
  console.error('Unexpected error on idle PostgreSQL client', err);
});

/**
 * Acquire a dedicated client from the pool for multi-statement transactions
 * (BEGIN / COMMIT / ROLLBACK). Services use this when an operation must
 * write to more than one table atomically. Always release the client when done:
 *
 *   const client = await getClient();
 *   try {
 *     await client.query('BEGIN');
 *     ...
 *     await client.query('COMMIT');
 *   } catch (err) {
 *     await client.query('ROLLBACK');
 *     throw err;
 *   } finally {
 *     client.release();
 *   }
 */
async function getClient() {
  return pool.connect();
}

module.exports = { pool, getClient };
