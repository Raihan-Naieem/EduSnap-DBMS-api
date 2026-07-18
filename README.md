# EduSnap DBMS API

A production-quality backend for a DBMS course project: Node.js + Express +
PostgreSQL, using **raw SQL only** via the `pg` package. No ORM, no query
builder, no auto-generated schema — the database is defined entirely in
`database/schema.sql` and applied by hand with `psql`.

---

## Tech Stack

- Node.js + Express.js
- PostgreSQL
- `pg` (node-postgres) — raw parameterized SQL, no ORM
- CommonJS modules
- `dotenv` for configuration
- `bcryptjs` for password hashing only (no session/JWT auth layer — out of scope)

---

## Architecture

```
Routes  ->  Controllers  ->  Services  ->  Repositories  ->  PostgreSQL
```

| Layer | Responsibility |
|---|---|
| **Routes** (`src/routes/`) | Endpoint definitions only. No logic. |
| **Controllers** (`src/controllers/`) | Parse the request, call the service, shape the HTTP response. No SQL, no business rules. |
| **Services** (`src/services/`) | ALL business logic and validation rules. Manages transactions when a write touches more than one table. No SQL. |
| **Repositories** (`src/repositories/`) | ALL SQL — CRUD, joins, aggregates. Every query is parameterized. One repository file per entity. |
| **Middleware** (`src/middleware/`) | `asyncHandler` (catches async errors), `errorHandler` (centralized error responses), `validate` (required-field checks). |

There is **no Models folder**. The schema lives in `database/schema.sql` and
is applied manually — see [Database Setup](#database-setup) below.

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                  # pg.Pool connection only — no DDL, no migrations
│   ├── routes/                    # 11 routers + index.js aggregator
│   ├── controllers/                # 11 controllers
│   ├── services/                   # 11 services (business rules + transactions)
│   ├── repositories/                # 11 repositories (raw SQL only)
│   ├── middleware/
│   │   ├── asyncHandler.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── utils/
│   │   └── ApiError.js
│   ├── app.js                      # Express app config (no listen())
│   └── server.js                   # Loads .env, starts the HTTP server
├── database/
│   ├── schema.sql                  # DDL only: tables, PK/FK/UNIQUE/CHECK, indexes, 1 view, 1 trigger+function
│   └── seed.sql                    # Sample data for every table
├── .env.example
├── package.json
└── README.md
```

---

## Requirements

- **Node.js** 18 or newer (uses `node --watch`, available since Node 18.11)
- **PostgreSQL** 13 or newer (uses `FILTER (WHERE ...)` in the view, standard since Postgres 9.4+; trigger/function syntax works on any modern version)

---

## Installation

```bash
git clone https://github.com/Raihan-Naieem/EduSnap-DBMS-api
npm install
```

--- 

## Environment Variables

Copy `.env.example` to `.env` and fill in your local Postgres credentials:

```bash
cp .env.example .env
```

```
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=my_database
DB_USER=your_username
DB_PASSWORD=your_password

NODE_ENV=development
```

---
## Creating a PostgreSQL User

Before running the setup steps below, you need a Postgres role (user) with
login privileges and a password — this is what `DB_USER` / `DB_PASSWORD` in
your `.env` will point to.

### Create a dedicated user for this project 

Rather than using the superuser, create a scoped role that only has access
to this project's database:

```bash
sudo -u postgres psql
```

```sql
-- Create the role with a password and login rights
CREATE USER your_username WITH PASSWORD 'your_password_here';

-- Create the database (or skip if you already ran `createdb`)
CREATE DATABASE my_database;

-- Give the new user full rights on that database
GRANT ALL PRIVILEGES ON DATABASE my_database TO your_username;

-- Postgres 15+ additionally requires schema-level grants:
\c my_database
GRANT ALL ON SCHEMA public TO your_username;
```

Then in `.env`:
```
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=my_database
```

### Verify it works

Test the credentials directly with `psql` before touching the Node app:

```bash
psql -U your_username -h localhost -d my_database
```

If this connects without a password prompt failing, `.env` should work too.
If it still fails, check `pg_hba.conf`'s authentication method for local
TCP connections (commonly `/etc/postgresql/<version>/main/pg_hba.conf` on
Linux) — the line for `host ... 127.0.0.1/32` should say `md5` or
`scram-sha-256`, not `peer` or `trust`. Restart Postgres after any change:

```bash
sudo systemctl restart postgresql
```
---

## Database Setup

The schema is managed **entirely** through SQL files — nothing is created
automatically by the Node app.

```bash
# 1. Create an empty database
createdb my_database

# 2. Apply the schema (tables, constraints, indexes, view, trigger)
psql -U your-username -d my_database -f database/schema.sql

# 3. (Optional) Load sample data so you have something to query immediately
psql -U your-username -d my_database -f database/seed.sql
```

`schema.sql` is safe to re-run — it starts with `DROP TABLE IF EXISTS ...`
in dependency order, so you can reset your database anytime by re-running
steps 2 and 3.

### What's inside `schema.sql`

- All 17 tables from the schema, with `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`,
  `CHECK`, and `DEFAULT` constraints (e.g. `Enrollment.status` defaults to
  `'active'` and is constrained to `active | completed | cancelled`).
- Indexes on every foreign key column that isn't already covered by a
  primary key (e.g. `idx_enrollment_course_id`, `idx_exam_course_id`).
- A **view**, `course_enrollment_counts`, aggregating active/total enrollment
  counts per course — backs `GET /api/courses/:id/stats`.
- A **trigger + function**, `trg_check_marks_within_range` /
  `check_marks_within_range()`, which rejects any `Attempt_exam` insert or
  update where `marks_obtained` exceeds that exam's `max_marks` — enforced at
  the database level as defense-in-depth, in addition to the same check in
  `exam.service.js`.

---

## Running the Server

```bash
npm run dev    # auto-restarts on file changes (node --watch)
# or
npm start
```

You should see:

```
Server running on http://localhost:3000
```

Health check: `GET http://localhost:3000/health` → `{ "status": "ok" }`

---

## Error Handling

- Every async controller is wrapped in `asyncHandler`, so thrown errors are
  automatically forwarded to Express's error pipeline (no repetitive
  try/catch per controller).
- Services throw `ApiError(statusCode, message)` for expected failures
  (not found, conflict, validation, business rule violations).
- `middleware/errorHandler.js` is registered last in `app.js` and converts
  any error into a consistent JSON shape:

  ```json
  { "success": false, "message": "Course not found." }
  ```

  Unexpected errors (bugs, DB connection issues) are logged server-side and
  returned to the client as a generic `500` — internals are never leaked.

---

## Validation

Required-field validation is manual and dependency-free
(`middleware/validate.js`'s `requireFields([...])`), applied per-route:

```js
router.post('/', requireFields(['name', 'email', 'password']), asyncHandler(studentController.register));
```

Missing fields return:

```json
{ "success": false, "message": "Missing required field(s).", "details": { "missingFields": ["email", "password"] } }
```

---

## Transactions

Most operations are single-table and need no transaction. One operation
writes to **two** tables atomically and demonstrates the pattern explicitly:

**`POST /api/enrollments/with-payment`** — creates an `Enrollment` row AND a
`Student_payment` row in one `BEGIN`/`COMMIT`/`ROLLBACK` block
(`enrollment.service.js` → `enrollWithPayment`). If either insert fails
(e.g. a non-positive `amount` violates the `CHECK (amount > 0)` constraint), both
are rolled back — a student is never left "enrolled but unbilled."

```js
const client = await getClient();
try {
  await client.query('BEGIN');
  const enrollment = await enrollmentRepository.createEnrollment(studentId, courseId, client);
  const payment = await studentPaymentRepository.create({ ... }, client);
  await client.query('COMMIT');
  return { enrollment, payment };
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

---

## API Documentation

All routes are mounted under `/api`. Every response follows
`{ "success": true/false, "data": ... }` (or `"message"` on error).

### Students — `/api/students`

| Method | Endpoint | Purpose | Status Codes |
|---|---|---|---|
| POST | `/api/students` | Register a student | `201`, `400`, `409` |
| GET | `/api/students` | List all students | `200` |
| GET | `/api/students/:id` | Get one student | `200`, `404` |
| PUT | `/api/students/:id` | Update name/email | `200`, `404` |
| DELETE | `/api/students/:id` | Delete a student | `204`, `404` |
| POST | `/api/students/:id/phones` | Add a phone number | `201`, `404` |
| GET | `/api/students/:id/phones` | List phone numbers | `200`, `404` |
| DELETE | `/api/students/:id/phones/:phone` | Remove a phone number | `204`, `404` |

**Example — Register a student**

Request: `POST /api/students`
```json
{ "name": "Sam Student", "email": "sam@example.com", "password": "secret123" }
```

Response `201`:
```json
{ "success": true, "data": { "studentId": 1, "name": "Sam Student", "email": "sam@example.com" } }
```

### Teachers — `/api/teachers`

Same shape as Students, plus `adminId` is required on registration (the
service validates that admin exists before creating the teacher).

| Method | Endpoint | Purpose | Status Codes |
|---|---|---|---|
| POST | `/api/teachers` | Register a teacher (`name`, `email`, `password`, `adminId`) | `201`, `400`, `404`, `409` |
| GET | `/api/teachers` | List all teachers | `200` |
| GET | `/api/teachers/:id` | Get one teacher | `200`, `404` |
| PUT | `/api/teachers/:id` | Update name/email | `200`, `404` |
| DELETE | `/api/teachers/:id` | Delete a teacher | `204`, `404` |
| POST/GET/DELETE | `/api/teachers/:id/phones[/:phone]` | Same phone sub-resource pattern as Students | `201`/`200`/`204`, `404` |

### Admins — `/api/admins`

Same CRUD + phone sub-resource shape as Students (no `adminId` dependency).

### Courses — `/api/courses`

| Method | Endpoint | Purpose | Status Codes |
|---|---|---|---|
| POST | `/api/courses` | Create a course (`title`, `price`, `adminId`, optional `description`) | `201`, `400` |
| GET | `/api/courses` | List all courses | `200` |
| GET | `/api/courses/:id` | Get one course | `200`, `404` |
| GET | `/api/courses/:id/stats` | Active/total enrollment counts (uses the `course_enrollment_counts` VIEW) | `200`, `404` |
| PUT | `/api/courses/:id` | Update a course | `200`, `404` |
| DELETE | `/api/courses/:id` | Delete a course | `204`, `404` |
| POST | `/api/courses/:id/prerequisites` | Add a prerequisite (`{ "prerequisiteId": 1 }`) | `201`, `400`, `404` |
| GET | `/api/courses/:id/prerequisites` | List prerequisite course ids | `200`, `404` |
| DELETE | `/api/courses/:id/prerequisites/:prerequisiteId` | Remove a prerequisite | `204`, `404` |

**Example — Course stats**

Request: `GET /api/courses/1/stats`

Response `200`:
```json
{
  "success": true,
  "data": { "courseId": 1, "title": "Intro to Programming", "activeEnrollmentCount": "1", "totalEnrollmentCount": "2" }
}
```

### Enrollments — `/api/enrollments`

**Business rule:** to enroll in a course with a prerequisite, the student
must have PASSED an exam belonging to that prerequisite course
(`marks_obtained >= passing_marks` on any attempt).

| Method | Endpoint | Purpose | Status Codes |
|---|---|---|---|
| POST | `/api/enrollments` | Enroll (`{ "studentId", "courseId" }`) | `201`, `403`, `404`, `409` |
| POST | `/api/enrollments/with-payment` | Enroll + record payment atomically (transaction) — body adds `amount`, optional `paymentDue` | `201`, `403`, `404`, `409` |
| GET | `/api/enrollments/student/:studentId` | List a student's enrollments | `200` |
| GET | `/api/enrollments/course/:courseId` | List a course's enrollments | `200` |
| PUT | `/api/enrollments/:studentId/:courseId/status` | Update status (`{ "status": "completed" }`) | `200`, `400`, `404` |
| DELETE | `/api/enrollments/:studentId/:courseId` | Cancel/delete an enrollment | `204`, `404` |

**Example — Blocked by prerequisite**

Request: `POST /api/enrollments`
```json
{ "studentId": 2, "courseId": 2 }
```

Response `403`:
```json
{ "success": false, "message": "Student must pass an exam for prerequisite course (id: 1) before enrolling in this course." }
```

### Exams — `/api/exams`

**Business rule:** a student can only attempt an exam if enrolled in its
course; `attemptNumber` auto-increments per student+exam.

| Method | Endpoint | Purpose | Status Codes |
|---|---|---|---|
| POST | `/api/exams` | Create an exam for a course | `201`, `400`, `404` |
| GET | `/api/exams/course/:courseId` | List exams for a course | `200` |
| GET | `/api/exams/:id` | Get one exam | `200`, `404` |
| PUT | `/api/exams/:id` | Update an exam | `200`, `404` |
| DELETE | `/api/exams/:id` | Delete an exam | `204`, `404` |
| POST | `/api/exams/:examId/attempts` | Record an attempt (`{ "studentId", "marksObtained" }`) | `201`, `400`, `403`, `404` |
| GET | `/api/exams/:examId/attempts/:studentId` | List a student's attempts on an exam | `200` |

### Routines — `/api/routines`

| Method | Endpoint | Purpose | Status Codes |
|---|---|---|---|
| POST | `/api/routines` | Create a routine (`startTime`, `endTime`, `courseId`, `teacherId`, optional `classLink`, `isActive`) | `201`, `400`, `404` |
| GET | `/api/routines/course/:courseId` | List routines for a course | `200` |
| GET | `/api/routines/teacher/:teacherId` | List routines for a teacher | `200` |
| GET | `/api/routines/:id` | Get one routine | `200`, `404` |
| PUT | `/api/routines/:id` | Update a routine | `200`, `404` |
| DELETE | `/api/routines/:id` | Delete a routine | `204`, `404` |
| POST | `/api/routines/:id/days` | Add a day (`{ "dayOfWeek": "MON" }`) | `201`, `400`, `404` |
| GET | `/api/routines/:id/days` | List days | `200`, `404` |
| DELETE | `/api/routines/:id/days/:day` | Remove a day | `204`, `404` |

### Conducts — `/api/conducts`

| Method | Endpoint | Purpose | Status Codes |
|---|---|---|---|
| POST | `/api/conducts` | Assign a teacher to a course (`{ "courseId", "teacherId" }`) | `201`, `404`, `409` |
| GET | `/api/conducts/course/:courseId/teachers` | List teachers assigned to a course | `200` |
| GET | `/api/conducts/teacher/:teacherId/courses` | List courses a teacher conducts | `200` |
| DELETE | `/api/conducts/:courseId/:teacherId` | Unassign | `204`, `404` |

### Student Payments — `/api/student-payments`

**Business rule:** a payment can only be recorded for a course the student
is enrolled in.

| Method | Endpoint | Purpose | Status Codes |
|---|---|---|---|
| POST | `/api/student-payments` | Create a payment (`amount`, `studentId`, `courseId`, optional `paymentDue`) | `201`, `403` |
| GET | `/api/student-payments/student/:studentId` | List a student's payments | `200` |
| GET | `/api/student-payments/course/:courseId` | List a course's payments | `200` |
| GET | `/api/student-payments/:id` | Get one payment | `200`, `404` |
| PUT | `/api/student-payments/:id` | Update amount/due date | `200`, `404` |
| DELETE | `/api/student-payments/:id` | Delete a payment | `204`, `404` |

### Teacher Payments — `/api/teacher-payments`

| Method | Endpoint | Purpose | Status Codes |
|---|---|---|---|
| POST | `/api/teacher-payments` | Create a payment (`amount`, `teacherId`, optional `paymentDate`) | `201`, `400`, `404` |
| GET | `/api/teacher-payments/teacher/:teacherId` | List a teacher's payments | `200` |
| GET | `/api/teacher-payments/:id` | Get one payment | `200`, `404` |
| PUT | `/api/teacher-payments/:id` | Update a payment | `200`, `404` |
| DELETE | `/api/teacher-payments/:id` | Delete a payment | `204`, `404` |

### Teacher Applications — `/api/teacher-applications`

**Business rule:** status can only move `pending -> approved/rejected` once.

| Method | Endpoint | Purpose | Status Codes |
|---|---|---|---|
| POST | `/api/teacher-applications` | Submit an application (`applicantName`, `applicantEmail`, optional `resumeLink`, `demoLink`) | `201`, `400` |
| GET | `/api/teacher-applications?status=pending` | List applications, optionally filtered by status | `200` |
| GET | `/api/teacher-applications/:id` | Get one application | `200`, `404` |
| PUT | `/api/teacher-applications/:id/review` | Approve/reject (`{ "decision": "approved", "adminId": 1 }`) | `200`, `400`, `404`, `409` |
| DELETE | `/api/teacher-applications/:id` | Delete an application | `204`, `404` |

---

## Testing

### Using curl

Every endpoint can be exercised with curl. A representative sample (swap in
real ids from your seeded data):

```bash
# Health check
curl http://localhost:3000/health

# Register a student
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Sam Student","email":"sam@example.com","password":"secret123"}'

# List courses
curl http://localhost:3000/api/courses

# Enroll a student in a course
curl -X POST http://localhost:3000/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{"studentId":1,"courseId":1}'

# Enroll + pay atomically
curl -X POST http://localhost:3000/api/enrollments/with-payment \
  -H "Content-Type: application/json" \
  -d '{"studentId":1,"courseId":1,"amount":99.99}'

# Record an exam attempt
curl -X POST http://localhost:3000/api/exams/1/attempts \
  -H "Content-Type: application/json" \
  -d '{"studentId":1,"marksObtained":85}'

# Review a teacher application
curl -X PUT http://localhost:3000/api/teacher-applications/1/review \
  -H "Content-Type: application/json" \
  -d '{"decision":"approved","adminId":1}'

# Delete a resource
curl -X DELETE http://localhost:3000/api/students/1
```

### Using Postman or Insomnia

1. Create a new collection called "PERN DBMS Backend".
2. Add a collection-level variable `baseUrl = http://localhost:3000/api`.
3. For each endpoint in the [API Documentation](#api-documentation) above,
   create a request using `{{baseUrl}}/...` and the method/body shown.
4. Set the `Content-Type: application/json` header on any POST/PUT request
   with a body (Postman/Insomnia do this automatically if you select the
   "JSON" body type).
5. Run requests roughly in this order so foreign keys resolve: Admins →
   Teachers/Courses → Enrollments → Exams/Attempts → Payments → Routines →
   Conducts → Teacher Applications.

### Using VS Code REST Client (optional)

Create a `requests.http` file and use the extension's "Send Request" link
that appears above each block:

```http
@baseUrl = http://localhost:3000/api

### Register a student
POST {{baseUrl}}/students
Content-Type: application/json

{
  "name": "Sam Student",
  "email": "sam@example.com",
  "password": "secret123"
}

### List courses
GET {{baseUrl}}/courses

### Enroll a student
POST {{baseUrl}}/enrollments
Content-Type: application/json

{
  "studentId": 1,
  "courseId": 1
}
```

---

## Code Quality Notes

- One repository file per entity; SQL never leaves `src/repositories/`.
- Every SQL statement is parameterized (`$1`, `$2`, ...) — no string
  concatenation, anywhere.
- Repositories alias columns (`SELECT student_id AS "studentId"`) so
  callers get consistent camelCase keys straight from Postgres — no
  separate mapping layer needed, and no risk of SQL/JS naming drift.
- `password_hash` is never selected in any general-purpose query — only
  `findByEmailWithHash` exposes it, for future login/auth work.
- Controllers contain zero SQL and zero business rules — only request
  parsing and response shaping. 
- Services contain zero SQL — only orchestration, validation, and (where
  needed) transactions via `getClient()`.
