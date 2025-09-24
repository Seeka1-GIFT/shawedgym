-- ShawedGym Database Setup Script
-- Run this in your PostgreSQL database (shawedgym)

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create members table
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    membership_type VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    address TEXT,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    features JSONB,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    schedule VARCHAR(100) NOT NULL,
    trainer VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL,
    enrolled INTEGER DEFAULT 0,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    purchase_date DATE,
    purchase_price DECIMAL(10,2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trainers table
CREATE TABLE IF NOT EXISTS trainers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    specialization VARCHAR(100),
    experience INTEGER,
    hourly_rate DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP NOT NULL,
    check_out_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(50) NOT NULL,
    description TEXT,
    plan_id INTEGER REFERENCES plans(id),
    receipt_number VARCHAR(50),
    status VARCHAR(20) DEFAULT 'completed',
    payment_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    vendor VARCHAR(100),
    status VARCHAR(20) DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reports table (summary snapshots)
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    report_type VARCHAR(50) NOT NULL, -- e.g., financial, membership
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_revenue NUMERIC(12,2) DEFAULT 0,
    total_expenses NUMERIC(12,2) DEFAULT 0,
    net_profit NUMERIC(12,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password, first_name, last_name, role) 
VALUES ('admin@shawedgym.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Administrator', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample data for testing

-- Sample plans
INSERT INTO plans (name, price, duration, features, description) VALUES
('Basic Monthly', 50.00, '1 month', '["Gym access", "Locker room"]', 'Basic gym membership with access to all equipment'),
('Premium Monthly', 75.00, '1 month', '["Gym access", "Group classes", "Locker room"]', 'Premium membership with classes included'),
('VIP Monthly', 120.00, '1 month', '["All access", "Personal trainer", "Nutrition consultation"]', 'VIP membership with personal training')
ON CONFLICT DO NOTHING;

-- Sample members
INSERT INTO members (first_name, last_name, email, phone, membership_type, status) VALUES
('Ahmed', 'Hassan', 'ahmed@example.com', '252-61-123456', 'premium', 'Active'),
('Fatima', 'Ali', 'fatima@example.com', '252-61-789012', 'basic', 'Active'),
('Mohamed', 'Omar', 'mohamed@example.com', '252-61-345678', 'vip', 'Active')
ON CONFLICT (email) DO NOTHING;

-- Sample classes
INSERT INTO classes (title, schedule, trainer, capacity, enrolled, description) VALUES
('Morning Yoga', 'Mon, Wed, Fri - 7:00 AM', 'Sarah Johnson', 20, 15, 'Relaxing yoga class to start your day'),
('HIIT Training', 'Tue, Thu - 6:00 PM', 'Mike Wilson', 15, 12, 'High-intensity interval training'),
('Evening Pilates', 'Mon, Wed - 7:00 PM', 'Lisa Chen', 12, 8, 'Core strengthening pilates class')
ON CONFLICT DO NOTHING;

-- Sample trainers
INSERT INTO trainers (first_name, last_name, email, phone, specialization, experience, hourly_rate) VALUES
('Sarah', 'Johnson', 'sarah@shawedgym.com', '252-61-111111', 'Yoga & Flexibility', 5, 50.00),
('Mike', 'Wilson', 'mike@shawedgym.com', '252-61-222222', 'HIIT & Cardio', 7, 60.00),
('Lisa', 'Chen', 'lisa@shawedgym.com', '252-61-333333', 'Pilates & Core', 4, 45.00)
ON CONFLICT (email) DO NOTHING;

-- Sample payments
INSERT INTO payments (member_id, amount, method, description, receipt_number, status, payment_date) VALUES
(1, 75.00, 'card', 'Premium Monthly Membership', 'PAY001', 'completed', CURRENT_DATE - INTERVAL '1 day'),
(2, 50.00, 'cash', 'Basic Monthly Membership', 'PAY002', 'completed', CURRENT_DATE - INTERVAL '2 days'),
(3, 120.00, 'transfer', 'VIP Monthly Membership', 'PAY003', 'pending', CURRENT_DATE - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- Sample expenses
INSERT INTO expenses (title, amount, category, description, expense_date, vendor) VALUES
('Equipment Maintenance', 500.00, 'maintenance', 'Monthly equipment servicing', CURRENT_DATE - INTERVAL '5 days', 'GymTech Services'),
('Electricity Bill', 300.00, 'utilities', 'Monthly electricity bill', CURRENT_DATE - INTERVAL '10 days', 'Power Company'),
('Cleaning Supplies', 150.00, 'supplies', 'Monthly cleaning supplies', CURRENT_DATE - INTERVAL '15 days', 'CleanCorp')
ON CONFLICT DO NOTHING;

-- Sample assets
INSERT INTO assets (name, type, location, status, purchase_date, purchase_price, description) VALUES
('Treadmill Pro X1', 'cardio', 'Zone A', 'active', '2024-01-15', 2500.00, 'High-end treadmill with advanced features'),
('Olympic Barbell Set', 'strength', 'Zone B', 'active', '2024-01-10', 800.00, 'Professional Olympic barbell with plates'),
('Leg Press Machine', 'strength', 'Zone B', 'maintenance', '2023-12-20', 3000.00, 'Heavy-duty leg press machine'),
('Elliptical Trainer', 'cardio', 'Zone A', 'active', '2024-02-01', 1800.00, 'Low-impact elliptical trainer')
ON CONFLICT DO NOTHING;

-- Sample attendance records
INSERT INTO attendance (member_id, check_in_time, check_out_time) VALUES
(1, CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(2, CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(3, CURRENT_TIMESTAMP - INTERVAL '1 hour', NULL)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(check_in_time);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- Update function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trainers_updated_at BEFORE UPDATE ON trainers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



