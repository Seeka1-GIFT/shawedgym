const pool = require('../config/database');

// Get all gyms (admin only)
const getGyms = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        g.*,
        sp.name as plan_name,
        sp.price as plan_price,
        sp.max_members as plan_max_members,
        COUNT(DISTINCT m.id) as current_members,
        COUNT(DISTINCT p.id) as total_payments,
        COALESCE(SUM(p.amount), 0) as total_revenue
      FROM gyms g
      LEFT JOIN subscription_plans sp ON g.subscription_plan = sp.name
      LEFT JOIN members m ON g.id = m.gym_id
      LEFT JOIN payments p ON g.id = p.gym_id AND p.status = 'completed'
      GROUP BY g.id, g.name, g.owner_email, g.owner_name, g.phone, g.address, 
               g.subscription_plan, g.subscription_status, g.max_members, 
               g.created_at, g.updated_at, sp.name, sp.price, sp.max_members
      ORDER BY g.created_at DESC
    `);

    res.json({
      success: true,
      data: { gyms: result.rows }
    });
  } catch (error) {
    console.error('Get gyms error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch gyms'
    });
  }
};

// Get gym by ID
const getGym = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        g.*,
        sp.name as plan_name,
        sp.price as plan_price,
        sp.max_members as plan_max_members,
        sp.features as plan_features,
        COUNT(DISTINCT m.id) as current_members,
        COUNT(DISTINCT p.id) as total_payments,
        COALESCE(SUM(p.amount), 0) as total_revenue
      FROM gyms g
      LEFT JOIN subscription_plans sp ON g.subscription_plan = sp.name
      LEFT JOIN members m ON g.id = m.gym_id
      LEFT JOIN payments p ON g.id = p.gym_id AND p.status = 'completed'
      WHERE g.id = $1
      GROUP BY g.id, g.name, g.owner_email, g.owner_name, g.phone, g.address, 
               g.subscription_plan, g.subscription_status, g.max_members, 
               g.created_at, g.updated_at, sp.name, sp.price, sp.max_members, sp.features
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Gym Not Found',
        message: 'Gym not found'
      });
    }

    res.json({
      success: true,
      data: { gym: result.rows[0] }
    });
  } catch (error) {
    console.error('Get gym error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch gym'
    });
  }
};

// Create new gym
const createGym = async (req, res) => {
  try {
    const { 
      name, 
      owner_email, 
      owner_name, 
      phone, 
      address, 
      subscription_plan = 'basic' 
    } = req.body;

    // Validation
    if (!name || !owner_email || !owner_name) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name, owner email, and owner name are required'
      });
    }

    // Check if email already exists
    const existingGym = await pool.query('SELECT id FROM gyms WHERE owner_email = $1', [owner_email]);
    if (existingGym.rows.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Gym with this email already exists'
      });
    }

    // Get plan details
    const planResult = await pool.query('SELECT * FROM subscription_plans WHERE name = $1', [subscription_plan]);
    if (planResult.rows.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid subscription plan'
      });
    }

    const plan = planResult.rows[0];

    const result = await pool.query(
      `INSERT INTO gyms 
       (name, owner_email, owner_name, phone, address, subscription_plan, max_members) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [name, owner_email, owner_name, phone, address, subscription_plan, plan.max_members]
    );

    const gym = result.rows[0];

    // Create subscription record
    await pool.query(
      `INSERT INTO gym_subscriptions (gym_id, plan_id, status, end_date)
       VALUES ($1, $2, 'active', NOW() + INTERVAL '1 month')`,
      [gym.id, plan.id]
    );

    res.status(201).json({
      success: true,
      message: 'Gym created successfully',
      data: { gym }
    });
  } catch (error) {
    console.error('Create gym error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create gym'
    });
  }
};

// Update gym
const updateGym = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      owner_name, 
      phone, 
      address, 
      subscription_plan,
      subscription_status 
    } = req.body;

    // Check if gym exists
    const existingGym = await pool.query('SELECT id FROM gyms WHERE id = $1', [id]);
    if (existingGym.rows.length === 0) {
      return res.status(404).json({
        error: 'Gym Not Found',
        message: 'Gym not found'
      });
    }

    const result = await pool.query(
      `UPDATE gyms 
       SET name = $1, owner_name = $2, phone = $3, address = $4, 
           subscription_plan = $5, subscription_status = $6, updated_at = NOW()
       WHERE id = $7 
       RETURNING *`,
      [name, owner_name, phone, address, subscription_plan, subscription_status, id]
    );

    res.json({
      success: true,
      message: 'Gym updated successfully',
      data: { gym: result.rows[0] }
    });
  } catch (error) {
    console.error('Update gym error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update gym'
    });
  }
};

// Delete gym
const deleteGym = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM gyms WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Gym Not Found',
        message: 'Gym not found'
      });
    }

    res.json({
      success: true,
      message: 'Gym deleted successfully',
      data: { gym: result.rows[0] }
    });
  } catch (error) {
    console.error('Delete gym error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete gym'
    });
  }
};

// Get subscription plans
const getSubscriptionPlans = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subscription_plans ORDER BY price ASC');
    
    res.json({
      success: true,
      data: { plans: result.rows }
    });
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch subscription plans'
    });
  }
};

// Get gym statistics
const getGymStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        g.name,
        g.subscription_plan,
        g.subscription_status,
        g.max_members,
        COUNT(DISTINCT m.id) as current_members,
        COUNT(DISTINCT CASE WHEN m.status = 'Active' THEN m.id END) as active_members,
        COUNT(DISTINCT p.id) as total_payments,
        COALESCE(SUM(p.amount), 0) as total_revenue,
        COUNT(DISTINCT c.id) as total_classes,
        COUNT(DISTINCT t.id) as total_trainers,
        COUNT(DISTINCT a.id) as total_assets
      FROM gyms g
      LEFT JOIN members m ON g.id = m.gym_id
      LEFT JOIN payments p ON g.id = p.gym_id AND p.status = 'completed'
      LEFT JOIN classes c ON g.id = c.gym_id
      LEFT JOIN trainers t ON g.id = t.gym_id
      LEFT JOIN assets a ON g.id = a.gym_id
      WHERE g.id = $1
      GROUP BY g.id, g.name, g.subscription_plan, g.subscription_status, g.max_members
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Gym Not Found',
        message: 'Gym not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get gym stats error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch gym statistics'
    });
  }
};

module.exports = {
  getGyms,
  getGym,
  createGym,
  updateGym,
  deleteGym,
  getSubscriptionPlans,
  getGymStats
};
