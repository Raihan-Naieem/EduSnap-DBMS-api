/** src/controllers/studentPayment.controller.js — HTTP in/out for Student_payment endpoints. */
const studentPaymentService = require('../services/studentPayment.service');

async function create(req, res) {
  const { amount, paymentDue, studentId, courseId } = req.body;
  res.status(201).json({ success: true, data: await studentPaymentService.createPayment({ amount, paymentDue, studentId, courseId }) });
}

async function getById(req, res) {
  res.status(200).json({ success: true, data: await studentPaymentService.getPaymentById(req.params.id) });
}

async function listForStudent(req, res) {
  res.status(200).json({ success: true, data: await studentPaymentService.listPaymentsForStudent(req.params.studentId) });
}

async function listForCourse(req, res) {
  res.status(200).json({ success: true, data: await studentPaymentService.listPaymentsForCourse(req.params.courseId) });
}

async function update(req, res) {
  res.status(200).json({ success: true, data: await studentPaymentService.updatePayment(req.params.id, req.body) });
}

async function remove(req, res) {
  await studentPaymentService.deletePayment(req.params.id);
  res.status(204).send();
}

module.exports = { create, getById, listForStudent, listForCourse, update, remove };
