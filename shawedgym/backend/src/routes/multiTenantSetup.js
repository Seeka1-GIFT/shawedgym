const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

// Setup multi-tenant database
router.post('/setup', async (req, res) => {
  try {
    console.log('🚀 Starting multi-tenant database setup...');

    // Read the SQL setup file
    const setupSQL = fs.readFileSync(
      path.join(__dirname, '../../multi_tenant_setup.sql'), 
      'utf8'
    );

    // Split the SQL into individual statements
    const statements = setupSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          await pool.query(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          // Some statements might fail if they already exist, that's okay
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('duplicate key')) {
            console.log(`⚠️  Statement ${i + 1} skipped (already exists): ${error.message}`);
            continue;
          }
          throw error;
        }
      }
    }

    // Verify the setup
    const verificationQueries = [
      'SELECT COUNT(*) as gym_count FROM gyms',
      'SELECT COUNT(*) as plan_count FROM subscription_plans',
      'SELECT COUNT(*) as member_count FROM members WHERE gym_id IS NOT NULL',
      'SELECT COUNT(*) as payment_count FROM payments WHERE gym_id IS NOT NULL'
    ];

    const results = {};
    for (const query of verificationQueries) {
      const result = await pool.query(query);
      const key = query.split(' ')[5].replace('_count', '');
      results[key] = parseInt(result.rows[0][Object.keys(result.rows[0])[0]]);
    }

    console.log('🎉 Multi-tenant setup completed successfully!');
    console.log('📊 Verification results:', results);

    res.json({
      success: true,
      message: 'Multi-tenant database setup completed successfully',
      data: {
        verification: results,
        statements_executed: statements.length
      }
    });

  } catch (error) {
    console.error('❌ Multi-tenant setup failed:', error);
    res.status(500).json({
      success: false,
      error: 'Setup Failed',
      message: error.message,
      details: error.stack
    });
  }
});

// Check multi-tenant setup status
router.get('/status', async (req, res) => {
  try {
    const checks = [
      { name: 'gyms_table', query: "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'gyms')" },
      { name: 'subscription_plans_table', query: "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscription_plans')" },
      { name: 'gym_id_in_members', query: "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'gym_id')" },
      { name: 'gym_id_in_payments', query: "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'gym_id')" },
      { name: 'gym_id_in_plans', query: "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'gym_id')" },
      { name: 'gym_id_in_assets', query: "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'gym_id')" },
      { name: 'gym_id_in_classes', query: "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'gym_id')" },
      { name: 'gym_id_in_trainers', query: "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'trainers' AND column_name = 'gym_id')" },
      { name: 'gym_id_in_attendance', query: "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'attendance' AND column_name = 'gym_id')" },
      { name: 'gym_id_in_expenses', query: "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'gym_id')" },
      { name: 'gym_id_in_users', query: "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'gym_id')" }
    ];

    const results = {};
    for (const check of checks) {
      const result = await pool.query(check.query);
      results[check.name] = result.rows[0].exists;
    }

    // Count records
    const counts = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM gyms'),
      pool.query('SELECT COUNT(*) as count FROM subscription_plans'),
      pool.query('SELECT COUNT(*) as count FROM members WHERE gym_id IS NOT NULL'),
      pool.query('SELECT COUNT(*) as count FROM payments WHERE gym_id IS NOT NULL')
    ]);

    const countsData = {
      gyms: parseInt(counts[0].rows[0].count),
      subscription_plans: parseInt(counts[1].rows[0].count),
      members_with_gym_id: parseInt(counts[2].rows[0].count),
      payments_with_gym_id: parseInt(counts[3].rows[0].count)
    };

    const allTablesExist = Object.values(results).every(exists => exists);
    const isSetupComplete = allTablesExist && countsData.gyms > 0 && countsData.subscription_plans > 0;

    res.json({
      success: true,
      data: {
        setup_complete: isSetupComplete,
        table_checks: results,
        record_counts: countsData,
        status: isSetupComplete ? 'READY' : 'NEEDS_SETUP'
      }
    });

  } catch (error) {
    console.error('❌ Status check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Status Check Failed',
      message: error.message
    });
  }
});

// Reset multi-tenant setup (for testing)
router.post('/reset', async (req, res) => {
  try {
    console.log('🔄 Resetting multi-tenant setup...');

    // Drop foreign key constraints first
    const dropConstraints = [
      'ALTER TABLE members DROP CONSTRAINT IF EXISTS members_gym_id_fkey',
      'ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_gym_id_fkey',
      'ALTER TABLE plans DROP CONSTRAINT IF EXISTS plans_gym_id_fkey',
      'ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_gym_id_fkey',
      'ALTER TABLE classes DROP CONSTRAINT IF EXISTS classes_gym_id_fkey',
      'ALTER TABLE trainers DROP CONSTRAINT IF EXISTS trainers_gym_id_fkey',
      'ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_gym_id_fkey',
      'ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_gym_id_fkey',
      'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_gym_id_fkey'
    ];

    for (const constraint of dropConstraints) {
      try {
        await pool.query(constraint);
      } catch (error) {
        console.log('⚠️  Constraint drop skipped:', error.message);
      }
    }

    // Drop columns
    const dropColumns = [
      'ALTER TABLE members DROP COLUMN IF EXISTS gym_id',
      'ALTER TABLE payments DROP COLUMN IF EXISTS gym_id',
      'ALTER TABLE plans DROP COLUMN IF EXISTS gym_id',
      'ALTER TABLE assets DROP COLUMN IF EXISTS gym_id',
      'ALTER TABLE classes DROP COLUMN IF EXISTS gym_id',
      'ALTER TABLE trainers DROP COLUMN IF EXISTS gym_id',
      'ALTER TABLE attendance DROP COLUMN IF EXISTS gym_id',
      'ALTER TABLE expenses DROP COLUMN IF EXISTS gym_id',
      'ALTER TABLE users DROP COLUMN IF EXISTS gym_id'
    ];

    for (const column of dropColumns) {
      try {
        await pool.query(column);
      } catch (error) {
        console.log('⚠️  Column drop skipped:', error.message);
      }
    }

    // Drop tables
    const dropTables = [
      'DROP TABLE IF EXISTS gym_subscriptions CASCADE',
      'DROP TABLE IF EXISTS subscription_plans CASCADE',
      'DROP TABLE IF EXISTS gyms CASCADE',
      'DROP VIEW IF EXISTS gym_stats CASCADE',
      'DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE'
    ];

    for (const table of dropTables) {
      try {
        await pool.query(table);
      } catch (error) {
        console.log('⚠️  Table drop skipped:', error.message);
      }
    }

    console.log('✅ Multi-tenant setup reset completed');

    res.json({
      success: true,
      message: 'Multi-tenant setup reset completed successfully'
    });

  } catch (error) {
    console.error('❌ Reset failed:', error);
    res.status(500).json({
      success: false,
      error: 'Reset Failed',
      message: error.message
    });
  }
});

module.exports = router;
