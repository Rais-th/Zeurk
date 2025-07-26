/**
 * Test Firebase Authentication Flow
 * This script tests the complete authentication flow as it would work in the app
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

// Load environment variables
require('dotenv').config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY_IOS || process.env.FIREBASE_API_KEY_ANDROID,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID_IOS || process.env.FIREBASE_APP_ID_ANDROID
};

async function testAuthenticationFlow() {
  console.log('🔐 Testing Firebase Authentication Flow...\n');

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const testEmail = 'test@zeurk.com';
    const testPassword = 'TestPassword123!';
    const testUserData = {
      fullName: 'Test User',
      phoneNumber: '+243123456789',
      email: testEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('1. Testing user registration...');
    
    try {
      // Try to create a new user
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      const user = userCredential.user;
      console.log(`✅ User created successfully: ${user.uid}`);

      // Create user document in Firestore
      console.log('2. Creating user document in Firestore...');
      await setDoc(doc(db, 'passengers', user.uid), testUserData);
      console.log('✅ User document created successfully');

      // Test reading user document
      console.log('3. Testing user document retrieval...');
      const userDoc = await getDoc(doc(db, 'passengers', user.uid));
      if (userDoc.exists()) {
        console.log('✅ User document retrieved successfully');
        console.log('   Data:', userDoc.data());
      } else {
        console.log('❌ User document not found');
      }

      // Test sign out
      console.log('4. Testing sign out...');
      await signOut(auth);
      console.log('✅ User signed out successfully');

      // Test sign in
      console.log('5. Testing sign in...');
      const signInCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      console.log(`✅ User signed in successfully: ${signInCredential.user.uid}`);

      console.log('\n🎉 Authentication flow test completed successfully!');
      return true;

    } catch (authError) {
      if (authError.code === 'auth/email-already-in-use') {
        console.log('ℹ️  User already exists, testing sign in...');
        
        // Test sign in with existing user
        const signInCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
        console.log(`✅ Existing user signed in successfully: ${signInCredential.user.uid}`);

        // Test reading existing user document
        console.log('2. Testing existing user document retrieval...');
        const userDoc = await getDoc(doc(db, 'passengers', signInCredential.user.uid));
        if (userDoc.exists()) {
          console.log('✅ Existing user document retrieved successfully');
        } else {
          console.log('⚠️  User document not found, creating one...');
          await setDoc(doc(db, 'passengers', signInCredential.user.uid), testUserData);
          console.log('✅ User document created for existing user');
        }

        console.log('\n🎉 Authentication flow test completed successfully!');
        return true;
      } else {
        throw authError;
      }
    }

  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    return false;
  }
}

// Run the test
testAuthenticationFlow()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });