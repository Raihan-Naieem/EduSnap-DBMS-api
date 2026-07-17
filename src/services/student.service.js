/**
 * =============================================================================
 * src/services/student.service.js
 * =============================================================================
 * Business logic ONLY — no SQL. Talks exclusively to the repository layer.
 * =============================================================================
 */
const bcrypt = require('bcryptjs');
const studentRepository = require('../repositories/student.repository');
const ApiError = require('../utils/ApiError');

const SALT_ROUNDS = 10;

async function registerStudent({ name, email, password }) {
  const existing = await studentRepository.findByEmailWithHash(email);
  if (existing) throw new ApiError(409, 'A student with this email already exists.');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return studentRepository.create({ name, email, passwordHash });
}

async function getStudentById(studentId) {
  const student = await studentRepository.findById(studentId);
  if (!student) throw new ApiError(404, 'Student not found.');
  return student;
}

async function listStudents() {
  return studentRepository.getAll();
}

async function updateStudent(studentId, { name, email }) {
  const updated = await studentRepository.update(studentId, { name, email });
  if (!updated) throw new ApiError(404, 'Student not found.');
  return updated;
}

async function deleteStudent(studentId) {
  const deleted = await studentRepository.remove(studentId);
  if (!deleted) throw new ApiError(404, 'Student not found.');
}

async function addPhone(studentId, phone) {
  await getStudentById(studentId); // 404s if the student doesn't exist
  return studentRepository.addPhone(studentId, phone);
}

async function listPhones(studentId) {
  await getStudentById(studentId);
  return studentRepository.getPhones(studentId);
}

async function removePhone(studentId, phone) {
  const removed = await studentRepository.removePhone(studentId, phone);
  if (!removed) throw new ApiError(404, 'Phone number not found for this student.');
}

module.exports = {
  registerStudent,
  getStudentById,
  listStudents,
  updateStudent,
  deleteStudent,
  addPhone,
  listPhones,
  removePhone,
};
