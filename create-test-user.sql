-- Create a test admin user for login
-- Corrected version matching actual schema

-- Create test user
INSERT INTO users (id, email, encrypted_password, email_confirmed_at)
VALUES (
  UUID(),
  'admin@test.com',
  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
  NOW()
);

-- Get the user ID
SET @user_id = (SELECT id FROM users WHERE email = 'admin@test.com');

-- Create profile
INSERT INTO profiles (id, first_name, last_name, role)
VALUES (@user_id, 'Admin', 'User', 'admin');

-- Verify the user was created
SELECT u.id, u.email, p.first_name, p.last_name, p.role
FROM users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'admin@test.com';

-- Login credentials:
-- Email: admin@test.com
-- Password: password123
