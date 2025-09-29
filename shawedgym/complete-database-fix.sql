-- Complete Database Setup for Individual Gym Creation
-- Run this in Neon Console to fix the gym_id issue

-- 1. Create subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    member_limit INTEGER NOT NULL,
    features TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Insert basic subscription plan
INSERT INTO subscription_plans (name, price, member_limit, features) 
VALUES ('basic', 35.00, 50, ARRAY['Basic gym management', 'Member tracking', 'Payment processing'])
ON CONFLICT (name) DO NOTHING;

-- 3. Create individual gyms for existing admin users
DO $$
DECLARE
    user_record RECORD;
    new_gym_id INTEGER;
    plan_id INTEGER;
BEGIN
    -- Get basic plan ID
    SELECT id INTO plan_id FROM subscription_plans WHERE name = 'basic' LIMIT 1;
    IF plan_id IS NULL THEN
        plan_id := 1;
    END IF;
    
    -- Create individual gyms for each admin user
    FOR user_record IN 
        SELECT id, email, first_name, last_name 
        FROM users 
        WHERE role = 'admin' AND gym_id = 1
    LOOP
        -- Create new gym for this admin (using only existing columns)
        INSERT INTO gyms (name, owner_email, owner_name)
        VALUES (
            CONCAT(COALESCE(user_record.first_name, 'Admin'), '''s Gym'),
            user_record.email,
            CONCAT(COALESCE(user_record.first_name, ''), ' ', COALESCE(user_record.last_name, ''))
        )
        RETURNING id INTO new_gym_id;
        
        -- Update user's gym_id
        UPDATE users SET gym_id = new_gym_id WHERE id = user_record.id;
        
        -- Create subscription for the new gym (if table exists)
        INSERT INTO gym_subscriptions (gym_id, plan_id, status, end_date)
        VALUES (new_gym_id, plan_id, 'active', NOW() + INTERVAL '1 month');
        
        RAISE NOTICE 'Created gym % for admin %', new_gym_id, user_record.email;
    END LOOP;
END $$;

-- 4. Create trigger function for automatic gym creation
CREATE OR REPLACE FUNCTION public.ensure_gym_for_user()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_gym_id integer;
  v_plan_id integer;
BEGIN
  -- Only create gym if gym_id is NULL or 1 (fallback)
  IF NEW.gym_id IS NULL OR NEW.gym_id = 1 THEN
    -- Get basic subscription plan ID
    SELECT id INTO v_plan_id FROM subscription_plans WHERE name = 'basic' LIMIT 1;
    IF v_plan_id IS NULL THEN
      v_plan_id := 1; -- Fallback
    END IF;
    
    -- Create new gym (using only existing columns)
    INSERT INTO gyms (name, owner_email, owner_name)
    VALUES (
      CONCAT(COALESCE(NEW.first_name, 'User'), '''s Gym'),
      NEW.email,
      CONCAT(COALESCE(NEW.first_name, ''), ' ', COALESCE(NEW.last_name, ''))
    )
    RETURNING id INTO v_gym_id;
    
    -- Update the user's gym_id
    NEW.gym_id := v_gym_id;
    
    -- Create subscription for the new gym (if table exists)
    INSERT INTO gym_subscriptions (gym_id, plan_id, status, end_date)
    VALUES (v_gym_id, v_plan_id, 'active', NOW() + INTERVAL '1 month');
    
    RAISE NOTICE 'Created gym % for user %', v_gym_id, NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 5. Create trigger on users table
DROP TRIGGER IF EXISTS trg_users_ensure_gym ON public.users;
CREATE TRIGGER trg_users_ensure_gym
BEFORE INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.ensure_gym_for_user();

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_gym_id ON users(gym_id);
CREATE INDEX IF NOT EXISTS idx_members_gym_id ON members(gym_id);
CREATE INDEX IF NOT EXISTS idx_payments_gym_id ON payments(gym_id);
CREATE INDEX IF NOT EXISTS idx_assets_gym_id ON assets(gym_id);
CREATE INDEX IF NOT EXISTS idx_classes_gym_id ON classes(gym_id);
CREATE INDEX IF NOT EXISTS idx_trainers_gym_id ON trainers(gym_id);
CREATE INDEX IF NOT EXISTS idx_attendance_gym_id ON attendance(gym_id);
CREATE INDEX IF NOT EXISTS idx_expenses_gym_id ON expenses(gym_id);

-- 7. Verify the results
SELECT 'Database setup completed successfully' as status;
SELECT 'Users with unique gym_ids:' as info, COUNT(*) as count FROM users WHERE gym_id > 1;
SELECT 'Total gyms created:' as info, COUNT(*) as count FROM gyms;
SELECT 'Subscription plans:' as info, COUNT(*) as count FROM subscription_plans;

-- 8. Show current users and their gym_ids
SELECT id, email, first_name, last_name, role, gym_id FROM users WHERE role = 'admin' ORDER BY id;
SELECT id, name, owner_email FROM gyms ORDER BY id;
