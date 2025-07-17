import NetInfo from '@react-native-community/netinfo';
import { useState, useEffect, useCallback } from 'react';
import offlineStorage from './offlineStorage';

class NetworkManager {
  constructor() {
    this.isConnected = true;
    this.connectionType = 'unknown';
    this.listeners = [];
    this.syncInProgress = false;
  }

  // Initialize network monitoring
  initialize() {
    return NetInfo.addEventListener(state => {
      const wasConnected = this.isConnected;
      this.isConnected = state.isConnected;
      this.connectionType = state.type;
      
      console.log(`🌐 Network status: ${this.isConnected ? 'Online' : 'Offline'} (${this.connectionType})`);
      
      // Notify all listeners
      this.listeners.forEach(listener => listener(this.isConnected, this.connectionType));
      
      // Auto-sync when coming back online
      if (!wasConnected && this.isConnected) {
        this.handleReconnection();
      }
    });
  }

  // Add listener for network changes
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Handle reconnection logic
  async handleReconnection() {
    console.log('🔄 Reconnected to internet, starting sync...');
    await this.syncOfflineData();
  }

  // Sync offline data when connection is restored
  async syncOfflineData() {
    if (this.syncInProgress || !this.isConnected) return;
    
    this.syncInProgress = true;
    
    try {
      const offlineQueue = await offlineStorage.getOfflineQueue();
      console.log(`📤 Syncing ${offlineQueue.length} offline actions...`);
      
      for (const action of offlineQueue) {
        try {
          await this.processOfflineAction(action);
          await offlineStorage.removeFromOfflineQueue(action.id);
          console.log(`✅ Synced action: ${action.type}`);
        } catch (error) {
          console.error(`❌ Failed to sync action ${action.type}:`, error);
          // Keep failed actions in queue for retry
        }
      }
      
      await offlineStorage.setLastSyncTime();
      console.log('✅ Offline sync completed');
      
    } catch (error) {
      console.error('❌ Error during offline sync:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Process individual offline actions
  async processOfflineAction(action) {
    switch (action.type) {
      case 'CREATE_RIDE':
        // Simulate API call to create ride
        console.log('Syncing ride creation:', action.data);
        break;
      
      case 'UPDATE_PROFILE':
        // Simulate API call to update profile
        console.log('Syncing profile update:', action.data);
        break;
      
      case 'CREATE_VEHICLE_LISTING':
        // Simulate API call to create vehicle listing
        console.log('Syncing vehicle listing:', action.data);
        break;
      
      case 'REPORT_PROBLEM':
        // Simulate API call to report problem
        console.log('Syncing problem report:', action.data);
        break;
      
      default:
        console.log('Unknown action type:', action.type);
    }
  }

  // Check if device is online
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      connectionType: this.connectionType
    };
  }

  // Force sync (manual trigger)
  async forcSync() {
    if (this.isConnected) {
      await this.syncOfflineData();
    } else {
      console.log('⚠️ Cannot sync: device is offline');
    }
  }
}

// React hook for network status
export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
    });

    // Get initial state
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
    });

    return unsubscribe;
  }, []);

  return { isConnected, connectionType };
};

// React hook for offline-first data management
export const useOfflineData = (dataKey, fetchFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineData, setIsOfflineData] = useState(false);
  const { isConnected } = useNetworkStatus();

  const loadData = useCallback(async () => {
    setLoading(true);
    
    try {
      // Always try to load from cache first
      const cachedData = await offlineStorage.getItem(dataKey);
      
      if (cachedData) {
        setData(cachedData);
        setIsOfflineData(true);
        setLoading(false);
      }
      
      // If online, try to fetch fresh data
      if (isConnected && fetchFunction) {
        try {
          const freshData = await fetchFunction();
          if (freshData) {
            setData(freshData);
            setIsOfflineData(false);
            // Cache the fresh data
            await offlineStorage.setItem(dataKey, freshData);
          }
        } catch (error) {
          console.log(`⚠️ Failed to fetch fresh data for ${dataKey}, using cached version`);
          // Keep using cached data if fetch fails
        }
      }
      
    } catch (error) {
      console.error(`❌ Error loading data for ${dataKey}:`, error);
    } finally {
      setLoading(false);
    }
  }, [dataKey, fetchFunction, isConnected]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateData = useCallback(async (newData) => {
    setData(newData);
    await offlineStorage.setItem(dataKey, newData);
    
    // If offline, queue the update for later sync
    if (!isConnected) {
      await offlineStorage.addToOfflineQueue({
        type: 'UPDATE_DATA',
        dataKey,
        data: newData
      });
    }
  }, [dataKey, isConnected]);

  return {
    data,
    loading,
    isOfflineData,
    updateData,
    refreshData: loadData
  };
};

export default new NetworkManager();