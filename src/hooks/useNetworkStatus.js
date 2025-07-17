import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Network Status Hook
 * Monitors internet connectivity for fallback strategies
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');
  const [isInternetReachable, setIsInternetReachable] = useState(true);

  useEffect(() => {
    // Get initial network state
    const getInitialState = async () => {
      try {
        const state = await NetInfo.fetch();
        setIsOnline(state.isConnected && state.isInternetReachable);
        setConnectionType(state.type);
        setIsInternetReachable(state.isInternetReachable);
      } catch (error) {
        console.warn('Failed to get initial network state:', error);
        // Assume online if we can't determine
        setIsOnline(true);
      }
    };

    getInitialState();

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected && state.isInternetReachable);
      setConnectionType(state.type);
      setIsInternetReachable(state.isInternetReachable);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isOnline,
    connectionType,
    isInternetReachable
  };
};