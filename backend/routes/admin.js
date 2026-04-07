const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAdmin);

router.get('/stats', (req, res) => {
  const students = db.prepare('SELECT COUNT(*) as count FROM students').get();
  const faculty  = db.prepare('SELECT COUNT(*) as count FROM faculty WHERE approved = 1').get();
  const pending  = db.prepare('SELECT COUNT(*) as count FROM faculty WHERE approved = 0').get();
  res.json({ students: students.count, faculty: faculty.count, pending: pending.count });
});

router.get('/students', (req, res) => {
  const rows = db.prepare(
    'SELECT id, name, email, student_id, created_at FROM students ORDER BY created_at DESC'
  ).all();
  res.json(rows);
});

router.get('/faculty', (req, res) => {
  const rows = db.prepare(
    'SELECT id, name, email, department, domain, approved, created_at FROM faculty ORDER BY approved ASC, created_at DESC'
  ).all();
  res.json(rows);
});

router.post('/faculty/:id/approve', (req, res) => {
  const faculty = db.prepare('SELECT id, name FROM faculty WHERE id = ?').get(req.params.id);
  if (!faculty) return res.status(404).json({ error: 'Faculty not found' });
  db.prepare('UPDATE faculty SET approved = 1 WHERE id = ?').run(req.params.id);
  db.prepare('INSERT INTO notifications (faculty_id, message) VALUES (?, ?)').run(
    faculty.id,
    'Your faculty account has been approved by the admin. You can now receive guide requests from students.'
  );
  res.json({ message: 'Faculty approved' });
});

router.delete('/faculty/:id', (req, res) => {
  const faculty = db.prepare('SELECT id FROM faculty WHERE id = ?').get(req.params.id);
  if (!faculty) return res.status(404).json({ error: 'Faculty not found' });

  const cascadeDelete = db.transaction((facultyId) => {
    // 1. Remove student notifications that belong to requests against this faculty
    db.prepare(
      `DELETE FROM student_notifications
       WHERE student_id IN (
         SELECT student_id FROM requests WHERE faculty_id = ?
       )`
    ).run(facultyId);

    // 2. Remove faculty-side notifications
    db.prepare('DELETE FROM notifications WHERE faculty_id = ?').run(facultyId);

    // 3. Remove all requests involving this faculty
    db.prepare('DELETE FROM requests WHERE faculty_id = ?').run(facultyId);

    // 4. Remove the faculty row itself
    db.prepare('DELETE FROM faculty WHERE id = ?').run(facultyId);
  });

  try {
    cascadeDelete(req.params.id);
    res.json({ message: 'Faculty removed' });
  } catch (err) {
    console.error('Faculty delete transaction failed:', err);
    res.status(500).json({ error: 'Failed to remove faculty' });
  }
});

router.patch('/faculty/:id/slots', (req, res) => {
  const { max_teams } = req.body;
  if (typeof max_teams !== 'number' || max_teams < 1 || max_teams > 20) {
    return res.status(400).json({ error: 'max_teams must be a number between 1 and 20' });
  }
  const result = db.prepare('UPDATE faculty SET max_teams = ? WHERE id = ?').run(max_teams, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Faculty not found' });
  res.json({ message: 'Slots updated' });
});

module.exports = router;
