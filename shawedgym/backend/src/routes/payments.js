const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
const authMiddleware = require('../middleware/auth');

// All payment routes require authentication
// router.use(authMiddleware);

// GET /api/payments - Get all payments
router.get('/', paymentsController.getPayments);

// GET /api/payments/stats/revenue - Get payment statistics
router.get('/stats/revenue', paymentsController.getPaymentStats);

// GET /api/payments/:id - Get payment by ID
router.get('/:id', paymentsController.getPayment);

// POST /api/payments - Create new payment
router.post('/', paymentsController.createPayment);

// PUT /api/payments/:id - Update payment
router.put('/:id', paymentsController.updatePayment);

// DELETE /api/payments/:id - Delete payment
router.delete('/:id', paymentsController.deletePayment);

module.exports = router;



