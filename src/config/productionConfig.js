// Configuration de production pour Zeurk
// Ce fichier contrôle le comportement de l'app en production vs développement

const PRODUCTION_CONFIG = {
  // Mode de l'application
  IS_PRODUCTION: true, // Changer à true pour la production
  
  // Configuration des chauffeurs
  DRIVER_DETECTION: {
    // Désactiver le mode démo automatique en production
    ENABLE_AUTO_DEMO_MODE: false, // false en production
    
    // Rayons de recherche (en km)
    LOCAL_RADIUS: 5,      // Recherche locale
    EXTENDED_RADIUS: 50,  // Recherche élargie
    
    // Nombre maximum de chauffeurs à afficher
    MAX_DRIVERS: 10,
    
    // Temps d'attente avant fallback (ms)
    SEARCH_TIMEOUT: 10000,
  },
  
  // Configuration des données
  DATA_MANAGEMENT: {
    // Supprimer automatiquement les données de test au démarrage
    AUTO_CLEANUP_TEST_DATA: false, // Désactivé pour permettre les tests
    
    // Préfixes des IDs de test à supprimer
    TEST_DATA_PREFIXES: ['driver_', 'test_', 'demo_'],
    
    // Validation stricte des chauffeurs
    STRICT_DRIVER_VALIDATION: false, // Désactivé pour permettre les tests
  },
  
  // Configuration de l'interface utilisateur
  UI_CONFIG: {
    // Masquer les indicateurs de mode démo
    HIDE_DEMO_INDICATORS: true,
    
    // Messages d'erreur pour utilisateurs finaux
    USER_FRIENDLY_ERRORS: true,
    
    // Désactiver les logs de debug
    DISABLE_DEBUG_LOGS: true,
  },
  
  // Configuration des notifications
  NOTIFICATIONS: {
    // Activer les vraies notifications push
    ENABLE_PUSH_NOTIFICATIONS: true,
    
    // Désactiver les notifications de test
    DISABLE_TEST_NOTIFICATIONS: true,
  },
  
  // Configuration des paiements
  PAYMENTS: {
    // Activer les vrais paiements
    ENABLE_REAL_PAYMENTS: true,
    
    // Désactiver les paiements de test
    DISABLE_TEST_PAYMENTS: true,
  }
};

// Messages d'erreur adaptés à la production
const PRODUCTION_MESSAGES = {
  NO_DRIVERS_FOUND: "Aucun chauffeur disponible dans votre zone. Veuillez réessayer dans quelques minutes.",
  SEARCH_ERROR: "Erreur lors de la recherche de chauffeurs. Vérifiez votre connexion internet.",
  LOCATION_ERROR: "Impossible de déterminer votre position. Vérifiez vos paramètres de localisation.",
  NETWORK_ERROR: "Problème de connexion. Vérifiez votre connexion internet.",
};

// Fonction pour vérifier si on est en mode production
export const isProduction = () => PRODUCTION_CONFIG.IS_PRODUCTION;

// Fonction pour obtenir la configuration
export const getConfig = () => PRODUCTION_CONFIG;

// Fonction pour obtenir les messages
export const getMessages = () => PRODUCTION_MESSAGES;

// Fonction pour logger uniquement en développement
export const devLog = (message, ...args) => {
  if (!PRODUCTION_CONFIG.IS_PRODUCTION || !PRODUCTION_CONFIG.UI_CONFIG.DISABLE_DEBUG_LOGS) {
    console.log(message, ...args);
  }
};

// Fonction pour déterminer si le mode démo doit être activé
export const shouldEnableDemoMode = (driversFound, userLocation) => {
  // En production, ne jamais activer le mode démo automatiquement
  if (PRODUCTION_CONFIG.IS_PRODUCTION && !PRODUCTION_CONFIG.DRIVER_DETECTION.ENABLE_AUTO_DEMO_MODE) {
    return false;
  }
  
  // En développement, activer si aucun chauffeur trouvé
  return driversFound === 0;
};

// Fonction pour valider si un chauffeur est réel (pas de test)
export const isRealDriver = (driverId) => {
  if (!PRODUCTION_CONFIG.DATA_MANAGEMENT.STRICT_DRIVER_VALIDATION) {
    return true;
  }
  
  // Vérifier si l'ID contient des préfixes de test
  const testPrefixes = PRODUCTION_CONFIG.DATA_MANAGEMENT.TEST_DATA_PREFIXES;
  return !testPrefixes.some(prefix => driverId.toLowerCase().includes(prefix.toLowerCase()));
};

export default PRODUCTION_CONFIG;