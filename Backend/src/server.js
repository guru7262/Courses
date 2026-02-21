const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// CORS configuration - IMPORTANT for authentication to work
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5000', // Your frontend URL
  credentials: true // Required for cookies
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Connect to MongoDB
connectDB();

const profileRoutes = require('./auth/routes/profileRoutes');
   app.use('/api/profile', profileRoutes);

// Import auth routes
const authRoutes = require('./auth/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Import your existing routes
const categoriesRouter = require('./routes/categories');
const notificationsRouter = require('./routes/notifications');

// Use your existing routes
app.use('/api/categories', categoriesRouter);
app.use('/api/notifications', notificationsRouter);

// Test API route
app.get('/api', (req, res) => {
  res.json({ message: 'API is working' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});
