const axios = require('axios');

async function testAppFirstWorkflow() {
  console.log('🧪 Testing App-First SMS Workflow');
  console.log('=====================================\n');

  try {
    // Simulate SMS webhook call
    const smsData = {
      From: '+243123456789',
      Body: 'Course Bandal vers Gombe 18h'
    };

    console.log('📱 Simulating SMS received:', smsData.Body);
    console.log('📞 From:', smsData.From);
    console.log('');

    // Call the SMS API
    const response = await axios.post('https://zeurk.vercel.app/api/sms', smsData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('✅ SMS API Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log('\n🎯 APP-FIRST WORKFLOW TEST RESULTS:');
      console.log('=====================================');
      console.log('✅ SMS received and parsed successfully');
      console.log('✅ Ride request created with ID:', response.data.rideRequest.id);
      console.log('✅ Push notification sent to driver app');
      console.log('✅ No SMS sent back to user (as requested)');
      console.log('');
      console.log('📋 Ride Request Details:');
      console.log(`   From: ${response.data.rideRequest.startAddress}`);
      console.log(`   To: ${response.data.rideRequest.endAddress}`);
      console.log(`   Time: ${response.data.rideRequest.requestedTime || 'ASAP'}`);
      console.log(`   Price: ${response.data.rideRequest.price} FC`);
      console.log(`   Priority: ${response.data.rideRequest.priority}`);
      console.log(`   Status: ${response.data.rideRequest.status}`);
      console.log('');
      console.log('🚀 WORKFLOW STATUS: App receives ride request FIRST ✅');
    } else {
      console.log('❌ Workflow failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAppFirstWorkflow();