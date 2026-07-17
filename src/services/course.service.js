/** src/services/course.service.js — business rules for Course + prerequisites. */
const courseRepository = require('../repositories/course.repository');
const ApiError = require('../utils/ApiError');

async function createCourse({ title, description, price, adminId }) {
  return courseRepository.create({ title, description, price, adminId });
}

async function getCourseById(courseId) {
  const course = await courseRepository.findById(courseId);
  if (!course) throw new ApiError(404, 'Course not found.');
  return course;
}

async function listCourses() {
  return courseRepository.getAll();
}

async function updateCourse(courseId, data) {
  const updated = await courseRepository.update(courseId, data);
  if (!updated) throw new ApiError(404, 'Course not found.');
  return updated;
}

async function deleteCourse(courseId) {
  const deleted = await courseRepository.remove(courseId);
  if (!deleted) throw new ApiError(404, 'Course not found.');
}

async function getCourseStats(courseId) {
  const stats = await courseRepository.getEnrollmentStats(courseId);
  if (!stats) throw new ApiError(404, 'Course not found.');
  return stats;
}

async function addPrerequisite(courseId, prerequisiteId) {
  await getCourseById(courseId);
  await getCourseById(prerequisiteId);
  if (Number(courseId) === Number(prerequisiteId)) {
    throw new ApiError(400, 'A course cannot be its own prerequisite.');
  }
  return courseRepository.addPrerequisite(courseId, prerequisiteId);
}

async function listPrerequisites(courseId) {
  await getCourseById(courseId);
  return courseRepository.listPrerequisites(courseId);
}

async function removePrerequisite(courseId, prerequisiteId) {
  const removed = await courseRepository.removePrerequisite(courseId, prerequisiteId);
  if (!removed) throw new ApiError(404, 'Prerequisite relationship not found.');
}

module.exports = { createCourse, getCourseById, listCourses, updateCourse, deleteCourse, getCourseStats, addPrerequisite, listPrerequisites, removePrerequisite };
