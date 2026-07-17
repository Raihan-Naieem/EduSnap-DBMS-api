/** src/routes/routine.routes.js — URL -> Controller mapping only. */
const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routine.controller');
const asyncHandler = require('../middleware/asyncHandler');
const { requireFields } = require('../middleware/validate');

router.post('/', requireFields(['startTime', 'endTime', 'courseId', 'teacherId']), asyncHandler(routineController.create));
router.get('/course/:courseId', asyncHandler(routineController.listForCourse));
router.get('/teacher/:teacherId', asyncHandler(routineController.listForTeacher));
router.get('/:id', asyncHandler(routineController.getById));
router.put('/:id', asyncHandler(routineController.update));
router.delete('/:id', asyncHandler(routineController.remove));

router.post('/:id/days', requireFields(['dayOfWeek']), asyncHandler(routineController.addDay));
router.get('/:id/days', asyncHandler(routineController.listDays));
router.delete('/:id/days/:day', asyncHandler(routineController.removeDay));

module.exports = router;
