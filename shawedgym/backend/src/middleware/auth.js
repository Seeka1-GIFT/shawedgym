const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'No valid token provided' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shawedgym_super_secret_key_2024');
      
      // Verify user still exists in database and get gym_id
      const userQuery = 'SELECT id, email, role, gym_id FROM users WHERE id = $1';
      const userResult = await pool.query(userQuery, [decoded.userId]);
      
      if (userResult.rows.length === 0) {
        return res.status(401).json({ 
          error: 'Access denied', 
          message: 'User no longer exists' 
        });
      }
      
      const user = userResult.rows[0];
      
      console.log('Auth Check: User authenticated:', { id: user.id, email: user.email, role: user.role, gym_id: user.gym_id });
      req.user = user;
      next();
    } catch (jwtError) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Invalid token' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Authentication failed' 
    });
  }
};

// Variant: allow authenticated users even if they don't yet have a gym_id
const authAllowMissingGym = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied', message: 'No valid token provided' });
    }
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shawedgym_super_secret_key_2024');
    const userResult = await pool.query('SELECT id, email, role, gym_id FROM users WHERE id = $1', [decoded.userId]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Access denied', message: 'User no longer exists' });
    }
    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('AuthAllowMissingGym error:', error);
    return res.status(401).json({ error: 'Access denied', message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
module.exports.authAllowMissingGym = authAllowMissingGym;






