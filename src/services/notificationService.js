import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, where, orderBy, serverTimestamp, getDoc } from 'firebase/firestore';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.listeners = new Map(); // Active Firebase listeners
  }

  // Initialiser le service de notifications
  async initialize() {
    try {
      // Configurer le canal Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('zeurk-rides', {
          name: 'Courses Zeurk',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF9500',
          sound: 'default',
          icon: './assets/notification-icons/notification-icon-96.png',
          color: '#FF9500',
        });
      }

      // Obtenir le token push
      this.expoPushToken = await this.registerForPushNotifications();
      
      console.log('🔔 Service de notifications initialisé');
      console.log('📱 Token push:', this.expoPushToken);
      
      return this.expoPushToken;
    } catch (error) {
      console.error('❌ Erreur initialisation notifications:', error);
      return null;
    }
  }

  // Enregistrer pour les notifications push
  async registerForPushNotifications() {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('⚠️ Permission notifications refusée');
        return null;
      }

      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        
        token = (await Notifications.getExpoPushTokenAsync({
          projectId,
        })).data;
      } catch (e) {
        token = `${Device.osName}-${Device.modelName}-${Date.now()}`;
        console.warn('⚠️ Token Expo non disponible, utilisation token simulé:', token);
      }
    } else {
      console.warn('⚠️ Notifications push non disponibles sur simulateur');
      token = 'simulator-token';
    }

    return token;
  }

  // Écouter les notifications
  setupNotificationListeners(navigation) {
    // Notification reçue quand l'app est ouverte
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification reçue:', notification);
      
      const { type, rideData } = notification.request.content.data || {};
      
      if (type === 'sms_ride_request') {
        // Afficher une alerte ou un toast
        console.log('📱 Nouvelle course SMS:', rideData);
      }
    });

    // Notification cliquée
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification cliquée:', response);
      
      const { type, rideData } = response.notification.request.content.data || {};
      
      if (type === 'sms_ride_request' && navigation) {
        // Naviguer vers l'écran de course
        navigation.navigate('SMSRideRequest', { rideData });
      }
    });
  }

  // Nettoyer les listeners
  cleanup() {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  // Envoyer une notification locale (pour test)
  async sendLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
          icon: Platform.OS === 'android' ? './assets/notification-icons/notification-icon-96.png' : undefined,
          color: '#FF9500',
        },
        trigger: null, // Immédiatement
      });
      console.log('📤 Notification locale envoyée');
    } catch (error) {
      console.error('❌ Erreur notification locale:', error);
    }
  }

  // Simuler une notification de course SMS
  async simulateSMSRideNotification(rideData) {
    const title = '🚗 Nouvelle Course SMS';
    const body = `${rideData.from} → ${rideData.to}${rideData.time ? ` à ${rideData.time}` : ''}`;
    
    await this.sendLocalNotification(title, body, {
      type: 'sms_ride_request',
      rideData
    });
  }

  // Obtenir le token actuel
  getToken() {
    return this.expoPushToken;
  }

  // ========================================
  // NOUVELLES MÉTHODES UBER-STYLE
  // ========================================

  /**
   * Initialiser notifications pour un utilisateur spécifique
   */
  async initializeForUser(userId, userType) {
    try {
      console.log(`🔔 Initialisation notifications pour ${userType}:`, userId);
      
      // Sauvegarder token dans Firebase
      await this.saveUserToken(userId, userType, this.expoPushToken);
      
      // Démarrer l'écoute des notifications
      this.startListeningForNotifications(userId, userType);
      
      console.log('✅ Notifications utilisateur initialisées');
      return this.expoPushToken;
      
    } catch (error) {
      console.error('❌ Erreur initialisation notifications utilisateur:', error);
      return null;
    }
  }

  /**
   * Sauvegarder token utilisateur dans Firebase
   */
  async saveUserToken(userId, userType, token) {
    try {
      const collection_name = userType === 'driver' ? 'drivers_live' : 'passengers';
      
      await updateDoc(doc(db, collection_name, userId), {
        pushToken: token,
        tokenUpdatedAt: serverTimestamp(),
        notificationsEnabled: true
      });
      
      console.log(`✅ Token sauvegardé pour ${userType}:`, userId);
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde token:', error);
    }
  }

  /**
   * Écouter les notifications en temps réel depuis Firebase
   */
  startListeningForNotifications(userId, userType) {
    const collection_name = userType === 'driver' ? 'driver_notifications' : 'passenger_notifications';
    
    const q = query(
      collection(db, collection_name),
      where(userType === 'driver' ? 'driverId' : 'passengerId', '==', userId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notification = { id: change.doc.id, ...change.doc.data() };
          this.handleIncomingNotification(notification, userType);
        }
      });
    });

    this.listeners.set(`${userType}_${userId}`, unsubscribe);
    console.log(`👂 Écoute notifications démarrée pour ${userType}:`, userId);
  }

  /**
   * Traiter notification entrante
   */
  async handleIncomingNotification(notification, userType) {
    try {
      console.log(`📨 Notification reçue pour ${userType}:`, notification);
      
      // Afficher notification locale
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title || 'Nouvelle notification',
          body: notification.body || '',
          data: notification.data || {},
          sound: 'default',
        },
        trigger: null, // Immédiat
      });

      // Marquer comme reçue
      await this.markNotificationAsReceived(notification.id, userType);
      
    } catch (error) {
      console.error('❌ Erreur traitement notification:', error);
    }
  }

  /**
   * ENVOYER NOTIFICATION À UN CHAUFFEUR
   */
  async sendToDriver(driverId, notificationData) {
    try {
      console.log(`📱➡️ Envoi notification chauffeur ${driverId}:`, notificationData);
      
      // Créer notification dans Firebase
      const notification = {
        driverId: driverId,
        type: notificationData.type || 'general',
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data || {},
        status: 'pending',
        createdAt: serverTimestamp(),
        expiresAt: notificationData.expiresAt || new Date(Date.now() + 60000), // 1 minute par défaut
      };

      await addDoc(collection(db, 'driver_notifications'), notification);
      
      // Envoyer push notification via Expo
      await this.sendExpoPushNotification(driverId, 'driver', notificationData);
      
      console.log('✅ Notification chauffeur envoyée');
      
    } catch (error) {
      console.error('❌ Erreur envoi notification chauffeur:', error);
    }
  }

  /**
   * ENVOYER NOTIFICATION À UN PASSAGER
   */
  async sendToPassenger(passengerId, notificationData) {
    try {
      console.log(`📱➡️ Envoi notification passager ${passengerId}:`, notificationData);
      
      // Créer notification dans Firebase
      const notification = {
        passengerId: passengerId,
        type: notificationData.type || 'general',
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data || {},
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'passenger_notifications'), notification);
      
      // Envoyer push notification via Expo
      await this.sendExpoPushNotification(passengerId, 'passenger', notificationData);
      
      console.log('✅ Notification passager envoyée');
      
    } catch (error) {
      console.error('❌ Erreur envoi notification passager:', error);
    }
  }

  /**
   * Envoyer notification push via Expo
   */
  async sendExpoPushNotification(userId, userType, notificationData) {
    try {
      // Récupérer token push de l'utilisateur
      const token = await this.getUserPushToken(userId, userType);
      if (!token) {
        console.log(`⚠️ Pas de token push pour ${userType}:`, userId);
        return;
      }

      // Préparer message Expo
      const message = {
        to: token,
        sound: 'default',
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data || {},
        priority: 'high',
        channelId: userType === 'driver' ? 'driver-notifications' : 'passenger-notifications',
      };

      // Envoyer via API Expo
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('📤 Réponse Expo Push:', result);
      
    } catch (error) {
      console.error('❌ Erreur Expo Push:', error);
    }
  }

  /**
   * Récupérer token push utilisateur
   */
  async getUserPushToken(userId, userType) {
    try {
      const collection_name = userType === 'driver' ? 'drivers_live' : 'passengers';
      const docRef = doc(db, collection_name, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().pushToken;
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Erreur récupération token:', error);
      return null;
    }
  }

  /**
   * Marquer notification comme reçue
   */
  async markNotificationAsReceived(notificationId, userType) {
    try {
      const collection_name = userType === 'driver' ? 'driver_notifications' : 'passenger_notifications';
      
      await updateDoc(doc(db, collection_name, notificationId), {
        status: 'received',
        receivedAt: serverTimestamp()
      });
      
    } catch (error) {
      console.error('❌ Erreur marquage notification:', error);
    }
  }

  /**
   * NOTIFICATIONS SPÉCIFIQUES UBER-STYLE
   */

  // Notification course trouvée (passager)
  async notifyRideFound(passengerId, driverData) {
    await this.sendToPassenger(passengerId, {
      type: 'ride_found',
      title: 'Chauffeur trouvé !',
      body: `${driverData.name} arrive dans ${driverData.eta} minutes`,
      data: {
        driverId: driverData.id,
        driverName: driverData.name,
        eta: driverData.eta,
        licensePlate: driverData.licensePlate
      }
    });
  }

  // Notification nouvelle course (chauffeur)
  async notifyNewRideRequest(driverId, rideData) {
    await this.sendToDriver(driverId, {
      type: 'ride_request',
      title: 'Nouvelle course disponible',
      body: `${rideData.startLocation} → ${rideData.destination} (${rideData.estimatedPrice} FC)`,
      data: {
        rideRequestId: rideData.id,
        startLocation: rideData.startLocation,
        destination: rideData.destination,
        estimatedPrice: rideData.estimatedPrice,
        distance: rideData.distance
      },
      expiresAt: new Date(Date.now() + 15000) // 15 secondes
    });
  }

  // Notification chauffeur en route (passager)
  async notifyDriverEnRoute(passengerId, driverData) {
    await this.sendToPassenger(passengerId, {
      type: 'driver_en_route',
      title: 'Votre chauffeur est en route',
      body: `${driverData.name} arrive dans ${driverData.eta} minutes`,
      data: {
        driverId: driverData.id,
        eta: driverData.eta
      }
    });
  }

  // Notification chauffeur arrivé (passager)
  async notifyDriverArrived(passengerId, driverData) {
    await this.sendToPassenger(passengerId, {
      type: 'driver_arrived',
      title: 'Votre chauffeur est arrivé',
      body: `${driverData.name} vous attend`,
      data: {
        driverId: driverData.id,
        licensePlate: driverData.licensePlate
      }
    });
  }

  // Notification course terminée (passager)
  async notifyRideCompleted(passengerId, rideData) {
    await this.sendToPassenger(passengerId, {
      type: 'ride_completed',
      title: 'Course terminée',
      body: `Merci d'avoir utilisé Zeurk ! Total: ${rideData.finalPrice} FC`,
      data: {
        rideId: rideData.id,
        finalPrice: rideData.finalPrice,
        duration: rideData.duration
      }
    });
  }

  /**
   * Nettoyer les listeners Firebase
   */
  cleanupUserListeners(userId, userType) {
    const key = `${userType}_${userId}`;
    const unsubscribe = this.listeners.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(key);
      console.log(`🧹 Listener notifications nettoyé pour ${userType}:`, userId);
    }
  }
}

// Instance singleton
export const notificationService = new NotificationService();
export default NotificationService;