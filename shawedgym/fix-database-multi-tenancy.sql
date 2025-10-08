-- Fix all tables to support multi-tenancy by adding gym_id columns
-- This script will add gym_id columns to all tables that need them

-- Fix plans table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'plans' AND column_name = 'gym_id'
    ) THEN
        ALTER TABLE plans ADD COLUMN gym_id INTEGER;
        RAISE NOTICE 'Added gym_id column to plans table';
    END IF;
END $$;

-- Fix members table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'members' AND column_name = 'gym_id'
    ) THEN
        ALTER TABLE members ADD COLUMN gym_id INTEGER;
        RAISE NOTICE 'Added gym_id column to members table';
    END IF;
END $$;

-- Fix payments table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'gym_id'
    ) THEN
        ALTER TABLE payments ADD COLUMN gym_id INTEGER;
        RAISE NOTICE 'Added gym_id column to payments table';
    END IF;
END $$;

-- Fix attendance table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attendance' AND column_name = 'gym_id'
    ) THEN
        ALTER TABLE attendance ADD COLUMN gym_id INTEGER;
        RAISE NOTICE 'Added gym_id column to attendance table';
    END IF;
END $$;

-- Fix classes table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'classes' AND column_name = 'gym_id'
    ) THEN
        ALTER TABLE classes ADD COLUMN gym_id INTEGER;
        RAISE NOTICE 'Added gym_id column to classes table';
    END IF;
END $$;

-- Fix trainers table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trainers' AND column_name = 'gym_id'
    ) THEN
        ALTER TABLE trainers ADD COLUMN gym_id INTEGER;
        RAISE NOTICE 'Added gym_id column to trainers table';
    END IF;
END $$;

-- Fix assets table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assets' AND column_name = 'gym_id'
    ) THEN
        ALTER TABLE assets ADD COLUMN gym_id INTEGER;
        RAISE NOTICE 'Added gym_id column to assets table';
    END IF;
END $$;

-- Fix expenses table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'expenses' AND column_name = 'gym_id'
    ) THEN
        ALTER TABLE expenses ADD COLUMN gym_id INTEGER;
        RAISE NOTICE 'Added gym_id column to expenses table';
    END IF;
END $$;

-- Add foreign key constraints
DO $$
BEGIN
    -- Plans foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'plans' AND constraint_name = 'plans_gym_id_fkey'
    ) THEN
        ALTER TABLE plans ADD CONSTRAINT plans_gym_id_fkey FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for plans';
    END IF;
    
    -- Members foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'members' AND constraint_name = 'members_gym_id_fkey'
    ) THEN
        ALTER TABLE members ADD CONSTRAINT members_gym_id_fkey FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for members';
    END IF;
    
    -- Payments foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'payments' AND constraint_name = 'payments_gym_id_fkey'
    ) THEN
        ALTER TABLE payments ADD CONSTRAINT payments_gym_id_fkey FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for payments';
    END IF;
    
    -- Attendance foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'attendance' AND constraint_name = 'attendance_gym_id_fkey'
    ) THEN
        ALTER TABLE attendance ADD CONSTRAINT attendance_gym_id_fkey FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for attendance';
    END IF;
    
    -- Classes foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'classes' AND constraint_name = 'classes_gym_id_fkey'
    ) THEN
        ALTER TABLE classes ADD CONSTRAINT classes_gym_id_fkey FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for classes';
    END IF;
    
    -- Trainers foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'trainers' AND constraint_name = 'trainers_gym_id_fkey'
    ) THEN
        ALTER TABLE trainers ADD CONSTRAINT trainers_gym_id_fkey FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for trainers';
    END IF;
    
    -- Assets foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'assets' AND constraint_name = 'assets_gym_id_fkey'
    ) THEN
        ALTER TABLE assets ADD CONSTRAINT assets_gym_id_fkey FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for assets';
    END IF;
    
    -- Expenses foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'expenses' AND constraint_name = 'expenses_gym_id_fkey'
    ) THEN
        ALTER TABLE expenses ADD CONSTRAINT expenses_gym_id_fkey FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for expenses';
    END IF;
END $$;

-- Update existing records to have gym_id = 1 (default gym)
UPDATE plans SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE members SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE payments SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE attendance SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE classes SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE trainers SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE assets SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE expenses SET gym_id = 1 WHERE gym_id IS NULL;

-- Make gym_id NOT NULL after setting default values
ALTER TABLE plans ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE members ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE payments ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE attendance ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE classes ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE trainers ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE assets ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE expenses ALTER COLUMN gym_id SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plans_gym_id ON plans(gym_id);
CREATE INDEX IF NOT EXISTS idx_members_gym_id ON members(gym_id);
CREATE INDEX IF NOT EXISTS idx_payments_gym_id ON payments(gym_id);
CREATE INDEX IF NOT EXISTS idx_attendance_gym_id ON attendance(gym_id);
CREATE INDEX IF NOT EXISTS idx_classes_gym_id ON classes(gym_id);
CREATE INDEX IF NOT EXISTS idx_trainers_gym_id ON trainers(gym_id);
CREATE INDEX IF NOT EXISTS idx_assets_gym_id ON assets(gym_id);
CREATE INDEX IF NOT EXISTS idx_expenses_gym_id ON expenses(gym_id);

-- Show success message
SELECT 'Database multi-tenancy setup completed successfully!' as status;
