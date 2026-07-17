/** src/controllers/enrollment.controller.js — HTTP in/out for Enrollment endpoints. */
const enrollmentService = require('../services/enrollment.service');

async function enroll(req, res) {
  const { studentId, courseId } = req.body;
  const enrollment = await enrollmentService.enrollStudentInCourse(studentId, courseId);
  res.status(201).json({ success: true, message: 'Student successfully enrolled in course.', data: enrollment });
}

async function enrollWithPayment(req, res) {
  const { studentId, courseId, amount, paymentDue } = req.body;
  const result = await enrollmentService.enrollWithPayment(studentId, courseId, { amount, paymentDue });
  res.status(201).json({ success: true, message: 'Student enrolled and payment recorded atomically.', data: result });
}

async function listForStudent(req, res) {
  res.status(200).json({ success: true, data: await enrollmentService.listEnrollmentsForStudent(req.params.studentId) });
}

async function listForCourse(req, res) {
  res.status(200).json({ success: true, data: await enrollmentService.listEnrollmentsForCourse(req.params.courseId) });
}

async function updateStatus(req, res) {
  const { studentId, courseId } = req.params;
  const updated = await enrollmentService.updateEnrollmentStatus(studentId, courseId, req.body.status);
  res.status(200).json({ success: true, data: updated });
}

async function cancel(req, res) {
  const { studentId, courseId } = req.params;
  await enrollmentService.cancelEnrollment(studentId, courseId);
  res.status(204).send();
}

module.exports = { enroll, enrollWithPayment, listForStudent, listForCourse, updateStatus, cancel };
