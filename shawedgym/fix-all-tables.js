const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixAllTables() {
  console.log('🔧 Fixing all required tables for gym owner registration...\n');

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
    console.log('✅ subscription_plans table created/verified');

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
    console.log('✅ gyms table created/verified');

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
    console.log('✅ gym_subscriptions table created/verified');

    // 4. Clear and insert subscription plans
    await pool.query('DELETE FROM subscription_plans');
    await pool.query(`
      INSERT INTO subscription_plans (name, price, member_limit, features) VALUES
      ('basic', 35.00, 50, ARRAY['Basic gym management', 'Member tracking', 'Payment processing']),
      ('premium', 75.00, 150, ARRAY['Advanced analytics', 'Class scheduling', 'Trainer management', 'Equipment tracking']),
      ('enterprise', 150.00, 500, ARRAY['Multi-location support', 'Advanced reporting', 'API access', 'Custom integrations'])
    `);
    console.log('✅ Subscription plans inserted');

    // 5. Verify tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('subscription_plans', 'gyms', 'gym_subscriptions', 'users')
      ORDER BY table_name
    `);
    
    console.log('\n📋 Existing tables:');
    tables.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    // 6. Test subscription plan query
    const plans = await pool.query('SELECT * FROM subscription_plans WHERE name = $1', ['basic']);
    console.log(`\n✅ Basic plan found: ${plans.rows.length > 0 ? 'Yes' : 'No'}`);
    if (plans.rows.length > 0) {
      console.log(`   Plan details: $${plans.rows[0].price}/month, ${plans.rows[0].member_limit} members`);
    }

    console.log('\n🎉 All tables fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing tables:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
  } finally {
    await pool.end();
  }
}

fixAllTables();
