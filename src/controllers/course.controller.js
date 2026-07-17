/** src/controllers/course.controller.js — HTTP in/out for Course endpoints. */
const courseService = require('../services/course.service');

async function create(req, res) {
  const { title, description, price, adminId } = req.body;
  res.status(201).json({ success: true, data: await courseService.createCourse({ title, description, price, adminId }) });
}

async function getById(req, res) {
  res.status(200).json({ success: true, data: await courseService.getCourseById(req.params.id) });
}

async function list(req, res) {
  res.status(200).json({ success: true, data: await courseService.listCourses() });
}

async function update(req, res) {
  res.status(200).json({ success: true, data: await courseService.updateCourse(req.params.id, req.body) });
}

async function remove(req, res) {
  await courseService.deleteCourse(req.params.id);
  res.status(204).send();
}

async function getStats(req, res) {
  res.status(200).json({ success: true, data: await courseService.getCourseStats(req.params.id) });
}

async function addPrerequisite(req, res) {
  const result = await courseService.addPrerequisite(req.params.id, req.body.prerequisiteId);
  res.status(201).json({ success: true, data: result });
}

async function listPrerequisites(req, res) {
  res.status(200).json({ success: true, data: await courseService.listPrerequisites(req.params.id) });
}

async function removePrerequisite(req, res) {
  await courseService.removePrerequisite(req.params.id, req.params.prerequisiteId);
  res.status(204).send();
}

module.exports = { create, getById, list, update, remove, getStats, addPrerequisite, listPrerequisites, removePrerequisite };
