const { Pool } = require('pg');

// Database connection - Update this with your actual DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'YOUR_ACTUAL_DATABASE_URL_HERE',
  ssl: { rejectUnauthorized: false }
});

async function runSQLFix() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Starting SQL fix for admin user...');
    
    // Step 1: Check if gym_id column exists
    console.log('📋 Step 1: Checking gym_id column...');
    const columnCheck = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'gym_id'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('➕ Adding gym_id column to users table...');
      await client.query('ALTER TABLE users ADD COLUMN gym_id INTEGER');
      console.log('✅ gym_id column added');
    } else {
      console.log('✅ gym_id column already exists');
    }
    
    // Step 2: Ensure default gym exists
    console.log('📋 Step 2: Ensuring default gym exists...');
    await client.query(`
      INSERT INTO gyms (id, name, owner_email, owner_name, subscription_plan_id, subscription_status)
      VALUES (1, 'ShawedGym', 'admin@shawedgym.com', 'System Admin', 1, 'active')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Default gym ensured');
    
    // Step 3: Fix admin user
    console.log('📋 Step 3: Fixing admin user...');
    const adminUpdate = await client.query(`
      UPDATE users 
      SET gym_id = 1 
      WHERE email = 'admin@shawedgym.com' AND gym_id IS NULL
      RETURNING id, email, role, gym_id
    `);
    
    if (adminUpdate.rows.length > 0) {
      console.log('✅ Admin user updated:', adminUpdate.rows[0]);
    } else {
      console.log('ℹ️ Admin user already has gym_id');
    }
    
    // Step 4: Fix other users
    console.log('📋 Step 4: Fixing other users...');
    const otherUsersUpdate = await client.query(`
      UPDATE users 
      SET gym_id = 1 
      WHERE gym_id IS NULL
      RETURNING id, email, role, gym_id
    `);
    
    if (otherUsersUpdate.rows.length > 0) {
      console.log(`✅ Updated ${otherUsersUpdate.rows.length} users:`, otherUsersUpdate.rows);
    } else {
      console.log('ℹ️ All users already have gym_id');
    }
    
    // Step 5: Add constraints
    console.log('📋 Step 5: Adding constraints...');
    
    // Check if NOT NULL constraint exists
    const nullCheck = await client.query(`
      SELECT is_nullable FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'gym_id'
    `);
    
    if (nullCheck.rows[0]?.is_nullable === 'YES') {
      await client.query('ALTER TABLE users ALTER COLUMN gym_id SET NOT NULL');
      console.log('✅ Added NOT NULL constraint to gym_id');
    } else {
      console.log('ℹ️ NOT NULL constraint already exists');
    }
    
    // Check if foreign key constraint exists
    const fkCheck = await client.query(`
      SELECT constraint_name FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_users_gym' AND table_name = 'users'
    `);
    
    if (fkCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE users ADD CONSTRAINT fk_users_gym 
        FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
      `);
      console.log('✅ Added foreign key constraint');
    } else {
      console.log('ℹ️ Foreign key constraint already exists');
    }
    
    // Step 6: Verify the fix
    console.log('📋 Step 6: Verifying the fix...');
    const verification = await client.query(`
      SELECT 
        u.id, 
        u.email, 
        u.role, 
        u.gym_id, 
        g.name as gym_name
      FROM users u
      LEFT JOIN gyms g ON u.gym_id = g.id
      WHERE u.email = 'admin@shawedgym.com'
    `);
    
    if (verification.rows.length > 0) {
      console.log('🎉 SUCCESS! Admin user fixed:');
      console.table(verification.rows);
    } else {
      console.log('❌ ERROR: Admin user not found');
    }
    
    // Show all users
    const allUsers = await client.query(`
      SELECT 
        u.id, 
        u.email, 
        u.role, 
        u.gym_id, 
        g.name as gym_name
      FROM users u
      LEFT JOIN gyms g ON u.gym_id = g.id
      ORDER BY u.id
    `);
    
    console.log('📊 All users in database:');
    console.table(allUsers.rows);
    
  } catch (error) {
    console.error('❌ Error running SQL fix:', error.message);
    console.error('Full error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the fix
runSQLFix().then(() => {
  console.log('🏁 SQL fix completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});