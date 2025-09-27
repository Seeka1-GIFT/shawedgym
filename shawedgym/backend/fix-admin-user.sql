-- Fix admin user to have gym_id
-- This script ensures the admin user has a valid gym_id

-- First, check if gym_id column exists in users table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'gym_id'
    ) THEN
        -- Add gym_id column if it doesn't exist
        ALTER TABLE users ADD COLUMN gym_id INTEGER;
        RAISE NOTICE 'Added gym_id column to users table';
    END IF;
END $$;

-- Ensure there's a default gym
INSERT INTO gyms (id, name, owner_email, owner_name, subscription_plan_id, subscription_status)
VALUES (1, 'ShawedGym', 'admin@shawedgym.com', 'System Admin', 1, 'active')
ON CONFLICT (id) DO NOTHING;

-- Update admin user to have gym_id = 1
UPDATE users 
SET gym_id = 1 
WHERE email = 'admin@shawedgym.com' AND gym_id IS NULL;

-- Update any other users without gym_id to default gym
UPDATE users 
SET gym_id = 1 
WHERE gym_id IS NULL;

-- Add NOT NULL constraint to gym_id if not already present
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'gym_id' AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE users ALTER COLUMN gym_id SET NOT NULL;
        RAISE NOTICE 'Set gym_id to NOT NULL';
    END IF;
END $$;

-- Add foreign key constraint if not already present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_users_gym' AND table_name = 'users'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT fk_users_gym FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for gym_id';
    END IF;
END $$;

-- Verify the fix
SELECT 
    u.id, 
    u.email, 
    u.role, 
    u.gym_id, 
    g.name as gym_name
FROM users u
LEFT JOIN gyms g ON u.gym_id = g.id
WHERE u.email = 'admin@shawedgym.com';
