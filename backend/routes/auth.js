const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'guide-allocation-secret-key';

router.post('/register/student', async (req, res) => {
  const { name, email, student_id, password } = req.body;

  if (!name || !email || !student_id || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const stmt = db.prepare(
      'INSERT INTO students (name, email, student_id, password_hash) VALUES (?, ?, ?, ?)'
    );
    stmt.run(name, email, student_id, password_hash);
    res.status(201).json({ message: 'Student registered successfully' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      const field = err.message.includes('email') ? 'Email' : 'Student ID';
      return res.status(409).json({ error: `${field} already registered` });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/register/faculty', async (req, res) => {
  const { name, email, department, domain, password } = req.body;

  if (!name || !email || !department || !password) {
    return res.status(400).json({ error: 'Name, email, department, and password are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const stmt = db.prepare(
      'INSERT INTO faculty (name, email, department, domain, password_hash) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(name, email, department, domain || null, password_hash);
    res.status(201).json({ message: 'Faculty registration submitted, pending admin approval' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Hardcoded admin
  if (email === 'admin@gmail.com') {
    if (password !== 'Tejash007') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: 0, role: 'admin', name: 'Admin' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, user: { id: 0, name: 'Admin', email, role: 'admin' } });
  }

  try {
    let user = db.prepare('SELECT * FROM students WHERE email = ?').get(email);
    let role = 'student';

    if (!user) {
      user = db.prepare('SELECT * FROM faculty WHERE email = ?').get(email);
      role = 'faculty';
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (role === 'faculty' && user.approved === 0) {
      return res.status(403).json({ error: 'Account pending admin approval' });
    }

    const token = jwt.sign(
      { id: user.id, role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
