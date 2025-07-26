#!/usr/bin/env node

/**
 * Firebase Configuration Test Script
 * Tests Firebase configuration files and environment setup
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testFirebaseConfiguration() {
  console.log('🔥 Testing Firebase Configuration...\n');

  let allTestsPassed = true;

  try {
    // Test 1: Check configuration files exist
    console.log('1. Testing Configuration Files...');
    
    const androidConfigPath = path.join(__dirname, 'android/app/google-services.json');
    const iosConfigPath = path.join(__dirname, 'ios/Zeurk/GoogleService-Info.plist');
    
    if (fs.existsSync(androidConfigPath)) {
      console.log('✅ google-services.json found in android/app/');
      
      // Parse and validate Android config
      try {
        const androidConfig = JSON.parse(fs.readFileSync(androidConfigPath, 'utf8'));
        console.log(`   Project ID: ${androidConfig.project_info.project_id}`);
        console.log(`   Project Number: ${androidConfig.project_info.project_number}`);
        console.log(`   Storage Bucket: ${androidConfig.project_info.storage_bucket}`);
      } catch (error) {
        console.log('⚠️  google-services.json exists but has parsing issues');
        allTestsPassed = false;
      }
    } else {
      console.log('❌ google-services.json NOT found in android/app/');
      allTestsPassed = false;
    }
    
    if (fs.existsSync(iosConfigPath)) {
      console.log('✅ GoogleService-Info.plist found in ios/Zeurk/');
    } else {
      console.log('❌ GoogleService-Info.plist NOT found in ios/Zeurk/');
      allTestsPassed = false;
    }
    console.log('');

    // Test 2: Check Environment Variables
    console.log('2. Testing Environment Variables...');
    const envVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_STORAGE_BUCKET',
      'FIREBASE_AUTH_DOMAIN',
      'FIREBASE_MESSAGING_SENDER_ID',
      'FIREBASE_API_KEY_IOS',
      'FIREBASE_API_KEY_ANDROID',
      'FIREBASE_APP_ID_IOS',
      'FIREBASE_APP_ID_ANDROID'
    ];

    envVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`⚠️  ${varName}: Not set (will use fallback)`);
      }
    });
    console.log('');

    // Test 3: Check Firebase config file
    console.log('3. Testing Firebase Config File...');
    const firebaseConfigPath = path.join(__dirname, 'src/config/firebase.js');
    
    if (fs.existsSync(firebaseConfigPath)) {
      console.log('✅ src/config/firebase.js exists');
      
      const configContent = fs.readFileSync(firebaseConfigPath, 'utf8');
      
      // Check for required imports
      if (configContent.includes('@react-native-firebase/app')) {
        console.log('✅ Firebase app import found');
      } else {
        console.log('❌ Firebase app import missing');
        allTestsPassed = false;
      }
      
      if (configContent.includes('@react-native-firebase/auth')) {
        console.log('✅ Firebase auth import found');
      } else {
        console.log('❌ Firebase auth import missing');
        allTestsPassed = false;
      }
      
      if (configContent.includes('@react-native-firebase/firestore')) {
        console.log('✅ Firebase firestore import found');
      } else {
        console.log('❌ Firebase firestore import missing');
        allTestsPassed = false;
      }
      
    } else {
      console.log('❌ src/config/firebase.js NOT found');
      allTestsPassed = false;
    }
    console.log('');

    // Test 4: Check app.config.js
    console.log('4. Testing app.config.js...');
    const appConfigPath = path.join(__dirname, 'app.config.js');
    
    if (fs.existsSync(appConfigPath)) {
      console.log('✅ app.config.js exists');
      
      const appConfigContent = fs.readFileSync(appConfigPath, 'utf8');
      
      if (appConfigContent.includes('@react-native-firebase/app')) {
        console.log('✅ Firebase plugin configuration found');
      } else {
        console.log('❌ Firebase plugin configuration missing');
        allTestsPassed = false;
      }
      
    } else {
      console.log('❌ app.config.js NOT found');
      allTestsPassed = false;
    }
    console.log('');

    // Test 5: Check package.json dependencies
    console.log('5. Testing Package Dependencies...');
    const packageJsonPath = path.join(__dirname, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const requiredDeps = [
        '@react-native-firebase/app',
        '@react-native-firebase/auth',
        '@react-native-firebase/firestore',
        '@react-native-async-storage/async-storage'
      ];
      
      requiredDeps.forEach(dep => {
        if (dependencies[dep]) {
          console.log(`✅ ${dep}: ${dependencies[dep]}`);
        } else {
          console.log(`❌ ${dep}: Missing`);
          allTestsPassed = false;
        }
      });
    } else {
      console.log('❌ package.json NOT found');
      allTestsPassed = false;
    }

    console.log('\n🎉 Firebase Configuration Test Complete!');
    
    if (allTestsPassed) {
      console.log('✅ All configuration checks passed!');
      console.log('🚀 Firebase is ready for testing in the React Native app.');
    } else {
      console.log('⚠️  Some configuration issues found. Please review the items marked with ❌');
    }
    
  } catch (error) {
    console.error('❌ Firebase Configuration Test Failed:');
    console.error(error.message);
    console.error('\nPlease check:');
    console.error('1. Firebase configuration files');
    console.error('2. Environment variables in .env file');
    console.error('3. Package dependencies');
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testFirebaseConfiguration()
    .then(() => {
      console.log('\n✅ Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testFirebaseConfiguration };