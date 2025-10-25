const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET || 'shawedgym_super_secret_key_2024',
    { expiresIn: '7d' }
  );
};

// Register user
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'user' } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email, password, first name, and last name are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'Registration Error',
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create individual gym for ALL users using transaction
    let gymId;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      console.log('Creating new gym for user:', email);
      
      // Create new gym for user (using only existing columns)
      const gymResult = await client.query(
        `INSERT INTO gyms (name, owner_email, owner_name) 
         VALUES ($1, $2, $3) 
         RETURNING id`,
        [`${firstName}'s Gym`, email, `${firstName} ${lastName}`]
      );
      gymId = gymResult.rows[0].id;
      console.log('Created gym with ID:', gymId);
      
      await client.query('COMMIT');
      console.log('Transaction committed successfully');
      
    } catch (gymError) {
      await client.query('ROLLBACK');
      console.error('Gym creation error:', gymError);
      console.error('Gym error details:', gymError.message);
      console.error('Gym error code:', gymError.code);
      
      // Fallback: assign to gym_id = 1 if gym creation fails
      gymId = 1;
      console.log('Fallback: using gym_id = 1');
    } finally {
      client.release();
    }

    // Create user with appropriate gym_id
    const result = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, role, gym_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id, email, first_name, last_name, role, gym_id, created_at',
      [email, hashedPassword, firstName, lastName, role, gymId]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        gym_id: user.gym_id,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          gym_id: user.gym_id
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to register user'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required'
      });
    }

    // Find user with gym_id
    console.log('Login attempt for email:', email);
    const result = await pool.query(
      'SELECT id, email, password, first_name, last_name, role, gym_id FROM users WHERE email = $1',
      [email]
    );
    console.log('User query result:', result.rows.length > 0 ? 'User found' : 'User not found');

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];
    console.log('User found:', { id: user.id, email: user.email, role: user.role, gym_id: user.gym_id });

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password check result:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.id);
    console.log('Token generated successfully');

    const response = {
      success: true,
      message: 'Login successful',
      data: {
        token,
        gym_id: user.gym_id,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          gym_id: user.gym_id
        }
      }
    };
    
    console.log('Login response prepared:', { 
      success: response.success, 
      user_id: response.data.user.id, 
      gym_id: response.data.gym_id 
    });
    
    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to login'
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role, gym_id, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          gym_id: user.gym_id,
          createdAt: user.created_at
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get user information'
    });
  }
};

// Register gym owner (creates user + gym)
const registerGymOwner = async (req, res) => {
  try {
    const { 
      first_name, 
      last_name, 
      email, 
      password, 
      role = 'admin',
      gym_name,
      gym_phone,
      gym_address,
      subscription_plan = 'basic'
    } = req.body;

    // Validation
    if (!first_name || !last_name || !email || !password || !gym_name || !gym_phone || !gym_address) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'All fields are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'User already exists'
      });
    }

    // Check if gym with same email already exists
    const existingGym = await pool.query('SELECT id FROM gyms WHERE owner_email = $1', [email]);
    if (existingGym.rows.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Gym with this email already exists'
      });
    }

    // Get subscription plan details
    const planResult = await pool.query('SELECT * FROM subscription_plans WHERE name = $1', [subscription_plan]);
    if (planResult.rows.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid subscription plan'
      });
    }

    const plan = planResult.rows[0];

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create gym first
      const gymResult = await client.query(
        `INSERT INTO gyms 
         (name, owner_email, owner_name, phone, address, subscription_plan_id, max_members) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id`,
        [gym_name, email, `${first_name} ${last_name}`, gym_phone, gym_address, plan.id, plan.member_limit]
      );

      const gymId = gymResult.rows[0].id;

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user with gym_id
      const userResult = await client.query(
        'INSERT INTO users (first_name, last_name, email, password, role, gym_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id, first_name, last_name, email, role, gym_id, created_at',
        [first_name, last_name, email, hashedPassword, role, gymId]
      );

      const user = userResult.rows[0];

      // Create subscription record
      await client.query(
        `INSERT INTO gym_subscriptions (gym_id, plan_id, status, end_date)
         VALUES ($1, $2, 'active', NOW() + INTERVAL '1 month')`,
        [gymId, plan.id]
      );

      await client.query('COMMIT');

      // Generate token
      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        message: 'Gym owner registered successfully',
        data: {
          token,
          gym_id: user.gym_id,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            gym_id: user.gym_id
          },
          gym: {
            id: gymId,
            name: gym_name,
            owner_email: email,
            owner_name: `${first_name} ${last_name}`,
            phone: gym_phone,
            address: gym_address,
            subscription_plan_id: plan.id
          }
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Register gym owner error:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to register gym owner',
      details: error.message,
      code: error.code
    });
  }
};

// Reset user password (Admin only)
const resetUserPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    // Check if requester is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can reset passwords'
      });
    }

    if (!userId || !newPassword) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'User ID and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user exists AND belongs to the same gym
    const userCheck = await pool.query(
      'SELECT id, email, first_name, last_name, role, gym_id FROM users WHERE id = $1', 
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    const user = userCheck.rows[0];
    
    // Verify user belongs to the same gym
    if (user.gym_id !== req.user.gym_id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only reset passwords for users in your gym'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, userId]
    );

    console.log(`Password reset by admin for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        userId: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`
      }
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to reset password'
    });
  }
};

module.exports = {
  register,
  registerGymOwner,
  login,
  getCurrentUser,
  resetUserPassword
};






