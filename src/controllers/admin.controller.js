/** src/controllers/admin.controller.js — HTTP in/out for Admin endpoints. */
const adminService = require('../services/admin.service');

async function register(req, res) {
  const { name, email, password } = req.body;
  res.status(201).json({ success: true, data: await adminService.registerAdmin({ name, email, password }) });
}

async function getById(req, res) {
  res.status(200).json({ success: true, data: await adminService.getAdminById(req.params.id) });
}

async function list(req, res) {
  res.status(200).json({ success: true, data: await adminService.listAdmins() });
}

async function update(req, res) {
  res.status(200).json({ success: true, data: await adminService.updateAdmin(req.params.id, req.body) });
}

async function remove(req, res) {
  await adminService.deleteAdmin(req.params.id);
  res.status(204).send();
}

async function addPhone(req, res) {
  res.status(201).json({ success: true, data: await adminService.addPhone(req.params.id, req.body.phone) });
}

async function listPhones(req, res) {
  res.status(200).json({ success: true, data: await adminService.listPhones(req.params.id) });
}

async function removePhone(req, res) {
  await adminService.removePhone(req.params.id, req.params.phone);
  res.status(204).send();
}

module.exports = { register, getById, list, update, remove, addPhone, listPhones, removePhone };
