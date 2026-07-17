/** src/controllers/teacherPayment.controller.js — HTTP in/out for Teacher_payment endpoints. */
const teacherPaymentService = require('../services/teacherPayment.service');

async function create(req, res) {
  const { amount, paymentDate, teacherId } = req.body;
  res.status(201).json({ success: true, data: await teacherPaymentService.createPayment({ amount, paymentDate, teacherId }) });
}

async function getById(req, res) {
  res.status(200).json({ success: true, data: await teacherPaymentService.getPaymentById(req.params.id) });
}

async function listForTeacher(req, res) {
  res.status(200).json({ success: true, data: await teacherPaymentService.listPaymentsForTeacher(req.params.teacherId) });
}

async function update(req, res) {
  res.status(200).json({ success: true, data: await teacherPaymentService.updatePayment(req.params.id, req.body) });
}

async function remove(req, res) {
  await teacherPaymentService.deletePayment(req.params.id);
  res.status(204).send();
}

module.exports = { create, getById, listForTeacher, update, remove };
