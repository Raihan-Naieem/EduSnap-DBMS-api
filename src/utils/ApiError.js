/**
 * =============================================================================
 * src/utils/ApiError.js
 * =============================================================================
 * A small custom error class so services can express "this failed, and here
 * is the HTTP status code that should be returned" without importing Express
 * or knowing anything about req/res. Controllers/middleware read `.statusCode`.
 * =============================================================================
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details; // optional extra info, e.g. field-level validation errors
  }
}

module.exports = ApiError;
