const { run, get, all } = require("./courseDb");

const addCourse = async (db, course) => {
  const result = await run(
    db,
    "INSERT INTO courses (code, title, capacity) VALUES (?, ?, ?)",
    [course.code, course.title, course.capacity],
  );

  return {
    id: result.lastID,
    code: course.code,
    title: course.title,
    capacity: course.capacity,
  };
};

const findCourseByCode = (db, code) => {
  return get(
    db,
    "SELECT id, code, title, capacity FROM courses WHERE code = ?",
    [code],
  );
};

const countEnrollmentsByCourseId = async (db, courseId) => {
  const row = await get(
    db,
    "SELECT COUNT(*) AS total FROM enrollments WHERE course_id = ?",
    [courseId],
  );
  return row.total;
};

const addEnrollment = async (db, studentName, courseId) => {
  const result = await run(
    db,
    "INSERT INTO enrollments (student_name, course_id) VALUES (?, ?)",
    [studentName, courseId],
  );

  return {
    id: result.lastID,
    studentName,
    courseId,
  };
};

const listEnrollmentsForCourse = (db, courseCode) => {
  return all(
    db,
    `SELECT e.id, e.student_name AS studentName, c.code AS courseCode
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     WHERE c.code = ?
     ORDER BY e.id`,
    [courseCode],
  );
};

module.exports = {
  addCourse,
  findCourseByCode,
  countEnrollmentsByCourseId,
  addEnrollment,
  listEnrollmentsForCourse,
};
