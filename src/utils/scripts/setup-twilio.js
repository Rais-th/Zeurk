#!/usr/bin/env node

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupTwilio() {
  console.log('🔧 Configuration Twilio pour Zeurk SMS → Notifications\n');

  try {
    // Check if backend is running
    console.log('1️⃣ Vérification du backend...');
    try {
      const healthResponse = await axios.get('http://localhost:3001/health');
      console.log('✅ Backend actif:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Backend non accessible. Démarrez-le avec: npm run server');
      process.exit(1);
    }

    console.log('\n2️⃣ Configuration Twilio');
    console.log('📋 Étapes à suivre dans votre console Twilio:');
    console.log('   1. Allez sur https://console.twilio.com/');
    console.log('   2. Sélectionnez votre numéro de téléphone');
    console.log('   3. Dans "Messaging", configurez le webhook:');
    console.log('      URL: http://localhost:3001/api/sms');
    console.log('      Method: POST');
    
    const useNgrok = await question('\n🌐 Voulez-vous utiliser ngrok pour exposer localhost? (y/n): ');
    
    if (useNgrok.toLowerCase() === 'y') {
      console.log('\n📡 Configuration ngrok:');
      console.log('   1. Installez ngrok: https://ngrok.com/download');
      console.log('   2. Exécutez: ngrok http 3001');
      console.log('   3. Copiez l\'URL HTTPS générée');
      console.log('   4. Dans Twilio, utilisez: [URL_NGROK]/api/sms');
      
      const ngrokUrl = await question('\n🔗 Entrez votre URL ngrok (ex: https://abc123.ngrok.io): ');
      if (ngrokUrl) {
        console.log(`✅ URL webhook Twilio: ${ngrokUrl}/api/sms`);
      }
    }

    console.log('\n3️⃣ Test de configuration');
    const testSms = await question('\n📱 Voulez-vous tester avec un SMS simulé? (y/n): ');
    
    if (testSms.toLowerCase() === 'y') {
      console.log('\n📨 Envoi d\'un SMS de test...');
      
      const testResponse = await axios.post('http://localhost:3001/api/sms', {
        From: '+243123456789',
        Body: 'Course Bandal vers Gombe 18h'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      console.log('✅ SMS traité:', testResponse.data);
    }

    console.log('\n4️⃣ Instructions finales');
    console.log('📋 Pour tester le flow complet:');
    console.log('   1. Ouvrez l\'app Zeurk');
    console.log('   2. Allez dans Tableau de bord → Paramètres');
    console.log('   3. Activez "Notifications SMS"');
    console.log('   4. Envoyez un SMS à votre numéro Twilio');
    console.log('   5. Vérifiez que la notification arrive sur l\'app');

    console.log('\n🎉 Configuration terminée !');
    console.log('📖 Consultez SMS_NOTIFICATION_SETUP.md pour plus de détails');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    rl.close();
  }
}

setupTwilio();