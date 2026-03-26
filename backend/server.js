const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
const path = require('path');

// Load environment variables
dotenv.config();

const { pool } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Auto-migrate: ensure bids & notifications tables exist ───
async function ensureTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        buyer_id INT REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Bids & Notifications tables verified');
  } catch (error) {
    console.error('❌ Auto-migration error:', error.message);
  }
}
ensureTables();

// ─── 1. Logger First (To capture all attempts) ───
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] DEBUG: ${req.method} ${req.url}`);
  console.log(`Headers: ${JSON.stringify(req.headers)}`);
  next();
});

// ─── 2. CORS ───
app.use(cors());

// ─── 3. Payload Limits ───
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true, parameterLimit: 100000 }));

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ─── Routes ───
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const bidRoutes = require('./routes/bidRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/notifications', notificationRoutes);

// Test route to verify routing works
app.get('/api/ping', (req, res) => res.json({ success: true, message: 'pong' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🛒 CampusKart API is running!',
    version: '1.0.0',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
    },
  });
});

// Diagnostic endpoint to check if the server is updated
app.get('/api/init-check', (req, res) => {
  res.json({
    success: true,
    message: '🚀 CampusKart Backend is UPDATED with Bidding & Notifications!',
    timestamp: new Date().toISOString(),
    routes_loaded: ['bids', 'notifications', 'auth', 'products', 'users', 'messages']
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// ─── Start Server ───
app.listen(PORT, () => {
  console.log(`\n🛒 CampusKart Backend Server`);
  console.log(`   Running on: http://localhost:${PORT}`);
  console.log(`   DB Type:    ${process.env.DB_TYPE || 'mysql'}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
