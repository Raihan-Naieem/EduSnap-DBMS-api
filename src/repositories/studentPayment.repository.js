/** src/repositories/studentPayment.repository.js — ALL SQL for the Student_payment table. */
const { pool } = require('../config/db');

async function create({ amount, paymentDue, studentId, courseId }, client = pool) {
  const query = `
    INSERT INTO Student_payment (amount, payment_due, student_id, course_id)
    VALUES ($1, $2, $3, $4)
    RETURNING payment_id AS "paymentId", amount,
              payment_due AS "paymentDue", student_id AS "studentId", course_id AS "courseId"
  `;
  const { rows } = await client.query(query, [amount, paymentDue, studentId, courseId]);
  return rows[0];
}

async function findById(paymentId, client = pool) {
  const query = `
    SELECT payment_id AS "paymentId", amount,
           payment_due AS "paymentDue", student_id AS "studentId", course_id AS "courseId"
    FROM Student_payment WHERE payment_id = $1
  `;
  const { rows } = await client.query(query, [paymentId]);
  return rows[0] || null;
}

async function listByStudent(studentId, client = pool) {
  const query = `
    SELECT payment_id AS "paymentId", amount,
           payment_due AS "paymentDue", student_id AS "studentId", course_id AS "courseId"
    FROM Student_payment WHERE student_id = $1 ORDER BY payment_id
  `;
  const { rows } = await client.query(query, [studentId]);
  return rows;
}

async function listByCourse(courseId, client = pool) {
  const query = `
    SELECT payment_id AS "paymentId", amount,
           payment_due AS "paymentDue", student_id AS "studentId", course_id AS "courseId"
    FROM Student_payment WHERE course_id = $1 ORDER BY payment_id
  `;
  const { rows } = await client.query(query, [courseId]);
  return rows;
}

async function update(paymentId, { amount, paymentDue }, client = pool) {
  const query = `
    UPDATE Student_payment
    SET amount = COALESCE($1, amount), payment_due = COALESCE($2, payment_due)
    WHERE payment_id = $3
    RETURNING payment_id AS "paymentId", amount,
              payment_due AS "paymentDue", student_id AS "studentId", course_id AS "courseId"
  `;
  const { rows } = await client.query(query, [amount, paymentDue, paymentId]);
  return rows[0] || null;
}

async function remove(paymentId, client = pool) {
  const { rowCount } = await client.query('DELETE FROM Student_payment WHERE payment_id = $1', [paymentId]);
  return rowCount > 0;
}

module.exports = { create, findById, listByStudent, listByCourse, update, remove };
