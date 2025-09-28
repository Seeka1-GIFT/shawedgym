const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function ensureTablesExist() {
  console.log('🔧 Ensuring all required tables exist...\n');

  try {
    // 1. Create subscription_plans table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        price DECIMAL(10,2) NOT NULL,
        member_limit INTEGER NOT NULL,
        features TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ subscription_plans table verified');

    // 2. Create gyms table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gyms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        owner_email VARCHAR(255) NOT NULL UNIQUE,
        owner_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        subscription_plan_id INTEGER REFERENCES subscription_plans(id),
        max_members INTEGER DEFAULT 50,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ gyms table verified');

    // 3. Create gym_subscriptions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gym_subscriptions (
        id SERIAL PRIMARY KEY,
        gym_id INTEGER REFERENCES gyms(id) ON DELETE CASCADE,
        plan_id INTEGER REFERENCES subscription_plans(id),
        status VARCHAR(50) DEFAULT 'active',
        start_date TIMESTAMP DEFAULT NOW(),
        end_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ gym_subscriptions table verified');

    // 4. Ensure subscription plans exist
    const planCount = await pool.query('SELECT COUNT(*) FROM subscription_plans');
    if (planCount.rows[0].count === '0') {
      await pool.query(`
        INSERT INTO subscription_plans (name, price, member_limit, features) VALUES
        ('basic', 35.00, 50, ARRAY['Basic gym management', 'Member tracking', 'Payment processing']),
        ('premium', 75.00, 150, ARRAY['Advanced analytics', 'Class scheduling', 'Trainer management', 'Equipment tracking']),
        ('enterprise', 150.00, 500, ARRAY['Multi-location support', 'Advanced reporting', 'API access', 'Custom integrations'])
      `);
      console.log('✅ Default subscription plans inserted');
    } else {
      console.log('✅ Subscription plans already exist');
    }

    // 5. Verify tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('subscription_plans', 'gyms', 'gym_subscriptions', 'users')
      ORDER BY table_name
    `);
    
    console.log('\n📋 Verified tables:');
    tables.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    console.log('\n🎉 All tables verified successfully!');

  } catch (error) {
    console.error('❌ Error ensuring tables:', error);
    console.error('Error details:', error.message);
  } finally {
    await pool.end();
  }
}

ensureTablesExist();
