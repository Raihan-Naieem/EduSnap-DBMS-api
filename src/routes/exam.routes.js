/** src/routes/exam.routes.js — URL -> Controller mapping only. */
const express = require('express');
const router = express.Router();
const examController = require('../controllers/exam.controller');
const asyncHandler = require('../middleware/asyncHandler');
const { requireFields } = require('../middleware/validate');

router.post('/', requireFields(['title', 'maxMarks', 'passingMarks', 'durationMinutes', 'courseId']), asyncHandler(examController.create));
router.get('/course/:courseId', asyncHandler(examController.listForCourse));
router.get('/:id', asyncHandler(examController.getById));
router.put('/:id', asyncHandler(examController.update));
router.delete('/:id', asyncHandler(examController.remove));

router.post('/:examId/attempts', requireFields(['studentId', 'marksObtained']), asyncHandler(examController.recordAttempt));
router.get('/:examId/attempts/:studentId', asyncHandler(examController.listAttempts));

module.exports = router;
