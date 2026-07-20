/**
 * =============================================================================
 * src/server.js
 * =============================================================================
 * Entry point. Loads environment variables, then starts the HTTP server
 * defined in app.js. Run with `npm start` or `npm run dev`.
 *
 * IMPORTANT: this project does NOT create or migrate any database tables.
 * Before running this for the first time, apply database/schema.sql (and
 * optionally database/seed.sql) by hand with psql — see README.md.
 * =============================================================================
 */
require('dotenv').config();
const cors = require('cors');
const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  server.close(() => process.exit(1));
});
