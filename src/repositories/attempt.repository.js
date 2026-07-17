/** src/repositories/attempt.repository.js — ALL SQL for the Attempt_exam table. */
const { pool } = require('../config/db');

/** Used by enrollment.service.js: has this student ever passed an exam for this course? */
async function findPassingAttemptForCourse(studentId, courseId, client = pool) {
  const query = `
    SELECT ae.student_id AS "studentId", ae.exam_id AS "examId",
           ae.attempt_number AS "attemptNumber", ae.marks_obtained AS "marksObtained"
    FROM Attempt_exam ae
    JOIN Exam e ON e.exam_id = ae.exam_id
    WHERE e.course_id = $1 AND ae.student_id = $2 AND ae.marks_obtained >= e.passing_marks
    LIMIT 1
  `;
  const { rows } = await client.query(query, [courseId, studentId]);
  return rows[0] || null;
}

async function findLatestAttemptNumber(studentId, examId, client = pool) {
  const { rows } = await client.query(
    'SELECT MAX(attempt_number) AS latest FROM Attempt_exam WHERE student_id = $1 AND exam_id = $2',
    [studentId, examId]
  );
  return rows[0]?.latest || 0;
}

async function createAttempt(studentId, examId, attemptNumber, marksObtained, client = pool) {
  const query = `
    INSERT INTO Attempt_exam (student_id, exam_id, attempt_number, marks_obtained)
    VALUES ($1, $2, $3, $4)
    RETURNING student_id AS "studentId", exam_id AS "examId",
              attempt_number AS "attemptNumber", marks_obtained AS "marksObtained"
  `;
  const { rows } = await client.query(query, [studentId, examId, attemptNumber, marksObtained]);
  return rows[0];
}

async function listAttempts(studentId, examId, client = pool) {
  const query = `
    SELECT student_id AS "studentId", exam_id AS "examId",
           attempt_number AS "attemptNumber", marks_obtained AS "marksObtained"
    FROM Attempt_exam WHERE student_id = $1 AND exam_id = $2 ORDER BY attempt_number
  `;
  const { rows } = await client.query(query, [studentId, examId]);
  return rows;
}

module.exports = { findPassingAttemptForCourse, findLatestAttemptNumber, createAttempt, listAttempts };
