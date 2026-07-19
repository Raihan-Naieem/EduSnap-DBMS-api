/** 
 * src/config/db.js
 * Database initialization module.
 * Connects to PostgreSQL using a connection pool for safe query scaling.
 */

const { Pool } = require('pg');
require('dotenv').config(); // Loads variables from the .env file into process.env

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Dynamically targets your Neon cloud string
  ssl: {
    rejectUnauthorized: false // Required for secure serverless cloud handshakes
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};