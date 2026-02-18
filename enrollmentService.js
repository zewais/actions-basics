const {
  addCourse,
  findCourseByCode,
  countEnrollmentsByCourseId,
  addEnrollment,
  listEnrollmentsForCourse,
} = require("./courseRepo");

const validateCourse = (course) => {
  if (!course || typeof course !== "object") {
    throw new TypeError("course must be an object");
  }
  if (typeof course.code !== "string" || course.code.trim() === "") {
    throw new TypeError("course.code must be a non-empty string");
  }
  if (typeof course.title !== "string" || course.title.trim() === "") {
    throw new TypeError("course.title must be a non-empty string");
  }
  if (!Number.isInteger(course.capacity) || course.capacity <= 0) {
    throw new TypeError("course.capacity must be a positive integer");
  }
};

const validateStudentName = (studentName) => {
  if (typeof studentName !== "string" || studentName.trim() === "") {
    throw new TypeError("studentName must be a non-empty string");
  }
};

const createCourse = async (db, course) => {
  validateCourse(course);
  return addCourse(db, {
    code: course.code.trim().toUpperCase(),
    title: course.title.trim(),
    capacity: course.capacity,
  });
};

const enrollStudent = async (db, studentName, courseCode) => {
  validateStudentName(studentName);
  if (typeof courseCode !== "string" || courseCode.trim() === "") {
    throw new TypeError("courseCode must be a non-empty string");
  }

  const normalizedCourseCode = courseCode.trim().toUpperCase();
  const course = await findCourseByCode(db, normalizedCourseCode);

  if (!course) {
    throw new Error("course not found");
  }

  const enrollmentCount = await countEnrollmentsByCourseId(db, course.id);
  if (enrollmentCount >= course.capacity) {
    throw new Error("course is full");
  }

  return addEnrollment(db, studentName.trim(), course.id);
};

const getEnrollmentRoster = (db, courseCode) => {
  if (typeof courseCode !== "string" || courseCode.trim() === "") {
    throw new TypeError("courseCode must be a non-empty string");
  }
  return listEnrollmentsForCourse(db, courseCode.trim().toUpperCase());
};

module.exports = {
  createCourse,
  enrollStudent,
  getEnrollmentRoster,
};
