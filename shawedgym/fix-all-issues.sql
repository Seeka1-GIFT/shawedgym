-- Complete fix for all ShawedGym issues
-- This script will fix all database and authentication problems

-- Step 1: Create all necessary tables
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  member_limit INTEGER NOT NULL,
  features TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  gym_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  address TEXT,
  emergency_contact VARCHAR(100),
  emergency_phone VARCHAR(20),
  membership_type VARCHAR(50),
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'Active',
  gym_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  member_id INTEGER,
  plan_id INTEGER,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'completed',
  description TEXT,
  gym_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration_months INTEGER DEFAULT 1,
  features TEXT[],
  gym_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'Active',
  purchase_date DATE,
  purchase_price DECIMAL(10, 2),
  gym_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  instructor VARCHAR(100),
  schedule_time TIME,
  schedule_days VARCHAR(50),
  max_capacity INTEGER,
  gym_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trainers (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  specialization VARCHAR(100),
  hourly_rate DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'Active',
  gym_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL,
  check_in_time TIMESTAMP DEFAULT NOW(),
  check_out_time TIMESTAMP,
  gym_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50),
  date DATE DEFAULT CURRENT_DATE,
  gym_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 2: Insert default data
INSERT INTO subscription_plans (id, name, price, member_limit, features) 
VALUES (1, 'Basic', 29.99, 100, ARRAY['Basic dashboard', 'Member management', 'Payment tracking'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO gyms (id, name, owner_email, owner_name, subscription_plan_id, subscription_status)
VALUES (1, 'ShawedGym', 'admin@shawedgym.com', 'System Admin', 1, 'active')
ON CONFLICT (id) DO NOTHING;

-- Step 3: Clear all existing users and create fresh admin
DELETE FROM users;

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

-- Step 4: Add foreign key constraints
ALTER TABLE users ADD CONSTRAINT fk_users_gym FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
ALTER TABLE members ADD CONSTRAINT fk_members_gym FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
ALTER TABLE payments ADD CONSTRAINT fk_payments_gym FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
ALTER TABLE plans ADD CONSTRAINT fk_plans_gym FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
ALTER TABLE assets ADD CONSTRAINT fk_assets_gym FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
ALTER TABLE classes ADD CONSTRAINT fk_classes_gym FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
ALTER TABLE trainers ADD CONSTRAINT fk_trainers_gym FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
ALTER TABLE attendance ADD CONSTRAINT fk_attendance_gym FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;
ALTER TABLE expenses ADD CONSTRAINT fk_expenses_gym FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;

-- Step 5: Set NOT NULL constraints
ALTER TABLE users ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE members ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE payments ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE plans ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE assets ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE classes ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE trainers ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE attendance ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE expenses ALTER COLUMN gym_id SET NOT NULL;

-- Step 6: Insert sample data
INSERT INTO members (first_name, last_name, email, phone, membership_type, status, gym_id)
VALUES 
  ('Ahmed', 'Hassan', 'ahmed@example.com', '+1234567890', 'Premium', 'Active', 1),
  ('Fatima', 'Ali', 'fatima@example.com', '+1234567891', 'Basic', 'Active', 1);

INSERT INTO plans (name, price, duration_months, features, gym_id)
VALUES 
  ('Basic Plan', 29.99, 1, ARRAY['Gym access', 'Basic equipment'], 1),
  ('Premium Plan', 49.99, 1, ARRAY['Gym access', 'All equipment', 'Personal trainer'], 1);

INSERT INTO payments (member_id, plan_id, amount, payment_method, status, description, gym_id)
VALUES 
  (1, 1, 29.99, 'cash', 'completed', 'Monthly membership', 1),
  (2, 2, 49.99, 'credit_card', 'completed', 'Monthly membership', 1);

-- Step 7: Verify everything
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Gyms', COUNT(*) FROM gyms
UNION ALL
SELECT 'Members', COUNT(*) FROM members
UNION ALL
SELECT 'Plans', COUNT(*) FROM plans
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments;

-- Step 8: Show admin user details
SELECT 
  u.id, 
  u.email, 
  u.role, 
  u.gym_id, 
  g.name as gym_name,
  'Password: admin123' as login_info
FROM users u
LEFT JOIN gyms g ON u.gym_id = g.id
WHERE u.email = 'admin@shawedgym.com';
