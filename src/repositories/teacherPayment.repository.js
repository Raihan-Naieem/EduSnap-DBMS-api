/** src/repositories/teacherPayment.repository.js — ALL SQL for the Teacher_payment table. */
const { pool } = require('../config/db');

async function create({ amount, paymentDate, teacherId }, client = pool) {
  const query = `
    INSERT INTO Teacher_payment (amount, payment_date, teacher_id)
    VALUES ($1, $2, $3)
    RETURNING payment_id AS "paymentId", amount, payment_date AS "paymentDate", teacher_id AS "teacherId"
  `;
  const { rows } = await client.query(query, [amount, paymentDate, teacherId]);
  return rows[0];
}

async function findById(paymentId, client = pool) {
  const query = `
    SELECT payment_id AS "paymentId", amount, payment_date AS "paymentDate", teacher_id AS "teacherId"
    FROM Teacher_payment WHERE payment_id = $1
  `;
  const { rows } = await client.query(query, [paymentId]);
  return rows[0] || null;
}

async function listByTeacher(teacherId, client = pool) {
  const query = `
    SELECT payment_id AS "paymentId", amount, payment_date AS "paymentDate", teacher_id AS "teacherId"
    FROM Teacher_payment WHERE teacher_id = $1 ORDER BY payment_id
  `;
  const { rows } = await client.query(query, [teacherId]);
  return rows;
}

async function update(paymentId, { amount, paymentDate }, client = pool) {
  const query = `
    UPDATE Teacher_payment
    SET amount = COALESCE($1, amount), payment_date = COALESCE($2, payment_date)
    WHERE payment_id = $3
    RETURNING payment_id AS "paymentId", amount, payment_date AS "paymentDate", teacher_id AS "teacherId"
  `;
  const { rows } = await client.query(query, [amount, paymentDate, paymentId]);
  return rows[0] || null;
}

async function remove(paymentId, client = pool) {
  const { rowCount } = await client.query('DELETE FROM Teacher_payment WHERE payment_id = $1', [paymentId]);
  return rowCount > 0;
}

module.exports = { create, findById, listByTeacher, update, remove };
