const admin = require('firebase-admin');
const path = require('path');

// Initialiser Firebase Admin avec le fichier de service account
const serviceAccount = require('./zeurk-be41b-firebase-adminsdk-fbsvc-674b2f596c.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'zeurk-be41b'
});

const db = admin.firestore();

// Données des chauffeurs de test
const testDrivers = [
  // Chauffeurs à Kinshasa
  {
    id: 'driver_kinshasa_1',
    lat: -4.4419,  // Gombe, Kinshasa
    lng: 15.2663,
    av: 1,         // Available
    ts: admin.firestore.FieldValue.serverTimestamp(),
    name: 'Jean Mukendi',
    vehicle: 'Toyota Corolla',
    rating: 4.8
  },
  {
    id: 'driver_kinshasa_2',
    lat: -4.4284,  // Gombe
    lng: 15.2916,
    av: 1,
    ts: admin.firestore.FieldValue.serverTimestamp(),
    name: 'Marie Kabila',
    vehicle: 'Honda Civic',
    rating: 4.9
  },
  {
    id: 'driver_kinshasa_3',
    lat: -4.4650,  // Kalamu
    lng: 15.2847,
    av: 1,
    ts: admin.firestore.FieldValue.serverTimestamp(),
    name: 'Pierre Tshisekedi',
    vehicle: 'Nissan Sentra',
    rating: 4.7
  },
  {
    id: 'driver_kinshasa_4',
    lat: -4.4167,  // Lingwala
    lng: 15.3000,
    av: 1,
    ts: admin.firestore.FieldValue.serverTimestamp(),
    name: 'Grace Mbuyi',
    vehicle: 'Hyundai Elantra',
    rating: 4.6
  },
  {
    id: 'driver_kinshasa_5',
    lat: -4.3800,  // Ngaliema
    lng: 15.2400,
    av: 1,
    ts: admin.firestore.FieldValue.serverTimestamp(),
    name: 'Joseph Kasongo',
    vehicle: 'Kia Rio',
    rating: 4.8
  },
  // Chauffeurs dans d'autres villes pour test
  {
    id: 'driver_houston_1',
    lat: 29.7604,  // Houston, Texas
    lng: -95.3698,
    av: 1,
    ts: admin.firestore.FieldValue.serverTimestamp(),
    name: 'John Smith',
    vehicle: 'Ford Focus',
    rating: 4.5
  },
  {
    id: 'driver_paris_1',
    lat: 48.8566,  // Paris, France
    lng: 2.3522,
    av: 1,
    ts: admin.firestore.FieldValue.serverTimestamp(),
    name: 'Pierre Dubois',
    vehicle: 'Peugeot 308',
    rating: 4.7
  }
];

async function addDriversToFirestore() {
  console.log('🚗 Ajout des chauffeurs à Firestore avec Admin SDK...\n');
  
  try {
    const batch = db.batch();
    
    for (const driver of testDrivers) {
      const driverRef = db.collection('drivers_live').doc(driver.id);
      
      const driverData = {
        lat: driver.lat,
        lng: driver.lng,
        av: driver.av,
        ts: driver.ts,
        name: driver.name,
        vehicle: driver.vehicle,
        rating: driver.rating
      };
      
      batch.set(driverRef, driverData);
      console.log(`✅ Préparé: ${driver.name} (${driver.id})`);
      console.log(`   📍 Position: ${driver.lat}, ${driver.lng}`);
      console.log(`   🚗 Véhicule: ${driver.vehicle}`);
      console.log(`   ⭐ Note: ${driver.rating}/5`);
      console.log('');
    }
    
    // Exécuter le batch
    await batch.commit();
    
    console.log('🎉 Tous les chauffeurs ont été ajoutés avec succès!');
    console.log(`📊 Total: ${testDrivers.length} chauffeurs`);
    console.log('');
    console.log('🔍 Vous pouvez maintenant:');
    console.log('1. Vérifier dans la console Firebase Firestore');
    console.log('2. Tester l\'app pour voir les marqueurs de chauffeurs');
    console.log('3. Les chauffeurs de Kinshasa devraient apparaître si vous êtes dans la région');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des chauffeurs:', error);
  }
}

// Fonction pour nettoyer la collection
async function clearDrivers() {
  console.log('🧹 Nettoyage de la collection drivers_live...');
  
  try {
    const snapshot = await db.collection('drivers_live').get();
    const batch = db.batch();
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('✅ Collection nettoyée');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

// Fonction pour vérifier les chauffeurs existants
async function checkDrivers() {
  console.log('🔍 Vérification des chauffeurs existants...\n');
  
  try {
    const snapshot = await db.collection('drivers_live').get();
    
    if (snapshot.empty) {
      console.log('📭 Aucun chauffeur trouvé dans la collection drivers_live');
      return;
    }
    
    console.log(`📊 ${snapshot.size} chauffeur(s) trouvé(s):\n`);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`🚗 ${doc.id}:`);
      console.log(`   📍 Position: ${data.lat}, ${data.lng}`);
      console.log(`   🟢 Disponible: ${data.av ? 'Oui' : 'Non'}`);
      console.log(`   👤 Nom: ${data.name || 'N/A'}`);
      console.log(`   🚙 Véhicule: ${data.vehicle || 'N/A'}`);
      console.log(`   ⭐ Note: ${data.rating || 'N/A'}/5`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

// Exécuter le script
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--clear')) {
    await clearDrivers();
  } else if (args.includes('--check')) {
    await checkDrivers();
  } else {
    await addDriversToFirestore();
  }
  
  process.exit(0);
}

main();