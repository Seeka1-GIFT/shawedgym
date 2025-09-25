const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
const authMiddleware = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

// All payment routes require authentication
router.use(authMiddleware);

// GET /api/payments - Get all payments
router.get('/', authorizeRoles('admin', 'user'), paymentsController.getPayments);

// GET /api/payments/stats/revenue - Get payment statistics
router.get('/stats/revenue', authorizeRoles('admin', 'user'), paymentsController.getPaymentStats);

// GET /api/payments/:id - Get payment by ID
router.get('/:id', authorizeRoles('admin', 'user'), paymentsController.getPayment);

// POST /api/payments - Create new payment
router.post('/', authorizeRoles('admin'), paymentsController.createPayment);

// PUT /api/payments/:id - Update payment
router.put('/:id', authorizeRoles('admin'), paymentsController.updatePayment);

// DELETE /api/payments/:id - Delete payment
router.delete('/:id', authorizeRoles('admin'), paymentsController.deletePayment);

module.exports = router;



