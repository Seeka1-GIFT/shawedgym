const pool = require('../config/database');

// Get all payments
const getPayments = async (req, res) => {
  try {
    console.log('getPayments called with user:', req.user);
    const { page = 1, limit = 20, status, memberId } = req.query;
    const offset = (page - 1) * limit;
    const gymId = req.user?.gym_id; // Get gym_id from authenticated user

    console.log('getPayments - gymId:', gymId, 'user:', req.user);

    if (!gymId) {
      console.log('getPayments - No gym_id found in user object');
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Gym ID is required'
      });
    }

    let query = `
      SELECT p.*, m.first_name, m.last_name, m.email 
      FROM payments p 
      LEFT JOIN members m ON p.member_id = m.id 
      WHERE p.gym_id = $1
    `;
    let countQuery = 'SELECT COUNT(*) FROM payments p WHERE p.gym_id = $1';
    let queryParams = [gymId];
    let paramIndex = 2;
    
    console.log('getPayments - Executing query with gymId:', gymId);

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

    console.log('getPayments - Final query:', query);
    console.log('getPayments - Query params:', queryParams);

    const [paymentsResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2))
    ]);

    console.log('getPayments - Query results:', {
      paymentsCount: paymentsResult.rows.length,
      totalCount: countResult.rows[0]?.count
    });

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
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch payments',
      details: error.message
    });
  }
};

// Get payment by ID (joined with member, plan, gym)
const getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const gymId = req.user?.gym_id; // Get gym_id from authenticated user

    if (!gymId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Gym ID is required'
      });
    }
    
    const result = await pool.query(`
      SELECT 
        p.id AS payment_id,
        COALESCE((m.first_name || ' ' || m.last_name), 'Unknown Member') AS member_name,
        COALESCE(pl.name, 'Unknown Plan') AS plan_name,
        COALESCE(g.name, 'ShawedGym') AS gym_name,
        p.amount AS amount,
        p.description AS description,
        COALESCE(pl.price, 0) AS plan_price,
        p.method,
        p.created_at
      FROM payments p
      LEFT JOIN members m ON p.member_id = m.id AND m.gym_id = $2
      LEFT JOIN plans pl ON p.plan_id = pl.id AND pl.gym_id = $2
      LEFT JOIN gyms g ON p.gym_id = g.id
      WHERE p.id = $1 AND p.gym_id = $2
    `, [id, gymId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Payment Not Found',
        message: 'Payment not found'
      });
    }

    const row = result.rows[0];
    const desc = (row.description || '').toString();
    const matchAmt = (label) => {
      const m = desc.match(new RegExp(label + ':\\s*(\\d+(?:\\.\\d+)?)', 'i'));
      return m ? Number(m[1]) : null;
    };
    const planFromDesc = matchAmt('PLAN');
    const rgFromDesc = matchAmt('RG');
    const totalAmount = Number(row.amount) || 0;
    let computedPlan = planFromDesc;
    let computedRg = rgFromDesc;
    if (computedPlan == null && computedRg == null) {
      // Derive from plan price when available
      if (row.plan_price && totalAmount >= Number(row.plan_price)) {
        computedPlan = Number(row.plan_price);
        computedRg = Math.max(totalAmount - computedPlan, 0);
      } else {
        computedPlan = totalAmount;
        computedRg = 0;
      }
    } else if (computedPlan == null) {
      computedPlan = Math.max(totalAmount - (computedRg || 0), 0);
    } else if (computedRg == null) {
      computedRg = Math.max(totalAmount - (computedPlan || 0), 0);
    }
    res.json({
      success: true,
      data: {
        payment: {
          paymentId: row.payment_id,
          memberName: row.member_name,
          planName: row.plan_name,
          gymName: row.gym_name,
          rgFee: Number(computedRg) || 0,
          planFee: Number(computedPlan) || 0,
          total: Number(totalAmount) || 0,
          method: row.method,
          createdAt: row.created_at
        }
      }
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
    const gymId = req.user?.gym_id; // Get gym_id from authenticated user

    if (!gymId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Gym ID is required'
      });
    }

    // Validation
    if (!memberId || !amount || !method) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Member ID, amount, and payment method are required'
      });
    }

    // Verify member exists in this gym
    const memberResult = await pool.query('SELECT id FROM members WHERE id = $1 AND gym_id = $2', [memberId, gymId]);
    if (memberResult.rows.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Member not found'
      });
    }

    // Generate receipt number
    const receiptResult = await pool.query('SELECT COUNT(*) FROM payments WHERE gym_id = $1', [gymId]);
    const receiptNumber = `PAY${String(parseInt(receiptResult.rows[0].count) + 1).padStart(6, '0')}`;

    const result = await pool.query(
      `INSERT INTO payments 
       (member_id, amount, method, description, plan_id, receipt_number, status, payment_date, gym_id, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, 'completed', CURRENT_DATE, $7, NOW()) 
       RETURNING *`,
      [memberId, amount, method, description, planId, receiptNumber, gymId]
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
    const gymId = req.user?.gym_id; // Get gym_id from authenticated user

    if (!gymId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Gym ID is required'
      });
    }

    // Check if payment exists in this gym
    const existingPayment = await pool.query('SELECT id FROM payments WHERE id = $1 AND gym_id = $2', [id, gymId]);
    if (existingPayment.rows.length === 0) {
      return res.status(404).json({
        error: 'Payment Not Found',
        message: 'Payment not found'
      });
    }

    const result = await pool.query(
      `UPDATE payments 
       SET amount = $1, method = $2, description = $3, status = $4, updated_at = NOW()
       WHERE id = $5 AND gym_id = $6
       RETURNING *`,
      [amount, method, description, status, id, gymId]
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
    const gymId = req.user?.gym_id; // Get gym_id from authenticated user

    if (!gymId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Gym ID is required'
      });
    }

    const result = await pool.query('DELETE FROM payments WHERE id = $1 AND gym_id = $2 RETURNING *', [id, gymId]);
    
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
    const gymId = req.user?.gym_id; // Get gym_id from authenticated user

    if (!gymId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Gym ID is required'
      });
    }

    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN status = 'completed' AND payment_date >= CURRENT_DATE - INTERVAL '30 days' THEN amount ELSE 0 END) as monthly_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments
      FROM payments
      WHERE gym_id = $1
    `, [gymId]);

    const methodStats = await pool.query(`
      SELECT 
        method as payment_method,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total
      FROM payments 
      WHERE status = 'completed' AND gym_id = $1
      GROUP BY method
    `, [gymId]);

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






