# Integration Testing Lab: Course Registration

## Scenario

You are QA engineers reviewing a backend implementation created by another team.
Your job is to write integration tests that verify the behavior end-to-end before approving the code.

This lab includes:

- `courseDb.js`: SQLite connection, query helpers, and schema creation
- `courseRepo.js`: SQL data access for courses and enrollments
- `enrollmentService.js`: validation + business logic

## Goal

Write integration tests that exercise all three layers together:

1. Create an in-memory DB
2. Initialize schema
3. Call service functions
4. Assert results by checking returned data and database state
5. Close DB

## Functional Expectations to Test

Your tests should verify at least the following:

1. `createCourse` saves a valid course and normalizes `code` to uppercase.
2. `enrollStudent` creates enrollment records for valid input.
3. `enrollStudent` rejects enrollment for a non-existent course.
4. `enrollStudent` rejects enrollment when capacity has been reached.
5. Duplicate enrollment of the same student in the same course is rejected.
6. `getEnrollmentRoster` returns students in insertion order.
7. Invalid inputs are rejected with `TypeError` where appropriate.

## Suggested Test File

Create your tests in:

- `test/courseRegistration.int.test.js`

Use Node's built-in test runner (`node:test`) and assertions (`node:assert/strict`).

## Example Setup Pattern

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const { createDb, initSchema, closeDb } = require("../lab-course-registration/courseDb");
const { createCourse, enrollStudent, getEnrollmentRoster } = require("../lab-course-registration/enrollmentService");
```

## Run

```bash
npm test
```

## Instructor Notes

- This lab is designed for integration testing, not unit mocking.
- Students should use the real in-memory SQLite database in each test.
- Keep each test isolated by creating a fresh DB in `beforeEach` and closing it in `afterEach`.
