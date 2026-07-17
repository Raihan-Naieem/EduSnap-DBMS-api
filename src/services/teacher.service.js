/** src/services/teacher.service.js — business rules for Teacher management. */
const bcrypt = require('bcryptjs');
const teacherRepository = require('../repositories/teacher.repository');
const adminRepository = require('../repositories/admin.repository');
const ApiError = require('../utils/ApiError');

const SALT_ROUNDS = 10;

async function registerTeacher({ name, email, password, adminId }) {
  const existing = await teacherRepository.findByEmailWithHash(email);
  if (existing) throw new ApiError(409, 'A teacher with this email already exists.');

  const admin = await adminRepository.findById(adminId);
  if (!admin) throw new ApiError(404, `Admin with id ${adminId} does not exist.`);

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return teacherRepository.create({ name, email, passwordHash, adminId });
}

async function getTeacherById(teacherId) {
  const teacher = await teacherRepository.findById(teacherId);
  if (!teacher) throw new ApiError(404, 'Teacher not found.');
  return teacher;
}

async function listTeachers() {
  return teacherRepository.getAll();
}

async function updateTeacher(teacherId, { name, email }) {
  const updated = await teacherRepository.update(teacherId, { name, email });
  if (!updated) throw new ApiError(404, 'Teacher not found.');
  return updated;
}

async function deleteTeacher(teacherId) {
  const deleted = await teacherRepository.remove(teacherId);
  if (!deleted) throw new ApiError(404, 'Teacher not found.');
}

async function addPhone(teacherId, phone) {
  await getTeacherById(teacherId);
  return teacherRepository.addPhone(teacherId, phone);
}

async function listPhones(teacherId) {
  await getTeacherById(teacherId);
  return teacherRepository.getPhones(teacherId);
}

async function removePhone(teacherId, phone) {
  const removed = await teacherRepository.removePhone(teacherId, phone);
  if (!removed) throw new ApiError(404, 'Phone number not found for this teacher.');
}

module.exports = { registerTeacher, getTeacherById, listTeachers, updateTeacher, deleteTeacher, addPhone, listPhones, removePhone };
