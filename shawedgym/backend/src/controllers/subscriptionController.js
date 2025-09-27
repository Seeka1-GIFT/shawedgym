const pool = require('../config/database');

// Get all subscription plans
const getSubscriptionPlans = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        sp.*,
        COUNT(gs.id) as active_subscriptions
      FROM subscription_plans sp
      LEFT JOIN gym_subscriptions gs ON sp.id = gs.plan_id AND gs.status = 'active'
      GROUP BY sp.id, sp.name, sp.price, sp.max_members, sp.features, sp.created_at
      ORDER BY sp.price ASC
    `);

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

// Get subscription plan by ID
const getSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('SELECT * FROM subscription_plans WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Plan Not Found',
        message: 'Subscription plan not found'
      });
    }

    res.json({
      success: true,
      data: { plan: result.rows[0] }
    });
  } catch (error) {
    console.error('Get subscription plan error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch subscription plan'
    });
  }
};

// Create new subscription plan (Admin only)
const createSubscriptionPlan = async (req, res) => {
  try {
    const { name, price, max_members, features } = req.body;

    // Validation
    if (!name || !price || !max_members) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name, price, and max_members are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO subscription_plans (name, price, max_members, features, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING *`,
      [name, price, max_members, JSON.stringify(features || [])]
    );

    res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully',
      data: { plan: result.rows[0] }
    });
  } catch (error) {
    console.error('Create subscription plan error:', error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({
        error: 'Validation Error',
        message: 'A subscription plan with this name already exists'
      });
    }
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create subscription plan'
    });
  }
};

// Update subscription plan (Admin only)
const updateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, max_members, features } = req.body;

    // Check if plan exists
    const existingPlan = await pool.query('SELECT id FROM subscription_plans WHERE id = $1', [id]);
    if (existingPlan.rows.length === 0) {
      return res.status(404).json({
        error: 'Plan Not Found',
        message: 'Subscription plan not found'
      });
    }

    const result = await pool.query(
      `UPDATE subscription_plans 
       SET name = $1, price = $2, max_members = $3, features = $4
       WHERE id = $5 
       RETURNING *`,
      [name, price, max_members, JSON.stringify(features || []), id]
    );

    res.json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: { plan: result.rows[0] }
    });
  } catch (error) {
    console.error('Update subscription plan error:', error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({
        error: 'Validation Error',
        message: 'A subscription plan with this name already exists'
      });
    }
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update subscription plan'
    });
  }
};

// Delete subscription plan (Admin only)
const deleteSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if plan is being used by any gyms
    const usageCheck = await pool.query(
      'SELECT COUNT(*) as count FROM gym_subscriptions WHERE plan_id = $1 AND status = $2',
      [id, 'active']
    );

    if (parseInt(usageCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'Cannot Delete',
        message: 'This subscription plan is currently being used by active gyms'
      });
    }

    const result = await pool.query('DELETE FROM subscription_plans WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Plan Not Found',
        message: 'Subscription plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Subscription plan deleted successfully',
      data: { plan: result.rows[0] }
    });
  } catch (error) {
    console.error('Delete subscription plan error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete subscription plan'
    });
  }
};

// Get gym's current subscription
const getGymSubscription = async (req, res) => {
  try {
    const gymId = req.user?.gym_id;

    if (!gymId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Gym ID is required'
      });
    }

    const result = await pool.query(`
      SELECT 
        gs.*,
        sp.name as plan_name,
        sp.price as plan_price,
        sp.max_members,
        sp.features
      FROM gym_subscriptions gs
      JOIN subscription_plans sp ON gs.plan_id = sp.id
      WHERE gs.gym_id = $1 AND gs.status = 'active'
      ORDER BY gs.start_date DESC
      LIMIT 1
    `, [gymId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'No Active Subscription',
        message: 'No active subscription found for this gym'
      });
    }

    res.json({
      success: true,
      data: { subscription: result.rows[0] }
    });
  } catch (error) {
    console.error('Get gym subscription error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch gym subscription'
    });
  }
};

// Subscribe gym to a plan
const subscribeGym = async (req, res) => {
  try {
    const { plan_id } = req.body;
    const gymId = req.user?.gym_id;

    if (!gymId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Gym ID is required'
      });
    }

    if (!plan_id) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Plan ID is required'
      });
    }

    // Verify plan exists
    const planResult = await pool.query('SELECT * FROM subscription_plans WHERE id = $1', [plan_id]);
    if (planResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Plan Not Found',
        message: 'Subscription plan not found'
      });
    }

    const plan = planResult.rows[0];

    // Deactivate current subscription if exists
    await pool.query(
      'UPDATE gym_subscriptions SET status = $1, end_date = NOW() WHERE gym_id = $2 AND status = $3',
      ['inactive', gymId, 'active']
    );

    // Create new subscription
    const result = await pool.query(
      `INSERT INTO gym_subscriptions 
       (gym_id, plan_id, status, start_date, end_date, auto_renew, created_at) 
       VALUES ($1, $2, 'active', NOW(), NOW() + INTERVAL '1 month', true, NOW()) 
       RETURNING *`,
      [gymId, plan_id]
    );

    // Update gym's subscription info
    await pool.query(
      'UPDATE gyms SET subscription_plan_id = $1, subscription_status = $2 WHERE id = $3',
      [plan_id, 'active', gymId]
    );

    res.status(201).json({
      success: true,
      message: 'Gym subscribed successfully',
      data: { 
        subscription: result.rows[0],
        plan: plan
      }
    });
  } catch (error) {
    console.error('Subscribe gym error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to subscribe gym'
    });
  }
};

// Cancel gym subscription
const cancelSubscription = async (req, res) => {
  try {
    const gymId = req.user?.gym_id;

    if (!gymId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Gym ID is required'
      });
    }

    const result = await pool.query(
      `UPDATE gym_subscriptions 
       SET status = $1, end_date = NOW(), auto_renew = false
       WHERE gym_id = $2 AND status = $3
       RETURNING *`,
      ['cancelled', gymId, 'active']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'No Active Subscription',
        message: 'No active subscription found to cancel'
      });
    }

    // Update gym's subscription status
    await pool.query(
      'UPDATE gyms SET subscription_status = $1 WHERE id = $2',
      ['cancelled', gymId]
    );

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: { subscription: result.rows[0] }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to cancel subscription'
    });
  }
};

// Get subscription usage statistics
const getSubscriptionUsage = async (req, res) => {
  try {
    const gymId = req.user?.gym_id;

    if (!gymId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Gym ID is required'
      });
    }

    // Get current subscription
    const subscriptionResult = await pool.query(`
      SELECT 
        gs.*,
        sp.name as plan_name,
        sp.max_members,
        sp.features
      FROM gym_subscriptions gs
      JOIN subscription_plans sp ON gs.plan_id = sp.id
      WHERE gs.gym_id = $1 AND gs.status = 'active'
      ORDER BY gs.start_date DESC
      LIMIT 1
    `, [gymId]);

    if (subscriptionResult.rows.length === 0) {
      return res.status(404).json({
        error: 'No Active Subscription',
        message: 'No active subscription found'
      });
    }

    const subscription = subscriptionResult.rows[0];

    // Get usage statistics
    const usageResult = await pool.query(`
      SELECT 
        COUNT(*) as total_members,
        COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_members,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_members_this_month
      FROM members
      WHERE gym_id = $1
    `, [gymId]);

    const usage = usageResult.rows[0];
    const usagePercentage = Math.round((usage.active_members / subscription.max_members) * 100);

    res.json({
      success: true,
      data: {
        subscription,
        usage: {
          ...usage,
          max_members: subscription.max_members,
          usage_percentage: usagePercentage,
          remaining_members: subscription.max_members - usage.active_members
        }
      }
    });
  } catch (error) {
    console.error('Get subscription usage error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch subscription usage'
    });
  }
};

module.exports = {
  getSubscriptionPlans,
  getSubscriptionPlan,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getGymSubscription,
  subscribeGym,
  cancelSubscription,
  getSubscriptionUsage
};
