const express = require('express');
const router = express.Router();
const gymsController = require('../controllers/gymsController');
const authMiddleware = require('../middleware/auth');
const { authAllowMissingGym } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

// All gym routes require authentication
// Allow authenticated users even if they haven't been assigned a gym yet
router.use(authAllowMissingGym);

// GET /api/gyms - Get gyms scoped to current user (any authenticated user)
router.get('/', gymsController.getGyms);

// GET /api/gyms/my - Get authenticated user's gym (Any authenticated user)
router.get('/my', gymsController.getMyGym);

// GET /api/gyms/plans - Get subscription plans (Public)
router.get('/plans', gymsController.getSubscriptionPlans);

// GET /api/gyms/:id - Get gym by ID (Admin only)
router.get('/:id', authorizeRoles("admin"), gymsController.getGym);

// GET /api/gyms/:id/stats - Get gym statistics (Admin only)
router.get('/:id/stats', authorizeRoles("admin"), gymsController.getGymStats);

// POST /api/gyms - Create new gym (Admin only)
router.post('/', authorizeRoles("admin"), gymsController.createGym);

// PUT /api/gyms/:id - Update gym (Admin only)
router.put('/:id', authorizeRoles("admin"), gymsController.updateGym);

// DELETE /api/gyms/:id - Delete gym (Admin only)
router.delete('/:id', authorizeRoles("admin"), gymsController.deleteGym);

module.exports = router;
