import { useState, useCallback, useEffect } from 'react';
import offlineStorage from '../utils/offlineStorage';
import { useNetworkStatus } from '../utils/networkManager';

// Mock ride history data for demonstration
const mockRideHistory = [
  {
    id: '1',
    date: '2024-01-15',
    time: '14:30',
    from: 'Kinshasa Centre',
    to: 'Gombe',
    driver: 'Jean Mukendi',
    driverPhone: '+243123456789',
    vehicle: 'Toyota Corolla',
    price: '15000 FC',
    priceUSD: '$15',
    status: 'completed',
    rating: 5,
    duration: '25 min',
    distance: '8.5 km'
  },
  {
    id: '2',
    date: '2024-01-14',
    time: '09:15',
    from: 'Lemba',
    to: 'Kinshasa Centre',
    driver: 'Marie Kabila',
    driverPhone: '+243987654321',
    vehicle: 'Honda Civic',
    price: '12000 FC',
    priceUSD: '$12',
    status: 'completed',
    rating: 4,
    duration: '30 min',
    distance: '12.3 km'
  }
];

export const useRideHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineData, setIsOfflineData] = useState(false);
  const { isConnected } = useNetworkStatus();

  // Load ride history from cache and/or server
  const loadRideHistory = useCallback(async () => {
    setLoading(true);
    
    try {
      // Always load from cache first for instant display
      const cachedRides = await offlineStorage.getRideHistory();
      if (cachedRides && cachedRides.length > 0) {
        setRides(cachedRides);
        setIsOfflineData(true);
        setLoading(false);
        console.log('📱 Loaded ride history from offline cache');
      } else {
        // If no cache, use mock data as fallback
        setRides(mockRideHistory);
        await offlineStorage.saveRideHistory(mockRideHistory);
        setIsOfflineData(true);
        setLoading(false);
        console.log('📱 Initialized ride history with mock data');
      }

      // If online, try to fetch fresh data
      if (isConnected) {
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // In a real app, this would be an actual API call
          // For now, we'll merge mock data with any cached user rides
          const userRides = cachedRides.filter(r => r.id.startsWith('user_'));
          const freshRides = [...mockRideHistory, ...userRides];
          
          setRides(freshRides);
          setIsOfflineData(false);
          await offlineStorage.saveRideHistory(freshRides);
          console.log('🌐 Updated ride history from server');
        } catch (error) {
          console.log('⚠️ Failed to fetch fresh ride history, using cached version');
        }
      }
    } catch (error) {
      console.error('❌ Error loading ride history:', error);
      // Fallback to mock data if everything fails
      setRides(mockRideHistory);
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  // Initialize data loading
  useEffect(() => {
    loadRideHistory();
  }, [loadRideHistory]);

  // Add a new ride to history
  const addRide = useCallback(async (rideData) => {
    const newRide = {
      id: `user_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      ...rideData,
      status: 'completed',
      timestamp: new Date().toISOString(),
      isOffline: !isConnected
    };

    // Update local state immediately
    const updatedRides = [newRide, ...rides];
    setRides(updatedRides);
    
    // Save to offline storage
    await offlineStorage.saveRideHistory(updatedRides);
    
    // If offline, queue for later sync
    if (!isConnected) {
      await offlineStorage.addToOfflineQueue({
        type: 'CREATE_RIDE',
        data: newRide
      });
      console.log('📱 Ride added offline, queued for sync');
    } else {
      // If online, simulate API call
      try {
        console.log('🌐 Syncing new ride to server...');
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('✅ Ride synced to server');
      } catch (error) {
        console.error('❌ Failed to sync ride to server:', error);
        // Queue for retry
        await offlineStorage.addToOfflineQueue({
          type: 'CREATE_RIDE',
          data: newRide
        });
      }
    }
    
    return newRide;
  }, [rides, isConnected]);

  // Update ride rating
  const updateRideRating = useCallback(async (rideId, rating) => {
    const updatedRides = rides.map(ride => 
      ride.id === rideId ? { 
        ...ride, 
        rating,
        lastModified: new Date().toISOString(),
        isOffline: !isConnected
      } : ride
    );
    
    setRides(updatedRides);
    
    // Save to offline storage
    await offlineStorage.saveRideHistory(updatedRides);
    
    // If offline, queue for later sync
    if (!isConnected) {
      await offlineStorage.addToOfflineQueue({
        type: 'UPDATE_RIDE_RATING',
        data: { rideId, rating }
      });
      console.log('📱 Ride rating update queued for sync');
    } else {
      // If online, simulate API call
      try {
        console.log('🌐 Updating ride rating on server...');
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('✅ Ride rating updated on server');
      } catch (error) {
        console.error('❌ Failed to update ride rating on server:', error);
      }
    }
  }, [rides, isConnected]);

  // Get rides by status
  const getRidesByStatus = useCallback((status) => {
    return rides.filter(ride => ride.status === status);
  }, [rides]);

  // Get recent rides (last 30 days)
  const getRecentRides = useCallback(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return rides.filter(ride => {
      const rideDate = new Date(ride.date);
      return rideDate >= thirtyDaysAgo;
    });
  }, [rides]);

  return {
    rides,
    loading,
    isOfflineData,
    addRide,
    updateRideRating,
    getRidesByStatus,
    getRecentRides,
    refreshRideHistory: loadRideHistory,
  };
};