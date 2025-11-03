const pool = require('../config/database');

// Ensure members table has columns required by the app
let membersSchemaEnsured = false;
async function ensureMembersSchema() {
  if (membersSchemaEnsured) return;
  try {
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='members' AND column_name='registered_at'
        ) THEN
          ALTER TABLE members ADD COLUMN registered_at TIMESTAMP WITH TIME ZONE;
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='members' AND column_name='plan_expires_at'
        ) THEN
          ALTER TABLE members ADD COLUMN plan_expires_at TIMESTAMP WITH TIME ZONE;
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='members' AND column_name='face_id'
        ) THEN
          ALTER TABLE members ADD COLUMN face_id VARCHAR(100);
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='members' AND column_name='photo_url'
        ) THEN
          ALTER TABLE members ADD COLUMN photo_url TEXT;
        END IF;
      END$$;
    `);
    membersSchemaEnsured = true;
  } catch (e) {
    console.error('ensureMembersSchema error:', e);
  }
}

// Get all members
const getMembers = async (req, res) => {
  try {
    console.log('getMembers called with user:', req.user);
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    const gymId = req.user?.gym_id; // Get gym_id from authenticated user

    console.log('getMembers - gymId:', gymId, 'user:', req.user);

    if (!gymId) {
      console.log('getMembers - No gym_id found in user object');
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Gym ID is required'
      });
    }

    let query = 'SELECT * FROM members WHERE gym_id = $1';
    let countQuery = 'SELECT COUNT(*) FROM members WHERE gym_id = $1';
    let queryParams = [gymId];
    let paramIndex = 2;
    
    console.log('getMembers - Executing query with gymId:', gymId);

    // Search filter
    if (search) {
      query += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
      countQuery += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(parseInt(limit), offset);

    console.log('getMembers - Final query:', query);
    console.log('getMembers - Query params:', queryParams);
    
    const [membersResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2))
    ]);

    console.log('getMembers - Query results:', {
      membersCount: membersResult.rows.length,
      totalCount: countResult.rows[0]?.count
    });

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
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch members',
      details: error.message
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
    await ensureMembersSchema();
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
      registrationFee,
      planId,
      paymentMethod,
      // New optional fields for device integration and membership tracking
      registered_at,
      external_person_id,
      photo_url
    } = req.body;
    // Support both registrationFee and registration_fee; default to 0 when empty
    const registrationFeeRaw = req.body.registration_fee ?? registrationFee;
    const registrationFeeValue = (registrationFeeRaw !== undefined && registrationFeeRaw !== null && `${registrationFeeRaw}`.trim() !== '')
      ? parseFloat(registrationFeeRaw)
      : 0;
    const gymId = req.user?.gym_id; // Get gym_id from authenticated user

    if (!gymId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Gym ID is required'
      });
    }

    // Validation (email, address, registrationFee optional)
    if (!firstName || !lastName || !phone) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'First name, last name, and phone are required'
      });
    }

    // Normalize optional fields
    // Email: store empty string when empty to satisfy NOT NULL constraint
    const normalizedEmail = (email && email.trim()) ? email.trim() : '';
    // Address: allow NULL when empty
    const normalizedAddress = (address || '').trim() || null;
    // Date of birth: ensure NULL when empty/invalid
    const normalizedDob = dateOfBirth ? new Date(dateOfBirth) : null;

    // Check if email already exists in this gym (only when provided and not empty)
    if (normalizedEmail && normalizedEmail.trim() !== '') {
      const existingMember = await pool.query('SELECT id FROM members WHERE email = $1 AND gym_id = $2', [normalizedEmail, gymId]);
      if (existingMember.rows.length > 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Member with this email already exists'
        });
      }
    }

    // Insert with unique email to avoid duplicate constraint
    const uniqueEmail = normalizedEmail + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Determine membership start/end
    const startAt = registered_at ? new Date(registered_at) : new Date();
    let expiresAt = null;

    // Derive plan duration in days from plans.duration if available, default 30 days
    try {
      if (planId) {
        const planRes = await pool.query('SELECT duration FROM plans WHERE id = $1 AND gym_id = $2', [planId, gymId]);
        if (planRes.rows.length) {
          const months = Number(planRes.rows[0].duration) || 1; // duration stored as months
          const tmp = new Date(startAt);
          tmp.setMonth(tmp.getMonth() + months);
          expiresAt = tmp;
        }
      }
    } catch (e) {
      // fallback: 30 days
      const tmp = new Date(startAt);
      tmp.setDate(tmp.getDate() + 30);
      expiresAt = tmp;
    }

    const result = await pool.query(
      `INSERT INTO members (
         first_name, last_name, email, phone, membership_type, status,
         gym_id, created_at, registered_at, plan_expires_at, face_id, photo_url
       ) 
       VALUES ($1, $2, $3, $4, 'Standard', 'Active', $5, NOW(), $6, $7, $8, $9) 
       RETURNING *`,
      [firstName, lastName, uniqueEmail, phone, gymId, startAt, expiresAt, external_person_id || null, photo_url || null]
    );

    const member = result.rows[0];

    // Create a SINGLE payment that combines Registration Fee + first Membership payment
    try {
      let plan = null;
      if (planId) {
        // Prefer explicit plan id scoped to this gym
        const planById = await pool.query(
          `SELECT id, name, price FROM plans WHERE id = $1 AND gym_id = $2 LIMIT 1`,
          [planId, gymId]
        );
        if (planById.rows.length > 0) plan = planById.rows[0];
      }

      const reg = Number(registrationFeeValue) || 0;
      const planAmount = plan ? Number(plan.price) : 0;
      const totalAmount = reg + planAmount;

      // Only create payment if there's a fee or plan amount
      if (totalAmount > 0) {
        const countRes = await pool.query('SELECT COUNT(*) FROM payments');
        const prefix = plan ? 'SUB' : 'REG';
        const receiptNumber = `${prefix}${String(parseInt(countRes.rows[0].count) + 1).padStart(6, '0')}`;
        // Encode amounts in description so frontend can separate on receipt
        const desc = plan
          ? `PLAN:${planAmount};RG:${reg}; ${plan.name} Membership${reg > 0 ? ' + Registration Fee' : ''}`
          : `RG:${reg}; Registration fee`;
        await pool.query(
          `INSERT INTO payments (member_id, amount, method, description, plan_id, receipt_number, status, payment_date, gym_id, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'completed', CURRENT_DATE, $7, NOW())`,
          [member.id, totalAmount, paymentMethod || 'EVC-PLUS', desc, plan ? plan.id : null, receiptNumber, gymId]
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
    console.error('Create member error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      table: error.table
    });
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
    // Accept both the simplified Edit form fields and legacy fields; only update what is provided
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
      status,
      // New optional fields
      registered_at,
      plan_expires_at,
      external_person_id,
      photo_url,
      // When provided, also sync latest payment method
      paymentMethod
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

    // Use COALESCE so that missing fields don't overwrite NOT NULL columns (e.g., email)
    const result = await pool.query(
      `UPDATE members
       SET 
         first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         email = COALESCE($3, email),
         phone = COALESCE($4, phone),
         membership_type = COALESCE($5, membership_type),
         date_of_birth = COALESCE($6, date_of_birth),
         address = COALESCE($7, address),
         emergency_contact = COALESCE($8, emergency_contact),
         emergency_phone = COALESCE($9, emergency_phone),
         status = COALESCE($10, status),
         registered_at = COALESCE($11, registered_at),
         plan_expires_at = COALESCE($12, plan_expires_at),
         face_id = COALESCE($13, face_id),
         photo_url = COALESCE($14, photo_url),
         updated_at = NOW()
       WHERE id = $15 AND gym_id = $16
       RETURNING *`,
      [
        firstName ?? null,
        lastName ?? null,
        email ?? null,
        phone ?? null,
        membershipType ?? null,
        dateOfBirth ?? null,
        address ?? null,
        emergencyContact ?? null,
        emergencyPhone ?? null,
        status ?? null,
        registered_at ?? null,
        plan_expires_at ?? null,
        external_person_id ?? null,
        photo_url ?? null,
        id,
        gymId
      ]
    );

    // If a paymentMethod is provided, update the latest payment for this member in this gym
    try {
      if (paymentMethod && String(paymentMethod).trim()) {
        const lastPayment = await pool.query(
          `SELECT id FROM payments WHERE member_id = $1 AND gym_id = $2 ORDER BY created_at DESC LIMIT 1`,
          [id, gymId]
        );
        if (lastPayment.rows.length > 0) {
          await pool.query(
            `UPDATE payments SET method = $1, updated_at = NOW() WHERE id = $2 AND gym_id = $3`,
            [paymentMethod, lastPayment.rows[0].id, gymId]
          );
        }
      }
    } catch (syncErr) {
      console.error('Sync payment method on updateMember failed:', syncErr);
    }

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






