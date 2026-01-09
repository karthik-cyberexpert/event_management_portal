# Backend API - Quick Reference

## Server Status

Backend server running on: **http://localhost:3000**

## Test Endpoints

### Health Check
```bash
curl http://localhost:3000/health
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Get Events
```bash
curl http://localhost:3000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Starting the Backend

```bash
cd backend
node src/server.js
# OR with auto-reload
npm run dev
```

## Environment Configuration

Update `backend/.env`:
```env
DB_PASSWORD=your_actual_password
JWT_SECRET=your-random-secret-key
```

## Next Steps

1. ✅ Backend server is running
2. Update frontend `AuthContext.tsx` to use API client
3. Update frontend components to use API
4. Test login flow
5. Test event CRUD operations

## API Endpoints Available

**Auth:**
- POST `/api/auth/login`
- POST `/api/auth/signup`
- GET `/api/auth/me`

**Events:**
- GET `/api/events`
- GET `/api/events/:id`
- POST `/api/events`
- PUT `/api/events/:id`
- DELETE `/api/events/:id`
- POST `/api/events/:id/status`

## Frontend API Client

Use the new API client at `src/lib/api.ts`:

```typescript
import { api } from '@/lib/api';

// Login
const { token, user } = await api.auth.login(email, password);

// Get events
const events = await api.events.list();
```
