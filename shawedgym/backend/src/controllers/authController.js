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

    // Create user with default gym_id = 1
    const result = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, role, gym_id, created_at) VALUES ($1, $2, $3, $4, $5, 1, NOW()) RETURNING id, email, first_name, last_name, role, gym_id, created_at',
      [email, hashedPassword, firstName, lastName, role]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
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

module.exports = {
  register,
  login,
  getCurrentUser
};






