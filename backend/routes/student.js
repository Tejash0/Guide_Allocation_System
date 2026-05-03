const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/profile', (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  const student = db.prepare('SELECT max_teams FROM students WHERE id = ?').get(req.user.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const { cnt: acceptedCount } = db.prepare(
    "SELECT COUNT(*) AS cnt FROM requests WHERE student_id = ? AND status = 'accepted'"
  ).get(req.user.id);
  res.json({ max_teams: student.max_teams ?? 1, accepted_count: acceptedCount });
});

router.get('/preference', (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const student = db.prepare(
    'SELECT preferred_faculty_id FROM students WHERE id = ?'
  ).get(req.user.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json({ preferred_faculty_id: student.preferred_faculty_id });
});

router.get('/interests', (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  const student = db.prepare('SELECT interests FROM students WHERE id = ?').get(req.user.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json({ interests: student.interests });
});

router.patch('/interests', (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  const { interests } = req.body;
  if (typeof interests !== 'string' || interests.trim().length === 0) {
    return res.status(400).json({ error: 'interests is required' });
  }
  db.prepare('UPDATE students SET interests = ? WHERE id = ?').run(interests.trim(), req.user.id);
  res.json({ message: 'Interests saved' });
});

router.post('/preference', (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { faculty_id } = req.body;
  if (!faculty_id) return res.status(400).json({ error: 'faculty_id is required' });

  const faculty = db.prepare(
    'SELECT id FROM faculty WHERE id = ? AND approved = 1'
  ).get(faculty_id);
  if (!faculty) return res.status(400).json({ error: 'Faculty not found or not approved' });

  db.prepare(
    'UPDATE students SET preferred_faculty_id = ? WHERE id = ?'
  ).run(faculty_id, req.user.id);

  res.json({ message: 'Preference saved' });
});

// Get student's project submission
router.get('/project', (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  const student = db.prepare(
    'SELECT project_title, project_description, tech_stack FROM students WHERE id = ?'
  ).get(req.user.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

// Save/update student's project submission (only if guide is confirmed)
router.patch('/project', (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });

  const accepted = db.prepare(
    "SELECT id FROM requests WHERE student_id = ? AND status = 'accepted'"
  ).get(req.user.id);
  if (!accepted) {
    return res.status(403).json({ error: 'You can only submit a project once your guide is confirmed' });
  }

  const { project_title, project_description, tech_stack } = req.body;
  if (!project_title || !project_title.trim()) {
    return res.status(400).json({ error: 'project_title is required' });
  }

  db.prepare(
    'UPDATE students SET project_title = ?, project_description = ?, tech_stack = ? WHERE id = ?'
  ).run(project_title.trim(), (project_description || '').trim(), (tech_stack || '').trim(), req.user.id);

  res.json({ message: 'Project saved' });
});

// Get unread student notifications
router.get('/notifications', (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  const rows = db.prepare(
    'SELECT id, message, created_at FROM student_notifications WHERE student_id = ? AND read = 0 ORDER BY created_at DESC'
  ).all(req.user.id);
  res.json(rows);
});

// Mark all student notifications as read
router.patch('/notifications/read', (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  db.prepare('UPDATE student_notifications SET read = 1 WHERE student_id = ?').run(req.user.id);
  res.json({ message: 'Marked as read' });
});

// Project templates (Task 6)
router.get('/project-templates', (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  const rows = db.prepare(
    'SELECT id, title, description, tech_stack, created_at FROM student_project_templates WHERE student_id = ? ORDER BY created_at DESC'
  ).all(req.user.id);
  res.json(rows);
});

router.post('/project-templates', (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  const { title, description, tech_stack } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'title is required' });
  const result = db.prepare(
    'INSERT INTO student_project_templates (student_id, title, description, tech_stack) VALUES (?, ?, ?, ?)'
  ).run(req.user.id, title.trim(), (description || '').trim(), (tech_stack || '').trim());
  res.json({ id: result.lastInsertRowid, title: title.trim(), description: (description||'').trim(), tech_stack: (tech_stack||'').trim() });
});

router.delete('/project-templates/:id', (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  const result = db.prepare(
    'DELETE FROM student_project_templates WHERE id = ? AND student_id = ?'
  ).run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
});

// Project comment thread — student view + reply (Task 8)
router.get('/project-comments', (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
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
  `).all(req.user.id);
  res.json(rows);
});

router.post('/project-comments', (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  const accepted = db.prepare(
    "SELECT id FROM requests WHERE student_id = ? AND status = 'accepted'"
  ).get(req.user.id);
  if (!accepted) return res.status(403).json({ error: 'No confirmed guide yet' });

  const { comment } = req.body;
  if (!comment || !comment.trim()) return res.status(400).json({ error: 'comment is required' });

  const result = db.prepare(
    'INSERT INTO project_comments (student_id, author_id, author_role, comment) VALUES (?, ?, ?, ?)'
  ).run(req.user.id, req.user.id, 'student', comment.trim());
  res.json({ id: result.lastInsertRowid, comment: comment.trim(), author_role: 'student' });
});

module.exports = router;
