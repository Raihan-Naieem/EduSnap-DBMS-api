-- =============================================================================
-- database/seed.sql
-- Sample data for local development/testing. Run after schema.sql:
--   psql -U postgres -d my_database -f database/seed.sql
--
-- Passwords below are plain placeholder strings, NOT real bcrypt hashes.
-- Registering new users through the API will store proper bcrypt hashes;
-- this seed data exists only so GET/list endpoints have something to show.
-- =============================================================================

-- Admin
INSERT INTO Admin (name, email, password_hash) VALUES
('Ada Admin', 'ada.admin@example.com', 'placeholder_hash_1');

INSERT INTO Admin_phone (admin_id, phone) VALUES
(1, '555-0100');

-- Students
INSERT INTO Student (name, email, password_hash) VALUES
('Sam Student', 'sam.student@example.com', 'placeholder_hash_2'),
('Priya Patel', 'priya.patel@example.com', 'placeholder_hash_3');

INSERT INTO Student_phone (student_id, phone) VALUES
(1, '555-0201'),
(2, '555-0202');

-- Teachers
INSERT INTO Teacher (name, email, password_hash, admin_id) VALUES
('Tara Teacher', 'tara.teacher@example.com', 'placeholder_hash_4', 1);

INSERT INTO Teacher_phone (teacher_id, phone) VALUES
(1, '555-0301');

-- Courses (Course 2 requires Course 1 as a prerequisite)
INSERT INTO Course (title, description, price, admin_id) VALUES
('Intro to Programming', 'Fundamentals of programming with JavaScript.', 99.99, 1),
('Data Structures & Algorithms', 'Builds on Intro to Programming.', 149.99, 1);

INSERT INTO Requires (course_id, prerequisite_id) VALUES
(2, 1);

-- Exam for the prerequisite course
INSERT INTO Exam (title, max_marks, passing_marks, duration_minutes, course_id) VALUES
('Intro to Programming Final', 100, 50, 60, 1);

-- Sam already passed the prerequisite exam
INSERT INTO Attempt_exam (student_id, exam_id, attempt_number, marks_obtained) VALUES
(1, 1, 1, 78);

-- Enrollments
INSERT INTO Enrollment (student_id, course_id, status) VALUES
(1, 1, 'completed'),
(2, 1, 'active');

-- Routine + Routine_Day
INSERT INTO Routine (start_time, end_time, class_link, is_active, course_id, teacher_id) VALUES
('09:00:00', '10:30:00', 'https://meet.example.com/intro-programming', TRUE, 1, 1);

INSERT INTO Routine_Day (routine_id, day_of_week) VALUES
(1, 'MON'),
(1, 'WED');

-- Conducts
INSERT INTO Conducts (course_id, teacher_id) VALUES
(1, 1);

-- Payments
INSERT INTO Student_payment (amount, payment_due, student_id, course_id) VALUES
(99.99, '2026-08-01', 1, 1);

INSERT INTO Teacher_payment (amount, payment_date, teacher_id) VALUES
(1200.00, '2026-07-01', 1);

-- Teacher application (still pending review)
INSERT INTO Teacher_Application (applicant_name, applicant_email, resume_link, demo_link) VALUES
('Jordan Jobseeker', 'jordan.jobseeker@example.com', 'https://example.com/resume.pdf', 'https://example.com/demo.mp4');
