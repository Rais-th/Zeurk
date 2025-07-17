const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Import handlers
const smsHandler = require('./api/sms');
const driverHandlers = require('./api/drivers');

// Routes
app.post('/api/sms', smsHandler);

// Driver management routes
app.post('/api/driver/register', driverHandlers.registerDriver);
app.post('/api/driver/unregister', driverHandlers.unregisterDriver);
app.get('/api/driver/tokens', driverHandlers.getDriverTokens);
app.get('/api/driver/stats', driverHandlers.getDriverStats);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Zeurk SMS Backend Server',
    endpoints: {
      sms: '/api/sms',
      driverRegister: '/api/driver/register',
      driverUnregister: '/api/driver/unregister',
      driverTokens: '/api/driver/tokens',
      driverStats: '/api/driver/stats',
      health: '/health'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Zeurk SMS Backend running on port ${PORT}`);
  console.log(`📱 SMS Webhook URL: http://localhost:${PORT}/api/sms`);
  console.log(`👥 Driver API: http://localhost:${PORT}/api/driver/*`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;