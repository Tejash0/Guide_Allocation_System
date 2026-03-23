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
    'SELECT id, name, email, department, domain, max_teams FROM faculty WHERE id = ?'
  ).get(req.user.id);
  if (!faculty) return res.status(404).json({ error: 'Not found' });
  res.json(faculty);
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

router.get('/available', (req, res) => {
  const rows = db.prepare(`
    SELECT
      f.id, f.name, f.department, f.domain, f.max_teams,
      COUNT(s.id) AS current_team_count
    FROM faculty f
    LEFT JOIN students s ON s.preferred_faculty_id = f.id
    WHERE f.approved = 1
    GROUP BY f.id
    ORDER BY f.name ASC
  `).all();
  res.json(rows);
});

module.exports = router;
