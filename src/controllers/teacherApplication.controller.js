/** src/controllers/teacherApplication.controller.js — HTTP in/out for Teacher_Application endpoints. */
const teacherApplicationService = require('../services/teacherApplication.service');

async function submit(req, res) {
  const { applicantName, applicantEmail, resumeLink, demoLink } = req.body;
  res.status(201).json({ success: true, data: await teacherApplicationService.submitApplication({ applicantName, applicantEmail, resumeLink, demoLink }) });
}

async function getById(req, res) {
  res.status(200).json({ success: true, data: await teacherApplicationService.getApplicationById(req.params.id) });
}

async function list(req, res) {
  res.status(200).json({ success: true, data: await teacherApplicationService.listApplications(req.query.status) });
}

async function review(req, res) {
  const { decision, adminId } = req.body;
  res.status(200).json({ success: true, data: await teacherApplicationService.reviewApplication(req.params.id, decision, adminId) });
}

async function remove(req, res) {
  await teacherApplicationService.deleteApplication(req.params.id);
  res.status(204).send();
}

module.exports = { submit, getById, list, review, remove };
