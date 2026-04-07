const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

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

module.exports = router;
