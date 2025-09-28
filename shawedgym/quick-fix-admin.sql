-- Quick fix for admin user - run this in Neon SQL Editor
-- This will create/update admin user with correct credentials

-- Ensure gyms table exists
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

-- Insert default gym
INSERT INTO gyms (id, name, owner_email, owner_name, subscription_plan_id, subscription_status)
VALUES (1, 'ShawedGym', 'admin@shawedgym.com', 'System Admin', 1, 'active')
ON CONFLICT (id) DO NOTHING;

-- Delete existing admin user if exists
DELETE FROM users WHERE email = 'admin@shawedgym.com';

-- Create new admin user with correct password hash
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

-- Verify admin user was created
SELECT 
  id, 
  email, 
  role, 
  gym_id, 
  created_at,
  CASE WHEN password IS NOT NULL THEN 'Password set' ELSE 'No password' END as password_status
FROM users 
WHERE email = 'admin@shawedgym.com';
