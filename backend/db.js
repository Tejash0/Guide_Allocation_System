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

// ── Phase 4 migrations ─────────────────────────────────────────
// Per-student guide limit (reused column; add first, then normalize value)
try { db.exec('ALTER TABLE students ADD COLUMN max_teams INTEGER DEFAULT 1'); } catch (_) {}
db.prepare('UPDATE students SET max_teams = 1 WHERE max_teams IS NULL OR max_teams != 1').run();

// Faculty: opt-in availability flag
try { db.exec('ALTER TABLE faculty ADD COLUMN is_available INTEGER DEFAULT 0'); } catch (_) {}

// Faculty problem statements (optional list, guides may leave empty)
db.exec(`CREATE TABLE IF NOT EXISTS faculty_problem_statements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  faculty_id INTEGER NOT NULL,
  statement TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
)`);

// Student project templates (pre-saved, reusable during guide selection)
db.exec(`CREATE TABLE IF NOT EXISTS student_project_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  tech_stack TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
)`);

// Attach problem statement to each guide request (required: student must provide one)
try { db.exec('ALTER TABLE requests ADD COLUMN problem_statement TEXT DEFAULT NULL'); } catch (_) {}

// Project comment thread shared between faculty and the student (two-way)
db.exec(`CREATE TABLE IF NOT EXISTS project_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  author_role TEXT NOT NULL CHECK(author_role IN ('faculty','student')),
  comment TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
)`);
// ───────────────────────────────────────────────────────────────

module.exports = db;
