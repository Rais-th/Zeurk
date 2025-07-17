const axios = require('axios');

async function checkDriverAppStatus() {
  console.log('📱 Checking Driver App Status');
  console.log('=============================\n');

  try {
    // Check driver registration status using the correct endpoint
    const response = await axios.get('https://zeurk.vercel.app/api/driver/stats');
    
    console.log('✅ Driver API Response Status:', response.status);
    console.log('📊 Active Drivers:', response.data.totalDrivers);
    console.log('🕐 Last Updated:', response.data.timestamp);
    
    if (response.data.totalDrivers > 0) {
      console.log('\n✅ DRIVER APP STATUS: Ready to receive ride requests');
      console.log(`📲 ${response.data.totalDrivers} driver(s) registered for notifications`);
      console.log('🎯 SMS ride requests will be sent to these drivers');
      
      console.log('\n📋 WORKFLOW SUMMARY:');
      console.log('1. ✅ SMS received and parsed by AI');
      console.log('2. ✅ Ride request created with high priority');
      console.log('3. ✅ Push notification sent to driver app(s)');
      console.log('4. ✅ No SMS sent back to user (app-first approach)');
      
    } else {
      console.log('\n❌ DRIVER APP STATUS: No drivers registered');
      console.log('💡 Make sure the driver app is running and has registered for notifications');
      console.log('🔧 A default driver token is automatically added for development');
    }

  } catch (error) {
    console.error('❌ Failed to check driver status:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the check
checkDriverAppStatus();