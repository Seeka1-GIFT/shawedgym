const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupGymSchema() {
  console.log('🔧 Setting up gym schema for individual gym creation...\n');

  try {
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'setup-gym-schema.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const result = await pool.query(statement);
          if (result.rows && result.rows.length > 0) {
            console.log('✅ Result:', result.rows[0]);
          }
        } catch (error) {
          // Some statements might fail if tables already exist, which is fine
          if (!error.message.includes('already exists') && !error.message.includes('duplicate key')) {
            console.log('⚠️  Statement warning:', error.message);
          }
        }
      }
    }

    // Verify the setup
    console.log('\n📋 Verifying setup...');
    
    const usersCount = await pool.query('SELECT COUNT(*) as count FROM users WHERE gym_id IS NOT NULL');
    console.log(`✅ Users with gym_id: ${usersCount.rows[0].count}`);
    
    const gymsCount = await pool.query('SELECT COUNT(*) as count FROM gyms');
    console.log(`✅ Gyms created: ${gymsCount.rows[0].count}`);
    
    const plansCount = await pool.query('SELECT COUNT(*) as count FROM subscription_plans');
    console.log(`✅ Subscription plans: ${plansCount.rows[0].count}`);
    
    // Show current users and their gym_ids
    const users = await pool.query('SELECT id, email, first_name, last_name, role, gym_id FROM users ORDER BY id');
    console.log('\n👥 Current users:');
    users.rows.forEach(user => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Gym ID: ${user.gym_id}`);
    });
    
    // Show current gyms
    const gyms = await pool.query('SELECT id, name, owner_email, owner_name FROM gyms ORDER BY id');
    console.log('\n🏢 Current gyms:');
    gyms.rows.forEach(gym => {
      console.log(`  - ID: ${gym.id}, Name: ${gym.name}, Owner: ${gym.owner_email}`);
    });

    console.log('\n🎉 Gym schema setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up gym schema:', error);
    console.error('Error details:', error.message);
  } finally {
    await pool.end();
  }
}

setupGymSchema();
