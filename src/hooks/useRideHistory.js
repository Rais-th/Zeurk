import { useState, useCallback, useEffect, useContext } from 'react';
import offlineStorage from '../utils/offlineStorage';
import { useNetworkStatus } from '../utils/networkManager';
import { AuthContext } from '../contexts/AuthContext';
import { firestore } from '../config/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

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

// Firebase helper functions
const getRidesCollection = (userId) => {
  return query(
    collection(firestore, 'rides'),
    where('passengerId', '==', userId)
  );
};

const createRideDocument = async (rideData) => {
  try {
    const docRef = await addDoc(collection(firestore, 'rides'), {
      ...rideData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating ride document:', error);
    throw error;
  }
};

const updateRideDocument = async (rideId, updateData) => {
  try {
    const rideRef = doc(firestore, 'rides', rideId);
    await updateDoc(rideRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating ride document:', error);
    throw error;
  }
};

export const useRideHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineData, setIsOfflineData] = useState(false);
  const { isConnected } = useNetworkStatus();
  const { user } = useContext(AuthContext);

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

      // If online and user is authenticated, try to fetch fresh data from Firebase
      if (isConnected && user) {
        try {
          console.log('🌐 Fetching ride history from Firebase...');
          
          const ridesQuery = query(
            getRidesCollection(user.uid),
            orderBy('createdAt', 'desc')
          );
          const ridesSnapshot = await getDocs(ridesQuery);
          
          const firebaseRides = ridesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              date: data.createdAt ? data.createdAt.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              time: data.createdAt ? data.createdAt.toDate().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              from: data.pickup?.address || data.from || 'Unknown',
              to: data.destination?.address || data.to || 'Unknown',
              driver: data.driverName || data.driver || 'Unknown Driver',
              driverPhone: data.driverPhone || '+243000000000',
              vehicle: data.vehicleInfo || data.vehicle || 'Unknown Vehicle',
              price: data.price || '0 FC',
              priceUSD: data.priceUSD || '$0',
              status: data.status || 'completed',
              rating: data.rating || 0,
              duration: data.duration || '0 min',
              distance: data.distance || '0 km',
              timestamp: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
              ...data
            };
          });
          
          // Merge Firebase rides with mock data for demo purposes
          const allRides = [...firebaseRides, ...mockRideHistory];
          
          setRides(allRides);
          setIsOfflineData(false);
          await offlineStorage.saveRideHistory(allRides);
          console.log('✅ Updated ride history from Firebase');
        } catch (error) {
          console.log('⚠️ Failed to fetch fresh ride history from Firebase:', error);
          // Keep using cached data
        }
      } else if (!user) {
        console.log('👤 No authenticated user, using mock data only');
      }
    } catch (error) {
      console.error('❌ Error loading ride history:', error);
      // Fallback to mock data if everything fails
      setRides(mockRideHistory);
    } finally {
      setLoading(false);
    }
  }, [isConnected, user]);

  // Initialize data loading
  useEffect(() => {
    loadRideHistory();
  }, [loadRideHistory]);

  // Add a new ride to history
  const addRide = useCallback(async (rideData) => {
    if (!user) {
      console.log('👤 No authenticated user, cannot add ride');
      return null;
    }

    const newRide = {
      passengerId: user.uid,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      ...rideData,
      status: rideData.status || 'completed',
      timestamp: new Date().toISOString(),
      isOffline: !isConnected
    };

    // Create a local version with generated ID for immediate display
    const localRide = {
      id: `local_${Date.now()}`,
      ...newRide
    };

    // Update local state immediately
    const updatedRides = [localRide, ...rides];
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
      // If online, save to Firebase
      try {
        console.log('🌐 Syncing new ride to Firebase...');
        const firebaseRideId = await createRideDocument(newRide);
        
        // Update the local ride with the Firebase ID
        const updatedRidesWithFirebaseId = updatedRides.map(ride => 
          ride.id === localRide.id ? { ...ride, id: firebaseRideId } : ride
        );
        
        setRides(updatedRidesWithFirebaseId);
        await offlineStorage.saveRideHistory(updatedRidesWithFirebaseId);
        
        console.log('✅ Ride synced to Firebase with ID:', firebaseRideId);
        return { ...localRide, id: firebaseRideId };
      } catch (error) {
        console.error('❌ Failed to sync ride to Firebase:', error);
        // Queue for retry
        await offlineStorage.addToOfflineQueue({
          type: 'CREATE_RIDE',
          data: newRide
        });
      }
    }
    
    return localRide;
  }, [rides, isConnected, user]);

  // Update ride rating
  const updateRideRating = useCallback(async (rideId, rating) => {
    if (!user) {
      console.log('👤 No authenticated user, cannot update ride rating');
      return;
    }

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
      // If online, update in Firebase
      try {
        console.log('🌐 Updating ride rating in Firebase...');
        await updateRideDocument(rideId, { rating });
        console.log('✅ Ride rating updated in Firebase');
      } catch (error) {
        console.error('❌ Failed to update ride rating in Firebase:', error);
        // Queue for retry
        await offlineStorage.addToOfflineQueue({
          type: 'UPDATE_RIDE_RATING',
          data: { rideId, rating }
        });
      }
    }
  }, [rides, isConnected, user]);

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