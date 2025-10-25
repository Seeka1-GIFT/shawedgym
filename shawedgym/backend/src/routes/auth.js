const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

// Public routes
router.post('/register', authController.register);
router.post('/register-gym-owner', authController.registerGymOwner);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getCurrentUser);

// Admin-only routes
router.post('/reset-password', authMiddleware, authorizeRoles('admin'), authController.resetUserPassword);

module.exports = router;






