/** src/routes/studentPayment.routes.js — URL -> Controller mapping only. */
const express = require('express');
const router = express.Router();
const studentPaymentController = require('../controllers/studentPayment.controller');
const asyncHandler = require('../middleware/asyncHandler');
const { requireFields } = require('../middleware/validate');

router.post('/', requireFields(['amount', 'studentId', 'courseId']), asyncHandler(studentPaymentController.create));
router.get('/student/:studentId', asyncHandler(studentPaymentController.listForStudent));
router.get('/course/:courseId', asyncHandler(studentPaymentController.listForCourse));
router.get('/:id', asyncHandler(studentPaymentController.getById));
router.put('/:id', asyncHandler(studentPaymentController.update));
router.delete('/:id', asyncHandler(studentPaymentController.remove));

module.exports = router;
