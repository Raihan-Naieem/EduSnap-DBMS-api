/**
 * =============================================================================
 * src/middleware/asyncHandler.js
 * =============================================================================
 * Wraps an async controller function so any rejected promise (thrown error)
 * is automatically forwarded to Express's error-handling middleware via
 * next(err), instead of requiring a try/catch in every single controller.
 *
 * Usage:
 *   router.post('/', asyncHandler(studentController.register));
 * =============================================================================
 */
function asyncHandler(fn) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
