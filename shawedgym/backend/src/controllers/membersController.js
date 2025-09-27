const pool = require('../config/database');

// Get all members
const getMembers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    const gymId = req.user?.gym_id; // Get gym_id from authenticated user

    if (!gymId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Gym ID is required'
      });
    }

    let query = 'SELECT * FROM members WHERE gym_id = $1';
    let countQuery = 'SELECT COUNT(*) FROM members WHERE gym_id = $1';
    let queryParams = [gymId];
    let paramIndex = 2;

    // Search filter
    if (search) {
      query += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
      countQuery += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(parseInt(limit), offset);

    const [membersResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2))
    ]);

    const totalMembers = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalMembers / parseInt(limit));

    res.json({
      success: true,
      data: {
        members: membersResult.rows,
        pagination: {
          total: totalMembers,
          page: parseInt(page),
          pages: totalPages,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch members'
    });
  }
};

// Get member by ID
const getMember = async (req, res) => {
  try {
    const { id } = req.params;
    const gymId = req.user?.gym_id; // Get gym_id from authenticated user

    if (!gymId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Gym ID is required'
      });
    }
    
    const result = await pool.query('SELECT * FROM members WHERE id = $1 AND gym_id = $2', [id, gymId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Member Not Found',
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      data: { member: result.rows[0] }
    });
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch member'
    });
  }
};

// Create new member
const createMember = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      membershipType, 
      dateOfBirth, 
      address, 
      emergencyContact,
      emergencyPhone,
      registrationFee
    } = req.body;
    const gymId = req.user?.gym_id; // Get gym_id from authenticated user

    if (!gymId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Gym ID is required'
      });
    }

    // Validation
    if (!firstName || !lastName || !email || !phone || !membershipType) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'First name, last name, email, phone, and membership type are required'
      });
    }

    // Check if email already exists in this gym
    const existingMember = await pool.query('SELECT id FROM members WHERE email = $1 AND gym_id = $2', [email, gymId]);
    if (existingMember.rows.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Member with this email already exists'
      });
    }

    const result = await pool.query(
      `INSERT INTO members 
       (first_name, last_name, email, phone, membership_type, date_of_birth, address, emergency_contact, emergency_phone, status, gym_id, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Active', $10, NOW()) 
       RETURNING *`,
      [firstName, lastName, email, phone, membershipType, dateOfBirth, address, emergencyContact, emergencyPhone, gymId]
    );

    const member = result.rows[0];

    // Create a SINGLE payment that combines Registration Fee + first Membership payment
    try {
      let plan = null;
      if (membershipType) {
        const planResult = await pool.query(
          `SELECT id, name, price FROM plans 
           WHERE LOWER(name) LIKE CASE 
             WHEN LOWER($1) = 'basic' THEN '%basic%'
             WHEN LOWER($1) = 'premium' THEN '%premium%'
             WHEN LOWER($1) = 'vip' THEN '%vip%'
             ELSE LOWER('%' || $1 || '%') END
           ORDER BY price ASC LIMIT 1`,
          [membershipType]
        );
        if (planResult.rows.length > 0) plan = planResult.rows[0];
      }

      const reg = Number(registrationFee) || 0;
      const planAmount = plan ? Number(plan.price) : 0;
      const totalAmount = reg + planAmount;

      if (totalAmount > 0) {
        const countRes = await pool.query('SELECT COUNT(*) FROM payments');
        const prefix = plan ? 'SUB' : 'REG';
        const receiptNumber = `${prefix}${String(parseInt(countRes.rows[0].count) + 1).padStart(6, '0')}`;
        const desc = plan
          ? (reg > 0 ? `${plan.name} Membership + Registration Fee` : `${plan.name} Membership`)
          : 'Registration fee';
        await pool.query(
          `INSERT INTO payments (member_id, amount, method, description, plan_id, receipt_number, status, payment_date, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'completed', CURRENT_DATE, NOW())`,
          [member.id, totalAmount, 'cash', desc, plan ? plan.id : null, receiptNumber]
        );
      }
    } catch (combineErr) {
      console.error('Create combined payment error:', combineErr);
    }

    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: { member }
    });
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create member'
    });
  }
};

// Update member
const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      membershipType, 
      dateOfBirth, 
      address, 
      emergencyContact,
      emergencyPhone,
      status 
    } = req.body;
    const gymId = req.user?.gym_id; // Get gym_id from authenticated user

    if (!gymId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Gym ID is required'
      });
    }

    // Check if member exists in this gym
    const existingMember = await pool.query('SELECT id FROM members WHERE id = $1 AND gym_id = $2', [id, gymId]);
    if (existingMember.rows.length === 0) {
      return res.status(404).json({
        error: 'Member Not Found',
        message: 'Member not found'
      });
    }

    const result = await pool.query(
      `UPDATE members 
       SET first_name = $1, last_name = $2, email = $3, phone = $4, membership_type = $5, 
           date_of_birth = $6, address = $7, emergency_contact = $8, emergency_phone = $9, 
           status = $10, updated_at = NOW()
       WHERE id = $11 AND gym_id = $12
       RETURNING *`,
      [firstName, lastName, email, phone, membershipType, dateOfBirth, address, emergencyContact, emergencyPhone, status, id, gymId]
    );

    res.json({
      success: true,
      message: 'Member updated successfully',
      data: { member: result.rows[0] }
    });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update member'
    });
  }
};

// Delete member
const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const gymId = req.user?.gym_id; // Get gym_id from authenticated user

    if (!gymId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Gym ID is required'
      });
    }

    const result = await pool.query('DELETE FROM members WHERE id = $1 AND gym_id = $2 RETURNING *', [id, gymId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Member Not Found',
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      message: 'Member deleted successfully',
      data: { member: result.rows[0] }
    });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete member'
    });
  }
};

// Get member stats for dashboard
const getMemberStats = async (req, res) => {
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
        COUNT(*) as total_members,
        COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_members,
        COUNT(CASE WHEN status = 'Inactive' THEN 1 END) as inactive_members,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_members_this_month
      FROM members
      WHERE gym_id = $1
    `, [gymId]);

    res.json({
      success: true,
      data: stats.rows[0]
    });
  } catch (error) {
    console.error('Get member stats error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch member statistics'
    });
  }
};

// Check in member
const checkInMember = async (req, res) => {
  try {
    const { id } = req.params;
    const gymId = req.user?.gym_id; // Get gym_id from authenticated user

    if (!gymId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Gym ID is required'
      });
    }

    // Check if member exists and is active in this gym
    const memberResult = await pool.query('SELECT * FROM members WHERE id = $1 AND status = $2 AND gym_id = $3', [id, 'Active', gymId]);
    
    if (memberResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Member Not Found',
        message: 'Active member not found'
      });
    }

    const member = memberResult.rows[0];

    // Record check-in in attendance table
    await pool.query(
      'INSERT INTO attendance (member_id, check_in_time, gym_id, created_at) VALUES ($1, NOW(), $2, NOW())',
      [id, gymId]
    );

    res.json({
      success: true,
      message: 'Member checked in successfully',
      data: { 
        member: member,
        checkInTime: new Date().toISOString(),
        action: 'checkin'
      }
    });
  } catch (error) {
    console.error('Check in member error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to check in member'
    });
  }
};

module.exports = {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  getMemberStats,
  checkInMember
};






