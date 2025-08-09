#!/usr/bin/env node

const admin = require('firebase-admin');
const readline = require('readline');

// Configuration Firebase Admin
const serviceAccount = require('./zeurk-be41b-firebase-adminsdk-fbsvc-674b2f596c.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://zeurk-be41b-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function listAllDrivers() {
  console.log('🔍 Chauffeurs actuels dans Firestore:\n');
  
  const driversSnapshot = await db.collection('drivers').get();
  const drivers = [];
  
  driversSnapshot.forEach(doc => {
    const data = doc.data();
    drivers.push({
      id: doc.id,
      name: data.name || 'N/A',
      vehicle: data.vehicle || 'N/A',
      location: data.location ? `${data.location.latitude}, ${data.location.longitude}` : 'N/A',
      isTest: doc.id.includes('_') || doc.id.startsWith('driver_') // Identifier les données de test
    });
  });

  drivers.forEach((driver, index) => {
    const testFlag = driver.isTest ? '🧪 [TEST]' : '✅ [RÉEL]';
    console.log(`${index + 1}. ${testFlag} ${driver.id}`);
    console.log(`   👤 Nom: ${driver.name}`);
    console.log(`   🚙 Véhicule: ${driver.vehicle}`);
    console.log(`   📍 Position: ${driver.location}\n`);
  });

  return drivers;
}

async function cleanupTestData() {
  console.log('🧹 Nettoyage des données de test...\n');
  
  const drivers = await listAllDrivers();
  const testDrivers = drivers.filter(d => d.isTest);
  
  if (testDrivers.length === 0) {
    console.log('✅ Aucune donnée de test trouvée.');
    return;
  }

  console.log(`⚠️  ${testDrivers.length} chauffeur(s) de test trouvé(s):`);
  testDrivers.forEach(driver => {
    console.log(`   - ${driver.id} (${driver.name})`);
  });

  const answer = await new Promise(resolve => {
    rl.question('\n❓ Voulez-vous supprimer ces données de test ? (oui/non): ', resolve);
  });

  if (answer.toLowerCase() === 'oui' || answer.toLowerCase() === 'o') {
    console.log('\n🗑️  Suppression en cours...');
    
    const batch = db.batch();
    testDrivers.forEach(driver => {
      const driverRef = db.collection('drivers').doc(driver.id);
      batch.delete(driverRef);
    });

    await batch.commit();
    console.log(`✅ ${testDrivers.length} chauffeur(s) de test supprimé(s).`);
  } else {
    console.log('❌ Suppression annulée.');
  }
}

async function setupProductionEnvironment() {
  console.log('\n🚀 Configuration pour la production...\n');
  
  console.log('📋 Checklist de production:');
  console.log('   ✅ 1. Supprimer les données de test');
  console.log('   📝 2. Configurer l\'inscription des vrais chauffeurs');
  console.log('   🔐 3. Mettre en place la vérification des documents');
  console.log('   📱 4. Activer les notifications push');
  console.log('   💳 5. Configurer les paiements réels');
  console.log('   🗺️  6. Désactiver le mode démo automatique');
  
  console.log('\n🔧 Prochaines étapes recommandées:');
  console.log('   1. Utilisez AuthScreen pour l\'inscription des chauffeurs');
  console.log('   2. Implémentez VehiclesAndDocumentsModal pour la vérification');
  console.log('   3. Configurez les règles de sécurité Firestore');
  console.log('   4. Testez avec de vrais chauffeurs');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--list')) {
    await listAllDrivers();
  } else if (args.includes('--cleanup')) {
    await cleanupTestData();
  } else if (args.includes('--setup-production')) {
    await setupProductionEnvironment();
  } else {
    console.log('🧹 Gestionnaire de données de production Zeurk\n');
    console.log('Usage:');
    console.log('  node cleanup-test-data.js --list              # Lister tous les chauffeurs');
    console.log('  node cleanup-test-data.js --cleanup           # Supprimer les données de test');
    console.log('  node cleanup-test-data.js --setup-production  # Guide de configuration production');
    console.log('\nExemple:');
    console.log('  node cleanup-test-data.js --list');
  }
  
  rl.close();
  process.exit(0);
}

main().catch(console.error);