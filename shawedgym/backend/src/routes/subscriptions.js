const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

// All subscription routes require authentication
router.use(authMiddleware);

// GET /api/subscriptions/plans - Get all subscription plans (Public for authenticated users)
router.get('/plans', subscriptionController.getSubscriptionPlans);

// GET /api/subscriptions/plans/:id - Get subscription plan by ID (Public for authenticated users)
router.get('/plans/:id', subscriptionController.getSubscriptionPlan);

// POST /api/subscriptions/plans - Create new subscription plan (Admin only)
router.post('/plans', authorizeRoles('admin'), subscriptionController.createSubscriptionPlan);

// PUT /api/subscriptions/plans/:id - Update subscription plan (Admin only)
router.put('/plans/:id', authorizeRoles('admin'), subscriptionController.updateSubscriptionPlan);

// DELETE /api/subscriptions/plans/:id - Delete subscription plan (Admin only)
router.delete('/plans/:id', authorizeRoles('admin'), subscriptionController.deleteSubscriptionPlan);

// GET /api/subscriptions/gym - Get gym's current subscription
router.get('/gym', subscriptionController.getGymSubscription);

// POST /api/subscriptions/gym - Subscribe gym to a plan
router.post('/gym', subscriptionController.subscribeGym);

// DELETE /api/subscriptions/gym - Cancel gym subscription
router.delete('/gym', subscriptionController.cancelSubscription);

// GET /api/subscriptions/usage - Get subscription usage statistics
router.get('/usage', subscriptionController.getSubscriptionUsage);

module.exports = router;
