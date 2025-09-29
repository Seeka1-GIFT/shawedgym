-- Database Trigger for Automatic Gym Creation
-- This ensures that even if backend fails, each user gets their own gym

-- 1. Create function to ensure gym exists for user
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
    
    -- Create new gym
    INSERT INTO gyms (name, owner_email, owner_name, phone, address, subscription_plan_id, max_members)
    VALUES (
      CONCAT(COALESCE(NEW.first_name, 'User'), '''s Gym'),
      NEW.email,
      CONCAT(COALESCE(NEW.first_name, ''), ' ', COALESCE(NEW.last_name, '')),
      '',
      '',
      v_plan_id,
      50
    )
    RETURNING id INTO v_gym_id;
    
    -- Update the user's gym_id
    NEW.gym_id := v_gym_id;
    
    -- Create subscription for the new gym
    INSERT INTO gym_subscriptions (gym_id, plan_id, status, end_date)
    VALUES (v_gym_id, v_plan_id, 'active', NOW() + INTERVAL '1 month');
    
    RAISE NOTICE 'Created gym % for user %', v_gym_id, NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. Create trigger on users table
DROP TRIGGER IF EXISTS trg_users_ensure_gym ON public.users;
CREATE TRIGGER trg_users_ensure_gym
BEFORE INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.ensure_gym_for_user();

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_gym_id ON users(gym_id);
CREATE INDEX IF NOT EXISTS idx_members_gym_id ON members(gym_id);
CREATE INDEX IF NOT EXISTS idx_payments_gym_id ON payments(gym_id);
CREATE INDEX IF NOT EXISTS idx_assets_gym_id ON assets(gym_id);
CREATE INDEX IF NOT EXISTS idx_classes_gym_id ON classes(gym_id);
CREATE INDEX IF NOT EXISTS idx_trainers_gym_id ON trainers(gym_id);
CREATE INDEX IF NOT EXISTS idx_attendance_gym_id ON attendance(gym_id);
CREATE INDEX IF NOT EXISTS idx_expenses_gym_id ON expenses(gym_id);

-- 4. Verify the setup
SELECT 'Database trigger setup completed successfully' as status;
SELECT 'Trigger function created: ensure_gym_for_user' as info;
SELECT 'Trigger created: trg_users_ensure_gym' as info;
SELECT 'Indexes created for gym_id columns' as info;
