/** src/controllers/teacher.controller.js — HTTP in/out for Teacher endpoints. */
const teacherService = require('../services/teacher.service');

async function register(req, res) {
  const { name, email, password, adminId } = req.body;
  const teacher = await teacherService.registerTeacher({ name, email, password, adminId });
  res.status(201).json({ success: true, data: teacher });
}

async function getById(req, res) {
  const teacher = await teacherService.getTeacherById(req.params.id);
  res.status(200).json({ success: true, data: teacher });
}

async function list(req, res) {
  res.status(200).json({ success: true, data: await teacherService.listTeachers() });
}

async function update(req, res) {
  const teacher = await teacherService.updateTeacher(req.params.id, req.body);
  res.status(200).json({ success: true, data: teacher });
}

async function remove(req, res) {
  await teacherService.deleteTeacher(req.params.id);
  res.status(204).send();
}

async function addPhone(req, res) {
  const result = await teacherService.addPhone(req.params.id, req.body.phone);
  res.status(201).json({ success: true, data: result });
}

async function listPhones(req, res) {
  res.status(200).json({ success: true, data: await teacherService.listPhones(req.params.id) });
}

async function removePhone(req, res) {
  await teacherService.removePhone(req.params.id, req.params.phone);
  res.status(204).send();
}

module.exports = { register, getById, list, update, remove, addPhone, listPhones, removePhone };
