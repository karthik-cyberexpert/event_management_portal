# Debugging the 401 Login Error

## Steps to Debug

### 1. Check if user exists in MySQL

Run this in your MySQL terminal:

```sql
SELECT u.id, u.email, u.encrypted_password, p.first_name, p.last_name, p.role 
FROM users u 
LEFT JOIN profiles p ON u.id = p.id;
```

**Expected:** Should show at least one user (admin@test.com)

---

### 2. If NO users exist, create one:

```sql
INSERT INTO users (id, email, encrypted_password, email_confirmed_at)
VALUES (UUID(), 'admin@test.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', NOW());

SET @user_id = (SELECT id FROM users WHERE email = 'admin@test.com');

INSERT INTO profiles (id, first_name, last_name, role)
VALUES (@user_id, 'Admin', 'User', 'admin');
```

---

### 3. Check Backend Logs

The backend terminal should show errors when login fails. Look for:
- "Invalid email or password"
- Database query errors
- Any stack traces

**Where to look:** The terminal running `node src/server.js`

---

### 4. Test API Directly

Open a new PowerShell and test:

```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@test.com\",\"password\":\"password123\"}'
```

**Expected response:** 
- Success: `{"token":"...","user":{...}}`
- Failure: `{"error":"Invalid email or password"}`

---

### 5. Common Issues

**Issue:** User exists but no profile
**Fix:**
```sql
SET @user_id = (SELECT id FROM users WHERE email = 'admin@test.com');
INSERT INTO profiles (id, first_name, last_name, role)
VALUES (@user_id, 'Admin', 'User', 'admin');
```

**Issue:** Wrong password hash
**Fix:** Re-create user with correct hash (see step 2)

**Issue:** Email doesn't match case
**Fix:** MySQL is case-sensitive by default. Use exact email: `admin@test.com`

---

## Quick Test Checklist

- [ ] Database has users table
- [ ] User exists: `admin@test.com`
- [ ] Profile exists for that user
- [ ] Backend is running without errors
- [ ] Backend shows "✅ MySQL connected successfully"
- [ ] No errors in backend console when you click login

---

## Next Step

Run the SQL check in your MySQL terminal and tell me what you see!
