/** src/repositories/admin.repository.js — ALL SQL for Admin + Admin_phone. */
const { pool } = require('../config/db');

async function create({ name, email, passwordHash }, client = pool) {
  const query = `
    INSERT INTO Admin (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING admin_id AS "adminId", name, email
  `;
  const { rows } = await client.query(query, [name, email, passwordHash]);
  return rows[0];
}

async function findByEmailWithHash(email, client = pool) {
  const query = `
    SELECT admin_id AS "adminId", name, email, password_hash AS "passwordHash"
    FROM Admin WHERE email = $1
  `;
  const { rows } = await client.query(query, [email]);
  return rows[0] || null;
}

async function findById(adminId, client = pool) {
  const query = `SELECT admin_id AS "adminId", name, email FROM Admin WHERE admin_id = $1`;
  const { rows } = await client.query(query, [adminId]);
  return rows[0] || null;
}

async function getAll(client = pool) {
  const { rows } = await client.query(`SELECT admin_id AS "adminId", name, email FROM Admin ORDER BY admin_id`);
  return rows;
}

async function update(adminId, { name, email }, client = pool) {
  const query = `
    UPDATE Admin SET name = COALESCE($1, name), email = COALESCE($2, email)
    WHERE admin_id = $3
    RETURNING admin_id AS "adminId", name, email
  `;
  const { rows } = await client.query(query, [name, email, adminId]);
  return rows[0] || null;
}

async function remove(adminId, client = pool) {
  const { rowCount } = await client.query('DELETE FROM Admin WHERE admin_id = $1', [adminId]);
  return rowCount > 0;
}

// --- Admin_phone -------------------------------------------------------------
async function addPhone(adminId, phone, client = pool) {
  await client.query('INSERT INTO Admin_phone (admin_id, phone) VALUES ($1, $2)', [adminId, phone]);
  return { adminId, phone };
}

async function getPhones(adminId, client = pool) {
  const { rows } = await client.query('SELECT phone FROM Admin_phone WHERE admin_id = $1', [adminId]);
  return rows.map((r) => r.phone);
}

async function removePhone(adminId, phone, client = pool) {
  const { rowCount } = await client.query(
    'DELETE FROM Admin_phone WHERE admin_id = $1 AND phone = $2',
    [adminId, phone]
  );
  return rowCount > 0;
}

module.exports = { create, findByEmailWithHash, findById, getAll, update, remove, addPhone, getPhones, removePhone };
