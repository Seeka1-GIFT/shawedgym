const router = require('express').Router();
const { authorizeRoles } = require('../middleware/authorize');
const reports = require('../controllers/reportsController');

router.get('/balance-sheet', authorizeRoles('admin','cashier'), reports.getBalanceSheet);
router.get('/balance-sheet/export', authorizeRoles('admin','cashier'), reports.exportBalanceSheet);

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

// Protect all report routes for admin only
router.use(authMiddleware, authorizeRoles('admin'));

// Create a report snapshot
router.post('/', async (req, res) => {
  try {
    const { report_type, start_date, end_date, total_revenue, total_expenses, net_profit, metadata } = req.body;
    const result = await pool.query(
      'INSERT INTO reports (report_type, start_date, end_date, total_revenue, total_expenses, net_profit, metadata) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [report_type, start_date, end_date, total_revenue || 0, total_expenses || 0, net_profit || 0, metadata || {}]
    );
    res.status(201).json({ success: true, data: { report: result.rows[0] } });
  } catch (e) {
    console.error('Create report error:', e);
    res.status(500).json({ error: 'Server Error', message: 'Failed to create report' });
  }
});

// List reports
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reports ORDER BY created_at DESC');
    res.json({ success: true, data: { reports: result.rows } });
  } catch (e) {
    console.error('Get reports error:', e);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch reports' });
  }
});

module.exports = router;




