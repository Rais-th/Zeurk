const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

async function listVerifiedNumbers() {
    console.log('🔍 Checking Twilio Trial Account Limitations...\n');
    
    try {
        // Check account info
        const account = await client.api.accounts(accountSid).fetch();
        console.log(`📋 Account Status: ${account.status}`);
        console.log(`💰 Account Type: ${account.type}`);
        
        console.log('\n⚠️  TRIAL ACCOUNT LIMITATION DETECTED');
        console.log('📱 Trial accounts can only send SMS to verified phone numbers');
        
        // List outgoing caller IDs (verified numbers)
        console.log('\n📞 Checking verified phone numbers...');
        const outgoingCallerIds = await client.outgoingCallerIds.list();
        
        if (outgoingCallerIds.length > 0) {
            console.log('✅ Currently verified phone numbers:');
            outgoingCallerIds.forEach(callerId => {
                console.log(`   ${callerId.phoneNumber} - ${callerId.friendlyName}`);
            });
        } else {
            console.log('❌ No verified phone numbers found');
        }
        
        console.log('\n🔧 TO FIX THE SMS ISSUE:');
        console.log('');
        console.log('METHOD 1 - Verify Your Phone Number:');
        console.log('1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
        console.log('2. Click "Add a new number"');
        console.log('3. Enter YOUR phone number (the one you want to receive SMS)');
        console.log('4. Twilio will call/SMS you with a verification code');
        console.log('5. Enter the code to verify');
        console.log('6. Test your SMS system again');
        console.log('');
        console.log('METHOD 2 - Upgrade Account (Recommended):');
        console.log('1. Go to: https://console.twilio.com/billing');
        console.log('2. Add $20+ to your account');
        console.log('3. This removes trial limitations');
        console.log('4. You can then send SMS to ANY phone number');
        
        console.log('\n💡 For testing, verify your personal phone number first!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

listVerifiedNumbers();