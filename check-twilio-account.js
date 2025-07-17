const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

async function checkAccountAndVerifyNumber() {
    console.log('🔍 Checking Twilio Account Status...\n');
    
    try {
        // Check account info
        const account = await client.api.accounts(accountSid).fetch();
        console.log(`📋 Account Status: ${account.status}`);
        console.log(`💰 Account Type: ${account.type}`);
        
        if (account.type === 'Trial') {
            console.log('\n⚠️  You are using a Twilio Trial account');
            console.log('📱 Trial accounts can only send SMS to verified phone numbers');
            
            // List verified phone numbers
            console.log('\n📞 Checking verified phone numbers...');
            const validationRequests = await client.validationRequests.list({limit: 20});
            
            if (validationRequests.length > 0) {
                console.log('✅ Verified phone numbers:');
                validationRequests.forEach(request => {
                    if (request.validationCode) {
                        console.log(`   ${request.phoneNumber} - Status: ${request.status || 'Verified'}`);
                    }
                });
            } else {
                console.log('❌ No verified phone numbers found');
            }
            
            console.log('\n🔧 To fix the SMS issue:');
            console.log('1. Go to https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
            console.log('2. Click "Add a new number"');
            console.log('3. Enter the phone number you want to send SMS to');
            console.log('4. Verify it with the code Twilio sends');
            console.log('5. Then test your SMS system again');
            
            console.log('\n💡 Alternative: Upgrade to a paid account to send to any number');
            
        } else {
            console.log('\n✅ You have a paid account - SMS should work to any number');
        }
        
    } catch (error) {
        console.error('❌ Error checking account:', error.message);
    }
}

checkAccountAndVerifyNumber();