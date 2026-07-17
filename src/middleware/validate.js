/**
 * =============================================================================
 * src/middleware/validate.js
 * =============================================================================
 * Simple, dependency-free request validation. Rather than pulling in
 * express-validator, this exposes a small factory: give it a list of
 * required field names, and it returns middleware that checks req.body
 * for all of them, responding with 400 + a field-level error list if any
 * are missing. Controllers can still do additional, endpoint-specific
 * checks on top of this.
 *
 * Usage:
 *   router.post('/', requireFields(['name', 'email', 'password']), asyncHandler(studentController.register));
 * =============================================================================
 */
const ApiError = require('../utils/ApiError');

function requireFields(fields) {
  return function (req, res, next) {
    const missing = fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
      return next(
        new ApiError(400, 'Missing required field(s).', {
          missingFields: missing,
        })
      );
    }
    next();
  };
}

module.exports = { requireFields };
