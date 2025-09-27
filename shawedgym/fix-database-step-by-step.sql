-- Step 1: Add gym_id column to users table
ALTER TABLE users ADD COLUMN gym_id INTEGER;

-- Step 2: Create gyms table if it doesn't exist
CREATE TABLE IF NOT EXISTS gyms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_email VARCHAR(255) UNIQUE NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  subscription_plan_id INTEGER DEFAULT 1,
  subscription_status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Create subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  member_limit INTEGER NOT NULL,
  features TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 4: Insert default subscription plan
INSERT INTO subscription_plans (id, name, price, member_limit, features) 
VALUES (1, 'Basic', 29.99, 100, ARRAY['Basic dashboard', 'Member management', 'Payment tracking'])
ON CONFLICT (id) DO NOTHING;

-- Step 5: Insert default gym
INSERT INTO gyms (id, name, owner_email, owner_name, subscription_plan_id, subscription_status)
VALUES (1, 'ShawedGym', 'admin@shawedgym.com', 'System Admin', 1, 'active')
ON CONFLICT (id) DO NOTHING;

-- Step 6: Update admin user to have gym_id = 1
UPDATE users 
SET gym_id = 1 
WHERE email = 'admin@shawedgym.com';

-- Step 7: Update any other users without gym_id to default gym
UPDATE users 
SET gym_id = 1 
WHERE gym_id IS NULL;

-- Step 8: Set gym_id to NOT NULL
ALTER TABLE users ALTER COLUMN gym_id SET NOT NULL;

-- Step 9: Add foreign key constraint
ALTER TABLE users ADD CONSTRAINT fk_users_gym 
FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;

-- Step 10: Verify the fix
SELECT 
    u.id, 
    u.email, 
    u.role, 
    u.gym_id, 
    g.name as gym_name
FROM users u
LEFT JOIN gyms g ON u.gym_id = g.id
WHERE u.email = 'admin@shawedgym.com';
