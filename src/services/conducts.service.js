/** src/services/conducts.service.js — business rules for assigning teachers to courses. */
const conductsRepository = require('../repositories/conducts.repository');
const courseRepository = require('../repositories/course.repository');
const teacherRepository = require('../repositories/teacher.repository');
const ApiError = require('../utils/ApiError');

async function assignTeacherToCourse(courseId, teacherId) {
  const course = await courseRepository.findById(courseId);
  if (!course) throw new ApiError(404, `Course with id ${courseId} does not exist.`);

  const teacher = await teacherRepository.findById(teacherId);
  if (!teacher) throw new ApiError(404, `Teacher with id ${teacherId} does not exist.`);

  const existing = await conductsRepository.findAssignment(courseId, teacherId);
  if (existing) throw new ApiError(409, 'This teacher is already assigned to this course.');

  return conductsRepository.assign(courseId, teacherId);
}

async function listTeachersForCourse(courseId) {
  return conductsRepository.listTeachersForCourse(courseId);
}

async function listCoursesForTeacher(teacherId) {
  return conductsRepository.listCoursesForTeacher(teacherId);
}

async function unassignTeacherFromCourse(courseId, teacherId) {
  const removed = await conductsRepository.unassign(courseId, teacherId);
  if (!removed) throw new ApiError(404, 'Assignment not found.');
}

module.exports = { assignTeacherToCourse, listTeachersForCourse, listCoursesForTeacher, unassignTeacherFromCourse };
