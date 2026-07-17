/** src/services/routine.service.js — business rules for Routine + Routine_Day. */
const routineRepository = require('../repositories/routine.repository');
const courseRepository = require('../repositories/course.repository');
const teacherRepository = require('../repositories/teacher.repository');
const ApiError = require('../utils/ApiError');

const VALID_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

async function createRoutine({ startTime, endTime, classLink, isActive, courseId, teacherId }) {
  const course = await courseRepository.findById(courseId);
  if (!course) throw new ApiError(404, `Course with id ${courseId} does not exist.`);
  const teacher = await teacherRepository.findById(teacherId);
  if (!teacher) throw new ApiError(404, `Teacher with id ${teacherId} does not exist.`);
  if (endTime <= startTime) throw new ApiError(400, 'endTime must be after startTime.');

  return routineRepository.create({ startTime, endTime, classLink, isActive, courseId, teacherId });
}

async function getRoutineById(routineId) {
  const routine = await routineRepository.findById(routineId);
  if (!routine) throw new ApiError(404, 'Routine not found.');
  return routine;
}

async function listRoutinesForCourse(courseId) {
  return routineRepository.listByCourse(courseId);
}

async function listRoutinesForTeacher(teacherId) {
  return routineRepository.listByTeacher(teacherId);
}

async function updateRoutine(routineId, data) {
  const updated = await routineRepository.update(routineId, data);
  if (!updated) throw new ApiError(404, 'Routine not found.');
  return updated;
}

async function deleteRoutine(routineId) {
  const deleted = await routineRepository.remove(routineId);
  if (!deleted) throw new ApiError(404, 'Routine not found.');
}

async function addDay(routineId, dayOfWeek) {
  await getRoutineById(routineId);
  const normalized = String(dayOfWeek).toUpperCase();
  if (!VALID_DAYS.includes(normalized)) {
    throw new ApiError(400, `day_of_week must be one of: ${VALID_DAYS.join(', ')}`);
  }
  return routineRepository.addDay(routineId, normalized);
}

async function listDays(routineId) {
  await getRoutineById(routineId);
  return routineRepository.listDays(routineId);
}

async function removeDay(routineId, dayOfWeek) {
  const removed = await routineRepository.removeDay(routineId, String(dayOfWeek).toUpperCase());
  if (!removed) throw new ApiError(404, 'Day not found for this routine.');
}

module.exports = { createRoutine, getRoutineById, listRoutinesForCourse, listRoutinesForTeacher, updateRoutine, deleteRoutine, addDay, listDays, removeDay };
