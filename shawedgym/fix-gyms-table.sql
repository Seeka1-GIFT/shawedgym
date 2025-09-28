-- Fix gyms table structure
-- This script will ensure the gyms table exists with all required columns

-- Step 1: Create gyms table if it doesn't exist
CREATE TABLE IF NOT EXISTS gyms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_email VARCHAR(255) UNIQUE NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  subscription_plan VARCHAR(50) DEFAULT 'basic',
  subscription_status VARCHAR(20) DEFAULT 'active',
  max_members INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 2: Create subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  max_members INTEGER NOT NULL,
  features TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Insert default subscription plans
INSERT INTO subscription_plans (name, price, max_members, features) 
VALUES 
  ('basic', 29.99, 100, ARRAY['Basic dashboard', 'Member management', 'Payment tracking']),
  ('premium', 59.99, 500, ARRAY['Advanced analytics', 'Custom branding', 'API access']),
  ('enterprise', 99.99, 1000, ARRAY['White-label', 'Priority support', 'Custom integrations'])
ON CONFLICT (name) DO NOTHING;

-- Step 4: Insert default gym if it doesn't exist
INSERT INTO gyms (id, name, owner_email, owner_name, subscription_plan, max_members)
VALUES (1, 'ShawedGym', 'admin@shawedgym.com', 'System Admin', 'basic', 100)
ON CONFLICT (id) DO NOTHING;

-- Step 5: Verify table structure
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'gyms'
ORDER BY ordinal_position;

-- Step 6: Show current gyms
SELECT * FROM gyms;

-- Step 7: Show subscription plans
SELECT * FROM subscription_plans;
