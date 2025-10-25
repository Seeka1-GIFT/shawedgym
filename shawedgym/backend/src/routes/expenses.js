const express = require('express');
const router = express.Router();
const expensesController = require('../controllers/expensesController');
const authMiddleware = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

router.use(authMiddleware);

router.get('/', authorizeRoles('admin', 'cashier'), expensesController.getExpenses);
router.get('/:id', authorizeRoles('admin', 'cashier'), expensesController.getExpense);
router.post('/', authorizeRoles('admin', 'cashier'), expensesController.createExpense);
router.put('/:id', authorizeRoles('admin', 'cashier'), expensesController.updateExpense);
router.delete('/:id', authorizeRoles('admin', 'cashier'), expensesController.deleteExpense);

module.exports = router;






