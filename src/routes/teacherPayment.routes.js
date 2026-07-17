/** src/routes/teacherPayment.routes.js — URL -> Controller mapping only. */
const express = require('express');
const router = express.Router();
const teacherPaymentController = require('../controllers/teacherPayment.controller');
const asyncHandler = require('../middleware/asyncHandler');
const { requireFields } = require('../middleware/validate');

router.post('/', requireFields(['amount', 'teacherId']), asyncHandler(teacherPaymentController.create));
router.get('/teacher/:teacherId', asyncHandler(teacherPaymentController.listForTeacher));
router.get('/:id', asyncHandler(teacherPaymentController.getById));
router.put('/:id', asyncHandler(teacherPaymentController.update));
router.delete('/:id', asyncHandler(teacherPaymentController.remove));

module.exports = router;
