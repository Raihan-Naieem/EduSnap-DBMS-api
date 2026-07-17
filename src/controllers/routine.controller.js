/** src/controllers/routine.controller.js — HTTP in/out for Routine endpoints. */
const routineService = require('../services/routine.service');

async function create(req, res) {
  const { startTime, endTime, classLink, isActive, courseId, teacherId } = req.body;
  res.status(201).json({ success: true, data: await routineService.createRoutine({ startTime, endTime, classLink, isActive, courseId, teacherId }) });
}

async function getById(req, res) {
  res.status(200).json({ success: true, data: await routineService.getRoutineById(req.params.id) });
}

async function listForCourse(req, res) {
  res.status(200).json({ success: true, data: await routineService.listRoutinesForCourse(req.params.courseId) });
}

async function listForTeacher(req, res) {
  res.status(200).json({ success: true, data: await routineService.listRoutinesForTeacher(req.params.teacherId) });
}

async function update(req, res) {
  res.status(200).json({ success: true, data: await routineService.updateRoutine(req.params.id, req.body) });
}

async function remove(req, res) {
  await routineService.deleteRoutine(req.params.id);
  res.status(204).send();
}

async function addDay(req, res) {
  res.status(201).json({ success: true, data: await routineService.addDay(req.params.id, req.body.dayOfWeek) });
}

async function listDays(req, res) {
  res.status(200).json({ success: true, data: await routineService.listDays(req.params.id) });
}

async function removeDay(req, res) {
  await routineService.removeDay(req.params.id, req.params.day);
  res.status(204).send();
}

module.exports = { create, getById, listForCourse, listForTeacher, update, remove, addDay, listDays, removeDay };
