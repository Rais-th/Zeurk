// In-memory storage for driver tokens (in production, use a database)
let driverTokens = new Set();

// Add default driver for development
const initializeDefaultDriver = () => {
  const defaultDriverToken = 'ExponentPushToken[dev-default-driver-123456789]';
  driverTokens.add(defaultDriverToken);
  console.log(`🔧 Mode développement: Chauffeur par défaut ajouté`);
  console.log(`📱 Token: ${defaultDriverToken.substring(0, 30)}...`);
  console.log(`👥 Total chauffeurs actifs: ${driverTokens.size}`);
};

// Initialize default driver on module load
initializeDefaultDriver();

// Register a driver's push token
const registerDriver = (req, res) => {
  try {
    const { pushToken, deviceId, timestamp } = req.body;
    
    if (!pushToken) {
      return res.status(400).json({ error: 'Push token is required' });
    }
    
    // Add token to our storage
    driverTokens.add(pushToken);
    
    console.log(`✅ Driver registered: ${pushToken.substring(0, 20)}...`);
    console.log(`📱 Total active drivers: ${driverTokens.size}`);
    
    res.json({ 
      success: true, 
      message: 'Driver registered successfully',
      totalDrivers: driverTokens.size
    });
  } catch (error) {
    console.error('Error registering driver:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Unregister a driver's push token
const unregisterDriver = (req, res) => {
  try {
    const { pushToken, deviceId } = req.body;
    
    if (!pushToken) {
      return res.status(400).json({ error: 'Push token is required' });
    }
    
    // Remove token from our storage
    const wasDeleted = driverTokens.delete(pushToken);
    
    if (wasDeleted) {
      console.log(`❌ Driver unregistered: ${pushToken.substring(0, 20)}...`);
    }
    
    console.log(`📱 Total active drivers: ${driverTokens.size}`);
    
    res.json({ 
      success: true, 
      message: 'Driver unregistered successfully',
      totalDrivers: driverTokens.size
    });
  } catch (error) {
    console.error('Error unregistering driver:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all driver tokens
const getDriverTokens = (req, res) => {
  try {
    const tokens = Array.from(driverTokens);
    res.json({ 
      tokens,
      count: tokens.length
    });
  } catch (error) {
    console.error('Error getting driver tokens:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get driver statistics
const getDriverStats = (req, res) => {
  try {
    res.json({
      totalDrivers: driverTokens.size,
      activeTokens: Array.from(driverTokens).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting driver stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  registerDriver,
  unregisterDriver,
  getDriverTokens,
  getDriverStats,
  // Export the tokens set for use in SMS handler
  getActiveTokens: () => Array.from(driverTokens)
};