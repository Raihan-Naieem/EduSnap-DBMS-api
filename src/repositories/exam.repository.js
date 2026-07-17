/** src/repositories/exam.repository.js — ALL SQL for the Exam table. */
const { pool } = require('../config/db');

async function create({ title, maxMarks, passingMarks, durationMinutes, courseId }, client = pool) {
  const query = `
    INSERT INTO Exam (title, max_marks, passing_marks, duration_minutes, course_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING exam_id AS "examId", title, max_marks AS "maxMarks", passing_marks AS "passingMarks",
              duration_minutes AS "durationMinutes", course_id AS "courseId"
  `;
  const { rows } = await client.query(query, [title, maxMarks, passingMarks, durationMinutes, courseId]);
  return rows[0];
}

async function findById(examId, client = pool) {
  const query = `
    SELECT exam_id AS "examId", title, max_marks AS "maxMarks", passing_marks AS "passingMarks",
           duration_minutes AS "durationMinutes", course_id AS "courseId"
    FROM Exam WHERE exam_id = $1
  `;
  const { rows } = await client.query(query, [examId]);
  return rows[0] || null;
}

async function listByCourse(courseId, client = pool) {
  const query = `
    SELECT exam_id AS "examId", title, max_marks AS "maxMarks", passing_marks AS "passingMarks",
           duration_minutes AS "durationMinutes", course_id AS "courseId"
    FROM Exam WHERE course_id = $1 ORDER BY exam_id
  `;
  const { rows } = await client.query(query, [courseId]);
  return rows;
}

async function update(examId, { title, maxMarks, passingMarks, durationMinutes }, client = pool) {
  const query = `
    UPDATE Exam
    SET title = COALESCE($1, title),
        max_marks = COALESCE($2, max_marks),
        passing_marks = COALESCE($3, passing_marks),
        duration_minutes = COALESCE($4, duration_minutes)
    WHERE exam_id = $5
    RETURNING exam_id AS "examId", title, max_marks AS "maxMarks", passing_marks AS "passingMarks",
              duration_minutes AS "durationMinutes", course_id AS "courseId"
  `;
  const { rows } = await client.query(query, [title, maxMarks, passingMarks, durationMinutes, examId]);
  return rows[0] || null;
}

async function remove(examId, client = pool) {
  const { rowCount } = await client.query('DELETE FROM Exam WHERE exam_id = $1', [examId]);
  return rowCount > 0;
}

module.exports = { create, findById, listByCourse, update, remove };
