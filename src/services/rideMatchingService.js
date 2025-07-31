import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, where, orderBy, limit, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { locationService } from '../utils/locationService';
import { notificationService } from './notificationService';

/**
 * Service de matching automatique des courses - COMME UBER
 * Assigne automatiquement les chauffeurs aux passagers
 */
class RideMatchingService {
  constructor() {
    this.activeMatching = new Map(); // Track active matching processes
    this.rideRequests = new Map(); // Cache des demandes de course
    this.driverResponses = new Map(); // Cache des réponses chauffeurs
  }

  /**
   * ÉTAPE 1: Créer une demande de course (passager)
   */
  async createRideRequest(passengerData) {
    try {
      console.log('🚗 Création demande de course:', passengerData);
      
      const rideRequest = {
        passengerId: passengerData.userId,
        passengerName: passengerData.name,
        passengerPhone: passengerData.phone,
        
        // Localisation
        startLocation: passengerData.startLocation,
        startCoordinates: passengerData.startCoordinates,
        destination: passengerData.destination,
        destinationCoordinates: passengerData.destinationCoordinates,
        stops: passengerData.stops || [],
        
        // Détails course
        rideType: passengerData.rideType, // 'standard', 'luxe', 'moto'
        estimatedPrice: passengerData.estimatedPrice,
        estimatedDuration: passengerData.estimatedDuration,
        estimatedDistance: passengerData.estimatedDistance,
        
        // État
        status: 'searching', // 'searching', 'driver_assigned', 'driver_accepted', 'in_progress', 'completed', 'cancelled'
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Expire dans 5 minutes
        
        // Matching
        assignedDriverId: null,
        rejectedDrivers: [], // Liste des chauffeurs qui ont refusé
        notifiedDrivers: [], // Liste des chauffeurs notifiés
      };

      // Sauvegarder dans Firebase
      const docRef = await addDoc(collection(db, 'ride_requests'), rideRequest);
      rideRequest.id = docRef.id;
      
      console.log('✅ Demande de course créée:', rideRequest.id);
      
      // Démarrer le processus de matching automatique
      this.startAutomaticMatching(rideRequest);
      
      return rideRequest;
      
    } catch (error) {
      console.error('❌ Erreur création demande course:', error);
      throw error;
    }
  }

  /**
   * ÉTAPE 2: Processus de matching automatique (COMME UBER)
   */
  async startAutomaticMatching(rideRequest) {
    try {
      console.log('🎯 Démarrage matching automatique pour:', rideRequest.id);
      
      this.activeMatching.set(rideRequest.id, {
        rideRequest,
        startTime: Date.now(),
        currentRadius: 2, // Commencer par 2km
        maxRadius: 15, // Maximum 15km
        notificationRound: 1
      });

      // Rechercher et notifier les chauffeurs par vagues
      await this.findAndNotifyDrivers(rideRequest);
      
      // Programmer l'expansion du rayon si pas de réponse
      setTimeout(() => {
        this.expandSearchRadius(rideRequest.id);
      }, 30000); // 30 secondes
      
    } catch (error) {
      console.error('❌ Erreur matching automatique:', error);
    }
  }

  /**
   * ÉTAPE 3: Trouver et notifier les chauffeurs proches
   */
  async findAndNotifyDrivers(rideRequest) {
    try {
      const matchingData = this.activeMatching.get(rideRequest.id);
      if (!matchingData) return;

      console.log(`🔍 Recherche chauffeurs dans ${matchingData.currentRadius}km`);
      
      // Trouver chauffeurs disponibles dans le rayon
      const availableDrivers = await locationService.getNearestDrivers(
        rideRequest.startCoordinates,
        matchingData.currentRadius,
        10 // Max 10 chauffeurs par vague
      );

      // Filtrer les chauffeurs déjà notifiés ou qui ont refusé
      const eligibleDrivers = availableDrivers.filter(driver => 
        !rideRequest.notifiedDrivers.includes(driver.id) &&
        !rideRequest.rejectedDrivers.includes(driver.id) &&
        driver.status === 'available' &&
        this.isDriverCompatible(driver, rideRequest)
      );

      console.log(`📱 ${eligibleDrivers.length} chauffeurs éligibles trouvés`);

      if (eligibleDrivers.length === 0) {
        // Aucun chauffeur trouvé, programmer expansion
        setTimeout(() => {
          this.expandSearchRadius(rideRequest.id);
        }, 15000);
        return;
      }

      // Trier par distance et rating
      const sortedDrivers = this.sortDriversByPriority(eligibleDrivers, rideRequest);
      
      // Notifier les 3 meilleurs chauffeurs simultanément (comme Uber)
      const driversToNotify = sortedDrivers.slice(0, 3);
      
      for (const driver of driversToNotify) {
        await this.notifyDriver(driver, rideRequest);
        rideRequest.notifiedDrivers.push(driver.id);
      }

      // Mettre à jour Firebase
      await updateDoc(doc(db, 'ride_requests', rideRequest.id), {
        notifiedDrivers: rideRequest.notifiedDrivers,
        lastNotificationAt: serverTimestamp()
      });

    } catch (error) {
      console.error('❌ Erreur notification chauffeurs:', error);
    }
  }

  /**
   * ÉTAPE 4: Notifier un chauffeur spécifique
   */
  async notifyDriver(driver, rideRequest) {
    try {
      console.log(`📱 Notification chauffeur ${driver.id} pour course ${rideRequest.id}`);
      
      // Créer notification dans Firebase
      const notification = {
        driverId: driver.id,
        rideRequestId: rideRequest.id,
        type: 'ride_request',
        
        // Données de la course
        passengerName: rideRequest.passengerName,
        startLocation: rideRequest.startLocation,
        destination: rideRequest.destination,
        estimatedPrice: rideRequest.estimatedPrice,
        estimatedDuration: rideRequest.estimatedDuration,
        distance: this.calculateDistance(driver.coordinates, rideRequest.startCoordinates),
        
        // État
        status: 'pending', // 'pending', 'accepted', 'rejected', 'expired'
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 15000), // 15 secondes pour répondre
      };

      await addDoc(collection(db, 'driver_notifications'), notification);
      
      // Envoyer push notification
      await notificationService.sendToDriver(driver.id, {
        title: 'Nouvelle course disponible',
        body: `${rideRequest.startLocation} → ${rideRequest.destination}`,
        data: {
          type: 'ride_request',
          rideRequestId: rideRequest.id,
          estimatedPrice: rideRequest.estimatedPrice
        }
      });

    } catch (error) {
      console.error('❌ Erreur notification chauffeur:', error);
    }
  }

  /**
   * ÉTAPE 5: Gérer la réponse du chauffeur
   */
  async handleDriverResponse(driverId, rideRequestId, response) {
    try {
      console.log(`📞 Réponse chauffeur ${driverId}: ${response} pour course ${rideRequestId}`);
      
      const rideRequest = await this.getRideRequest(rideRequestId);
      if (!rideRequest || rideRequest.status !== 'searching') {
        console.log('⚠️ Course déjà assignée ou expirée');
        return false;
      }

      if (response === 'accepted') {
        // CHAUFFEUR ACCEPTÉ - ASSIGNER LA COURSE
        await this.assignDriverToRide(driverId, rideRequestId);
        return true;
        
      } else if (response === 'rejected') {
        // CHAUFFEUR REFUSÉ - CONTINUER LA RECHERCHE
        rideRequest.rejectedDrivers.push(driverId);
        
        await updateDoc(doc(db, 'ride_requests', rideRequestId), {
          rejectedDrivers: rideRequest.rejectedDrivers
        });
        
        // Continuer la recherche avec d'autres chauffeurs
        setTimeout(() => {
          this.findAndNotifyDrivers(rideRequest);
        }, 2000);
        
        return false;
      }
      
    } catch (error) {
      console.error('❌ Erreur réponse chauffeur:', error);
      return false;
    }
  }

  /**
   * ÉTAPE 6: Assigner définitivement le chauffeur
   */
  async assignDriverToRide(driverId, rideRequestId) {
    try {
      console.log(`✅ Assignment chauffeur ${driverId} à course ${rideRequestId}`);
      
      // Mettre à jour la demande de course
      await updateDoc(doc(db, 'ride_requests', rideRequestId), {
        assignedDriverId: driverId,
        status: 'driver_assigned',
        assignedAt: serverTimestamp()
      });

      // Mettre à jour le statut du chauffeur
      await updateDoc(doc(db, 'drivers_live', driverId), {
        status: 'assigned',
        currentRideId: rideRequestId,
        updatedAt: serverTimestamp()
      });

      // Arrêter le processus de matching
      this.activeMatching.delete(rideRequestId);
      
      // Notifier le passager
      await notificationService.sendToPassenger(rideRequestId, {
        title: 'Chauffeur trouvé !',
        body: 'Votre chauffeur arrive',
        data: {
          type: 'driver_assigned',
          driverId: driverId
        }
      });

      // Annuler les autres notifications en attente
      await this.cancelPendingNotifications(rideRequestId, driverId);
      
      console.log('🎉 Course assignée avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur assignment chauffeur:', error);
    }
  }

  /**
   * Expansion automatique du rayon de recherche
   */
  async expandSearchRadius(rideRequestId) {
    const matchingData = this.activeMatching.get(rideRequestId);
    if (!matchingData) return;

    matchingData.currentRadius = Math.min(
      matchingData.currentRadius + 2, 
      matchingData.maxRadius
    );
    
    matchingData.notificationRound++;
    
    console.log(`📈 Expansion rayon: ${matchingData.currentRadius}km (round ${matchingData.notificationRound})`);
    
    if (matchingData.currentRadius < matchingData.maxRadius) {
      await this.findAndNotifyDrivers(matchingData.rideRequest);
    } else {
      // Aucun chauffeur trouvé dans le rayon maximum
      await this.handleNoDriversFound(rideRequestId);
    }
  }

  /**
   * Utilitaires
   */
  isDriverCompatible(driver, rideRequest) {
    // Vérifier compatibilité type de véhicule
    if (rideRequest.rideType === 'luxe' && driver.vehicleType !== 'luxe') {
      return false;
    }
    return true;
  }

  sortDriversByPriority(drivers, rideRequest) {
    return drivers.sort((a, b) => {
      const distanceA = this.calculateDistance(a.coordinates, rideRequest.startCoordinates);
      const distanceB = this.calculateDistance(b.coordinates, rideRequest.startCoordinates);
      
      // Priorité: distance (70%) + rating (30%)
      const scoreA = (distanceA * 0.7) + ((5 - a.rating) * 0.3);
      const scoreB = (distanceB * 0.7) + ((5 - b.rating) * 0.3);
      
      return scoreA - scoreB;
    });
  }

  calculateDistance(coord1, coord2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async getRideRequest(rideRequestId) {
    // Implémenter récupération depuis Firebase
    return this.rideRequests.get(rideRequestId);
  }

  async cancelPendingNotifications(rideRequestId, excludeDriverId) {
    // Annuler toutes les notifications en attente sauf celle du chauffeur assigné
    const q = query(
      collection(db, 'driver_notifications'),
      where('rideRequestId', '==', rideRequestId),
      where('status', '==', 'pending')
    );
    
    // Marquer comme expirées
    // Implementation détaillée...
  }

  async handleNoDriversFound(rideRequestId) {
    console.log('😞 Aucun chauffeur trouvé pour la course:', rideRequestId);
    
    await updateDoc(doc(db, 'ride_requests', rideRequestId), {
      status: 'no_drivers_found',
      completedAt: serverTimestamp()
    });
    
    // Notifier le passager
    await notificationService.sendToPassenger(rideRequestId, {
      title: 'Aucun chauffeur disponible',
      body: 'Veuillez réessayer dans quelques minutes',
      data: { type: 'no_drivers_found' }
    });
  }

  /**
   * Alias pour assignDriverToRide (compatibilité)
   */
  async assignDriver(driverId, rideRequestId) {
    return await this.assignDriverToRide(driverId, rideRequestId);
  }

  /**
   * Ajouter un chauffeur disponible
   */
  async addAvailableDriver(driverData) {
    try {
      console.log('➕ Ajout chauffeur disponible:', driverData.id);
      
      const driverDoc = {
        id: driverData.id,
        name: driverData.name,
        phone: driverData.phone,
        vehicle: driverData.vehicle,
        coordinates: driverData.location,
        status: 'available',
        category: driverData.category || 'standard',
        rating: driverData.rating || 4.5,
        totalRides: driverData.totalRides || 0,
        updatedAt: serverTimestamp(),
        pushToken: driverData.pushToken || null
      };

      await updateDoc(doc(db, 'drivers_live', driverData.id), driverDoc);
      console.log('✅ Chauffeur ajouté avec succès');
      
      return driverDoc;
      
    } catch (error) {
      console.error('❌ Erreur ajout chauffeur:', error);
      throw error;
    }
  }

  /**
   * Retirer un chauffeur (déconnexion)
   */
  async removeDriver(driverId) {
    try {
      console.log('➖ Suppression chauffeur:', driverId);
      
      await updateDoc(doc(db, 'drivers_live', driverId), {
        status: 'offline',
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Chauffeur retiré avec succès');
      
    } catch (error) {
      console.error('❌ Erreur suppression chauffeur:', error);
      throw error;
    }
  }

  /**
   * Écouter les mises à jour d'une demande de course
   */
  listenToRideRequest(rideRequestId, callback) {
    try {
      console.log('👂 Écoute demande de course:', rideRequestId);
      
      const unsubscribe = onSnapshot(
        doc(db, 'ride_requests', rideRequestId),
        (doc) => {
          if (doc.exists()) {
            const rideData = { id: doc.id, ...doc.data() };
            console.log('📡 Mise à jour course:', rideData.status);
            callback(rideData);
          } else {
            console.log('⚠️ Demande de course introuvable');
            callback(null);
          }
        },
        (error) => {
          console.error('❌ Erreur écoute course:', error);
          callback(null);
        }
      );
      
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erreur setup écoute:', error);
      return () => {}; // Retourner fonction vide en cas d'erreur
    }
  }

  /**
   * Annuler une demande de course
   */
  async cancelRideRequest(rideRequestId) {
    try {
      console.log('❌ Annulation demande de course:', rideRequestId);
      
      await updateDoc(doc(db, 'ride_requests', rideRequestId), {
        status: 'cancelled',
        cancelledAt: serverTimestamp()
      });
      
      // Arrêter le matching actif
      this.activeMatching.delete(rideRequestId);
      
      // Annuler les notifications en attente
      await this.cancelPendingNotifications(rideRequestId);
      
      console.log('✅ Demande annulée avec succès');
      
    } catch (error) {
      console.error('❌ Erreur annulation:', error);
      throw error;
    }
  }
}

export const rideMatchingService = new RideMatchingService();