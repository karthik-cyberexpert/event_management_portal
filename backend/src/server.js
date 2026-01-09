require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS configuration - allow frontend to access backend
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API Routes
const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const venuesRoutes = require('./routes/venues');
const departmentsRoutes = require('./routes/departments');
const clubsRoutes = require('./routes/clubs');
const societiesRoutes = require('./routes/societies');
const usersRoutes = require('./routes/users');
const uploadRoutes = require('./routes/uploads');
const aiRoutes = require('./routes/ai');
const notificationsRoutes = require('./routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/venues', venuesRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/societies', societiesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationsRoutes);


// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
