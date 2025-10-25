const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

// Protect all user routes
router.use(authMiddleware, authorizeRoles('admin'));

// GET /api/users → list users (filtered by gym_id, except gym_id=1 sees all)
router.get('/', async (req, res) => {
  try {
    const gymId = req.user?.gym_id;
    
    if (!gymId) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Gym ID is required' 
      });
    }

    // SUPER ADMIN: gym_id = 1 sees ALL users from ALL gyms
    if (gymId === 1) {
      const result = await pool.query(
        'SELECT id, email, first_name, last_name, role, gym_id, created_at FROM users ORDER BY id DESC'
      );
      console.log(`Super Admin (gym_id: 1) accessing all users: ${result.rows.length} total`);
      return res.json({ success: true, data: { users: result.rows, isSuperAdmin: true } });
    }

    // Regular gym: only return users from the same gym
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role, gym_id, created_at FROM users WHERE gym_id = $1 ORDER BY id DESC',
      [gymId]
    );
    
    res.json({ success: true, data: { users: result.rows, isSuperAdmin: false } });
  } catch (error) {
    console.error('Users list error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch users' });
  }
});

module.exports = router;


