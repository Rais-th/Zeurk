const twilio = require('twilio');
const axios = require('axios');
const { Expo } = require('expo-server-sdk');
const { searchLandmarks } = require('./landmarks');
const driverHandlers = require('./drivers');

// Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const openrouterApiKey = process.env.OPENROUTER_API_KEY;

const client = new twilio(accountSid, authToken);
const expo = new Expo();

// OpenRouter configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${openrouterApiKey}`,
  'HTTP-Referer': 'https://github.com/raisthelemuka',
  'X-Title': 'Zeurk AI SMS Parser'
};

// Parse SMS using AI
async function parseRideRequest(smsText, clientPhone) {
  try {
    const prompt = `Parse ce SMS de demande de course à Kinshasa et retourne UNIQUEMENT un JSON valide:

SMS: "${smsText}"

Retourne exactement ce format JSON:
{
  "from": "lieu de départ extrait",
  "to": "lieu de destination extrait", 
  "time": "heure si mentionnée ou null",
  "reference": "point de référence si mentionné ou null",
  "clientPhone": "${clientPhone}",
  "isValid": true/false
}

Exemples:
- "Course Bandal vers Gombe 18h" → {"from": "Bandal", "to": "Gombe", "time": "18h", "reference": null, "clientPhone": "${clientPhone}", "isValid": true}
- "4b avenue Uvira gombe ref grand hotel vers Stade" → {"from": "4b avenue Uvira gombe", "to": "Stade", "time": null, "reference": "grand hotel", "clientPhone": "${clientPhone}", "isValid": true}`;

    const response = await axios.post(OPENROUTER_API_URL, {
      model: 'mistralai/mistral-7b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 200
    }, { headers });

    const aiResponse = response.data.choices[0].message.content.trim();
    
    // Extract JSON from AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('No valid JSON found in AI response');
  } catch (error) {
    console.error('AI parsing error:', error);
    return {
      from: null,
      to: null,
      time: null,
      reference: null,
      clientPhone,
      isValid: false
    };
  }
}

// Send push notification to drivers with priority handling
async function sendPushNotificationToDrivers(rideRequest) {
  try {
    // Get active driver tokens from our backend
    const driverTokens = driverHandlers.getActiveTokens();

    if (driverTokens.length === 0) {
      console.log('❌ No active drivers available for notifications');
      console.log('💡 Make sure the driver app is running and registered');
      return false;
    }

    console.log(`📱 Sending HIGH PRIORITY ride request to ${driverTokens.length} drivers`);

    const messages = [];
    for (let pushToken of driverTokens) {
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`❌ Invalid Expo push token: ${pushToken.substring(0, 20)}...`);
        continue;
      }

      // Enhanced notification with complete ride data
      messages.push({
        to: pushToken,
        sound: 'default',
        title: '🚨 NOUVELLE COURSE SMS',
        body: `${rideRequest.startAddress} → ${rideRequest.endAddress} (${rideRequest.price} FC)`,
        data: { 
          type: 'sms_ride_request',
          priority: 'high',
          source: 'sms',
          rideRequest: {
            id: rideRequest.id,
            clientPhone: rideRequest.clientPhone,
            startAddress: rideRequest.startAddress,
            endAddress: rideRequest.endAddress,
            requestedTime: rideRequest.requestedTime,
            reference: rideRequest.reference,
            price: rideRequest.price,
            duration: rideRequest.duration,
            distance: rideRequest.distance,
            status: rideRequest.status,
            timestamp: rideRequest.timestamp,
            clientInfo: rideRequest.clientInfo
          }
        },
        priority: 'high',
        channelId: 'ride-requests',
        badge: 1
      });
    }

    if (messages.length > 0) {
      const chunks = expo.chunkPushNotifications(messages);
      let totalSent = 0;
      let totalSuccess = 0;
      
      for (let chunk of chunks) {
        try {
          const receipts = await expo.sendPushNotificationsAsync(chunk);
          totalSent += chunk.length;
          
          // Count successful deliveries
          receipts.forEach(receipt => {
            if (receipt.status === 'ok') {
              totalSuccess++;
            } else {
              console.error(`❌ Push notification failed:`, receipt);
            }
          });
          
          console.log(`✅ Sent ${chunk.length} notifications, ${totalSuccess} successful`);
        } catch (error) {
          console.error('❌ Error sending push notification chunk:', error);
        }
      }
      
      console.log(`📊 DELIVERY SUMMARY: ${totalSuccess}/${totalSent} notifications delivered successfully`);
      console.log(`🎯 Ride request ${rideRequest.id} sent to driver app(s)`);
      
      return totalSuccess > 0;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Push notification error:', error);
    return false;
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const from = req.body.From;
  const body = req.body.Body || '';

  console.log(`📱 SMS received from ${from}: ${body}`);

  // Parse SMS using AI
  const parsedRequest = await parseRideRequest(body, from);

  if (!parsedRequest.isValid || !parsedRequest.from || !parsedRequest.to) {
    console.log(`❌ Invalid SMS request from ${from}: Could not parse ride details`);
    return res.status(200).send('OK');
  }

  // Create ride request object with enhanced details
  const rideRequest = {
    id: `sms_${Date.now()}`,
    clientPhone: from,
    startAddress: parsedRequest.from,
    endAddress: parsedRequest.to,
    requestedTime: parsedRequest.time,
    reference: parsedRequest.reference,
    price: Math.floor(Math.random() * 5000) + 2000, // Prix estimé
    duration: Math.floor(Math.random() * 30) + 10, // Durée estimée
    distance: Math.floor(Math.random() * 15) + 5, // Distance estimée en km
    source: 'sms',
    status: 'pending',
    priority: 'high', // SMS requests get high priority
    timestamp: new Date().toISOString(),
    clientInfo: {
      phone: from,
      requestMethod: 'SMS'
    }
  };

  console.log(`🚗 New SMS ride request created:`, {
    id: rideRequest.id,
    from: rideRequest.startAddress,
    to: rideRequest.endAddress,
    client: from,
    time: rideRequest.requestedTime || 'ASAP'
  });

  // PRIORITY 1: Send push notification to drivers immediately
  console.log(`📲 Sending ride request to driver app...`);
  await sendPushNotificationToDrivers(rideRequest);

  // PRIORITY 2: Log successful processing
  console.log(`✅ SMS ride request ${rideRequest.id} successfully sent to driver app`);
  console.log(`📊 Request details: ${rideRequest.startAddress} → ${rideRequest.endAddress} (${rideRequest.price} FC)`);

  // Return success response (no SMS sent back to user for now)
  res.status(200).json({ 
    success: true, 
    rideRequest,
    message: 'Ride request sent to driver app'
  });
};

async function sendSms(to, body) {
  try {
    await client.messages.create({
      to: to,
      from: twilioPhoneNumber,
      body: body,
    });
  } catch (error) {
    console.error('Failed to send SMS:', error);
  }
}