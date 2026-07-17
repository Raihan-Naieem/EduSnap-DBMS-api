/** src/controllers/conducts.controller.js — HTTP in/out for Conducts endpoints. */
const conductsService = require('../services/conducts.service');

async function assign(req, res) {
  const { courseId, teacherId } = req.body;
  res.status(201).json({ success: true, data: await conductsService.assignTeacherToCourse(courseId, teacherId) });
}

async function listTeachersForCourse(req, res) {
  res.status(200).json({ success: true, data: await conductsService.listTeachersForCourse(req.params.courseId) });
}

async function listCoursesForTeacher(req, res) {
  res.status(200).json({ success: true, data: await conductsService.listCoursesForTeacher(req.params.teacherId) });
}

async function unassign(req, res) {
  const { courseId, teacherId } = req.params;
  await conductsService.unassignTeacherFromCourse(courseId, teacherId);
  res.status(204).send();
}

module.exports = { assign, listTeachersForCourse, listCoursesForTeacher, unassign };
