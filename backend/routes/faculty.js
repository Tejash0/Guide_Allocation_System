const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Faculty updates their own profile (domain / interested fields)
router.patch('/profile', requireAuth, (req, res) => {
  if (req.user.role !== 'faculty') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { domain } = req.body;
  if (typeof domain !== 'string' || domain.trim().length === 0) {
    return res.status(400).json({ error: 'domain is required' });
  }
  const result = db.prepare('UPDATE faculty SET domain = ? WHERE id = ?').run(domain.trim(), req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Faculty not found' });
  res.json({ message: 'Profile updated' });
});

// GET own profile info (for faculty)
router.get('/profile', requireAuth, (req, res) => {
  if (req.user.role !== 'faculty') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const faculty = db.prepare(
    'SELECT id, name, email, department, domain, max_teams, is_available FROM faculty WHERE id = ?'
  ).get(req.user.id);
  if (!faculty) return res.status(404).json({ error: 'Not found' });

  const { cnt: accepted_students_count } = db.prepare(
    "SELECT COUNT(*) AS cnt FROM requests WHERE faculty_id = ? AND status = 'accepted'"
  ).get(req.user.id);
  const { cnt: pending_requests_count } = db.prepare(
    "SELECT COUNT(*) AS cnt FROM requests WHERE faculty_id = ? AND status = 'pending'"
  ).get(req.user.id);

  res.json({ ...faculty, accepted_students_count, pending_requests_count });
});

// GET unread notifications for logged-in faculty
router.get('/notifications', requireAuth, (req, res) => {
  if (req.user.role !== 'faculty') return res.status(403).json({ error: 'Forbidden' });
  const rows = db.prepare(
    'SELECT id, message, created_at FROM notifications WHERE faculty_id = ? AND read = 0 ORDER BY created_at DESC'
  ).all(req.user.id);
  res.json(rows);
});

// Mark all notifications as read
router.patch('/notifications/read', requireAuth, (req, res) => {
  if (req.user.role !== 'faculty') return res.status(403).json({ error: 'Forbidden' });
  db.prepare('UPDATE notifications SET read = 1 WHERE faculty_id = ?').run(req.user.id);
  res.json({ message: 'Marked as read' });
});

// Availability toggle (Task 4)
router.patch('/availability', requireAuth, (req, res) => {
  if (req.user.role !== 'faculty') return res.status(403).json({ error: 'Forbidden' });
  const { is_available } = req.body;
  if (typeof is_available !== 'boolean') {
    return res.status(400).json({ error: 'is_available must be a boolean' });
  }
  db.prepare('UPDATE faculty SET is_available = ? WHERE id = ?').run(is_available ? 1 : 0, req.user.id);
  res.json({ message: 'Availability updated' });
});

// Problem statements — own list (authenticated, specific route before parameterized /:id)
router.get('/problem-statements', requireAuth, (req, res) => {
  if (req.user.role !== 'faculty') return res.status(403).json({ error: 'Forbidden' });
  const rows = db.prepare(
    'SELECT id, statement, created_at FROM faculty_problem_statements WHERE faculty_id = ? ORDER BY created_at ASC'
  ).all(req.user.id);
  res.json(rows);
});

router.post('/problem-statements', requireAuth, (req, res) => {
  if (req.user.role !== 'faculty') return res.status(403).json({ error: 'Forbidden' });
  const { statement } = req.body;
  if (!statement || !statement.trim()) return res.status(400).json({ error: 'statement is required' });
  const result = db.prepare(
    'INSERT INTO faculty_problem_statements (faculty_id, statement) VALUES (?, ?)'
  ).run(req.user.id, statement.trim());
  res.json({ id: result.lastInsertRowid, statement: statement.trim() });
});

router.delete('/problem-statements/:id', requireAuth, (req, res) => {
  if (req.user.role !== 'faculty') return res.status(403).json({ error: 'Forbidden' });
  const result = db.prepare(
    'DELETE FROM faculty_problem_statements WHERE id = ? AND faculty_id = ?'
  ).run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
});

// My accepted students with project info (Task 8)
router.get('/my-students', requireAuth, (req, res) => {
  if (req.user.role !== 'faculty') return res.status(403).json({ error: 'Forbidden' });
  const rows = db.prepare(`
    SELECT s.id, s.name, s.email, s.student_id AS roll_no, s.interests,
           s.project_title, s.project_description, s.tech_stack,
           r.problem_statement
    FROM requests r
    JOIN students s ON s.id = r.student_id
    WHERE r.faculty_id = ? AND r.status = 'accepted'
    ORDER BY s.name ASC
  `).all(req.user.id);
  res.json(rows);
});

// Project comments on an accepted student (Task 8)
router.get('/students/:student_id/comments', requireAuth, (req, res) => {
  if (req.user.role !== 'faculty') return res.status(403).json({ error: 'Forbidden' });
  const accepted = db.prepare(
    "SELECT id FROM requests WHERE student_id = ? AND faculty_id = ? AND status = 'accepted'"
  ).get(req.params.student_id, req.user.id);
  if (!accepted) return res.status(403).json({ error: 'Student not under your guidance' });

  const rows = db.prepare(`
    SELECT pc.id, pc.author_role, pc.comment, pc.created_at,
           CASE pc.author_role
             WHEN 'faculty' THEN f.name
             WHEN 'student' THEN s.name
           END AS author_name
    FROM project_comments pc
    LEFT JOIN faculty f ON f.id = pc.author_id AND pc.author_role = 'faculty'
    LEFT JOIN students s ON s.id = pc.author_id AND pc.author_role = 'student'
    WHERE pc.student_id = ?
    ORDER BY pc.created_at ASC
  `).all(req.params.student_id);
  res.json(rows);
});

router.post('/students/:student_id/comments', requireAuth, (req, res) => {
  if (req.user.role !== 'faculty') return res.status(403).json({ error: 'Forbidden' });
  const accepted = db.prepare(
    "SELECT id FROM requests WHERE student_id = ? AND faculty_id = ? AND status = 'accepted'"
  ).get(req.params.student_id, req.user.id);
  if (!accepted) return res.status(403).json({ error: 'Student not under your guidance' });

  const { comment } = req.body;
  if (!comment || !comment.trim()) return res.status(400).json({ error: 'comment is required' });

  const result = db.prepare(
    'INSERT INTO project_comments (student_id, author_id, author_role, comment) VALUES (?, ?, ?, ?)'
  ).run(req.params.student_id, req.user.id, 'faculty', comment.trim());
  res.json({ id: result.lastInsertRowid, comment: comment.trim(), author_role: 'faculty' });
});

// Public: students fetch statements for a specific faculty (parameterized — after all specific routes)
router.get('/:id/problem-statements', (req, res) => {
  const rows = db.prepare(
    'SELECT id, statement FROM faculty_problem_statements WHERE faculty_id = ? ORDER BY created_at ASC'
  ).all(req.params.id);
  res.json(rows);
});

router.get('/available', (req, res) => {
  const { domain } = req.query;

  let rows;
  if (domain && domain.trim().length > 0) {
    rows = db.prepare(`
      SELECT
        f.id, f.name, f.department, f.domain, f.max_teams,
        COUNT(r.id) AS current_team_count
      FROM faculty f
      LEFT JOIN requests r ON r.faculty_id = f.id AND r.status = 'accepted'
      WHERE f.approved = 1 AND f.is_available = 1
        AND LOWER(f.domain) LIKE LOWER(?)
      GROUP BY f.id
      ORDER BY f.name ASC
    `).all(`%${domain.trim()}%`);
  } else {
    rows = db.prepare(`
      SELECT
        f.id, f.name, f.department, f.domain, f.max_teams,
        COUNT(r.id) AS current_team_count
      FROM faculty f
      LEFT JOIN requests r ON r.faculty_id = f.id AND r.status = 'accepted'
      WHERE f.approved = 1 AND f.is_available = 1
      GROUP BY f.id
      ORDER BY f.name ASC
    `).all();
  }

  res.json(rows);
});

module.exports = router;
