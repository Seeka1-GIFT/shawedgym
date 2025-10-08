const pool = require('../config/database');

// Get all plans (tenant-aware). If the user has a gym_id, only return plans they created.
// Otherwise, return an empty list so a new owner sees no default plans.
const getPlans = async (req, res) => {
  try {
    const gymId = req.user?.gym_id;
    let result;
    if (gymId) {
      // Assume plans table has gym_id column. If it doesn't, this will return zero, which is acceptable for new users.
      result = await pool.query('SELECT * FROM plans WHERE gym_id = $1 ORDER BY price ASC', [gymId]);
    } else {
      // No gym context → empty list
      result = { rows: [] };
    }

    res.json({
      success: true,
      data: { plans: result.rows }
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch plans'
    });
  }
};

// Get plan by ID
const getPlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('SELECT * FROM plans WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Plan Not Found',
        message: 'Plan not found'
      });
    }

    res.json({
      success: true,
      data: { plan: result.rows[0] }
    });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch plan'
    });
  }
};

// Create new plan (associate with the creator's gym)
const createPlan = async (req, res) => {
  try {
    const { name, price, duration, features, description } = req.body;
    const gymId = req.user?.gym_id;

    if (!name || !price || !duration) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name, price, and duration are required'
      });
    }

    const result = await pool.query(
      'INSERT INTO plans (name, price, duration, features, description, gym_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [name, price, duration, JSON.stringify(features), description || '', gymId || null]
    );

    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: { plan: result.rows[0] }
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create plan'
    });
  }
};

// Update plan
const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, duration, features, description, status } = req.body;

    const result = await pool.query(
      'UPDATE plans SET name = $1, price = $2, duration = $3, features = $4, description = $5, status = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [name, price, duration, JSON.stringify(features), description, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Plan Not Found',
        message: 'Plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Plan updated successfully',
      data: { plan: result.rows[0] }
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update plan'
    });
  }
};

// Delete plan
const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM plans WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Plan Not Found',
        message: 'Plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Plan deleted successfully',
      data: { plan: result.rows[0] }
    });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete plan'
    });
  }
};

module.exports = {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan
};






