const sqlite3 = require("sqlite3");

const createDb = () => {
  return new sqlite3.Database(":memory:");
};

const run = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
};

const get = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

const all = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const initSchema = async (db) => {
  await run(
    db,
    `CREATE TABLE courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      capacity INTEGER NOT NULL
    )`,
  );

  await run(
    db,
    `CREATE TABLE enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_name TEXT NOT NULL,
      course_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_name, course_id),
      FOREIGN KEY(course_id) REFERENCES courses(id)
    )`,
  );
};

const closeDb = (db) => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

module.exports = {
  createDb,
  initSchema,
  run,
  get,
  all,
  closeDb,
};
