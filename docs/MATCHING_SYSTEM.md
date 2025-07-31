# Système de Matching Automatique - Zeurk

## Vue d'ensemble

Le système de matching automatique de Zeurk permet de connecter automatiquement les passagers avec les chauffeurs disponibles en temps réel, similaire au fonctionnement d'Uber. Le système utilise Firebase Firestore pour la synchronisation en temps réel et Expo pour les notifications push.

## Architecture

### Services principaux

1. **rideMatchingService** (`src/services/rideMatchingService.js`)
   - Gestion des demandes de course
   - Algorithme de matching automatique
   - Suivi des chauffeurs disponibles
   - Gestion des statuts de course

2. **notificationService** (`src/services/notificationService.js`)
   - Notifications push en temps réel
   - Gestion des tokens Expo
   - Notifications spécifiques Uber-style
   - Écoute des notifications Firebase

### Collections Firebase

- `ride_requests` : Demandes de course des passagers
- `drivers_live` : Chauffeurs disponibles en temps réel
- `driver_notifications` : Notifications pour les chauffeurs
- `passenger_notifications` : Notifications pour les passagers

## Fonctionnalités

### Pour les Passagers

1. **Demande de course automatique**
   - Création automatique de la demande dans Firebase
   - Matching en temps réel avec les chauffeurs disponibles
   - Notifications de statut (course trouvée, chauffeur en route, etc.)

2. **Interface utilisateur**
   - Overlay de recherche avec indicateur de progression
   - Bouton d'annulation
   - Affichage des erreurs avec possibilité de réessayer
   - Informations de la course (type, prix)

### Pour les Chauffeurs

1. **Réception des demandes**
   - Notifications push automatiques pour nouvelles demandes
   - Calcul automatique de la distance et du temps d'arrivée
   - Acceptation/refus des courses

2. **Suivi en temps réel**
   - Mise à jour automatique de la position
   - Statut de disponibilité
   - Gestion des courses en cours

## Intégration dans RideOptionsScreen

Le système a été intégré dans `RideOptionsScreen.js` pour remplacer la navigation directe vers `ConfirmPickup`. Voici le flux :

1. **Sélection de course** → Clic sur "Suivant"
2. **Démarrage du matching** → `handleStartMatching()`
3. **Création de la demande** → Firebase Firestore
4. **Recherche automatique** → Algorithme de matching
5. **Notification du résultat** → Course trouvée ou timeout
6. **Navigation** → Vers `TrackRide` si succès

## Configuration

### Variables d'environnement requises

```env
# Firebase
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_PROJECT_ID=your_project_id

# Expo Push Notifications
EXPO_ACCESS_TOKEN=your_expo_token
```

### Paramètres de matching

```javascript
// Dans rideMatchingService.js
const MATCHING_CONFIG = {
  SEARCH_RADIUS_KM: 10,        // Rayon de recherche en km
  MAX_WAIT_TIME_MS: 120000,    // Temps d'attente max (2 min)
  DRIVER_RESPONSE_TIME_MS: 30000, // Temps de réponse chauffeur (30s)
  MAX_DRIVERS_TO_NOTIFY: 5     // Nombre max de chauffeurs notifiés
};
```

## Utilisation

### Démarrer une recherche de course

```javascript
import rideMatchingService from '../services/rideMatchingService';
import notificationService from '../services/notificationService';

const handleStartMatching = async (rideData) => {
  try {
    // Initialiser les notifications
    await notificationService.initializeForUser('passenger', passengerId);
    
    // Créer la demande
    const requestId = await rideMatchingService.createRideRequest(rideData);
    
    // Écouter les mises à jour
    const unsubscribe = rideMatchingService.listenToRideRequest(requestId, (update) => {
      if (update.status === 'matched') {
        // Course trouvée !
        handleRideMatched(update);
      }
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Erreur matching:', error);
  }
};
```

### Ajouter un chauffeur disponible

```javascript
const driver = {
  id: 'driver_123',
  name: 'Jean Mukendi',
  phone: '+243123456789',
  vehicle: { make: 'Toyota', model: 'Corolla' },
  location: { latitude: -4.4419, longitude: 15.2663 },
  available: true,
  category: 'standard'
};

await rideMatchingService.addAvailableDriver(driver);
```

## Tests

Un système de test complet est disponible dans `src/utils/testMatching.js` :

```javascript
import testMatching from '../utils/testMatching';

// Tester le système complet
await testMatching.runAllTests();

// Tests individuels
await testMatching.testCreateRideRequest();
await testMatching.testNotifications();
```

## Notifications Uber-style

Le système inclut des notifications spécifiques au style Uber :

- `notifyRideFound` : Course trouvée
- `notifyNewRideRequest` : Nouvelle demande pour chauffeur
- `notifyDriverEnRoute` : Chauffeur en route
- `notifyDriverArrived` : Chauffeur arrivé
- `notifyRideCompleted` : Course terminée

## Gestion des erreurs

Le système gère plusieurs types d'erreurs :

1. **Aucun chauffeur disponible** : Timeout après 2 minutes
2. **Erreur de géolocalisation** : Fallback sur position par défaut
3. **Erreur Firebase** : Retry automatique avec backoff
4. **Erreur de notification** : Log et continuation du processus

## Sécurité

- Validation des données côté client et serveur
- Tokens de notification chiffrés
- Géolocalisation avec permissions appropriées
- Nettoyage automatique des données sensibles

## Performance

- Utilisation d'index Firebase optimisés
- Cache local des positions chauffeurs
- Debouncing des mises à jour de position
- Nettoyage automatique des écouteurs

## Prochaines étapes

1. **Intégration avec le système de paiement**
2. **Ajout de métriques et analytics**
3. **Optimisation de l'algorithme de matching**
4. **Tests de charge et performance**
5. **Interface chauffeur complète**

## Support

Pour toute question ou problème, consultez les logs dans la console ou contactez l'équipe de développement.