# Course Registration Service Handoff (Engineering -> QA)

This document describes the backend implementation delivered for QA review.
The service provides course creation and student enrollment using an in-memory SQLite database.

## What Was Built

Three modules were implemented:

- `courseDb.js`: database connection, Promise-based query helpers, schema setup, teardown
- `courseRepo.js`: SQL data access for courses and enrollments
- `enrollmentService.js`: input validation and business rules

The expected execution path is:

1. Service validates input.
2. Service calls repository methods.
3. Repository executes SQL using DB helpers.
4. Results return to service, then to caller.

## Database Schema

### `courses`

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `code` TEXT NOT NULL UNIQUE
- `title` TEXT NOT NULL
- `capacity` INTEGER NOT NULL

### `enrollments`

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `student_name` TEXT NOT NULL
- `course_id` INTEGER NOT NULL
- `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
- `UNIQUE(student_name, course_id)` to prevent duplicate enrollment in the same course
- `FOREIGN KEY(course_id)` references `courses(id)`

## Service API Contract

### `createCourse(db, course)`

Input:

- `course.code`: non-empty string
- `course.title`: non-empty string
- `course.capacity`: positive integer

Behavior:

- Trims `code` and `title`
- Normalizes `code` to uppercase
- Inserts into `courses`
- Returns `{ id, code, title, capacity }`

Error behavior:

- Invalid input throws `TypeError`
- Duplicate `code` fails with SQLite `UNIQUE constraint failed` error

### `enrollStudent(db, studentName, courseCode)`

Input:

- `studentName`: non-empty string
- `courseCode`: non-empty string

Behavior:

- Trims `studentName`
- Normalizes `courseCode` to uppercase for lookup
- Rejects if course does not exist
- Checks current enrollment count against course capacity
- Inserts into `enrollments`
- Returns `{ id, studentName, courseId }`

Error behavior:

- Invalid input throws `TypeError`
- Missing course throws `Error("course not found")`
- Full course throws `Error("course is full")`
- Duplicate enrollment fails with SQLite `UNIQUE constraint failed` error

### `getEnrollmentRoster(db, courseCode)`

Input:

- `courseCode`: non-empty string

Behavior:

- Normalizes `courseCode` to uppercase
- Returns rows ordered by enrollment id:
  - `{ id, studentName, courseCode }`

Error behavior:

- Invalid input throws `TypeError`

## QA Focus Areas

Please prioritize integration tests for:

1. End-to-end persistence through service -> repo -> db.
2. Input validation at service boundary.
3. Course code normalization consistency (`qual2000` vs `QUAL2000`).
4. Capacity enforcement under sequential inserts.
5. Duplicate-enrollment rejection (same student + same course).
6. Roster ordering and shape of returned data.
7. Isolation between tests with fresh DB setup and teardown.

## Known Implementation Notes

- Database is in-memory (`:memory:`), so data is non-persistent by design.
- Error messages for business rules are explicit (`course not found`, `course is full`).
- Constraint violations are surfaced from SQLite and are not wrapped.

## Quick Start for QA

```js
const { createDb, initSchema, closeDb } = require("./courseDb");
const {
  createCourse,
  enrollStudent,
  getEnrollmentRoster,
} = require("./enrollmentService");
```

Typical test lifecycle:

1. `db = createDb()`
2. `await initSchema(db)`
3. exercise service calls
4. assert returned values / query results
5. `await closeDb(db)`
