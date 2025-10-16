const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const reports = require('../controllers/reportsController');

// Require auth for all report endpoints
router.use(authMiddleware);

// Balance Sheet endpoints
router.get('/balance-sheet', authorizeRoles('admin','cashier'), reports.getBalanceSheet);
router.get('/balance-sheet/export', authorizeRoles('admin','cashier'), reports.exportBalanceSheet);

module.exports = router;




