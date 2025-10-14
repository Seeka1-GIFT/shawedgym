const express = require('express');
const router = express.Router();
const plansController = require('../controllers/plansController');
const authMiddleware = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

// All plan routes require authentication
router.use(authMiddleware);

// GET /api/plans - Get all plans
router.get('/', authorizeRoles('admin', 'cashier'), plansController.getPlans);

// GET /api/plans/:id - Get plan by ID
router.get('/:id', authorizeRoles('admin', 'cashier'), plansController.getPlan);

// POST /api/plans - Create new plan
router.post('/', authorizeRoles('admin'), plansController.createPlan);

// PUT /api/plans/:id - Update plan
router.put('/:id', authorizeRoles('admin'), plansController.updatePlan);

// DELETE /api/plans/:id - Delete plan
router.delete('/:id', authorizeRoles('admin'), plansController.deletePlan);

module.exports = router;


