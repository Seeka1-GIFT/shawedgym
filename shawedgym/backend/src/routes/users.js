const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Protect all user routes
router.use(authMiddleware);

// GET /api/users → list users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role, created_at FROM users ORDER BY id DESC'
    );
    res.json({ success: true, data: { users: result.rows } });
  } catch (error) {
    console.error('Users list error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch users' });
  }
});

module.exports = router;


