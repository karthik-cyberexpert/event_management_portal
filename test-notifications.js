const API_BASE = 'http://localhost:3000/api';

async function testMarkAllAsRead() {
  try {
    // 1. Login to get token
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gmail.com', password: 'password' })
    });
    
    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        return;
    }
    const { token } = await loginRes.json();
    console.log('Logged in, token received.');

    // 2. List notifications
    const listRes = await fetch(`${API_BASE}/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const notifications = await listRes.json();
    console.log(`Current unread notifications: ${notifications.length}`);

    // 3. Mark all as read
    console.log('Calling mark-all-read...');
    const markRes = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!markRes.ok) {
        console.error('Mark all failed:', await markRes.text());
        // Check if 404 or something else
        console.log('Status:', markRes.status);
    } else {
        const markStatus = await markRes.json();
        console.log('Mark all res:', markStatus);
    }

    // 4. Verify list again
    const verifyRes = await fetch(`${API_BASE}/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const verifiedNotifications = await verifyRes.json();
    console.log(`Unread notifications after mark-all: ${verifiedNotifications.length}`);

  } catch (err) {
    console.error('Test failed:', err);
  }
}

testMarkAllAsRead();
