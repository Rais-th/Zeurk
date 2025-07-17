const axios = require('axios');

// Replace this with your actual Expo push token from the app console
const YOUR_ACTUAL_TOKEN = 'PASTE_YOUR_TOKEN_HERE';

async function registerRealToken() {
  console.log('📱 Registering Real Device Token');
  console.log('=================================\n');

  if (YOUR_ACTUAL_TOKEN === 'PASTE_YOUR_TOKEN_HERE') {
    console.log('❌ Please update YOUR_ACTUAL_TOKEN with your real token first!');
    console.log('');
    console.log('📋 HOW TO GET YOUR TOKEN:');
    console.log('1. Open Expo Go on your device');
    console.log('2. Open the Zeurk app');
    console.log('3. Look in the console for a line like:');
    console.log('   "🔔 App initialisé avec token: ExponentPushToken[...]"');
    console.log('4. Copy that token and replace YOUR_ACTUAL_TOKEN above');
    console.log('5. Run this script again');
    return;
  }

  try {
    console.log('🔄 Registering token:', YOUR_ACTUAL_TOKEN.substring(0, 30) + '...');
    
    const response = await axios.post('https://zeurk.vercel.app/api/driver/register', {
      pushToken: YOUR_ACTUAL_TOKEN,
      deviceId: 'real-device-' + Date.now(),
      timestamp: new Date().toISOString()
    });

    console.log('✅ Registration successful!');
    console.log('📊 Response:', response.data);
    
    // Check driver stats
    const statsResponse = await axios.get('https://zeurk.vercel.app/api/driver/stats');
    console.log(`📱 Total drivers now: ${statsResponse.data.totalDrivers}`);
    
    console.log('\n🧪 Now test by sending SMS to: +18447904199');
    console.log('📝 Message: "Course Bandal vers Gombe 18h"');
    console.log('🔔 You should receive a notification!');

  } catch (error) {
    console.error('❌ Registration failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

registerRealToken();