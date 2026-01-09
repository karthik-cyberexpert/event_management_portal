-- Simple diagnostic query
-- Copy and paste this entire block into your MySQL terminal

USE event_management;

-- Check if tables exist
SHOW TABLES;

-- Check users table
SELECT 'Users table:' as step;
SELECT id, email, SUBSTRING(encrypted_password, 1, 20) as password_preview, email_confirmed_at 
FROM users;

-- Check profiles table  
SELECT 'Profiles table:' as step;
SELECT id, first_name, last_name, role 
FROM profiles;

-- Check joined data
SELECT 'User-Profile JOIN:' as step;
SELECT u.id, u.email, p.first_name, p.last_name, p.role
FROM users u
LEFT JOIN profiles p ON u.id = p.id;
