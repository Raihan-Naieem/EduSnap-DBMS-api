/**
 * src/routes/index.js
 * Aggregates every feature router under its base path. app.js only needs
 * to mount this ONE file.
 */
const express = require('express');
const router = express.Router();

router.use('/students', require('./student.routes'));
router.use('/teachers', require('./teacher.routes'));
router.use('/admins', require('./admin.routes'));
router.use('/courses', require('./course.routes'));
router.use('/enrollments', require('./enrollment.routes'));
router.use('/exams', require('./exam.routes'));
router.use('/routines', require('./routine.routes'));
router.use('/conducts', require('./conducts.routes'));
router.use('/student-payments', require('./studentPayment.routes'));
router.use('/teacher-payments', require('./teacherPayment.routes'));
router.use('/teacher-applications', require('./teacherApplication.routes'));

module.exports = router;
