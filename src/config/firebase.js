import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration using environment variables
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'zeurk-be41b',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'zeurk-be41b.firebasestorage.app',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'zeurk-be41b.firebaseapp.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '734052770725',
  // Platform-specific API keys and App IDs
  apiKey: Platform.OS === 'ios' 
    ? process.env.FIREBASE_API_KEY_IOS || 'AIzaSyBy75Dma77TGNIBkSnYDfLiJXYu45-7ZlA'
    : process.env.FIREBASE_API_KEY_ANDROID || 'AIzaSyD7vdzQAxrFI8wbaUJ-MBqVpJ47hV1-YAs',
  appId: Platform.OS === 'ios'
    ? process.env.FIREBASE_APP_ID_IOS || '1:734052770725:ios:d32c448030d93cb7367e4c'
    : process.env.FIREBASE_APP_ID_ANDROID || '1:734052770725:android:6051f8b74889184e367e4c'
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with proper persistence for React Native
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // If auth is already initialized, get the existing instance
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error;
  }
}
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, firestore, storage };

// Collection names
export const COLLECTIONS = {
  PASSENGERS: 'passengers',
  DRIVERS: 'drivers',
  RIDES: 'rides',
  USERS: 'users' // Collection unifiée pour tous les utilisateurs
};

import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Helper functions for user documents
export const createUserDocument = async (userId, userData) => {
  try {
    // Créer dans la collection unifiée 'users'
    const userRef = doc(firestore, COLLECTIONS.USERS, userId);
    await setDoc(userRef, {
      ...userData,
      id: userId,
      userType: userData.userType || 'passenger',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Si c'est un passager, créer aussi dans la collection passengers
    if (userData.userType === 'passenger' || !userData.userType) {
      const passengerRef = doc(firestore, COLLECTIONS.PASSENGERS, userId);
      await setDoc(passengerRef, {
        ...userData,
        id: userId,
        userType: 'passenger',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    // Si c'est un driver, créer aussi dans la collection drivers
    if (userData.userType === 'driver') {
      const driverRef = doc(firestore, COLLECTIONS.DRIVERS, userId);
      await setDoc(driverRef, {
        ...userData,
        id: userId,
        userType: 'driver',
        isVerified: false,
        isAvailable: false,
        rating: 5.0,
        totalRides: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    return userData;
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};

export const getUserDocument = async (userId) => {
  try {
    // Essayer d'abord la collection unifiée 'users'
    const userRef = doc(firestore, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    }

    // Fallback: essayer la collection passengers
    const passengerRef = doc(firestore, COLLECTIONS.PASSENGERS, userId);
    const passengerSnap = await getDoc(passengerRef);
    
    if (passengerSnap.exists()) {
      return passengerSnap.data();
    }

    // Fallback: essayer la collection drivers
    const driverRef = doc(firestore, COLLECTIONS.DRIVERS, userId);
    const driverSnap = await getDoc(driverRef);
    
    if (driverSnap.exists()) {
      return driverSnap.data();
    }

    return null;
  } catch (error) {
    console.error('Error getting user document:', error);
    throw error;
  }
};

// Fonction pour promouvoir un passager en driver
export const promoteToDriver = async (userId, driverData) => {
  try {
    // Mettre à jour le document principal
    const userRef = doc(firestore, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      userType: 'driver',
      ...driverData,
      updatedAt: new Date().toISOString()
    });

    // Créer le document driver
    const driverRef = doc(firestore, COLLECTIONS.DRIVERS, userId);
    await setDoc(driverRef, {
      id: userId,
      userType: 'driver',
      isVerified: false,
      isAvailable: false,
      rating: 5.0,
      totalRides: 0,
      ...driverData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Supprimer de la collection passengers (optionnel - garder pour l'historique)
    const passengerRef = doc(firestore, COLLECTIONS.PASSENGERS, userId);
    await deleteDoc(passengerRef);

    return true;
  } catch (error) {
    console.error('Error promoting user to driver:', error);
    throw error;
  }
};

// Fonction pour vérifier le type d'utilisateur
export const getUserType = async (userId) => {
  try {
    const userData = await getUserDocument(userId);
    return userData?.userType || 'passenger';
  } catch (error) {
    console.error('Error getting user type:', error);
    return 'passenger';
  }
};

// Helper functions for Firebase Storage
export const uploadImageToStorage = async (imageUri, path) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteImageFromStorage = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export default { auth, firestore, storage };