-- URGENT: Fix trainers table for monthly_salary column
-- Copy and paste this entire script into your Neon Console SQL Editor

-- Step 1: Add monthly_salary column
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS monthly_salary NUMERIC(10, 2) DEFAULT 0;

-- Step 2: Update existing trainers with calculated monthly salary
UPDATE trainers 
SET monthly_salary = CASE 
    WHEN hourly_rate > 0 THEN hourly_rate * 160  -- 160 hours per month
    ELSE 0 
END
WHERE monthly_salary IS NULL OR monthly_salary = 0;

-- Step 3: Add index for performance
CREATE INDEX IF NOT EXISTS idx_trainers_monthly_salary ON trainers(monthly_salary);

-- Step 4: Verify the changes
SELECT 
    id, 
    first_name, 
    last_name, 
    hourly_rate, 
    monthly_salary,
    CASE 
        WHEN hourly_rate > 0 THEN hourly_rate * 160 
        ELSE 0 
    END as calculated_monthly
FROM trainers 
LIMIT 5;

-- Step 5: Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'trainers' 
ORDER BY ordinal_position;
