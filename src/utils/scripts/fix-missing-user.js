#!/usr/bin/env node

/**
 * Script pour corriger l'erreur "No document to update" lors de la promotion d'un utilisateur
 * Ce script vérifie si un utilisateur existe et crée le document manquant si nécessaire
 */

const admin = require('firebase-admin');

// Configuration Firebase Admin
const serviceAccount = require('./zeurk-be41b-firebase-adminsdk-fbsvc-674b2f596c.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'zeurk-be41b'
});

const firestore = admin.firestore();

// ID de l'utilisateur problématique
const PROBLEMATIC_USER_ID = 'RmRskSkoiqX25jiKWoMG8eikHba2';

// Collections
const COLLECTIONS = {
  USERS: 'users',
  PASSENGERS: 'passengers',
  DRIVERS: 'drivers'
};

/**
 * Vérifier si un utilisateur existe dans Firebase Auth
 */
async function checkUserInAuth(userId) {
  try {
    const userRecord = await admin.auth().getUser(userId);
    console.log('✅ Utilisateur trouvé dans Firebase Auth:');
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   Display Name: ${userRecord.displayName || 'N/A'}`);
    return userRecord;
  } catch (error) {
    console.log('❌ Utilisateur non trouvé dans Firebase Auth:', error.message);
    return null;
  }
}

/**
 * Vérifier si les documents utilisateur existent
 */
async function checkUserDocuments(userId) {
  const results = {};
  
  for (const collectionName of [COLLECTIONS.USERS, COLLECTIONS.PASSENGERS, COLLECTIONS.DRIVERS]) {
    try {
      const docRef = firestore.collection(collectionName).doc(userId);
      const docSnap = await docRef.get();
      
      results[collectionName] = {
        exists: docSnap.exists,
        data: docSnap.exists ? docSnap.data() : null
      };
      
      console.log(`${docSnap.exists ? '✅' : '❌'} ${collectionName}: ${docSnap.exists ? 'Document trouvé' : 'Document manquant'}`);
      if (docSnap.exists) {
        console.log(`   Données:`, JSON.stringify(docSnap.data(), null, 2));
      }
    } catch (error) {
      console.log(`❌ Erreur avec ${collectionName}:`, error.message);
      results[collectionName] = { exists: false, error: error.message };
    }
  }
  
  return results;
}

/**
 * Créer le document utilisateur manquant
 */
async function createMissingUserDocument(userId, userRecord) {
  try {
    console.log('\n🔄 Création du document utilisateur manquant...');
    
    const userData = {
      id: userId,
      email: userRecord.email,
      fullName: userRecord.displayName || 'Utilisateur',
      userType: 'passenger', // Par défaut, passenger
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Créer dans la collection principale 'users'
    const userRef = firestore.collection(COLLECTIONS.USERS).doc(userId);
    await userRef.set(userData);
    console.log('✅ Document créé dans users');

    // Créer dans la collection passengers
    const passengerRef = firestore.collection(COLLECTIONS.PASSENGERS).doc(userId);
    await passengerRef.set({
      ...userData,
      userType: 'passenger'
    });
    console.log('✅ Document créé dans passengers');

    console.log('\n✅ Documents utilisateur créés avec succès!');
    return true;
  } catch (error) {
    console.log('❌ Erreur lors de la création:', error.message);
    return false;
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🔍 === ANALYSE DU PROBLÈME UTILISATEUR ===\n');
  
  // 1. Vérifier l'utilisateur dans Firebase Auth
  console.log('1. Vérification dans Firebase Auth...');
  const userRecord = await checkUserInAuth(PROBLEMATIC_USER_ID);
  
  if (!userRecord) {
    console.log('\n❌ L\'utilisateur n\'existe pas dans Firebase Auth');
    console.log('   → Ce n\'est pas un problème de documents, mais d\'utilisateur inexistant');
    process.exit(1);
  }
  
  // 2. Vérifier les documents
  console.log('\n2. Vérification des documents...');
  const documents = await checkUserDocuments(PROBLEMATIC_USER_ID);
  
  // 3. Créer les documents manquants si nécessaire
  const missingInUsers = !documents[COLLECTIONS.USERS].exists;
  const missingInPassengers = !documents[COLLECTIONS.PASSENGERS].exists;
  
  if (missingInUsers || missingInPassengers) {
    console.log('\n📋 Résumé des documents manquants:');
    console.log(`   - users: ${missingInUsers ? 'MANQUANT' : 'OK'}`);
    console.log(`   - passengers: ${missingInPassengers ? 'MANQUANT' : 'OK'}`);
    
    const created = await createMissingUserDocument(PROBLEMATIC_USER_ID, userRecord);
    
    if (created) {
      console.log('\n🎉 Correction terminée!');
      console.log('   → L\'utilisateur peut maintenant être promu en driver');
    } else {
      console.log('\n❌ Échec de la correction');
    }
  } else {
    console.log('\n✅ Tous les documents existent déjà');
    console.log('   → Le problème peut être ailleurs');
  }
  
  // 4. Afficher les prochaines étapes
  console.log('\n📋 Prochaines étapes:');
  console.log('   1. Relancer l\'application');
  console.log('   2. Réessayer la promotion en driver');
  console.log('   3. Si le problème persiste, vérifier les logs de l\'application');
  
  process.exit(0);
}

// Exécuter le script
main().catch(console.error);