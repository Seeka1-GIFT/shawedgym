const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'shawedgym',
  user: 'postgres',
  password: 'postgres123',
});

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Hash the password
    const password = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log('Password hash:', hashedPassword);
    
    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Users table does not exist. Creating it...');
      
      // Create users table
      await pool.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('✅ Users table created');
    }
    
    // Insert admin user
    const result = await pool.query(`
      INSERT INTO users (email, password, first_name, last_name, role) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (email) DO UPDATE SET 
        password = EXCLUDED.password,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role
      RETURNING id, email, first_name, last_name, role;
    `, ['admin@shawedgym.com', hashedPassword, 'System', 'Administrator', 'admin']);
    
    console.log('✅ Admin user created/updated:', result.rows[0]);
    
    // Test login
    const user = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@shawedgym.com']);
    console.log('✅ Admin user exists in database');
    
    const isPasswordValid = await bcrypt.compare('admin123', user.rows[0].password);
    console.log('✅ Password validation:', isPasswordValid ? 'PASSED' : 'FAILED');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createAdminUser();





