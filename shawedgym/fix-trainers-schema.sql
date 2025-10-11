-- Fix trainers table to support monthly_salary
-- Run this in your Neon Console

-- Add monthly_salary column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trainers' AND column_name='monthly_salary') THEN
        ALTER TABLE trainers ADD COLUMN monthly_salary NUMERIC(10, 2) DEFAULT 0;
    END IF;
END
$$;

-- Update existing records to have monthly_salary based on hourly_rate
UPDATE trainers 
SET monthly_salary = CASE 
    WHEN hourly_rate > 0 THEN hourly_rate * 160  -- 160 hours per month
    ELSE 0 
END
WHERE monthly_salary IS NULL OR monthly_salary = 0;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_trainers_monthly_salary ON trainers(monthly_salary);

-- Verify the changes
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
