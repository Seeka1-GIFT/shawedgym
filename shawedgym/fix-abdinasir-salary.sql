-- IMMEDIATE FIX: Update ABDINASIR trainer's monthly salary
-- Copy and paste this into Neon Console SQL Editor

-- Step 1: Add monthly_salary column if it doesn't exist
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS monthly_salary NUMERIC(10, 2) DEFAULT 0;

-- Step 2: Update ABDINASIR trainer specifically
UPDATE trainers 
SET monthly_salary = 300.00
WHERE first_name = 'ABDINASIR' AND last_name = 'ABDULLAHI' AND email = 'cabdirxmn1100@gmail.com';

-- Step 3: Update hourly_rate to match (300 / 160 = 1.875)
UPDATE trainers 
SET hourly_rate = 1.875
WHERE first_name = 'ABDINASIR' AND last_name = 'ABDULLAHI' AND email = 'cabdirxmn1100@gmail.com';

-- Step 4: Verify the update
SELECT 
    id, 
    first_name, 
    last_name, 
    email,
    hourly_rate, 
    monthly_salary,
    CASE 
        WHEN hourly_rate > 0 THEN hourly_rate * 160 
        ELSE 0 
    END as calculated_monthly
FROM trainers 
WHERE first_name = 'ABDINASIR' AND last_name = 'ABDULLAHI';

-- Step 5: Check all trainers
SELECT 
    id, 
    first_name, 
    last_name, 
    hourly_rate, 
    monthly_salary
FROM trainers 
ORDER BY id DESC;
