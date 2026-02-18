const test = require("node:test");
const assert = require("node:assert/strict");
const { createDb, initSchema, closeDb } = require("../courseDb");
const {
  createCourse,
  enrollStudent,
  getEnrollmentRoster,
} = require("../enrollmentService");

test.describe("Instructor answer key: Course registration integration", () => {
  let db;

  test.beforeEach(async () => {
    db = createDb();
    await initSchema(db);
  });

  test.afterEach(async () => {
    await closeDb(db);
  });

  test("createCourse persists and normalizes code/title", async () => {
    const saved = await createCourse(db, {
      code: " qual2000 ",
      title: "  Integration Testing  ",
      capacity: 2,
    });

    assert.ok(saved.id > 0); //for boolean checks
    assert.strictEqual(saved.code, "QUAL2000"); //for equality checks
    assert.strictEqual(saved.title, "Integration Testing");
    assert.strictEqual(saved.capacity, 2);
  });

  test("enrollStudent creates records and roster returns insertion order", async () => {
    await createCourse(db, {
      code: "qual2000",
      title: "Integration Testing",
      capacity: 3,
    });

    const first = await enrollStudent(db, "  Alex  ", "qual2000");
    const second = await enrollStudent(db, "Sam", "QUAL2000");

    assert.ok(first.id > 0);
    assert.ok(second.id > first.id);

    const roster = await getEnrollmentRoster(db, "qual2000");
    assert.deepStrictEqual(roster, [
      { id: first.id, studentName: "Alex", courseCode: "QUAL2000" },
      { id: second.id, studentName: "Sam", courseCode: "QUAL2000" },
    ]);
  });

  test("enrollStudent rejects non-existent course", async () => {
    await assert.rejects(() => enrollStudent(db, "Alex", "MISSING101"), {
      message: "unfound course",
    });
  });

  test("enrollStudent rejects when course is full", async () => {
    await createCourse(db, {
      code: "qual2000",
      title: "Integration Testing",
      capacity: 1,
    });

    await enrollStudent(db, "Alex", "QUAL2000");

    await assert.rejects(() => enrollStudent(db, "Sam", "QUAL2000"), {
      message: "course is full",
    });
  });

  test("duplicate enrollment in the same course is rejected", async () => {
    await createCourse(db, {
      code: "qual2000",
      title: "Integration Testing",
      capacity: 3,
    });

    await enrollStudent(db, "Alex", "QUAL2000");

    await assert.rejects(
      () => enrollStudent(db, "Alex", "QUAL2000"),
      /UNIQUE constraint failed/,
    );
  });

  test("same student can enroll in different courses", async () => {
    await createCourse(db, {
      code: "qual2000",
      title: "Integration Testing",
      capacity: 3,
    });
    await createCourse(db, {
      code: "qual3000",
      title: "Automation",
      capacity: 3,
    });

    await enrollStudent(db, "Alex", "QUAL2000");
    await enrollStudent(db, "Alex", "QUAL3000");

    const roster2000 = await getEnrollmentRoster(db, "QUAL2000");
    const roster3000 = await getEnrollmentRoster(db, "QUAL3000");

    assert.deepStrictEqual(
      roster2000.map((row) => row.studentName),
      ["Alex"],
    );
    assert.deepStrictEqual(
      roster3000.map((row) => row.studentName),
      ["Alex"],
    );
  });

  test("invalid inputs throw TypeError", async () => {
    await assert.rejects(
      () => createCourse(db, { code: "", title: "T", capacity: 1 }),
      { name: "TypeError" },
    );
    await assert.rejects(
      () => createCourse(db, { code: "QUAL2000", title: "", capacity: 1 }),
      { name: "TypeError" },
    );
    await assert.rejects(
      () => createCourse(db, { code: "QUAL2000", title: "T", capacity: 0 }),
      { name: "TypeError" },
    );

    await createCourse(db, {
      code: "qual2000",
      title: "Integration Testing",
      capacity: 1,
    });

    await assert.rejects(() => enrollStudent(db, "", "QUAL2000"), {
      name: "TypeError",
    });
    await assert.rejects(() => enrollStudent(db, "Alex", ""), {
      name: "TypeError",
    });
    assert.throws(() => getEnrollmentRoster(db, ""), {
      name: "TypeError",
    });
  });
});
