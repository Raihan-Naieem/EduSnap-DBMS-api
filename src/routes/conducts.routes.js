/** src/routes/conducts.routes.js — URL -> Controller mapping only. */
const express = require('express');
const router = express.Router();
const conductsController = require('../controllers/conducts.controller');
const asyncHandler = require('../middleware/asyncHandler');
const { requireFields } = require('../middleware/validate');

router.post('/', requireFields(['courseId', 'teacherId']), asyncHandler(conductsController.assign));
router.get('/course/:courseId/teachers', asyncHandler(conductsController.listTeachersForCourse));
router.get('/teacher/:teacherId/courses', asyncHandler(conductsController.listCoursesForTeacher));
router.delete('/:courseId/:teacherId', asyncHandler(conductsController.unassign));

module.exports = router;
