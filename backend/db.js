const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'guide_allocation.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    student_id TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS faculty (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    domain TEXT,
    password_hash TEXT NOT NULL,
    approved INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Sprint 2 column additions
try { db.exec('ALTER TABLE faculty ADD COLUMN max_teams INTEGER DEFAULT 5'); } catch (_) {}
try { db.exec('ALTER TABLE students ADD COLUMN preferred_faculty_id INTEGER DEFAULT NULL'); } catch (_) {}
try { db.exec('ALTER TABLE students ADD COLUMN interests TEXT DEFAULT NULL'); } catch (_) {}

// Faculty notifications table
db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// US6 — student guide requests table
db.exec(`
  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    faculty_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, faculty_id)
  );
`);

// Sprint 3 — project submission columns on students
try { db.exec('ALTER TABLE students ADD COLUMN project_title TEXT DEFAULT NULL'); } catch (_) {}
try { db.exec('ALTER TABLE students ADD COLUMN project_description TEXT DEFAULT NULL'); } catch (_) {}
try { db.exec('ALTER TABLE students ADD COLUMN tech_stack TEXT DEFAULT NULL'); } catch (_) {}

// Sprint 3 — student notifications (guide request accepted/rejected)
db.exec(`
  CREATE TABLE IF NOT EXISTS student_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;
