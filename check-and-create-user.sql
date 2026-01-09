-- Quick check of what's in the database
SELECT 'Users:' as info;
SELECT id, email, email_confirmed_at FROM users;

SELECT 'Profiles:' as info;
SELECT id, first_name, last_name, role FROM profiles;

-- If no users exist, run this:
-- DELETE FROM profiles WHERE email = 'admin@test.com';
-- DELETE FROM users WHERE email = 'admin@test.com';

-- Then create the test user:
INSERT INTO users (id, email, encrypted_password, email_confirmed_at)
SELECT * FROM (SELECT UUID() as id, 'admin@test.com' as email, '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW' as encrypted_password, NOW() as email_confirmed_at) AS tmp
WHERE NOT EXISTS (SELECT email FROM users WHERE email = 'admin@test.com');

SET @user_id = (SELECT id FROM users WHERE email = 'admin@test.com');

INSERT INTO profiles (id, first_name, last_name, role)
SELECT * FROM (SELECT @user_id as id, 'Admin' as first_name, 'User' as last_name, 'admin' as role) AS tmp
WHERE NOT EXISTS (SELECT id FROM profiles WHERE id = @user_id);

-- Verify
SELECT u.id, u.email, p.first_name, p.last_name, p.role 
FROM users u 
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'admin@test.com';
