const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, getDBStatus } = require('./config/db');
const cloudinaryService = require('./services/cloudinary.service');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const path = require('path');
const fs = require('fs');

// Connect to Database
connectDB();

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/delivery', require('./routes/deliveryRoutes'));
app.use('/api/rentals', require('./routes/rentalRoutes'));
app.use('/api/evidence', require('./routes/evidenceRoutes'));
app.use('/api/inspections', require('./routes/inspectionRoutes'));
app.use('/api/penalties', require('./routes/penaltyRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Serve Frontend Static Build if available
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Health check & System Information
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Fashion Rental Platform API',
    cloudinary: {
      configured: cloudinaryService.isConfigured(),
      cloudName: cloudinaryService.cloudName
    },
    database: {
      mongoConnected: getDBStatus(),
      mode: getDBStatus() ? 'MongoDB Replica/Standalone' : 'High-Resilience In-Memory Data Store'
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5001;

// Start server when executed directly
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Fashion Rental Backend listening on http://localhost:${PORT}`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`ℹ️  Port ${PORT} is already running! (Backend is already active on http://localhost:${PORT})`);
      process.exit(0);
    }
  });
}

module.exports = app;
