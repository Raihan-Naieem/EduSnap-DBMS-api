/** src/routes/teacherApplication.routes.js — URL -> Controller mapping only. */
const express = require('express');
const router = express.Router();
const teacherApplicationController = require('../controllers/teacherApplication.controller');
const asyncHandler = require('../middleware/asyncHandler');
const { requireFields } = require('../middleware/validate');

router.post('/', requireFields(['applicantName', 'applicantEmail']), asyncHandler(teacherApplicationController.submit));
router.get('/', asyncHandler(teacherApplicationController.list)); // supports ?status=pending
router.get('/:id', asyncHandler(teacherApplicationController.getById));
router.put('/:id/review', requireFields(['decision', 'adminId']), asyncHandler(teacherApplicationController.review));
router.delete('/:id', asyncHandler(teacherApplicationController.remove));

module.exports = router;
