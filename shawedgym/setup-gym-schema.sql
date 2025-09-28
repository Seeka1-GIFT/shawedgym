-- Setup gym schema for individual gym creation
-- This script ensures all required tables exist with proper relationships

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

-- 2. Create gyms table if it doesn't exist
CREATE TABLE IF NOT EXISTS gyms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_email VARCHAR(255) NOT NULL UNIQUE,
    owner_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    subscription_plan_id INTEGER REFERENCES subscription_plans(id),
    max_members INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create gym_subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS gym_subscriptions (
    id SERIAL PRIMARY KEY,
    gym_id INTEGER REFERENCES gyms(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES subscription_plans(id),
    status VARCHAR(50) DEFAULT 'active',
    start_date TIMESTAMP DEFAULT NOW(),
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Ensure users table has gym_id column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'gym_id') THEN
        ALTER TABLE users ADD COLUMN gym_id INTEGER REFERENCES gyms(id);
    END IF;
END $$;

-- 5. Insert default subscription plans if they don't exist
INSERT INTO subscription_plans (name, price, member_limit, features) 
SELECT 'basic', 35.00, 50, ARRAY['Basic gym management', 'Member tracking', 'Payment processing']
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'basic');

INSERT INTO subscription_plans (name, price, member_limit, features) 
SELECT 'premium', 75.00, 150, ARRAY['Advanced analytics', 'Class scheduling', 'Trainer management', 'Equipment tracking']
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'premium');

INSERT INTO subscription_plans (name, price, member_limit, features) 
SELECT 'enterprise', 150.00, 500, ARRAY['Multi-location support', 'Advanced reporting', 'API access', 'Custom integrations']
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'enterprise');

-- 6. Create a default gym if none exists
INSERT INTO gyms (name, owner_email, owner_name, phone, address, subscription_plan_id, max_members)
SELECT 'Default Gym', 'system@shawedgym.com', 'System Admin', '', '', 1, 50
WHERE NOT EXISTS (SELECT 1 FROM gyms WHERE id = 1);

-- 7. Update existing users to have gym_id = 1 if they don't have one
UPDATE users SET gym_id = 1 WHERE gym_id IS NULL;

-- 8. Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'users_gym_id_fkey') THEN
        ALTER TABLE users ADD CONSTRAINT users_gym_id_fkey 
        FOREIGN KEY (gym_id) REFERENCES gyms(id);
    END IF;
END $$;

-- 9. Verify the setup
SELECT 'Setup completed successfully' as status;
SELECT 'Users with gym_id:' as info, COUNT(*) as count FROM users WHERE gym_id IS NOT NULL;
SELECT 'Gyms created:' as info, COUNT(*) as count FROM gyms;
SELECT 'Subscription plans:' as info, COUNT(*) as count FROM subscription_plans;
