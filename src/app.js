/**
 * =============================================================================
 * src/app.js
 * =============================================================================
 * Builds and configures the Express application: JSON body parsing, route
 * mounting, a health check, a 404 handler, and the centralized error handler
 * (registered LAST, as Express requires for error-handling middleware).
 *
 * This file does NOT start listening — see src/server.js. Separating the two
 * means app.js can be imported directly by test frameworks (e.g. supertest)
 * without opening a real network port.
 * =============================================================================
 */
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
// 2. Allow all origins to talk to your API
app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Error handler MUST be registered last.
app.use(errorHandler);

module.exports = app;
