const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// POST /api/database/setup → idempotent setup of tables and default admin
router.post('/setup', async (req, res) => {
  try {
    // Create tables if not exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        membership_type VARCHAR(50),
        status VARCHAR(20) DEFAULT 'Active',
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
        plan_id INTEGER,
        amount NUMERIC(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'completed',
        date DATE DEFAULT CURRENT_DATE
      );
    `);

    // Insert default admin if not exists
    const adminEmail = 'admin@shawedgym.com';
    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [adminEmail]);
    if (existing.rows.length === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1,$2,$3,$4,$5)',
        [adminEmail, hash, 'System', 'Administrator', 'admin']
      );
    }

    res.json({ success: true, message: 'Database setup completed' });
  } catch (error) {
    console.error('Database setup error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Database setup failed' });
  }
});

module.exports = router;


