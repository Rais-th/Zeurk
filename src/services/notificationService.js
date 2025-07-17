import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

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
          lightColor: '#FF6B35',
          sound: 'default',
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
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
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
}

// Instance singleton
export const notificationService = new NotificationService();
export default NotificationService;