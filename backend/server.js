const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── 1. Logger First (To capture all attempts) ───
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url} - Content-Length: ${req.headers['content-length'] || 0}`);
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

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

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
