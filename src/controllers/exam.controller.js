/** src/controllers/exam.controller.js — HTTP in/out for Exam + Attempt endpoints. */
const examService = require('../services/exam.service');

async function create(req, res) {
  const { title, maxMarks, passingMarks, durationMinutes, courseId } = req.body;
  res.status(201).json({ success: true, data: await examService.createExam({ title, maxMarks, passingMarks, durationMinutes, courseId }) });
}

async function getById(req, res) {
  res.status(200).json({ success: true, data: await examService.getExamById(req.params.id) });
}

async function listForCourse(req, res) {
  res.status(200).json({ success: true, data: await examService.listExamsForCourse(req.params.courseId) });
}

async function update(req, res) {
  res.status(200).json({ success: true, data: await examService.updateExam(req.params.id, req.body) });
}

async function remove(req, res) {
  await examService.deleteExam(req.params.id);
  res.status(204).send();
}

async function recordAttempt(req, res) {
  const { studentId, marksObtained } = req.body;
  const attempt = await examService.recordAttempt(studentId, req.params.examId, marksObtained);
  res.status(201).json({ success: true, data: attempt });
}

async function listAttempts(req, res) {
  const { examId, studentId } = req.params;
  res.status(200).json({ success: true, data: await examService.listAttempts(studentId, examId) });
}

module.exports = { create, getById, listForCourse, update, remove, recordAttempt, listAttempts };
