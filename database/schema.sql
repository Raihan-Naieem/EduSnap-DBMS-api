-- =============================================================================
-- database/schema.sql
-- Pure DDL. No data. Run this once per fresh database:
--   psql -U postgres -d my_database -f database/schema.sql
-- =============================================================================

-- Drop in dependency order so this script is safely re-runnable
DROP VIEW IF EXISTS course_enrollment_counts;
DROP TRIGGER IF EXISTS trg_check_marks_within_range ON Attempt_exam;
DROP FUNCTION IF EXISTS check_marks_within_range();
DROP TABLE IF EXISTS Conducts CASCADE;
DROP TABLE IF EXISTS Teacher_Application CASCADE;
DROP TABLE IF EXISTS Admin_phone CASCADE;
DROP TABLE IF EXISTS Teacher_payment CASCADE;
DROP TABLE IF EXISTS Routine_Day CASCADE;
DROP TABLE IF EXISTS Routine CASCADE;
DROP TABLE IF EXISTS Teacher_phone CASCADE;
DROP TABLE IF EXISTS Teacher CASCADE;
DROP TABLE IF EXISTS Attempt_exam CASCADE;
DROP TABLE IF EXISTS Exam CASCADE;
DROP TABLE IF EXISTS Enrollment CASCADE;
DROP TABLE IF EXISTS Requires CASCADE;
DROP TABLE IF EXISTS Student_payment CASCADE;
DROP TABLE IF EXISTS Student_phone CASCADE;
DROP TABLE IF EXISTS Course CASCADE;
DROP TABLE IF EXISTS Student CASCADE;
DROP TABLE IF EXISTS Admin CASCADE;

-- =============================================================================
-- Admin
-- =============================================================================
CREATE TABLE Admin (
    admin_id      SERIAL PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);

CREATE TABLE Admin_phone (
    admin_id INTEGER NOT NULL REFERENCES Admin(admin_id) ON DELETE CASCADE,
    phone    VARCHAR(20) NOT NULL,
    PRIMARY KEY (admin_id, phone)
);

-- =============================================================================
-- Student
-- =============================================================================
CREATE TABLE Student (
    student_id    SERIAL PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);

CREATE TABLE Student_phone (
    student_id INTEGER NOT NULL REFERENCES Student(student_id) ON DELETE CASCADE,
    phone      VARCHAR(20) NOT NULL,
    PRIMARY KEY (student_id, phone)
);

-- =============================================================================
-- Teacher
-- =============================================================================
CREATE TABLE Teacher (
    teacher_id    SERIAL PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    admin_id      INTEGER NOT NULL REFERENCES Admin(admin_id)
);

CREATE TABLE Teacher_phone (
    teacher_id INTEGER NOT NULL REFERENCES Teacher(teacher_id) ON DELETE CASCADE,
    phone      VARCHAR(20) NOT NULL,
    PRIMARY KEY (teacher_id, phone)
);

CREATE INDEX idx_teacher_admin_id ON Teacher(admin_id);

-- =============================================================================
-- Course
-- =============================================================================
DROP TABLE IF EXISTS Course;

CREATE TABLE Course (
    course_id   SERIAL PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    image       VARCHAR(500),
    admin_id    INTEGER NOT NULL REFERENCES Admin(admin_id),
);

CREATE INDEX idx_course_admin_id ON Course(admin_id);

-- Requires: a course can require a prerequisite course
CREATE TABLE Requires (
    course_id       INTEGER NOT NULL REFERENCES Course(course_id) ON DELETE CASCADE,
    prerequisite_id INTEGER NOT NULL REFERENCES Course(course_id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, prerequisite_id),
    CHECK (course_id <> prerequisite_id)
);

-- =============================================================================
-- Enrollment
-- =============================================================================
CREATE TABLE Enrollment (
    student_id  INTEGER NOT NULL REFERENCES Student(student_id) ON DELETE CASCADE,
    course_id   INTEGER NOT NULL REFERENCES Course(course_id) ON DELETE CASCADE,
    status      VARCHAR(20) NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'completed', 'cancelled')),
    enrolled_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (student_id, course_id)
);

CREATE INDEX idx_enrollment_course_id ON Enrollment(course_id);

-- =============================================================================
-- Exam + Attempt_exam
-- =============================================================================
CREATE TABLE Exam (
    exam_id          SERIAL PRIMARY KEY,
    title            VARCHAR(200) NOT NULL,
    max_marks        INTEGER NOT NULL CHECK (max_marks > 0),
    passing_marks    INTEGER NOT NULL CHECK (passing_marks >= 0),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    course_id        INTEGER NOT NULL REFERENCES Course(course_id) ON DELETE CASCADE,
    CHECK (passing_marks <= max_marks)
);

CREATE INDEX idx_exam_course_id ON Exam(course_id);

CREATE TABLE Attempt_exam (
    student_id     INTEGER NOT NULL REFERENCES Student(student_id) ON DELETE CASCADE,
    exam_id        INTEGER NOT NULL REFERENCES Exam(exam_id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL CHECK (attempt_number > 0),
    marks_obtained INTEGER NOT NULL CHECK (marks_obtained >= 0),
    PRIMARY KEY (student_id, exam_id, attempt_number)
);

CREATE INDEX idx_attempt_exam_id ON Attempt_exam(exam_id);

-- Defense-in-depth at the database level: a student's marks_obtained can
-- never exceed that exam's max_marks, even if the application layer has a bug.
CREATE FUNCTION check_marks_within_range() RETURNS TRIGGER AS $$
DECLARE
    exam_max_marks INTEGER;
BEGIN
    SELECT max_marks INTO exam_max_marks FROM Exam WHERE exam_id = NEW.exam_id;
    IF NEW.marks_obtained > exam_max_marks THEN
        RAISE EXCEPTION 'marks_obtained (%) cannot exceed exam max_marks (%)', NEW.marks_obtained, exam_max_marks;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_marks_within_range
    BEFORE INSERT OR UPDATE ON Attempt_exam
    FOR EACH ROW
    EXECUTE FUNCTION check_marks_within_range();

-- =============================================================================
-- Routine + Routine_Day
-- =============================================================================
CREATE TABLE Routine (
    routine_id SERIAL PRIMARY KEY,
    start_time TIME NOT NULL,
    end_time   TIME NOT NULL,
    class_link VARCHAR(500),
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    course_id  INTEGER NOT NULL REFERENCES Course(course_id) ON DELETE CASCADE,
    teacher_id INTEGER NOT NULL REFERENCES Teacher(teacher_id),
    CHECK (end_time > start_time)
);

CREATE INDEX idx_routine_course_id ON Routine(course_id);
CREATE INDEX idx_routine_teacher_id ON Routine(teacher_id);

CREATE TABLE Routine_Day (
    routine_id  INTEGER NOT NULL REFERENCES Routine(routine_id) ON DELETE CASCADE,
    day_of_week VARCHAR(3) NOT NULL
                CHECK (day_of_week IN ('MON','TUE','WED','THU','FRI','SAT','SUN')),
    PRIMARY KEY (routine_id, day_of_week)
);

-- =============================================================================
-- Payments
-- =============================================================================
CREATE TABLE Student_payment (
    payment_id     SERIAL PRIMARY KEY,
    amount         NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_due    DATE,
    student_id     INTEGER NOT NULL REFERENCES Student(student_id),
    course_id      INTEGER NOT NULL REFERENCES Course(course_id)
);

CREATE INDEX idx_student_payment_student_id ON Student_payment(student_id);
CREATE INDEX idx_student_payment_course_id ON Student_payment(course_id);

CREATE TABLE Teacher_payment (
    payment_id   SERIAL PRIMARY KEY,
    amount       NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    teacher_id   INTEGER NOT NULL REFERENCES Teacher(teacher_id)
);

CREATE INDEX idx_teacher_payment_teacher_id ON Teacher_payment(teacher_id);

-- =============================================================================
-- Teacher_Application
-- =============================================================================
CREATE TABLE Teacher_Application (
    application_id  SERIAL PRIMARY KEY,
    applicant_name  VARCHAR(150) NOT NULL,
    applicant_email VARCHAR(150) NOT NULL,
    resume_link     VARCHAR(500),
    demo_link       VARCHAR(500),
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_id        INTEGER REFERENCES Admin(admin_id)
);

-- =============================================================================
-- Conducts: which teacher(s) teach which course(s)
-- =============================================================================
CREATE TABLE Conducts (
    course_id  INTEGER NOT NULL REFERENCES Course(course_id) ON DELETE CASCADE,
    teacher_id INTEGER NOT NULL REFERENCES Teacher(teacher_id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, teacher_id)
);

-- =============================================================================
-- View: quick count of active enrollments per course (used by GET /api/courses/:id/stats)
-- =============================================================================
CREATE VIEW course_enrollment_counts AS
SELECT
    c.course_id,
    c.title,
    COUNT(e.student_id) FILTER (WHERE e.status = 'active') AS active_enrollment_count,
    COUNT(e.student_id) AS total_enrollment_count
FROM Course c
LEFT JOIN Enrollment e ON e.course_id = c.course_id
GROUP BY c.course_id, c.title;
