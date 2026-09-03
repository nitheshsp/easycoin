/**
 * EasyCoin Central API Gateway & Server
 * Combines all 4 backend modules developed by your team.
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT } = require('./config/constants');

// Import Module Routes
const authRoutes = require('./routes/auth.routes');
const accountRoutes = require('./routes/account.routes');
const paymentRoutes = require('./routes/payment.routes');
const guardianRoutes = require('./routes/guardian.routes');
const circleRoutes = require('./routes/circle.routes');

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..')));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'EasyCoin Accessible Banking Backend Gateway',
    version: '1.0.0',
    modules: {
      auth: 'Friend 1: Active',
      account: 'Friend 2: Active',
      payments: 'Friend 3: Active',
      guardian: 'Friend 4: Active',
      circle: 'UPI Circle: Active'
    },
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/guardian', guardianRoutes);
app.use('/api/circle', circleRoutes);

// 404 Handler for undefined API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Start Server with resilient fallback (e.g. if macOS AirPlay uses port 5000)
if (require.main === module) {
  const startServer = (port) => {
    const server = app.listen(port, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 EasyCoin Backend Gateway running on port ${port}`);
      console.log(`🔗 Health Check: http://localhost:${port}/api/health`);
      console.log(`🌐 Website Frontend: http://localhost:${port}/`);
      console.log(`==================================================\n`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${port} is occupied (macOS AirPlay / ControlCenter). Automatically switching to port ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  };

  startServer(Number(PORT));
}

module.exports = app;
