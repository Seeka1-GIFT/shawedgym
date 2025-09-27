-- Create admin user with proper password and gym_id
-- This script creates the admin user if it doesn't exist

-- First, ensure gyms table exists
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

-- Ensure subscription_plans table exists
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  member_limit INTEGER NOT NULL,
  features TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default subscription plan
INSERT INTO subscription_plans (id, name, price, member_limit, features) 
VALUES (1, 'Basic', 29.99, 100, ARRAY['Basic dashboard', 'Member management', 'Payment tracking'])
ON CONFLICT (id) DO NOTHING;

-- Insert default gym
INSERT INTO gyms (id, name, owner_email, owner_name, subscription_plan_id, subscription_status)
VALUES (1, 'ShawedGym', 'admin@shawedgym.com', 'System Admin', 1, 'active')
ON CONFLICT (id) DO NOTHING;

-- Check if admin user exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@shawedgym.com') THEN
        -- Create admin user with hashed password for 'admin123'
        INSERT INTO users (email, password, first_name, last_name, role, gym_id, created_at)
        VALUES (
            'admin@shawedgym.com',
            '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
            'System',
            'Admin',
            'admin',
            1,
            NOW()
        );
        RAISE NOTICE 'Admin user created successfully';
    ELSE
        -- Update existing admin user to ensure gym_id is set
        UPDATE users 
        SET gym_id = 1, 
            password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
        WHERE email = 'admin@shawedgym.com';
        RAISE NOTICE 'Admin user updated successfully';
    END IF;
END $$;

-- Verify the admin user
SELECT 
    u.id, 
    u.email, 
    u.role, 
    u.gym_id, 
    g.name as gym_name,
    CASE WHEN u.password IS NOT NULL THEN 'Password set' ELSE 'No password' END as password_status
FROM users u
LEFT JOIN gyms g ON u.gym_id = g.id
WHERE u.email = 'admin@shawedgym.com';

-- Show all users for verification
SELECT 
    u.id, 
    u.email, 
    u.role, 
    u.gym_id, 
    g.name as gym_name
FROM users u
LEFT JOIN gyms g ON u.gym_id = g.id
ORDER BY u.id;
