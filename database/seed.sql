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
INSERT INTO Course (title, description, price, image, admin_id) VALUES
(
    'Full-Stack Web Development Masterclass', 
    'Accelerate your developer career by mastering modern front-end and back-end web frameworks. This extensive course deep dives into the core architectures of React, Next.js, Node.js, and advanced database modeling.', 
    8500.00, 
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80', 
    1
),
(
    'Advanced UI/UX Product Design & Systematics', 
    'Go beyond standard user interface creation and explore the comprehensive mechanics of human-centered digital experiences. This curriculum covers deep user psychology research methodologies and interactive design systems.', 
    6000.00, 
    'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=800&q=80', 
    1
),
(
    'Data Science, Machine Learning, & AI Core', 
    'Unlock the power of raw organizational data utilizing advanced machine learning and statistical modeling parameters. You will develop custom Python architectures utilizing libraries like Pandas, NumPy, and Scikit-Learn.', 
    9500.00, 
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', 
    1
),
(
    'Cloud Native Architecture & Systems Engineering', 
    'Learn to manage, monitor, and scale distributed containerized environments under massive operational request loads. This highly technical engineering course bridges the gaps between manual operations and cloud orchestration.', 
    11000.00, 
    'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&q=80', 
    1
),
(
    'Class 8 JSC Excellence Academic Program', 
    'Build a rock-solid foundation for high school board excellence. This highly structured academic program completely covers the latest National Curriculum guidelines, focusing deeply on Mathematics, General Science, English, and ICT.', 
    3500.00, 
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80', 
    1
),
(
    'Class 9-10 (SSC) Physics & Chemistry Core Program', 
    'Master the core conceptual layers of secondary physical sciences. Students will practice extensive mathematical physics derivations, explore comprehensive chemical equation balance techniques, and analyze creative board questions.', 
    4500.00, 
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80', 
    1
),
(
    'SSC Complete Final Model Test Pack', 
    'The ultimate simulation blueprint for secondary board exam aspirants. Designed precisely on the standard board question patterns, this robust model test package includes comprehensive syllabus evaluation tests.', 
    2500.00, 
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80', 
    1
),
(
    'Class 11-12 (HSC) Higher Mathematics Full Course', 
    'Conquer the advanced engineering and university admission foundation concepts. This academic syllabus deep-dives comprehensively into Calculus, Complex Numbers, Coordinate Geometry, Vectors, and Linear Programming matrices.', 
    5500.00, 
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80', 
    1
),
(
    'HSC Mega Board & University Admission Model Test Series', 
    'Bridge the high-stakes gap between the board curriculum and elite university entry standards. This hyper-competitive model test ecosystem challenges students with dual-mode testing arrays matching current entry benchmarks.', 
    4000.00, 
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80', 
    1
);

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
