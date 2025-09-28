const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixSubscriptionPlans() {
  console.log('🔧 Fixing subscription plans table...\n');

  try {
    // Create subscription_plans table if it doesn't exist
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

    // Clear existing data and insert fresh plans
    await pool.query('DELETE FROM subscription_plans');
    console.log('✅ Cleared existing subscription plans');

    // Insert default subscription plans
    await pool.query(`
      INSERT INTO subscription_plans (name, price, member_limit, features) VALUES
      ('basic', 35.00, 50, ARRAY['Basic gym management', 'Member tracking', 'Payment processing']),
      ('premium', 75.00, 150, ARRAY['Advanced analytics', 'Class scheduling', 'Trainer management', 'Equipment tracking']),
      ('enterprise', 150.00, 500, ARRAY['Multi-location support', 'Advanced reporting', 'API access', 'Custom integrations'])
    `);
    console.log('✅ Inserted default subscription plans');

    // Verify the data
    const result = await pool.query('SELECT * FROM subscription_plans ORDER BY price');
    console.log('\n📋 Current subscription plans:');
    result.rows.forEach(plan => {
      console.log(`  - ${plan.name}: $${plan.price}/month (${plan.member_limit} members)`);
    });

    console.log('\n🎉 Subscription plans fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing subscription plans:', error);
  } finally {
    await pool.end();
  }
}

fixSubscriptionPlans();
