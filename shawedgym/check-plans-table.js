const { Pool } = require('pg');

// Create a new pool with SSL disabled for local testing
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function checkPlansTable() {
  try {
    console.log('Checking plans table structure...');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'plans' 
      ORDER BY ordinal_position
    `);
    
    console.log('Plans table columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type}) - nullable: ${row.is_nullable}`);
    });
    
    // Check if gym_id column exists
    const hasGymId = result.rows.some(row => row.column_name === 'gym_id');
    console.log(`\nHas gym_id column: ${hasGymId}`);
    
    if (!hasGymId) {
      console.log('\nAdding gym_id column to plans table...');
      await pool.query('ALTER TABLE plans ADD COLUMN gym_id INTEGER REFERENCES gyms(id) ON DELETE CASCADE');
      console.log('✅ Added gym_id column to plans table');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkPlansTable();
