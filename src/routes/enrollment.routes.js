/** src/routes/enrollment.routes.js — URL -> Controller mapping only. */
const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollment.controller');
const asyncHandler = require('../middleware/asyncHandler');
const { requireFields } = require('../middleware/validate');

router.post('/', requireFields(['studentId', 'courseId']), asyncHandler(enrollmentController.enroll));
router.post(
  '/with-payment',
  requireFields(['studentId', 'courseId', 'amount']),
  asyncHandler(enrollmentController.enrollWithPayment)
);
router.get('/student/:studentId', asyncHandler(enrollmentController.listForStudent));
router.get('/course/:courseId', asyncHandler(enrollmentController.listForCourse));
router.put('/:studentId/:courseId/status', asyncHandler(enrollmentController.updateStatus));
router.delete('/:studentId/:courseId', asyncHandler(enrollmentController.cancel));

module.exports = router;
