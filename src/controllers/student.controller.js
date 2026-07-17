/**
 * =============================================================================
 * src/controllers/student.controller.js
 * =============================================================================
 * Parses requests, delegates to the service layer, shapes HTTP responses.
 * No SQL, no business rules. Wrapped in asyncHandler at the route level, so
 * no try/catch is needed here — thrown ApiErrors flow to errorHandler.js.
 * =============================================================================
 */
const studentService = require('../services/student.service');

async function register(req, res) {
  const { name, email, password } = req.body;
  const student = await studentService.registerStudent({ name, email, password });
  res.status(201).json({ success: true, data: student });
}

async function getById(req, res) {
  const student = await studentService.getStudentById(req.params.id);
  res.status(200).json({ success: true, data: student });
}

async function list(req, res) {
  const students = await studentService.listStudents();
  res.status(200).json({ success: true, data: students });
}

async function update(req, res) {
  const student = await studentService.updateStudent(req.params.id, req.body);
  res.status(200).json({ success: true, data: student });
}

async function remove(req, res) {
  await studentService.deleteStudent(req.params.id);
  res.status(204).send();
}

async function addPhone(req, res) {
  const result = await studentService.addPhone(req.params.id, req.body.phone);
  res.status(201).json({ success: true, data: result });
}

async function listPhones(req, res) {
  const phones = await studentService.listPhones(req.params.id);
  res.status(200).json({ success: true, data: phones });
}

async function removePhone(req, res) {
  await studentService.removePhone(req.params.id, req.params.phone);
  res.status(204).send();
}

module.exports = { register, getById, list, update, remove, addPhone, listPhones, removePhone };
