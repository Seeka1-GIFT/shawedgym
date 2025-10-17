#!/usr/bin/env node

/**
 * Database Migration Script for Face ID Support
 * This script adds face recognition fields to the members table
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'shawedgym',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
};

async function runMigration() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🔄 Starting Face ID migration...');
    
    // Read the SQL migration file
    const sqlFile = path.join(__dirname, 'add-face-id-support.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the migration
    await pool.query(sql);
    
    console.log('✅ Face ID migration completed successfully!');
    console.log('📋 Added fields:');
    console.log('   - face_id (unique identifier for face recognition)');
    console.log('   - photo_url (URL to member photo)');
    console.log('   - external_person_id (device integration)');
    console.log('   - registered_at (registration timestamp)');
    console.log('   - plan_expires_at (membership expiration)');
    console.log('   - Auto-generation trigger for face_id');
    console.log('   - Indexes for performance');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration();
