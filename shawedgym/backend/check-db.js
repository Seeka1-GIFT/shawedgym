const pool = require('./src/config/database');

async function checkDatabase() {
  try {
    console.log('Checking users table structure...');
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Users table columns:');
    columnsResult.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
    });
    
    console.log('\nChecking sample user data...');
    const userResult = await pool.query('SELECT id, email, role, gym_id FROM users LIMIT 1');
    
    if (userResult.rows.length > 0) {
      console.log('Sample user data:');
      console.log(userResult.rows[0]);
    } else {
      console.log('No users found in database');
    }
    
    console.log('\nChecking gyms table...');
    const gymsResult = await pool.query('SELECT id, name, owner_email FROM gyms LIMIT 3');
    console.log('Gyms found:', gymsResult.rows.length);
    gymsResult.rows.forEach(gym => {
      console.log(`- Gym ${gym.id}: ${gym.name} (${gym.owner_email})`);
    });
    
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkDatabase();
