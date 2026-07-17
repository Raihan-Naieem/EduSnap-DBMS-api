/**
 * =============================================================================
 * src/middleware/errorHandler.js
 * =============================================================================
 * Centralized error-handling middleware. Must be registered LAST in app.js
 * (after all routes) — Express recognizes it as an error handler because it
 * takes four arguments (err, req, res, next).
 *
 * Every error that reaches here either:
 *   - is an ApiError thrown deliberately by a service/controller (has a
 *     meaningful statusCode + message), or
 *   - is an unexpected error (a bug, a DB connection issue, etc) — treated
 *     as a 500 with a generic message so internals are never leaked to clients.
 * =============================================================================
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal server error.';

  if (!err.statusCode) {
    // Only log unexpected errors loudly — ApiErrors are expected control flow.
    console.error('Unexpected error:', err);
  }

  const response = { success: false, message };
  if (err.details) response.details = err.details;
  if (process.env.NODE_ENV === 'development' && !err.statusCode) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
