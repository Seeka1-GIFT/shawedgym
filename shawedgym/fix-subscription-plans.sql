-- Fix subscription plans table
-- This script ensures the subscription_plans table exists with proper data

-- Create subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    member_limit INTEGER NOT NULL,
    features TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Clear existing data and insert fresh plans
DELETE FROM subscription_plans;

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price, member_limit, features) VALUES
('basic', 35.00, 50, ARRAY['Basic gym management', 'Member tracking', 'Payment processing']),
('premium', 75.00, 150, ARRAY['Advanced analytics', 'Class scheduling', 'Trainer management', 'Equipment tracking']),
('enterprise', 150.00, 500, ARRAY['Multi-location support', 'Advanced reporting', 'API access', 'Custom integrations']);

-- Verify the data
SELECT * FROM subscription_plans ORDER BY price;
