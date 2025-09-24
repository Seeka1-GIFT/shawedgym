/**
 * ShawedGym Backend API with PostgreSQL
 * Real database connection
 */

const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
const PORT = 3001;

// Database connection
const dbClient = new Client({
  host: 'localhost',
  port: 5432,
  database: 'shawedgym',
  user: 'postgres',
  password: 'postgres123'
});

// Connect to database
dbClient.connect()
  .then(() => {
    console.log('✅ PostgreSQL connected successfully!');
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check with database status
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbVersion = 'unknown';
  
  try {
    const result = await dbClient.query('SELECT version();');
    dbStatus = 'connected';
    dbVersion = result.rows[0].version.split(' ')[1]; // Extract version number
  } catch (error) {
    console.error('Database health check failed:', error.message);
  }
  
  res.json({
    status: 'OK',
    message: 'ShawedGym Backend API with PostgreSQL!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: {
      status: dbStatus,
      type: 'PostgreSQL',
      version: dbVersion,
      name: 'shawedgym'
    },
    server: {
      port: PORT,
      environment: 'development',
      cors: 'http://localhost:5173'
    }
  });
});

// Dashboard stats with real database queries
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Check if users table exists and get count
    let userCount = 0;
    try {
      const userResult = await dbClient.query('SELECT COUNT(*) FROM users');
      userCount = parseInt(userResult.rows[0].count);
    } catch (error) {
      console.log('Users table not found, using mock data');
    }

    // Mock stats with some real data
    const stats = {
      totalMembers: userCount > 0 ? userCount : 148,
      activeMembers: userCount > 0 ? Math.floor(userCount * 0.9) : 142,
      checkedInMembers: Math.floor(Math.random() * 15) + 5,
      totalRevenue: 18500,
      monthlyRevenue: 3200,
      totalClasses: 8,
      activeEquipment: 25,
      todayAttendance: Math.floor(Math.random() * 30) + 20,
      databaseConnected: true,
      realData: userCount > 0
    };
    
    console.log('📊 Dashboard stats requested:', stats);
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      error: 'Database Error',
      message: error.message
    });
  }
});

// Database info endpoint
app.get('/api/database/info', async (req, res) => {
  try {
    // Get all tables
    const tablesResult = await dbClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    
    // Get database size
    const sizeResult = await dbClient.query(`
      SELECT pg_size_pretty(pg_database_size('shawedgym')) as size
    `);
    
    res.json({
      success: true,
      data: {
        name: 'shawedgym',
        tables: tables,
        tableCount: tables.length,
        size: sizeResult.rows[0].size,
        connected: true
      }
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Database Query Failed',
      message: error.message
    });
  }
});

// Create users table if not exists
app.post('/api/database/setup', async (req, res) => {
  try {
    // Create users table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'member',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create members table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        membership_number VARCHAR(20) UNIQUE NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE,
        phone VARCHAR(20) NOT NULL,
        membership_type VARCHAR(20) DEFAULT 'basic',
        membership_status VARCHAR(20) DEFAULT 'active',
        join_date DATE DEFAULT CURRENT_DATE,
        membership_end_date DATE,
        is_checked_in BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert sample data
    await dbClient.query(`
      INSERT INTO users (first_name, last_name, email, role) 
      VALUES 
        ('System', 'Administrator', 'admin@shawedgym.com', 'admin'),
        ('Sarah', 'Johnson', 'sarah@shawedgym.com', 'trainer'),
        ('Mike', 'Wilson', 'mike@shawedgym.com', 'trainer')
      ON CONFLICT (email) DO NOTHING
    `);
    
    await dbClient.query(`
      INSERT INTO members (membership_number, first_name, last_name, email, phone, membership_type) 
      VALUES 
        ('GYM2024001', 'Ahmed', 'Hassan', 'ahmed@example.com', '252-61-123456', 'premium'),
        ('GYM2024002', 'Fatima', 'Ali', 'fatima@example.com', '252-61-789012', 'basic'),
        ('GYM2024003', 'Mohamed', 'Omar', 'mohamed@example.com', '252-61-345678', 'vip')
      ON CONFLICT (email) DO NOTHING
    `);
    
    res.json({
      success: true,
      message: 'Database setup completed successfully',
      tables: ['users', 'members']
    });
    
  } catch (error) {
    console.error('Database setup error:', error);
    res.status(500).json({
      error: 'Database Setup Failed',
      message: error.message
    });
  }
});

// Get real members from database
app.get('/api/members', async (req, res) => {
  try {
    const result = await dbClient.query(`
      SELECT 
        id,
        membership_number,
        first_name || ' ' || last_name as name,
        email,
        phone,
        membership_type,
        membership_status as status,
        join_date,
        is_checked_in
      FROM members 
      ORDER BY created_at DESC
    `);
    
    console.log(`👥 Real members from database: ${result.rows.length}`);
    
    res.json({
      success: true,
      data: {
        members: result.rows,
        pagination: {
          total: result.rows.length,
          page: 1,
          pages: 1
        }
      },
      source: 'PostgreSQL Database'
    });
    
  } catch (error) {
    console.error('Members query failed:', error);
    res.status(500).json({
      error: 'Database Query Failed',
      message: error.message
    });
  }
});

// Get real users from database
app.get('/api/users', async (req, res) => {
  try {
    const result = await dbClient.query(`
      SELECT 
        id,
        first_name || ' ' || last_name as name,
        email,
        role,
        is_active,
        created_at
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      data: {
        users: result.rows,
        total: result.rows.length
      },
      source: 'PostgreSQL Database'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Database Query Failed',
      message: error.message
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ API Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 ShawedGym Backend API with PostgreSQL!');
  console.log('='.repeat(60));
  console.log(`🌐 Backend API: http://localhost:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  Database Info: http://localhost:${PORT}/api/database/info`);
  console.log(`⚙️  Setup Database: POST http://localhost:${PORT}/api/database/setup`);
  console.log(`👥 Real Members: http://localhost:${PORT}/api/members`);
  console.log(`👤 Real Users: http://localhost:${PORT}/api/users`);
  console.log('='.repeat(60));
  console.log('🔗 Connect frontend: npm run dev (port 5173)');
  console.log('🗄️  Database: PostgreSQL (shawedgym)');
  console.log('');
});

module.exports = app;



