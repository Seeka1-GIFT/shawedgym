-- Fix Database Schema - Add missing gym_id columns
-- This script will add gym_id columns to tables that are missing them

-- Step 1: Add gym_id column to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS gym_id INTEGER;

-- Step 2: Add gym_id column to payments table  
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gym_id INTEGER;

-- Step 3: Add gym_id column to plans table
ALTER TABLE plans ADD COLUMN IF NOT EXISTS gym_id INTEGER;

-- Step 4: Add gym_id column to assets table
ALTER TABLE assets ADD COLUMN IF NOT EXISTS gym_id INTEGER;

-- Step 5: Add gym_id column to classes table
ALTER TABLE classes ADD COLUMN IF NOT EXISTS gym_id INTEGER;

-- Step 6: Add gym_id column to trainers table
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS gym_id INTEGER;

-- Step 7: Add gym_id column to attendance table
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS gym_id INTEGER;

-- Step 8: Add gym_id column to expenses table
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS gym_id INTEGER;

-- Step 9: Update existing records to have gym_id = 1 (default gym)
UPDATE members SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE payments SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE plans SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE assets SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE classes SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE trainers SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE attendance SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE expenses SET gym_id = 1 WHERE gym_id IS NULL;

-- Step 10: Add foreign key constraints
ALTER TABLE members ADD CONSTRAINT fk_members_gym FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
ALTER TABLE payments ADD CONSTRAINT fk_payments_gym FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
ALTER TABLE plans ADD CONSTRAINT fk_plans_gym FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
ALTER TABLE assets ADD CONSTRAINT fk_assets_gym FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
ALTER TABLE classes ADD CONSTRAINT fk_classes_gym FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
ALTER TABLE trainers ADD CONSTRAINT fk_trainers_gym FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
ALTER TABLE attendance ADD CONSTRAINT fk_attendance_gym FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
ALTER TABLE expenses ADD CONSTRAINT fk_expenses_gym FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;

-- Step 11: Set NOT NULL constraints
ALTER TABLE members ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE payments ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE plans ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE assets ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE classes ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE trainers ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE attendance ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE expenses ALTER COLUMN gym_id SET NOT NULL;

-- Step 12: Verify the changes
SELECT 
  'members' as table_name, 
  COUNT(*) as total_records,
  COUNT(CASE WHEN gym_id IS NOT NULL THEN 1 END) as records_with_gym_id
FROM members
UNION ALL
SELECT 
  'payments' as table_name, 
  COUNT(*) as total_records,
  COUNT(CASE WHEN gym_id IS NOT NULL THEN 1 END) as records_with_gym_id
FROM payments
UNION ALL
SELECT 
  'plans' as table_name, 
  COUNT(*) as total_records,
  COUNT(CASE WHEN gym_id IS NOT NULL THEN 1 END) as records_with_gym_id
FROM plans;

-- Step 13: Show table structure
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('members', 'payments', 'plans', 'assets', 'classes', 'trainers', 'attendance', 'expenses')
  AND column_name = 'gym_id'
ORDER BY table_name;
