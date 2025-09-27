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
      
      // Check if user has gym_id (required for multi-tenant)
      if (!user.gym_id) {
        console.log('Auth Check: User missing gym_id:', user);
        return res.status(401).json({ 
          error: 'Access denied', 
          message: 'User not assigned to any gym' 
        });
      }
      
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

module.exports = authMiddleware;






