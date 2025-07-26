/**
 * Test Firebase Integration with App
 * This script tests the Firebase configuration as it would be used in the React Native app
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator, collection, getDocs } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');
const { getStorage } = require('firebase/storage');

// Load environment variables
require('dotenv').config();

// Firebase configuration using environment variables (same as in app)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY_IOS || process.env.FIREBASE_API_KEY_ANDROID,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID_IOS || process.env.FIREBASE_APP_ID_ANDROID
};

async function testFirebaseWebSDK() {
  console.log('🔥 Testing Firebase Web SDK Integration...\n');

  try {
    // Initialize Firebase
    console.log('1. Initializing Firebase app...');
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized successfully');

    // Test Firestore
    console.log('\n2. Testing Firestore connection...');
    const db = getFirestore(app);
    
    // Test reading collections
    console.log('   - Testing passengers collection...');
    const passengersSnapshot = await getDocs(collection(db, 'passengers'));
    console.log(`   ✅ Found ${passengersSnapshot.size} passengers`);
    
    console.log('   - Testing rides collection...');
    const ridesSnapshot = await getDocs(collection(db, 'rides'));
    console.log(`   ✅ Found ${ridesSnapshot.size} rides`);

    // Test Auth service
    console.log('\n3. Testing Firebase Auth...');
    const auth = getAuth(app);
    console.log('✅ Firebase Auth service initialized');

    // Test Storage service
    console.log('\n4. Testing Firebase Storage...');
    const storage = getStorage(app);
    console.log('✅ Firebase Storage service initialized');

    console.log('\n🎉 All Firebase services are working correctly!');
    console.log('\nConfiguration used:');
    console.log(`   - Project ID: ${firebaseConfig.projectId}`);
    console.log(`   - Auth Domain: ${firebaseConfig.authDomain}`);
    console.log(`   - Storage Bucket: ${firebaseConfig.storageBucket}`);
    
    return true;
  } catch (error) {
    console.error('❌ Firebase test failed:', error.message);
    return false;
  }
}

// Run the test
testFirebaseWebSDK()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });