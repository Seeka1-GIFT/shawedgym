const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkCurrentGyms() {
  console.log('🔍 Checking current gyms and users...\n');

  try {
    // Check users table
    const users = await pool.query('SELECT id, email, first_name, last_name, role, gym_id FROM users ORDER BY id');
    console.log('👥 Current users:');
    users.rows.forEach(user => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Gym ID: ${user.gym_id}`);
    });

    // Check gyms table
    const gyms = await pool.query('SELECT id, name, owner_email, owner_name FROM gyms ORDER BY id');
    console.log('\n🏢 Current gyms:');
    gyms.rows.forEach(gym => {
      console.log(`  - ID: ${gym.id}, Name: ${gym.name}, Owner: ${gym.owner_email}`);
    });

    // Check gym_subscriptions table
    const subscriptions = await pool.query('SELECT id, gym_id, plan_id, status FROM gym_subscriptions ORDER BY id');
    console.log('\n📋 Current subscriptions:');
    subscriptions.rows.forEach(sub => {
      console.log(`  - Gym ID: ${sub.gym_id}, Plan ID: ${sub.plan_id}, Status: ${sub.status}`);
    });

    // Check subscription_plans table
    const plans = await pool.query('SELECT id, name, price, member_limit FROM subscription_plans ORDER BY id');
    console.log('\n💳 Available subscription plans:');
    plans.rows.forEach(plan => {
      console.log(`  - ID: ${plan.id}, Name: ${plan.name}, Price: $${plan.price}, Limit: ${plan.member_limit}`);
    });

  } catch (error) {
    console.error('❌ Error checking database:', error);
    console.error('Error details:', error.message);
  } finally {
    await pool.end();
  }
}

checkCurrentGyms();
