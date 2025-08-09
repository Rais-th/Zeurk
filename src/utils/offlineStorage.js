import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys for different data types
const STORAGE_KEYS = {
  USER_PROFILE: '@zeurk_user_profile',
  RIDE_HISTORY: '@zeurk_ride_history',
  // VEHICLE_LISTINGS: '@zeurk_vehicle_listings', // REMOVED TO REDUCE MEMORY CONSUMPTION
  FAVORITES: '@zeurk_favorites',
  DRIVER_DATA: '@zeurk_driver_data',
  OFFLINE_QUEUE: '@zeurk_offline_queue',
  LAST_SYNC: '@zeurk_last_sync',
  APP_STATE: '@zeurk_app_state'
};

class OfflineStorage {
  // Generic storage methods
  async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      console.log(`✅ Stored ${key} offline`);
      return true;
    } catch (error) {
      console.error(`❌ Error storing ${key}:`, error);
      return false;
    }
  }

  async getItem(key) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`❌ Error retrieving ${key}:`, error);
      return null;
    }
  }

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`❌ Error removing ${key}:`, error);
      return false;
    }
  }

  // User Profile Management
  async saveUserProfile(profile) {
    const profileWithTimestamp = {
      ...profile,
      lastUpdated: new Date().toISOString(),
      isOffline: true
    };
    return await this.setItem(STORAGE_KEYS.USER_PROFILE, profileWithTimestamp);
  }

  async getUserProfile() {
    return await this.getItem(STORAGE_KEYS.USER_PROFILE);
  }

  // Ride History Management
  async saveRideHistory(rides) {
    const rideHistoryWithTimestamp = {
      rides,
      lastUpdated: new Date().toISOString(),
      isOffline: true
    };
    return await this.setItem(STORAGE_KEYS.RIDE_HISTORY, rideHistoryWithTimestamp);
  }

  async getRideHistory() {
    const data = await this.getItem(STORAGE_KEYS.RIDE_HISTORY);
    return data ? data.rides : [];
  }

  async addRideToHistory(ride) {
    const existingHistory = await this.getRideHistory();
    const newRide = {
      ...ride,
      id: ride.id || Date.now().toString(),
      timestamp: new Date().toISOString(),
      isOffline: true
    };
    const updatedHistory = [newRide, ...existingHistory];
    return await this.saveRideHistory(updatedHistory);
  }

  // Vehicle Listings Management - REMOVED TO REDUCE MEMORY CONSUMPTION
  // Vehicle listings are now handled in-memory only without persistent storage

  // Favorites Management
  async saveFavorites(favorites) {
    return await this.setItem(STORAGE_KEYS.FAVORITES, favorites);
  }

  async getFavorites() {
    const favorites = await this.getItem(STORAGE_KEYS.FAVORITES);
    return favorites || [];
  }

  async addToFavorites(item) {
    const favorites = await this.getFavorites();
    if (!favorites.find(fav => fav.id === item.id)) {
      favorites.push({
        ...item,
        addedAt: new Date().toISOString()
      });
      return await this.saveFavorites(favorites);
    }
    return true;
  }

  async removeFromFavorites(itemId) {
    const favorites = await this.getFavorites();
    const updatedFavorites = favorites.filter(fav => fav.id !== itemId);
    return await this.saveFavorites(updatedFavorites);
  }

  // Driver Data Management
  async saveDriverData(driverData) {
    const driverDataWithTimestamp = {
      ...driverData,
      lastUpdated: new Date().toISOString(),
      isOffline: true
    };
    return await this.setItem(STORAGE_KEYS.DRIVER_DATA, driverDataWithTimestamp);
  }

  async getDriverData() {
    return await this.getItem(STORAGE_KEYS.DRIVER_DATA);
  }

  // Offline Queue Management (for actions to sync when online)
  async addToOfflineQueue(action) {
    const queue = await this.getOfflineQueue();
    const actionWithTimestamp = {
      ...action,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    queue.push(actionWithTimestamp);
    return await this.setItem(STORAGE_KEYS.OFFLINE_QUEUE, queue);
  }

  async getOfflineQueue() {
    const queue = await this.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    return queue || [];
  }

  async clearOfflineQueue() {
    return await this.setItem(STORAGE_KEYS.OFFLINE_QUEUE, []);
  }

  async removeFromOfflineQueue(actionId) {
    const queue = await this.getOfflineQueue();
    const updatedQueue = queue.filter(action => action.id !== actionId);
    return await this.setItem(STORAGE_KEYS.OFFLINE_QUEUE, updatedQueue);
  }

  // Sync Management
  async setLastSyncTime(timestamp = new Date().toISOString()) {
    return await this.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
  }

  async getLastSyncTime() {
    return await this.getItem(STORAGE_KEYS.LAST_SYNC);
  }

  // App State Management
  async saveAppState(state) {
    return await this.setItem(STORAGE_KEYS.APP_STATE, {
      ...state,
      lastUpdated: new Date().toISOString()
    });
  }

  async getAppState() {
    return await this.getItem(STORAGE_KEYS.APP_STATE);
  }

  // Utility Methods
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      console.log('✅ All offline data cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing offline data:', error);
      return false;
    }
  }

  async getStorageInfo() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const zeurkKeys = keys.filter(key => key.startsWith('@zeurk_'));
      const info = {
        totalKeys: zeurkKeys.length,
        keys: zeurkKeys,
        lastSync: await this.getLastSyncTime()
      };
      return info;
    } catch (error) {
      console.error('❌ Error getting storage info:', error);
      return null;
    }
  }
}

export default new OfflineStorage();
export { STORAGE_KEYS };