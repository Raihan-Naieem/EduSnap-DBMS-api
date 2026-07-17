/** src/repositories/teacher.repository.js — ALL SQL for Teacher + Teacher_phone. */
const { pool } = require('../config/db');

async function create({ name, email, passwordHash, adminId }, client = pool) {
  const query = `
    INSERT INTO Teacher (name, email, password_hash, admin_id)
    VALUES ($1, $2, $3, $4)
    RETURNING teacher_id AS "teacherId", name, email, admin_id AS "adminId"
  `;
  const { rows } = await client.query(query, [name, email, passwordHash, adminId]);
  return rows[0];
}

async function findByEmailWithHash(email, client = pool) {
  const query = `
    SELECT teacher_id AS "teacherId", name, email, password_hash AS "passwordHash", admin_id AS "adminId"
    FROM Teacher WHERE email = $1
  `;
  const { rows } = await client.query(query, [email]);
  return rows[0] || null;
}

async function findById(teacherId, client = pool) {
  const query = `SELECT teacher_id AS "teacherId", name, email, admin_id AS "adminId" FROM Teacher WHERE teacher_id = $1`;
  const { rows } = await client.query(query, [teacherId]);
  return rows[0] || null;
}

async function getAll(client = pool) {
  const { rows } = await client.query(
    `SELECT teacher_id AS "teacherId", name, email, admin_id AS "adminId" FROM Teacher ORDER BY teacher_id`
  );
  return rows;
}

async function update(teacherId, { name, email }, client = pool) {
  const query = `
    UPDATE Teacher SET name = COALESCE($1, name), email = COALESCE($2, email)
    WHERE teacher_id = $3
    RETURNING teacher_id AS "teacherId", name, email, admin_id AS "adminId"
  `;
  const { rows } = await client.query(query, [name, email, teacherId]);
  return rows[0] || null;
}

async function remove(teacherId, client = pool) {
  const { rowCount } = await client.query('DELETE FROM Teacher WHERE teacher_id = $1', [teacherId]);
  return rowCount > 0;
}

// --- Teacher_phone ----------------------------------------------------------
async function addPhone(teacherId, phone, client = pool) {
  await client.query('INSERT INTO Teacher_phone (teacher_id, phone) VALUES ($1, $2)', [teacherId, phone]);
  return { teacherId, phone };
}

async function getPhones(teacherId, client = pool) {
  const { rows } = await client.query('SELECT phone FROM Teacher_phone WHERE teacher_id = $1', [teacherId]);
  return rows.map((r) => r.phone);
}

async function removePhone(teacherId, phone, client = pool) {
  const { rowCount } = await client.query(
    'DELETE FROM Teacher_phone WHERE teacher_id = $1 AND phone = $2',
    [teacherId, phone]
  );
  return rowCount > 0;
}

module.exports = { create, findByEmailWithHash, findById, getAll, update, remove, addPhone, getPhones, removePhone };
