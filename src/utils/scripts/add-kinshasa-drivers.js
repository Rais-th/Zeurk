const { initializeApp } = require('firebase/app');
const { getFirestore, collection, setDoc, doc } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  projectId: 'zeurk-be41b',
  storageBucket: 'zeurk-be41b.firebasestorage.app',
  authDomain: 'zeurk-be41b.firebaseapp.com',
  messagingSenderId: '734052770725',
  apiKey: 'AIzaSyBy75Dma77TGNIBkSnYDfLiJXYu45-7ZlA',
  appId: '1:734052770725:ios:d32c448030d93cb7367e4c'
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Collections
const COLLECTIONS = {
  DRIVERS_LIVE: 'drivers_live'
};

async function addKinshasaDrivers() {
  console.log('🚗 Ajout de chauffeurs à Kinshasa...');
  
  // Chauffeurs à Kinshasa avec des positions réalistes
  const kinshasaDrivers = [
    {
      id: 'driver_kinshasa_1',
      lat: -4.3217, // Boulevard du 30 Juin
      lng: 15.3125,
      av: 1, // available
      ts: new Date()
    },
    {
      id: 'driver_kinshasa_2', 
      lat: -4.3115, // Gombe
      lng: 15.2940,
      av: 1,
      ts: new Date()
    },
    {
      id: 'driver_kinshasa_3',
      lat: -4.3310, // Près du Boulevard du 30 Juin
      lng: 15.3250,
      av: 1,
      ts: new Date()
    },
    {
      id: 'driver_kinshasa_4',
      lat: -4.2950, // Kalamu
      lng: 15.3180,
      av: 1,
      ts: new Date()
    },
    {
      id: 'driver_kinshasa_5',
      lat: -4.3400, // Bandalungwa
      lng: 15.2800,
      av: 1,
      ts: new Date()
    }
  ];

  try {
    for (const driver of kinshasaDrivers) {
      const driverRef = doc(firestore, COLLECTIONS.DRIVERS_LIVE, driver.id);
      await setDoc(driverRef, driver);
      console.log(`✅ Chauffeur ${driver.id} ajouté à (${driver.lat}, ${driver.lng})`);
    }
    
    console.log(`🎉 ${kinshasaDrivers.length} chauffeurs ajoutés à Kinshasa avec succès !`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des chauffeurs:', error);
  }
}

// Exécuter
addKinshasaDrivers().catch(console.error);