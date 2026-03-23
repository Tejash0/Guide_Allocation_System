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

module.exports = router;
