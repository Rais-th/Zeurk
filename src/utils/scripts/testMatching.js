/**
 * Script de test pour le système de matching automatique
 * Utilise ce script pour tester les fonctionnalités de matching sans interface utilisateur
 */

// Note: Ce script de test est conçu pour un environnement React Native
// Pour tester en Node.js, il faudrait adapter les imports et les dépendances

const rideMatchingService = require('../services/rideMatchingService');
const notificationService = require('../services/notificationService');

// Données de test
const testRideRequest = {
  passengerId: 'test_passenger_123',
  startLocation: {
    address: 'Kinshasa, République démocratique du Congo',
    coordinates: { latitude: -4.4419, longitude: 15.2663 }
  },
  destination: {
    address: 'Gombe, Kinshasa, République démocratique du Congo',
    coordinates: { latitude: -4.3276, longitude: 15.3136 }
  },
  stops: [],
  rideType: 'priority',
  category: 'standard',
  estimatedPrice: 50.82,
  luxePreferences: null,
  paymentMethod: { id: 'cash', type: 'Espèces' },
  arrivalTime: '14:30',
  routeCoordinates: []
};

const testDriver = {
  id: 'test_driver_456',
  name: 'Jean Mukendi',
  phone: '+243123456789',
  vehicle: {
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    color: 'Blanc',
    licensePlate: 'CD-123-ABC'
  },
  rating: 4.8,
  totalRides: 1250,
  location: {
    latitude: -4.4350,
    longitude: 15.2700
  },
  available: true,
  category: 'standard'
};

/**
 * Test de création d'une demande de course
 */
export const testCreateRideRequest = async () => {
  try {
    console.log('🧪 Test: Création d\'une demande de course...');
    
    const requestId = await rideMatchingService.createRideRequest(testRideRequest);
    console.log('✅ Demande créée avec succès:', requestId);
    
    return requestId;
  } catch (error) {
    console.error('❌ Erreur lors de la création de la demande:', error);
    throw error;
  }
};

/**
 * Test d'ajout d'un chauffeur disponible
 */
export const testAddAvailableDriver = async () => {
  try {
    console.log('🧪 Test: Ajout d\'un chauffeur disponible...');
    
    await rideMatchingService.addAvailableDriver(testDriver);
    console.log('✅ Chauffeur ajouté avec succès:', testDriver.id);
    
    return testDriver.id;
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout du chauffeur:', error);
    throw error;
  }
};

/**
 * Test du processus de matching complet
 */
export const testCompleteMatching = async () => {
  try {
    console.log('🧪 Test: Processus de matching complet...');
    
    // 1. Ajouter un chauffeur disponible
    await testAddAvailableDriver();
    
    // 2. Créer une demande de course
    const requestId = await testCreateRideRequest();
    
    // 3. Écouter les mises à jour
    const unsubscribe = rideMatchingService.listenToRideRequest(requestId, (updatedRequest) => {
      console.log('📱 Mise à jour reçue:', updatedRequest.status);
      
      if (updatedRequest.status === 'matched') {
        console.log('✅ Matching réussi! Chauffeur assigné:', updatedRequest.assignedDriverId);
        unsubscribe();
      } else if (updatedRequest.status === 'timeout') {
        console.log('⏰ Timeout du matching');
        unsubscribe();
      }
    });
    
    console.log('👂 Écoute des mises à jour...');
    
    // Nettoyer après 30 secondes
    setTimeout(() => {
      unsubscribe();
      console.log('🛑 Test terminé');
    }, 30000);
    
  } catch (error) {
    console.error('❌ Erreur lors du test complet:', error);
    throw error;
  }
};

/**
 * Test des notifications
 */
export const testNotifications = async () => {
  try {
    console.log('🧪 Test: Système de notifications...');
    
    // Initialiser les notifications pour le passager
    await notificationService.initializeForUser('passenger', 'test_passenger_123');
    console.log('✅ Notifications passager initialisées');
    
    // Initialiser les notifications pour le chauffeur
    await notificationService.initializeForUser('driver', 'test_driver_456');
    console.log('✅ Notifications chauffeur initialisées');
    
    // Test d'envoi de notification
    await notificationService.notifyNewRideRequest('test_driver_456', testRideRequest);
    console.log('✅ Notification de nouvelle course envoyée');
    
    await notificationService.notifyRideFound('test_passenger_123', testDriver);
    console.log('✅ Notification de course trouvée envoyée');
    
  } catch (error) {
    console.error('❌ Erreur lors du test des notifications:', error);
    throw error;
  }
};

/**
 * Test de nettoyage
 */
export const testCleanup = async () => {
  try {
    console.log('🧪 Test: Nettoyage...');
    
    // Nettoyer les chauffeurs de test
    await rideMatchingService.removeDriver('test_driver_456');
    console.log('✅ Chauffeur de test supprimé');
    
    // Nettoyer les notifications
    await notificationService.cleanupUserListeners('test_passenger_123');
    await notificationService.cleanupUserListeners('test_driver_456');
    console.log('✅ Écouteurs de notifications nettoyés');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  }
};

/**
 * Exécuter tous les tests
 */
export const runAllTests = async () => {
  console.log('🚀 Démarrage des tests du système de matching...');
  
  try {
    await testNotifications();
    await testCompleteMatching();
    
    // Attendre un peu avant le nettoyage
    setTimeout(async () => {
      await testCleanup();
      console.log('🎉 Tous les tests terminés avec succès!');
    }, 35000);
    
  } catch (error) {
    console.error('💥 Échec des tests:', error);
    await testCleanup();
  }
};

// Export par défaut pour utilisation facile
module.exports = {
  testCreateRideRequest,
  testAddAvailableDriver,
  testCompleteMatching,
  testNotifications,
  testCleanup,
  runAllTests
};