const axios = require('axios');

async function testRealDeviceNotification() {
  console.log('📱 Testing Real Device Notification Setup');
  console.log('==========================================\n');

  try {
    // First, let's see what drivers are currently registered
    console.log('1️⃣ Checking current driver registrations...');
    const statsResponse = await axios.get('https://zeurk.vercel.app/api/driver/stats');
    console.log(`📊 Current drivers: ${statsResponse.data.totalDrivers}`);
    
    // Test with a real Expo push token format
    const realDeviceToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]'; // This will be replaced by your actual token
    
    console.log('\n2️⃣ Registering real device token...');
    console.log('💡 IMPORTANT: You need to get your actual Expo push token from the app');
    console.log('');
    console.log('📋 TO GET YOUR REAL TOKEN:');
    console.log('1. Open Expo Go app on your device');
    console.log('2. Open the Zeurk app');
    console.log('3. Check the console logs for "Token push:" message');
    console.log('4. Copy that token and use it below');
    console.log('');
    
    // Register a test token (you'll need to replace this with your actual token)
    try {
      const registerResponse = await axios.post('https://zeurk.vercel.app/api/driver/register', {
        pushToken: realDeviceToken,
        deviceId: 'test-device-' + Date.now(),
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ Token registration response:', registerResponse.data);
    } catch (error) {
      console.log('⚠️ Token registration failed (expected with dummy token)');
    }
    
    console.log('\n3️⃣ Testing SMS to notification workflow...');
    
    // Simulate SMS
    const smsData = {
      From: '+243123456789',
      Body: 'Course Bandal vers Gombe 18h'
    };

    const smsResponse = await axios.post('https://zeurk.vercel.app/api/sms', smsData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('✅ SMS processed successfully');
    console.log('📊 Ride request created:', smsResponse.data.rideRequest.id);
    
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('========================');
    console.log('');
    console.log('If you\'re not receiving notifications:');
    console.log('');
    console.log('1. 📱 DEVICE SETUP:');
    console.log('   - Make sure you\'re using a physical device (not simulator)');
    console.log('   - Allow notifications when prompted');
    console.log('   - Keep the Expo Go app open');
    console.log('');
    console.log('2. 🔔 TOKEN REGISTRATION:');
    console.log('   - Open Zeurk app in Expo Go');
    console.log('   - Look for "Token push:" in console');
    console.log('   - Register as driver in the app');
    console.log('');
    console.log('3. 🧪 TEST NOTIFICATION:');
    console.log('   - Send SMS to +18447904199');
    console.log('   - Message: "Course Bandal vers Gombe 18h"');
    console.log('   - Check if notification appears');
    console.log('');
    console.log('4. 📋 MANUAL TOKEN REGISTRATION:');
    console.log('   - Get your token from app console');
    console.log('   - Use the register-real-token.js script');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testRealDeviceNotification();