import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { getUserType, promoteToDriver } from '../config/firebase';

const DRIVER_TOKEN_KEY = 'driver_push_token';
const DRIVER_STATUS_KEY = 'is_registered_driver';
const BACKEND_URL = 'https://zeurk.vercel.app'; // Production URL

class DriverTokenService {
  async registerAsDriver(userId, driverData = {}) {
    try {
      // Check if device can receive push notifications
      if (!Device.isDevice) {
        console.warn('Must use physical device for Push Notifications');
        return null;
      }

      // Get notification permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      if (token?.data) {
        // Store locally
        await AsyncStorage.setItem(DRIVER_TOKEN_KEY, token.data);
        await AsyncStorage.setItem(DRIVER_STATUS_KEY, 'true');
        
        // Promouvoir l'utilisateur en driver dans Firebase
        if (userId) {
          try {
            await promoteToDriver(userId, {
              ...driverData,
              pushToken: token.data,
              deviceId: Constants.deviceId,
              registeredAt: new Date().toISOString()
            });
            console.log('✅ Utilisateur promu en driver dans Firebase');
          } catch (firebaseError) {
            console.warn('⚠️ Erreur lors de la promotion Firebase, mais token enregistré localement:', firebaseError);
          }
        }
        
        // Send to backend
        await this.sendTokenToBackend(token.data);
        
        console.log('Driver registered with token:', token.data);
        return token.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error registering as driver:', error);
      return null;
    }
  }

  async sendTokenToBackend(token) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/driver/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pushToken: token,
          deviceId: Constants.deviceId,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        console.warn('Failed to register token with backend');
      }
    } catch (error) {
      console.warn('Backend not available, token stored locally only:', error.message);
    }
  }

  async removeTokenFromBackend(token) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/driver/unregister`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pushToken: token,
          deviceId: Constants.deviceId,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to unregister token with backend');
      }
    } catch (error) {
      console.warn('Backend not available for token removal:', error.message);
    }
  }

  async unregisterDriver() {
    try {
      const token = await AsyncStorage.getItem(DRIVER_TOKEN_KEY);
      
      if (token) {
        await this.removeTokenFromBackend(token);
      }
      
      await AsyncStorage.removeItem(DRIVER_TOKEN_KEY);
      await AsyncStorage.removeItem(DRIVER_STATUS_KEY);
      
      console.log('Driver unregistered successfully');
    } catch (error) {
      console.error('Error unregistering driver:', error);
    }
  }

  async getDriverToken() {
    try {
      return await AsyncStorage.getItem(DRIVER_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting driver token:', error);
      return null;
    }
  }

  async isRegisteredAsDriver(userId = null) {
    try {
      // Vérifier d'abord le statut local
      const localStatus = await AsyncStorage.getItem(DRIVER_STATUS_KEY);
      
      // Si on a un userId, vérifier aussi dans Firebase
      if (userId) {
        try {
          const userType = await getUserType(userId);
          const isDriverInFirebase = userType === 'driver';
          
          // Si Firebase dit que c'est un driver mais pas le local, mettre à jour le local
          if (isDriverInFirebase && localStatus !== 'true') {
            await AsyncStorage.setItem(DRIVER_STATUS_KEY, 'true');
            return true;
          }
          
          // Si Firebase dit que ce n'est pas un driver mais le local dit que oui, corriger le local
          if (!isDriverInFirebase && localStatus === 'true') {
            await AsyncStorage.removeItem(DRIVER_STATUS_KEY);
            return false;
          }
          
          return isDriverInFirebase;
        } catch (firebaseError) {
          console.warn('⚠️ Erreur lors de la vérification Firebase, utilisation du statut local:', firebaseError);
          return localStatus === 'true';
        }
      }
      
      // Fallback au statut local
      return localStatus === 'true';
    } catch (error) {
      console.error('Error checking driver status:', error);
      return false;
    }
  }

  async getAllDriverTokens() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/driver/tokens`);
      if (response.ok) {
        const data = await response.json();
        return data.tokens || [];
      }
      return [];
    } catch (error) {
      console.warn('Could not fetch driver tokens from backend:', error.message);
      return [];
    }
  }
}

export const driverTokenService = new DriverTokenService();