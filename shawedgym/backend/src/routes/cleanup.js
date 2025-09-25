const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// POST /api/cleanup/drop-duplicates → Remove duplicate capitalized tables
router.post('/drop-duplicates', async (req, res) => {
  try {
    console.log('🧹 Starting database cleanup...');
    
    // List of capitalized tables to drop
    const tablesToDrop = [
      'Asset',
      'Member', 
      'Payment',
      'Plan',
      'Expense',
      'Attendance',
      'Membership'
    ];

    const droppedTables = [];
    const errors = [];

    // Drop each capitalized table
    for (const tableName of tablesToDrop) {
      try {
        const result = await pool.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
        droppedTables.push(tableName);
        console.log(`✅ Dropped table: ${tableName}`);
      } catch (error) {
        console.error(`❌ Failed to drop table ${tableName}:`, error.message);
        errors.push({ table: tableName, error: error.message });
      }
    }

    // Verify remaining tables
    const remainingTables = await pool.query(`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    // Get table counts
    const tableCounts = await pool.query(`
      SELECT 
        'users' as table_name, COUNT(*) as row_count FROM users
      UNION ALL
      SELECT 
        'members' as table_name, COUNT(*) as row_count FROM members
      UNION ALL
      SELECT 
        'payments' as table_name, COUNT(*) as row_count FROM payments
      UNION ALL
      SELECT 
        'plans' as table_name, COUNT(*) as row_count FROM plans
      UNION ALL
      SELECT 
        'classes' as table_name, COUNT(*) as row_count FROM classes
      UNION ALL
      SELECT 
        'assets' as table_name, COUNT(*) as row_count FROM assets
      UNION ALL
      SELECT 
        'trainers' as table_name, COUNT(*) as row_count FROM trainers
      UNION ALL
      SELECT 
        'attendance' as table_name, COUNT(*) as row_count FROM attendance
      UNION ALL
      SELECT 
        'expenses' as table_name, COUNT(*) as row_count FROM expenses
    `);

    res.json({
      success: true,
      message: 'Database cleanup completed',
      data: {
        droppedTables,
        errors,
        remainingTables: remainingTables.rows,
        tableCounts: tableCounts.rows
      }
    });

  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to cleanup database',
      details: error.message
    });
  }
});

// GET /api/cleanup/status → Check current table status
router.get('/status', async (req, res) => {
  try {
    // Get all tables
    const allTables = await pool.query(`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    // Check for duplicates
    const duplicates = [];
    const lowercaseTables = [];
    const capitalizedTables = [];

    allTables.rows.forEach(table => {
      const name = table.table_name;
      if (name === name.toLowerCase()) {
        lowercaseTables.push(name);
      } else {
        capitalizedTables.push(name);
        // Check if there's a lowercase version
        if (lowercaseTables.includes(name.toLowerCase())) {
          duplicates.push({
            capitalized: name,
            lowercase: name.toLowerCase()
          });
        }
      }
    });

    res.json({
      success: true,
      data: {
        allTables: allTables.rows,
        lowercaseTables,
        capitalizedTables,
        duplicates,
        hasDuplicates: duplicates.length > 0
      }
    });

  } catch (error) {
    console.error('❌ Failed to check table status:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to check table status',
      details: error.message
    });
  }
});

module.exports = router;
