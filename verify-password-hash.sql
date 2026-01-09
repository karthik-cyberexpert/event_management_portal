-- Test the password hash
-- Run this to see the exact hash in the database
SELECT id, email, encrypted_password 
FROM users 
WHERE email = 'admin@test.com';

-- If the hash doesn't start with '$2b$10$EixZaYVK1fsbw1ZfbX3OXe'
-- Then we need to update it

-- Update password to a new hash for "password123"
UPDATE users 
SET encrypted_password = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'
WHERE email = 'admin@test.com';

-- Verify it was updated
SELECT email, SUBSTRING(encrypted_password, 1, 30) as hash_preview
FROM users
WHERE email = 'admin@test.com';
