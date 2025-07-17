import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '../utils/networkManager';
import networkManager from '../utils/networkManager';
import offlineStorage from '../utils/offlineStorage';

const { width } = Dimensions.get('window');

const OfflineIndicator = () => {
  const { isConnected, connectionType } = useNetworkStatus();
  const [slideAnim] = useState(new Animated.Value(-100));
  const [queueCount, setQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Check offline queue count
  useEffect(() => {
    const checkQueue = async () => {
      const queue = await offlineStorage.getOfflineQueue();
      setQueueCount(queue.length);
    };
    
    checkQueue();
    const interval = setInterval(checkQueue, 2000); // Check every 2 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Animate indicator visibility
  useEffect(() => {
    if (!isConnected || queueCount > 0) {
      // Show indicator
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      // Hide indicator
      Animated.spring(slideAnim, {
        toValue: -100,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [isConnected, queueCount, slideAnim]);

  // Handle manual sync
  const handleSync = async () => {
    if (!isConnected) return;
    
    setIsSyncing(true);
    try {
      await networkManager.forcSync();
      // Refresh queue count after sync
      const queue = await offlineStorage.getOfflineQueue();
      setQueueCount(queue.length);
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getIndicatorStyle = () => {
    if (!isConnected) {
      return styles.offlineIndicator;
    } else if (queueCount > 0) {
      return styles.syncIndicator;
    }
    return styles.onlineIndicator;
  };

  const getIndicatorText = () => {
    if (!isConnected) {
      return 'Mode hors ligne';
    } else if (isSyncing) {
      return 'Synchronisation...';
    } else if (queueCount > 0) {
      return `${queueCount} action${queueCount > 1 ? 's' : ''} en attente`;
    }
    return 'En ligne';
  };

  const getIndicatorIcon = () => {
    if (!isConnected) {
      return 'cloud-offline-outline';
    } else if (isSyncing) {
      return 'sync-outline';
    } else if (queueCount > 0) {
      return 'cloud-upload-outline';
    }
    return 'cloud-done-outline';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getIndicatorStyle(),
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons 
          name={getIndicatorIcon()} 
          size={16} 
          color="#fff" 
          style={[
            styles.icon,
            isSyncing && styles.spinningIcon
          ]} 
        />
        <Text style={styles.text}>{getIndicatorText()}</Text>
        
        {isConnected && queueCount > 0 && !isSyncing && (
          <TouchableOpacity 
            style={styles.syncButton} 
            onPress={handleSync}
            activeOpacity={0.7}
          >
            <Ionicons name="sync" size={14} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Connection type indicator */}
      {isConnected && (
        <View style={styles.connectionType}>
          <Text style={styles.connectionTypeText}>
            {connectionType?.toUpperCase()}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 50, // Account for status bar
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minHeight: 36,
  },
  offlineIndicator: {
    backgroundColor: '#FF3B30',
  },
  syncIndicator: {
    backgroundColor: '#FF9500',
  },
  onlineIndicator: {
    backgroundColor: '#34C759',
  },
  icon: {
    marginRight: 6,
  },
  spinningIcon: {
    // Add rotation animation if needed
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  syncButton: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  connectionType: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  connectionTypeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
});

export default OfflineIndicator;