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

  // Prevent sending new requests if student already has an accepted guide
  const alreadyAccepted = db.prepare(
    "SELECT id FROM requests WHERE student_id = ? AND status = 'accepted'"
  ).get(req.user.id);
  if (alreadyAccepted) {
    return res.status(400).json({ error: 'You already have a confirmed guide' });
  }

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

// Faculty accepts or rejects a student request
router.patch('/:id/status', (req, res) => {
  if (req.user.role !== 'faculty') return res.status(403).json({ error: 'Forbidden' });
  const { status } = req.body;
  if (status !== 'accepted' && status !== 'rejected') {
    return res.status(400).json({ error: 'status must be accepted or rejected' });
  }

  const request = db.prepare(
    'SELECT r.id, r.student_id, r.status FROM requests r WHERE r.id = ? AND r.faculty_id = ?'
  ).get(req.params.id, req.user.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.status !== 'pending') {
    return res.status(400).json({ error: 'Only pending requests can be updated' });
  }

  if (status === 'accepted') {
    const faculty = db.prepare('SELECT max_teams FROM faculty WHERE id = ?').get(req.user.id);
    const acceptedCount = db.prepare(
      "SELECT COUNT(*) AS cnt FROM requests WHERE faculty_id = ? AND status = 'accepted'"
    ).get(req.user.id).cnt;
    if (acceptedCount >= faculty.max_teams) {
      return res.status(400).json({ error: 'You have reached your maximum team capacity' });
    }
    // Set the student's preferred faculty
    db.prepare('UPDATE students SET preferred_faculty_id = ? WHERE id = ?').run(req.user.id, request.student_id);
  }

  db.prepare('UPDATE requests SET status = ? WHERE id = ?').run(status, request.id);

  const faculty = db.prepare('SELECT name FROM faculty WHERE id = ?').get(req.user.id);

  if (status === 'accepted') {
    // Auto-reject all other pending requests this student sent to other faculty
    const otherPending = db.prepare(
      "SELECT r.id, r.faculty_id, f.name AS faculty_name FROM requests r JOIN faculty f ON f.id = r.faculty_id WHERE r.student_id = ? AND r.status = 'pending' AND r.id != ?"
    ).all(request.student_id, request.id);

    for (const other of otherPending) {
      db.prepare("UPDATE requests SET status = 'rejected' WHERE id = ?").run(other.id);
      db.prepare('INSERT INTO student_notifications (student_id, message) VALUES (?, ?)').run(
        request.student_id,
        `Your request to Prof. ${other.faculty_name} was automatically rejected since you have been assigned a guide.`
      );
    }
  }

  // Notify the student about this specific action
  const message = status === 'accepted'
    ? `Your guide request to Prof. ${faculty.name} was accepted!`
    : `Your guide request to Prof. ${faculty.name} was not accepted.`;
  db.prepare('INSERT INTO student_notifications (student_id, message) VALUES (?, ?)').run(request.student_id, message);

  res.json({ message: `Request ${status}` });
});

// Student withdraws a pending request
router.delete('/:id', (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });

  const request = db.prepare(
    'SELECT id, faculty_id, status FROM requests WHERE id = ? AND student_id = ?'
  ).get(req.params.id, req.user.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.status !== 'pending') {
    return res.status(400).json({ error: 'Only pending requests can be withdrawn' });
  }

  db.prepare('DELETE FROM requests WHERE id = ?').run(request.id);

  // Clear preferred_faculty_id if it pointed to this faculty
  db.prepare(
    'UPDATE students SET preferred_faculty_id = NULL WHERE id = ? AND preferred_faculty_id = ?'
  ).run(req.user.id, request.faculty_id);

  res.json({ message: 'Request withdrawn' });
});

module.exports = router;
