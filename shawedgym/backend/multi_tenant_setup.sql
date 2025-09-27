-- Multi-Tenant Setup for ShawedGym
-- This script adds gym_id to all tables and creates gyms table

-- Create gyms table
CREATE TABLE IF NOT EXISTS gyms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_email VARCHAR(255) UNIQUE NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  subscription_plan VARCHAR(50) DEFAULT 'basic',
  subscription_status VARCHAR(20) DEFAULT 'active',
  max_members INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add gym_id to all existing tables
ALTER TABLE members ADD COLUMN IF NOT EXISTS gym_id INTEGER REFERENCES gyms(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gym_id INTEGER REFERENCES gyms(id);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS gym_id INTEGER REFERENCES gyms(id);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS gym_id INTEGER REFERENCES gyms(id);
ALTER TABLE classes ADD COLUMN IF NOT EXISTS gym_id INTEGER REFERENCES gyms(id);
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS gym_id INTEGER REFERENCES gyms(id);
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS gym_id INTEGER REFERENCES gyms(id);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS gym_id INTEGER REFERENCES gyms(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS gym_id INTEGER REFERENCES gyms(id);

-- Create default gym (for existing data)
INSERT INTO gyms (id, name, owner_email, owner_name, subscription_plan, subscription_status, max_members)
VALUES (1, 'ShawedGym', 'admin@shawedgym.com', 'System Admin', 'premium', 'active', 1000)
ON CONFLICT (id) DO NOTHING;

-- Update existing data to belong to default gym
UPDATE members SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE payments SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE plans SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE assets SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE classes SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE trainers SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE attendance SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE expenses SET gym_id = 1 WHERE gym_id IS NULL;
UPDATE users SET gym_id = 1 WHERE gym_id IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_gym_id ON members(gym_id);
CREATE INDEX IF NOT EXISTS idx_payments_gym_id ON payments(gym_id);
CREATE INDEX IF NOT EXISTS idx_plans_gym_id ON plans(gym_id);
CREATE INDEX IF NOT EXISTS idx_assets_gym_id ON assets(gym_id);
CREATE INDEX IF NOT EXISTS idx_classes_gym_id ON classes(gym_id);
CREATE INDEX IF NOT EXISTS idx_trainers_gym_id ON trainers(gym_id);
CREATE INDEX IF NOT EXISTS idx_attendance_gym_id ON attendance(gym_id);
CREATE INDEX IF NOT EXISTS idx_expenses_gym_id ON expenses(gym_id);
CREATE INDEX IF NOT EXISTS idx_users_gym_id ON users(gym_id);

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  max_members INTEGER NOT NULL,
  features JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price, max_members, features) VALUES
('basic', 29.99, 100, '["Basic dashboard", "Member management", "Payment tracking", "Basic reports"]'),
('premium', 59.99, 500, '["Advanced analytics", "Class scheduling", "Trainer management", "Advanced reports", "Email notifications"]'),
('enterprise', 99.99, 1000, '["Custom branding", "API access", "Priority support", "Advanced analytics", "Unlimited features"]')
ON CONFLICT (name) DO NOTHING;

-- Create gym subscriptions table
CREATE TABLE IF NOT EXISTS gym_subscriptions (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER REFERENCES gyms(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES subscription_plans(id),
  status VARCHAR(20) DEFAULT 'active',
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default subscription for existing gym
INSERT INTO gym_subscriptions (gym_id, plan_id, status, end_date)
SELECT 1, id, 'active', NOW() + INTERVAL '1 month'
FROM subscription_plans WHERE name = 'premium'
ON CONFLICT DO NOTHING;

-- Add constraints to ensure data integrity
ALTER TABLE members ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE payments ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE plans ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE assets ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE classes ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE trainers ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE attendance ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE expenses ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE users ALTER COLUMN gym_id SET NOT NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_gyms_updated_at BEFORE UPDATE ON gyms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for gym statistics
CREATE OR REPLACE VIEW gym_stats AS
SELECT 
    g.id,
    g.name,
    g.owner_email,
    g.subscription_plan,
    g.subscription_status,
    g.max_members,
    COUNT(DISTINCT m.id) as current_members,
    COUNT(DISTINCT p.id) as total_payments,
    COALESCE(SUM(p.amount), 0) as total_revenue,
    g.created_at
FROM gyms g
LEFT JOIN members m ON g.id = m.gym_id
LEFT JOIN payments p ON g.id = p.gym_id AND p.status = 'completed'
GROUP BY g.id, g.name, g.owner_email, g.subscription_plan, g.subscription_status, g.max_members, g.created_at;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO neondb_owner;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO neondb_owner;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO neondb_owner;

COMMIT;
