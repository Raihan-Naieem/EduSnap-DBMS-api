/**
 * =============================================================================
 * src/services/enrollment.service.js
 * =============================================================================
 * Business logic ONLY — no SQL. Two things worth noting:
 *
 * 1. Core rule: to enroll in a course with a prerequisite, the student must
 *    have PASSED an exam belonging to that prerequisite course.
 *
 * 2. `enrollWithPayment` demonstrates a database TRANSACTION: it creates an
 *    Enrollment row AND a Student_payment row atomically. If either insert
 *    fails, BOTH are rolled back — a student is never left "enrolled but
 *    unbilled" or "billed but not enrolled". This is the multi-table write
 *    the architecture spec calls out as needing a transaction.
 * =============================================================================
 */
const { getClient } = require('../config/db');
const courseRepository = require('../repositories/course.repository');
const attemptRepository = require('../repositories/attempt.repository');
const enrollmentRepository = require('../repositories/enrollment.repository');
const studentPaymentRepository = require('../repositories/studentPayment.repository');
const ApiError = require('../utils/ApiError');

async function assertEligible(studentId, courseId) {
  const course = await courseRepository.findById(courseId);
  if (!course) throw new ApiError(404, `Course with id ${courseId} does not exist.`);

  const existingEnrollment = await enrollmentRepository.findEnrollment(studentId, courseId);
  if (existingEnrollment) throw new ApiError(409, 'Student is already enrolled in this course.');

  const prerequisiteId = await courseRepository.findPrerequisiteId(courseId);
  if (prerequisiteId) {
    const passingAttempt = await attemptRepository.findPassingAttemptForCourse(studentId, prerequisiteId);
    if (!passingAttempt) {
      throw new ApiError(
        403,
        `Student must pass an exam for prerequisite course (id: ${prerequisiteId}) before enrolling in this course.`
      );
    }
  }
}

async function enrollStudentInCourse(studentId, courseId) {
  await assertEligible(studentId, courseId);
  return enrollmentRepository.createEnrollment(studentId, courseId);
}

/**
 * Enroll AND record the enrollment payment in a single atomic transaction.
 * Both repositories are called with the SAME client, inside BEGIN/COMMIT,
 * so either both rows are written or neither is.
 */
async function enrollWithPayment(studentId, courseId, { amount, paymentDue }) {
  await assertEligible(studentId, courseId);

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const enrollment = await enrollmentRepository.createEnrollment(studentId, courseId, client);
    const payment = await studentPaymentRepository.create(
      { amount, paymentDue, studentId, courseId },
      client
    );

    await client.query('COMMIT');
    return { enrollment, payment };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function listEnrollmentsForStudent(studentId) {
  return enrollmentRepository.listByStudent(studentId);
}

async function listEnrollmentsForCourse(courseId) {
  return enrollmentRepository.listByCourse(courseId);
}

async function updateEnrollmentStatus(studentId, courseId, status) {
  const allowed = ['active', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `status must be one of: ${allowed.join(', ')}`);
  }
  const updated = await enrollmentRepository.updateStatus(studentId, courseId, status);
  if (!updated) throw new ApiError(404, 'Enrollment not found.');
  return updated;
}

async function cancelEnrollment(studentId, courseId) {
  const deleted = await enrollmentRepository.remove(studentId, courseId);
  if (!deleted) throw new ApiError(404, 'Enrollment not found.');
}

module.exports = {
  enrollStudentInCourse,
  enrollWithPayment,
  listEnrollmentsForStudent,
  listEnrollmentsForCourse,
  updateEnrollmentStatus,
  cancelEnrollment,
};
