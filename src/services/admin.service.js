/** src/services/admin.service.js — business rules for Admin management. */
const bcrypt = require('bcryptjs');
const adminRepository = require('../repositories/admin.repository');
const ApiError = require('../utils/ApiError');

const SALT_ROUNDS = 10;

async function registerAdmin({ name, email, password }) {
  const existing = await adminRepository.findByEmailWithHash(email);
  if (existing) throw new ApiError(409, 'An admin with this email already exists.');
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return adminRepository.create({ name, email, passwordHash });
}

async function getAdminById(adminId) {
  const admin = await adminRepository.findById(adminId);
  if (!admin) throw new ApiError(404, 'Admin not found.');
  return admin;
}

async function listAdmins() {
  return adminRepository.getAll();
}

async function updateAdmin(adminId, { name, email }) {
  const updated = await adminRepository.update(adminId, { name, email });
  if (!updated) throw new ApiError(404, 'Admin not found.');
  return updated;
}

async function deleteAdmin(adminId) {
  const deleted = await adminRepository.remove(adminId);
  if (!deleted) throw new ApiError(404, 'Admin not found.');
}

async function addPhone(adminId, phone) {
  await getAdminById(adminId);
  return adminRepository.addPhone(adminId, phone);
}

async function listPhones(adminId) {
  await getAdminById(adminId);
  return adminRepository.getPhones(adminId);
}

async function removePhone(adminId, phone) {
  const removed = await adminRepository.removePhone(adminId, phone);
  if (!removed) throw new ApiError(404, 'Phone number not found for this admin.');
}

module.exports = { registerAdmin, getAdminById, listAdmins, updateAdmin, deleteAdmin, addPhone, listPhones, removePhone };
