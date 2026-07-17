/** src/repositories/enrollment.repository.js — ALL SQL for the Enrollment table. */
const { pool } = require('../config/db');

async function findEnrollment(studentId, courseId, client = pool) {
  const query = `
    SELECT student_id AS "studentId", course_id AS "courseId", status, enrolled_at AS "enrolledAt"
    FROM Enrollment WHERE student_id = $1 AND course_id = $2
  `;
  const { rows } = await client.query(query, [studentId, courseId]);
  return rows[0] || null;
}

async function createEnrollment(studentId, courseId, client = pool) {
  const query = `
    INSERT INTO Enrollment (student_id, course_id, status, enrolled_at)
    VALUES ($1, $2, 'active', NOW())
    RETURNING student_id AS "studentId", course_id AS "courseId", status, enrolled_at AS "enrolledAt"
  `;
  const { rows } = await client.query(query, [studentId, courseId]);
  return rows[0];
}

async function listByStudent(studentId, client = pool) {
  const query = `
    SELECT student_id AS "studentId", course_id AS "courseId", status, enrolled_at AS "enrolledAt"
    FROM Enrollment WHERE student_id = $1
  `;
  const { rows } = await client.query(query, [studentId]);
  return rows;
}

async function listByCourse(courseId, client = pool) {
  const query = `
    SELECT student_id AS "studentId", course_id AS "courseId", status, enrolled_at AS "enrolledAt"
    FROM Enrollment WHERE course_id = $1
  `;
  const { rows } = await client.query(query, [courseId]);
  return rows;
}

async function updateStatus(studentId, courseId, status, client = pool) {
  const query = `
    UPDATE Enrollment SET status = $1 WHERE student_id = $2 AND course_id = $3
    RETURNING student_id AS "studentId", course_id AS "courseId", status, enrolled_at AS "enrolledAt"
  `;
  const { rows } = await client.query(query, [status, studentId, courseId]);
  return rows[0] || null;
}

async function remove(studentId, courseId, client = pool) {
  const { rowCount } = await client.query(
    'DELETE FROM Enrollment WHERE student_id = $1 AND course_id = $2',
    [studentId, courseId]
  );
  return rowCount > 0;
}

module.exports = { findEnrollment, createEnrollment, listByStudent, listByCourse, updateStatus, remove };
