/** src/repositories/course.repository.js — ALL SQL for Course + Requires. */
const { pool } = require('../config/db');

async function create({ title, description, price, adminId }, client = pool) {
  const query = `
    INSERT INTO Course (title, description, price, admin_id)
    VALUES ($1, $2, $3, $4)
    RETURNING course_id AS "courseId", title, description, price, admin_id AS "adminId"
  `;
  const { rows } = await client.query(query, [title, description, price, adminId]);
  return rows[0];
}

async function findById(courseId, client = pool) {
  const query = `
    SELECT course_id AS "courseId", title, description, price, admin_id AS "adminId"
    FROM Course WHERE course_id = $1
  `;
  const { rows } = await client.query(query, [courseId]);
  return rows[0] || null;
}

async function getAll(client = pool) {
  const { rows } = await client.query(
    `SELECT course_id AS "courseId", title, description, price, admin_id AS "adminId" FROM Course ORDER BY course_id`
  );
  return rows;
}

async function update(courseId, { title, description, price }, client = pool) {
  const query = `
    UPDATE Course
    SET title = COALESCE($1, title), description = COALESCE($2, description), price = COALESCE($3, price)
    WHERE course_id = $4
    RETURNING course_id AS "courseId", title, description, price, admin_id AS "adminId"
  `;
  const { rows } = await client.query(query, [title, description, price, courseId]);
  return rows[0] || null;
}

async function remove(courseId, client = pool) {
  const { rowCount } = await client.query('DELETE FROM Course WHERE course_id = $1', [courseId]);
  return rowCount > 0;
}

/** Uses the course_enrollment_counts VIEW defined in database/schema.sql. */
async function getEnrollmentStats(courseId, client = pool) {
  const query = `
    SELECT course_id AS "courseId", title,
           active_enrollment_count AS "activeEnrollmentCount",
           total_enrollment_count AS "totalEnrollmentCount"
    FROM course_enrollment_counts WHERE course_id = $1
  `;
  const { rows } = await client.query(query, [courseId]);
  return rows[0] || null;
}

// --- Requires (prerequisites) -----------------------------------------------
async function addPrerequisite(courseId, prerequisiteId, client = pool) {
  await client.query('INSERT INTO Requires (course_id, prerequisite_id) VALUES ($1, $2)', [courseId, prerequisiteId]);
  return { courseId, prerequisiteId };
}

async function findPrerequisiteId(courseId, client = pool) {
  const { rows } = await client.query('SELECT prerequisite_id FROM Requires WHERE course_id = $1 LIMIT 1', [courseId]);
  return rows[0]?.prerequisite_id || null;
}

async function listPrerequisites(courseId, client = pool) {
  const { rows } = await client.query('SELECT prerequisite_id AS "prerequisiteId" FROM Requires WHERE course_id = $1', [courseId]);
  return rows.map((r) => r.prerequisiteId);
}

async function removePrerequisite(courseId, prerequisiteId, client = pool) {
  const { rowCount } = await client.query(
    'DELETE FROM Requires WHERE course_id = $1 AND prerequisite_id = $2',
    [courseId, prerequisiteId]
  );
  return rowCount > 0;
}

module.exports = {
  create, findById, getAll, update, remove, getEnrollmentStats,
  addPrerequisite, findPrerequisiteId, listPrerequisites, removePrerequisite,
};
