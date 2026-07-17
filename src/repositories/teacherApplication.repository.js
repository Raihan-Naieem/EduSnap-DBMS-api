/** src/repositories/teacherApplication.repository.js — ALL SQL for Teacher_Application. */
const { pool } = require('../config/db');

async function create({ applicantName, applicantEmail, resumeLink, demoLink }, client = pool) {
  const query = `
    INSERT INTO Teacher_Application (applicant_name, applicant_email, resume_link, demo_link, status)
    VALUES ($1, $2, $3, $4, 'pending')
    RETURNING application_id AS "applicationId", applicant_name AS "applicantName",
              applicant_email AS "applicantEmail", resume_link AS "resumeLink",
              demo_link AS "demoLink", status, admin_id AS "adminId"
  `;
  const { rows } = await client.query(query, [applicantName, applicantEmail, resumeLink, demoLink]);
  return rows[0];
}

async function findById(applicationId, client = pool) {
  const query = `
    SELECT application_id AS "applicationId", applicant_name AS "applicantName",
           applicant_email AS "applicantEmail", resume_link AS "resumeLink",
           demo_link AS "demoLink", status, admin_id AS "adminId"
    FROM Teacher_Application WHERE application_id = $1
  `;
  const { rows } = await client.query(query, [applicationId]);
  return rows[0] || null;
}

async function listByStatus(status, client = pool) {
  const base = `
    SELECT application_id AS "applicationId", applicant_name AS "applicantName",
           applicant_email AS "applicantEmail", resume_link AS "resumeLink",
           demo_link AS "demoLink", status, admin_id AS "adminId"
    FROM Teacher_Application
  `;
  if (status) {
    const { rows } = await client.query(`${base} WHERE status = $1 ORDER BY application_id`, [status]);
    return rows;
  }
  const { rows } = await client.query(`${base} ORDER BY application_id`);
  return rows;
}

async function updateStatus(applicationId, status, adminId, client = pool) {
  const query = `
    UPDATE Teacher_Application SET status = $1, admin_id = $2
    WHERE application_id = $3
    RETURNING application_id AS "applicationId", applicant_name AS "applicantName",
              applicant_email AS "applicantEmail", resume_link AS "resumeLink",
              demo_link AS "demoLink", status, admin_id AS "adminId"
  `;
  const { rows } = await client.query(query, [status, adminId, applicationId]);
  return rows[0] || null;
}

async function remove(applicationId, client = pool) {
  const { rowCount } = await client.query('DELETE FROM Teacher_Application WHERE application_id = $1', [applicationId]);
  return rowCount > 0;
}

module.exports = { create, findById, listByStatus, updateStatus, remove };
