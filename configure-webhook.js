const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const WEBHOOK_URL = 'https://zeurk.vercel.app/api/sms';

async function configureTwilioWebhook() {
    console.log('🔧 Configuring Twilio SMS Webhook...\n');
    
    try {
        // Get the phone number details
        console.log(`📱 Phone Number: ${twilioPhoneNumber}`);
        console.log(`🔗 Webhook URL: ${WEBHOOK_URL}`);
        
        // Update the phone number configuration
        const phoneNumber = await client.incomingPhoneNumbers
            .list({ phoneNumber: twilioPhoneNumber })
            .then(phoneNumbers => {
                if (phoneNumbers.length === 0) {
                    throw new Error(`Phone number ${twilioPhoneNumber} not found in your Twilio account`);
                }
                return phoneNumbers[0];
            });

        console.log(`\n📋 Current Configuration:`);
        console.log(`   SID: ${phoneNumber.sid}`);
        console.log(`   SMS URL: ${phoneNumber.smsUrl || 'Not set'}`);
        console.log(`   SMS Method: ${phoneNumber.smsMethod || 'Not set'}`);

        // Update the webhook configuration
        const updatedNumber = await client.incomingPhoneNumbers(phoneNumber.sid)
            .update({
                smsUrl: WEBHOOK_URL,
                smsMethod: 'POST'
            });

        console.log(`\n✅ Webhook Configuration Updated!`);
        console.log(`   New SMS URL: ${updatedNumber.smsUrl}`);
        console.log(`   New SMS Method: ${updatedNumber.smsMethod}`);
        
        console.log(`\n🎉 Twilio webhook is now configured!`);
        console.log(`📱 Send an SMS to ${twilioPhoneNumber} with:`);
        console.log(`   "Course Bandal vers Gombe 18h"`);
        console.log(`\n📨 You should receive two SMS responses:`);
        console.log(`   1. Immediate confirmation`);
        console.log(`   2. Driver assignment (after 3 seconds)`);

    } catch (error) {
        console.error('❌ Error configuring webhook:', error.message);
        
        if (error.code === 20003) {
            console.error('\n🔑 Authentication failed. Please check your Twilio credentials in .env file');
        } else if (error.code === 20404) {
            console.error('\n📱 Phone number not found. Please verify the number in your Twilio account');
        } else {
            console.error('\n💡 Manual Configuration Steps:');
            console.error('   1. Go to https://console.twilio.com/');
            console.error('   2. Navigate to Phone Numbers → Manage → Active numbers');
            console.error(`   3. Click on ${twilioPhoneNumber}`);
            console.error(`   4. Set webhook URL to: ${WEBHOOK_URL}`);
            console.error('   5. Set HTTP method to: POST');
            console.error('   6. Save the configuration');
        }
    }
}

configureTwilioWebhook();