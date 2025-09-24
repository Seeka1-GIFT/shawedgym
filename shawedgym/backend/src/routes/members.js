const express = require('express');
const router = express.Router();
const membersController = require('../controllers/membersController');
const authMiddleware = require('../middleware/auth');

// All member routes require authentication
router.use(authMiddleware);

// GET /api/members - Get all members
router.get('/', membersController.getMembers);

// GET /api/members/stats/dashboard - Get member statistics
router.get('/stats/dashboard', membersController.getMemberStats);

// GET /api/members/:id - Get member by ID
router.get('/:id', membersController.getMember);

// POST /api/members - Create new member
router.post('/', membersController.createMember);

// PUT /api/members/:id - Update member
router.put('/:id', membersController.updateMember);

// DELETE /api/members/:id - Delete member
router.delete('/:id', membersController.deleteMember);

// POST /api/members/:id/checkin - Check in member
router.post('/:id/checkin', membersController.checkInMember);

// POST /api/members/seed - quick seed member for testing
router.post('/seed/create', async (req, res) => {
  try {
    const pool = require('../config/database');
    const result = await pool.query(
      "INSERT INTO members (first_name, last_name, email, phone, membership_type, status) VALUES ('Test','Member','testmember@example.com','000-000','basic','Active') RETURNING *"
    );
    res.status(201).json({ success: true, data: { member: result.rows[0] } });
  } catch (e) {
    console.error('Seed member error:', e);
    res.status(500).json({ error: 'Server Error', message: 'Failed to seed member' });
  }
});

module.exports = router;



