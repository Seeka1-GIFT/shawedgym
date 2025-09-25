-- ShawedGym Database Cleanup Script
-- Remove duplicate capitalized tables and keep only lowercase tables
-- Run this in your Neon database console

-- Drop capitalized tables (duplicates)
DROP TABLE IF EXISTS "Asset" CASCADE;
DROP TABLE IF EXISTS "Member" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "Plan" CASCADE;
DROP TABLE IF EXISTS "Expense" CASCADE;
DROP TABLE IF EXISTS "Attendance" CASCADE;
DROP TABLE IF EXISTS "Membership" CASCADE;

-- Verify remaining tables (should only be lowercase)
-- This query will show all tables in the public schema
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Show table counts to verify data integrity
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
    'expenses' as table_name, COUNT(*) as row_count FROM expenses;
