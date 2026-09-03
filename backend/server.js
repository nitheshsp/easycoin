/**
 * EasyCoin Central API Gateway & Server
 * Combines all 4 backend modules developed by your team.
 */
const express = require('express');
const cors = require('cors');
const { PORT } = require('./config/constants');

// Import Module Routes
const authRoutes = require('./routes/auth.routes');
const accountRoutes = require('./routes/account.routes');
const paymentRoutes = require('./routes/payment.routes');
const guardianRoutes = require('./routes/guardian.routes');

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

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
      guardian: 'Friend 4: Active'
    },
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/guardian', guardianRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 EasyCoin Backend Gateway running on port ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`==================================================\n`);
  });
}

module.exports = app;
