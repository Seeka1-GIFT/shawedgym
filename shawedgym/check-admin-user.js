// Check if admin user exists and has correct password
const { Pool } = require('pg');

// Database connection - Update this with your actual DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'YOUR_ACTUAL_DATABASE_URL_HERE',
  ssl: { rejectUnauthorized: false }
});

async function checkAdminUser() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking admin user in database...');
    
    // Check if admin user exists
    const userResult = await client.query(`
      SELECT id, email, role, gym_id, created_at 
      FROM users 
      WHERE email = 'admin@shawedgym.com'
    `);
    
    if (userResult.rows.length === 0) {
      console.log('❌ Admin user not found in database');
      console.log('📋 Available users:');
      
      const allUsers = await client.query('SELECT id, email, role, gym_id FROM users LIMIT 10');
      if (allUsers.rows.length > 0) {
        console.table(allUsers.rows);
      } else {
        console.log('No users found in database');
      }
      
      return;
    }
    
    const adminUser = userResult.rows[0];
    console.log('✅ Admin user found:');
    console.table([adminUser]);
    
    // Check if gym_id is set
    if (!adminUser.gym_id) {
      console.log('❌ Admin user missing gym_id');
      console.log('🔧 Fixing admin user gym_id...');
      
      // Ensure gym exists
      await client.query(`
        INSERT INTO gyms (id, name, owner_email, owner_name, subscription_plan_id, subscription_status)
        VALUES (1, 'ShawedGym', 'admin@shawedgym.com', 'System Admin', 1, 'active')
        ON CONFLICT (id) DO NOTHING
      `);
      
      // Update admin user
      await client.query(`
        UPDATE users 
        SET gym_id = 1 
        WHERE email = 'admin@shawedgym.com'
      `);
      
      console.log('✅ Admin user gym_id fixed');
    } else {
      console.log('✅ Admin user has gym_id:', adminUser.gym_id);
    }
    
    // Check password (we can't see the hash, but we can verify it exists)
    const passwordResult = await client.query(`
      SELECT password IS NOT NULL as has_password, 
             LENGTH(password) as password_length
      FROM users 
      WHERE email = 'admin@shawedgym.com'
    `);
    
    const passwordInfo = passwordResult.rows[0];
    console.log('🔐 Password info:');
    console.log('Has password:', passwordInfo.has_password);
    console.log('Password length:', passwordInfo.password_length);
    
    if (!passwordInfo.has_password) {
      console.log('❌ Admin user has no password set');
      console.log('🔧 Setting default password...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await client.query(`
        UPDATE users 
        SET password = $1 
        WHERE email = 'admin@shawedgym.com'
      `, [hashedPassword]);
      
      console.log('✅ Default password set to "admin123"');
    }
    
    // Final verification
    const finalCheck = await client.query(`
      SELECT u.id, u.email, u.role, u.gym_id, g.name as gym_name
      FROM users u
      LEFT JOIN gyms g ON u.gym_id = g.id
      WHERE u.email = 'admin@shawedgym.com'
    `);
    
    console.log('🎯 Final admin user status:');
    console.table(finalCheck.rows);
    
  } catch (error) {
    console.error('❌ Error checking admin user:', error.message);
    console.error('Full error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAdminUser().then(() => {
  console.log('🏁 Admin user check completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
