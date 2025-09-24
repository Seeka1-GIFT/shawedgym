const express = require('express');
const router = express.Router();
const expensesController = require('../controllers/expensesController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', expensesController.getExpenses);
router.get('/:id', expensesController.getExpense);
router.post('/', expensesController.createExpense);
router.put('/:id', expensesController.updateExpense);
router.delete('/:id', expensesController.deleteExpense);

module.exports = router;






