/**
 * src/services/teacherApplication.service.js
 * Business rule enforced here: status can only move pending -> approved/rejected
 * once — reviewing an already-reviewed application is rejected with 409.
 */
const teacherApplicationRepository = require('../repositories/teacherApplication.repository');
const adminRepository = require('../repositories/admin.repository');
const ApiError = require('../utils/ApiError');

async function submitApplication({ applicantName, applicantEmail, resumeLink, demoLink }) {
  return teacherApplicationRepository.create({ applicantName, applicantEmail, resumeLink, demoLink });
}

async function getApplicationById(applicationId) {
  const application = await teacherApplicationRepository.findById(applicationId);
  if (!application) throw new ApiError(404, 'Application not found.');
  return application;
}

async function listApplications(status) {
  return teacherApplicationRepository.listByStatus(status);
}

async function reviewApplication(applicationId, decision, adminId) {
  const allowed = ['approved', 'rejected'];
  if (!allowed.includes(decision)) {
    throw new ApiError(400, `decision must be one of: ${allowed.join(', ')}`);
  }

  const application = await teacherApplicationRepository.findById(applicationId);
  if (!application) throw new ApiError(404, 'Application not found.');
  if (application.status !== 'pending') {
    throw new ApiError(409, `This application has already been ${application.status}.`);
  }

  const admin = await adminRepository.findById(adminId);
  if (!admin) throw new ApiError(404, `Admin with id ${adminId} does not exist.`);

  return teacherApplicationRepository.updateStatus(applicationId, decision, adminId);
  // NOTE: a natural next step (left as an exercise) would be: on 'approved',
  // call teacherService.registerTeacher(...) here to turn the application
  // into a real Teacher account — ideally inside a transaction alongside
  // updateStatus, following the same pattern as enrollmentService.enrollWithPayment.
}

async function deleteApplication(applicationId) {
  const deleted = await teacherApplicationRepository.remove(applicationId);
  if (!deleted) throw new ApiError(404, 'Application not found.');
}

module.exports = { submitApplication, getApplicationById, listApplications, reviewApplication, deleteApplication };
