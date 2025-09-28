-- Fix admin password to use correct hash for "admin123"
-- The current admin user has password "password" but we need "admin123"

-- First, let's check the current admin user
SELECT 
  id, 
  email, 
  role, 
  gym_id, 
  created_at,
  CASE WHEN password IS NOT NULL THEN 'Password set' ELSE 'No password' END as password_status
FROM users 
WHERE email = 'admin@shawedgym.com';

-- Update the admin user password to the correct hash for "admin123"
UPDATE users 
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@shawedgym.com';

-- Verify the update
SELECT 
  id, 
  email, 
  role, 
  gym_id, 
  created_at,
  'Password updated to admin123' as password_status
FROM users 
WHERE email = 'admin@shawedgym.com';
