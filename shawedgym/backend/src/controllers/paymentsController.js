const pool = require('../config/database');

// Get all payments
const getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, memberId } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, m.first_name, m.last_name, m.email 
      FROM payments p 
      LEFT JOIN members m ON p.member_id = m.id 
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) FROM payments p WHERE 1=1';
    let queryParams = [];
    let paramIndex = 1;

    // Status filter
    if (status) {
      query += ` AND p.status = $${paramIndex}`;
      countQuery += ` AND p.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    // Member filter
    if (memberId) {
      query += ` AND p.member_id = $${paramIndex}`;
      countQuery += ` AND p.member_id = $${paramIndex}`;
      queryParams.push(memberId);
      paramIndex++;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(parseInt(limit), offset);

    const [paymentsResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2))
    ]);

    const totalPayments = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalPayments / parseInt(limit));

    res.json({
      success: true,
      data: {
        payments: paymentsResult.rows,
        pagination: {
          total: totalPayments,
          page: parseInt(page),
          pages: totalPages,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch payments'
    });
  }
};

// Get payment by ID
const getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT p.*, m.first_name, m.last_name, m.email 
      FROM payments p 
      LEFT JOIN members m ON p.member_id = m.id 
      WHERE p.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Payment Not Found',
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: { payment: result.rows[0] }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch payment'
    });
  }
};

// Create new payment
const createPayment = async (req, res) => {
  try {
    const { 
      memberId, 
      amount, 
      method, 
      description, 
      planId 
    } = req.body;

    // Validation
    if (!memberId || !amount || !method) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Member ID, amount, and payment method are required'
      });
    }

    // Verify member exists
    const memberResult = await pool.query('SELECT id FROM members WHERE id = $1', [memberId]);
    if (memberResult.rows.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Member not found'
      });
    }

    // Generate receipt number
    const receiptResult = await pool.query('SELECT COUNT(*) FROM payments');
    const receiptNumber = `PAY${String(parseInt(receiptResult.rows[0].count) + 1).padStart(6, '0')}`;

    const result = await pool.query(
      `INSERT INTO payments 
       (member_id, amount, method, description, plan_id, receipt_number, status, payment_date, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, 'completed', CURRENT_DATE, NOW()) 
       RETURNING *`,
      [memberId, amount, method, description, planId, receiptNumber]
    );

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: { payment: result.rows[0] }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to process payment'
    });
  }
};

// Update payment
const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      amount, 
      method, 
      description, 
      status 
    } = req.body;

    // Check if payment exists
    const existingPayment = await pool.query('SELECT id FROM payments WHERE id = $1', [id]);
    if (existingPayment.rows.length === 0) {
      return res.status(404).json({
        error: 'Payment Not Found',
        message: 'Payment not found'
      });
    }

    const result = await pool.query(
      `UPDATE payments 
       SET amount = $1, method = $2, description = $3, status = $4, updated_at = NOW()
       WHERE id = $5 
       RETURNING *`,
      [amount, method, description, status, id]
    );

    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: { payment: result.rows[0] }
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update payment'
    });
  }
};

// Delete payment
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM payments WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Payment Not Found',
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment deleted successfully',
      data: { payment: result.rows[0] }
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete payment'
    });
  }
};

// Get payment statistics
const getPaymentStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN status = 'completed' AND payment_date >= CURRENT_DATE - INTERVAL '30 days' THEN amount ELSE 0 END) as monthly_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments
      FROM payments
    `);

    const methodStats = await pool.query(`
      SELECT 
        method as payment_method,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total
      FROM payments 
      WHERE status = 'completed'
      GROUP BY method
    `);

    res.json({
      success: true,
      data: {
        ...stats.rows[0],
        revenueByMethod: methodStats.rows,
        monthlyRevenue: [
          {
            month: new Date().getMonth() + 1,
            revenue: stats.rows[0].monthly_revenue || 0,
            transactions: stats.rows[0].total_payments || 0
          }
        ]
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch payment statistics'
    });
  }
};

module.exports = {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentStats
};






