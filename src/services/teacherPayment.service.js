/** src/services/teacherPayment.service.js — business rules for Teacher_payment. */
const teacherPaymentRepository = require('../repositories/teacherPayment.repository');
const teacherRepository = require('../repositories/teacher.repository');
const ApiError = require('../utils/ApiError');

async function createPayment({ amount, paymentDate, teacherId }) {
  const teacher = await teacherRepository.findById(teacherId);
  if (!teacher) throw new ApiError(404, `Teacher with id ${teacherId} does not exist.`);
  if (amount <= 0) throw new ApiError(400, 'amount must be greater than zero.');
  return teacherPaymentRepository.create({ amount, paymentDate, teacherId });
}

async function getPaymentById(paymentId) {
  const payment = await teacherPaymentRepository.findById(paymentId);
  if (!payment) throw new ApiError(404, 'Payment not found.');
  return payment;
}

async function listPaymentsForTeacher(teacherId) {
  return teacherPaymentRepository.listByTeacher(teacherId);
}

async function updatePayment(paymentId, data) {
  const updated = await teacherPaymentRepository.update(paymentId, data);
  if (!updated) throw new ApiError(404, 'Payment not found.');
  return updated;
}

async function deletePayment(paymentId) {
  const deleted = await teacherPaymentRepository.remove(paymentId);
  if (!deleted) throw new ApiError(404, 'Payment not found.');
}

module.exports = { createPayment, getPaymentById, listPaymentsForTeacher, updatePayment, deletePayment };
