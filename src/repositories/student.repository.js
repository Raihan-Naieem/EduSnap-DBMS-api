/**
 * =============================================================================
 * src/repositories/student.repository.js
 * =============================================================================
 * ALL SQL for Student + Student_phone lives here. Every query is parameterized
 * ($1, $2, ...) — never string-concatenated. Column aliases (AS "camelCase")
 * mean callers get clean JS-friendly keys straight out of Postgres, with no
 * separate mapping/model layer needed.
 *
 * Every function accepts an optional `client` (a pg PoolClient) as its last
 * argument so services can run these queries inside a transaction. When no
 * client is passed, the shared pool is used directly.
 * =============================================================================
 */
const { pool } = require('../config/db');

async function create({ name, email, passwordHash }, client = pool) {
  const query = `
    INSERT INTO Student (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING student_id AS "studentId", name, email
  `;
  const { rows } = await client.query(query, [name, email, passwordHash]);
  return rows[0];
}

/** Includes password_hash — used ONLY internally (e.g. future login checks), never returned to clients as-is. */
async function findByEmailWithHash(email, client = pool) {
  const query = `
    SELECT student_id AS "studentId", name, email, password_hash AS "passwordHash"
    FROM Student WHERE email = $1
  `;
  const { rows } = await client.query(query, [email]);
  return rows[0] || null;
}

async function findById(studentId, client = pool) {
  const query = `SELECT student_id AS "studentId", name, email FROM Student WHERE student_id = $1`;
  const { rows } = await client.query(query, [studentId]);
  return rows[0] || null;
}

async function getAll(client = pool) {
  const { rows } = await client.query(
    `SELECT student_id AS "studentId", name, email FROM Student ORDER BY student_id`
  );
  return rows;
}

async function update(studentId, { name, email }, client = pool) {
  const query = `
    UPDATE Student SET name = COALESCE($1, name), email = COALESCE($2, email)
    WHERE student_id = $3
    RETURNING student_id AS "studentId", name, email
  `;
  const { rows } = await client.query(query, [name, email, studentId]);
  return rows[0] || null;
}

async function remove(studentId, client = pool) {
  const { rowCount } = await client.query('DELETE FROM Student WHERE student_id = $1', [studentId]);
  return rowCount > 0;
}

// --- Student_phone (weak entity: composite PK student_id + phone) ---------
async function addPhone(studentId, phone, client = pool) {
  await client.query('INSERT INTO Student_phone (student_id, phone) VALUES ($1, $2)', [studentId, phone]);
  return { studentId, phone };
}

async function getPhones(studentId, client = pool) {
  const { rows } = await client.query('SELECT phone FROM Student_phone WHERE student_id = $1', [studentId]);
  return rows.map((r) => r.phone);
}

async function removePhone(studentId, phone, client = pool) {
  const { rowCount } = await client.query(
    'DELETE FROM Student_phone WHERE student_id = $1 AND phone = $2',
    [studentId, phone]
  );
  return rowCount > 0;
}

module.exports = {
  create,
  findByEmailWithHash,
  findById,
  getAll,
  update,
  remove,
  addPhone,
  getPhones,
  removePhone,
};
