-- Check the actual password hash length
SELECT 
    email,
    LENGTH(encrypted_password) as hash_length,
    encrypted_password
FROM users 
WHERE email = 'admin@test.com';

-- A bcrypt hash should be EXACTLY 60 characters
-- If it's not 60, the hash is corrupted

-- Delete the bad user
DELETE FROM profiles WHERE id = (SELECT id FROM users WHERE email = 'admin@test.com');
DELETE FROM users WHERE email = 'admin@test.com';

-- Create a NEW user with the EXACT correct hash
-- This hash is for password: "password123"
INSERT INTO users (id, email, encrypted_password, email_confirmed_at)
VALUES (
  UUID(),
  'admin@test.com',
  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
  NOW()
);

SET @user_id = (SELECT id FROM users WHERE email = 'admin@test.com');

INSERT INTO profiles (id, first_name, last_name, role)
VALUES (@user_id, 'Admin', 'User', 'admin');

-- Verify the new hash length (should be 60)
SELECT 
    email,
    LENGTH(encrypted_password) as hash_length,
    SUBSTRING(encrypted_password, 1, 30) as hash_preview
FROM users
WHERE email = 'admin@test.com';
