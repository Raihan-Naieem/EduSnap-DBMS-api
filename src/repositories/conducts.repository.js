/** src/repositories/conducts.repository.js — ALL SQL for the Conducts table. */
const { pool } = require('../config/db');

async function assign(courseId, teacherId, client = pool) {
  const query = `
    INSERT INTO Conducts (course_id, teacher_id)
    VALUES ($1, $2)
    RETURNING course_id AS "courseId", teacher_id AS "teacherId"
  `;
  const { rows } = await client.query(query, [courseId, teacherId]);
  return rows[0];
}

async function findAssignment(courseId, teacherId, client = pool) {
  const { rows } = await client.query(
    'SELECT course_id AS "courseId", teacher_id AS "teacherId" FROM Conducts WHERE course_id = $1 AND teacher_id = $2',
    [courseId, teacherId]
  );
  return rows[0] || null;
}

async function listTeachersForCourse(courseId, client = pool) {
  const { rows } = await client.query('SELECT teacher_id AS "teacherId" FROM Conducts WHERE course_id = $1', [courseId]);
  return rows.map((r) => r.teacherId);
}

async function listCoursesForTeacher(teacherId, client = pool) {
  const { rows } = await client.query('SELECT course_id AS "courseId" FROM Conducts WHERE teacher_id = $1', [teacherId]);
  return rows.map((r) => r.courseId);
}

async function unassign(courseId, teacherId, client = pool) {
  const { rowCount } = await client.query(
    'DELETE FROM Conducts WHERE course_id = $1 AND teacher_id = $2',
    [courseId, teacherId]
  );
  return rowCount > 0;
}

module.exports = { assign, findAssignment, listTeachersForCourse, listCoursesForTeacher, unassign };
