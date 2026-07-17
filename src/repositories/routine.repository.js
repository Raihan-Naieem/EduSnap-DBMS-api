/** src/repositories/routine.repository.js — ALL SQL for Routine + Routine_Day. */
const { pool } = require('../config/db');

async function create({ startTime, endTime, classLink, isActive, courseId, teacherId }, client = pool) {
  const query = `
    INSERT INTO Routine (start_time, end_time, class_link, is_active, course_id, teacher_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING routine_id AS "routineId", start_time AS "startTime", end_time AS "endTime",
              class_link AS "classLink", is_active AS "isActive", course_id AS "courseId", teacher_id AS "teacherId"
  `;
  const { rows } = await client.query(query, [startTime, endTime, classLink, isActive ?? true, courseId, teacherId]);
  return rows[0];
}

async function findById(routineId, client = pool) {
  const query = `
    SELECT routine_id AS "routineId", start_time AS "startTime", end_time AS "endTime",
           class_link AS "classLink", is_active AS "isActive", course_id AS "courseId", teacher_id AS "teacherId"
    FROM Routine WHERE routine_id = $1
  `;
  const { rows } = await client.query(query, [routineId]);
  return rows[0] || null;
}

async function listByCourse(courseId, client = pool) {
  const query = `
    SELECT routine_id AS "routineId", start_time AS "startTime", end_time AS "endTime",
           class_link AS "classLink", is_active AS "isActive", course_id AS "courseId", teacher_id AS "teacherId"
    FROM Routine WHERE course_id = $1
  `;
  const { rows } = await client.query(query, [courseId]);
  return rows;
}

async function listByTeacher(teacherId, client = pool) {
  const query = `
    SELECT routine_id AS "routineId", start_time AS "startTime", end_time AS "endTime",
           class_link AS "classLink", is_active AS "isActive", course_id AS "courseId", teacher_id AS "teacherId"
    FROM Routine WHERE teacher_id = $1
  `;
  const { rows } = await client.query(query, [teacherId]);
  return rows;
}

async function update(routineId, { startTime, endTime, classLink, isActive }, client = pool) {
  const query = `
    UPDATE Routine
    SET start_time = COALESCE($1, start_time),
        end_time = COALESCE($2, end_time),
        class_link = COALESCE($3, class_link),
        is_active = COALESCE($4, is_active)
    WHERE routine_id = $5
    RETURNING routine_id AS "routineId", start_time AS "startTime", end_time AS "endTime",
              class_link AS "classLink", is_active AS "isActive", course_id AS "courseId", teacher_id AS "teacherId"
  `;
  const { rows } = await client.query(query, [startTime, endTime, classLink, isActive, routineId]);
  return rows[0] || null;
}

async function remove(routineId, client = pool) {
  const { rowCount } = await client.query('DELETE FROM Routine WHERE routine_id = $1', [routineId]);
  return rowCount > 0;
}

// --- Routine_Day -------------------------------------------------------------
async function addDay(routineId, dayOfWeek, client = pool) {
  await client.query('INSERT INTO Routine_Day (routine_id, day_of_week) VALUES ($1, $2)', [routineId, dayOfWeek]);
  return { routineId, dayOfWeek };
}

async function listDays(routineId, client = pool) {
  const { rows } = await client.query('SELECT day_of_week AS "dayOfWeek" FROM Routine_Day WHERE routine_id = $1', [routineId]);
  return rows.map((r) => r.dayOfWeek);
}

async function removeDay(routineId, dayOfWeek, client = pool) {
  const { rowCount } = await client.query(
    'DELETE FROM Routine_Day WHERE routine_id = $1 AND day_of_week = $2',
    [routineId, dayOfWeek]
  );
  return rowCount > 0;
}

module.exports = { create, findById, listByCourse, listByTeacher, update, remove, addDay, listDays, removeDay };
