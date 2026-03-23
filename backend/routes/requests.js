const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Student sends a guide request
router.post('/', (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  const { faculty_id } = req.body;
  if (!faculty_id) return res.status(400).json({ error: 'faculty_id is required' });

  const faculty = db.prepare('SELECT id FROM faculty WHERE id = ? AND approved = 1').get(faculty_id);
  if (!faculty) return res.status(400).json({ error: 'Faculty not found or not approved' });

  try {
    db.prepare(
      'INSERT OR REPLACE INTO requests (student_id, faculty_id, status) VALUES (?, ?, ?)'
    ).run(req.user.id, faculty_id, 'pending');

    // Also update the student's preferred_faculty_id
    db.prepare('UPDATE students SET preferred_faculty_id = ? WHERE id = ?').run(faculty_id, req.user.id);

    res.json({ message: 'Request sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send request' });
  }
});

// Student views their own requests
router.get('/my', (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  const rows = db.prepare(`
    SELECT r.id, r.faculty_id, r.status, r.created_at,
           f.name AS faculty_name, f.department, f.domain
    FROM requests r
    JOIN faculty f ON f.id = r.faculty_id
    WHERE r.student_id = ?
    ORDER BY r.created_at DESC
  `).all(req.user.id);
  res.json(rows);
});

// Faculty views incoming requests
router.get('/incoming', (req, res) => {
  if (req.user.role !== 'faculty') return res.status(403).json({ error: 'Forbidden' });
  const rows = db.prepare(`
    SELECT r.id, r.student_id, r.status, r.created_at,
           s.name AS student_name, s.email, s.student_id AS roll_no, s.interests
    FROM requests r
    JOIN students s ON s.id = r.student_id
    WHERE r.faculty_id = ?
    ORDER BY r.created_at DESC
  `).all(req.user.id);
  res.json(rows);
});

module.exports = router;
