/**
 * =============================================================================
 * src/services/exam.service.js
 * =============================================================================
 * Business rule enforced here: a student can only attempt an exam if they
 * are (still) enrolled in that exam's course. Marks are also checked against
 * max_marks here for a friendly error message — the database additionally
 * enforces this at a lower level via the trg_check_marks_within_range trigger
 * in database/schema.sql, as defense-in-depth.
 * =============================================================================
 */
const examRepository = require('../repositories/exam.repository');
const attemptRepository = require('../repositories/attempt.repository');
const enrollmentRepository = require('../repositories/enrollment.repository');
const courseRepository = require('../repositories/course.repository');
const ApiError = require('../utils/ApiError');

async function createExam({ title, maxMarks, passingMarks, durationMinutes, courseId }) {
  const course = await courseRepository.findById(courseId);
  if (!course) throw new ApiError(404, `Course with id ${courseId} does not exist.`);
  if (passingMarks > maxMarks) throw new ApiError(400, 'passingMarks cannot exceed maxMarks.');
  return examRepository.create({ title, maxMarks, passingMarks, durationMinutes, courseId });
}

async function getExamById(examId) {
  const exam = await examRepository.findById(examId);
  if (!exam) throw new ApiError(404, 'Exam not found.');
  return exam;
}

async function listExamsForCourse(courseId) {
  return examRepository.listByCourse(courseId);
}

async function updateExam(examId, data) {
  const updated = await examRepository.update(examId, data);
  if (!updated) throw new ApiError(404, 'Exam not found.');
  return updated;
}

async function deleteExam(examId) {
  const deleted = await examRepository.remove(examId);
  if (!deleted) throw new ApiError(404, 'Exam not found.');
}

async function recordAttempt(studentId, examId, marksObtained) {
  const exam = await examRepository.findById(examId);
  if (!exam) throw new ApiError(404, 'Exam not found.');

  const enrollment = await enrollmentRepository.findEnrollment(studentId, exam.courseId);
  if (!enrollment) {
    throw new ApiError(403, "Student must be enrolled in this exam's course before attempting it.");
  }

  if (marksObtained > exam.maxMarks) {
    throw new ApiError(400, `marksObtained cannot exceed the exam's max_marks (${exam.maxMarks}).`);
  }

  const latest = await attemptRepository.findLatestAttemptNumber(studentId, examId);
  return attemptRepository.createAttempt(studentId, examId, latest + 1, marksObtained);
}

async function listAttempts(studentId, examId) {
  return attemptRepository.listAttempts(studentId, examId);
}

module.exports = { createExam, getExamById, listExamsForCourse, updateExam, deleteExam, recordAttempt, listAttempts };
