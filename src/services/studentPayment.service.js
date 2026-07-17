/**
 * src/services/studentPayment.service.js
 * Business rule enforced here: a student can only be charged for a course
 * they are enrolled in.
 */
const studentPaymentRepository = require('../repositories/studentPayment.repository');
const enrollmentRepository = require('../repositories/enrollment.repository');
const ApiError = require('../utils/ApiError');

async function createPayment({ amount, paymentDue, studentId, courseId }) {
  const enrollment = await enrollmentRepository.findEnrollment(studentId, courseId);
  if (!enrollment) {
    throw new ApiError(403, 'Cannot record a payment for a course the student is not enrolled in.');
  }
  return studentPaymentRepository.create({ amount, paymentDue, studentId, courseId });
}

async function getPaymentById(paymentId) {
  const payment = await studentPaymentRepository.findById(paymentId);
  if (!payment) throw new ApiError(404, 'Payment not found.');
  return payment;
}

async function listPaymentsForStudent(studentId) {
  return studentPaymentRepository.listByStudent(studentId);
}

async function listPaymentsForCourse(courseId) {
  return studentPaymentRepository.listByCourse(courseId);
}

async function updatePayment(paymentId, data) {
  const updated = await studentPaymentRepository.update(paymentId, data);
  if (!updated) throw new ApiError(404, 'Payment not found.');
  return updated;
}

async function deletePayment(paymentId) {
  const deleted = await studentPaymentRepository.remove(paymentId);
  if (!deleted) throw new ApiError(404, 'Payment not found.');
}

module.exports = { createPayment, getPaymentById, listPaymentsForStudent, listPaymentsForCourse, updatePayment, deletePayment };
