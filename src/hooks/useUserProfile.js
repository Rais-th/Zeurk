import { useState, useCallback, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { getUserDocument, createUserDocument } from '../config/firebase';
import offlineStorage from '../utils/offlineStorage';
import { useNetworkStatus } from '../utils/networkManager';

// Default user profile structure
const getDefaultProfile = (user) => ({
  id: user?.id || user?.uid,
  fullName: user?.displayName || '',
  email: user?.email || '',
  phoneNumber: '',
  avatar_url: user?.photoURL || '',
  location: 'Kinshasa, RDC',
  rating: 5.0,
  totalRides: 0,
  memberSince: new Date().toISOString(),
  preferences: {
    language: 'fr',
    currency: 'FC',
    notifications: {
      rideUpdates: true,
      promotions: false,
      newsletter: true
    },
    privacy: {
      shareLocation: true,
      showProfile: true
    }
  },
  paymentMethods: [],
  emergency_contact: '',
  date_of_birth: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineData, setIsOfflineData] = useState(false);
  const { user } = useContext(AuthContext);
  const { isConnected } = useNetworkStatus();

  // Load user profile from cache and/or Firebase
  const loadProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      // Always load from cache first for instant display
      const cachedProfile = await offlineStorage.getUserProfile();
      if (cachedProfile) {
        setProfile(cachedProfile);
        setIsOfflineData(true);
        setLoading(false);
        console.log('📱 Loaded user profile from offline cache');
      }

      // If online, try to fetch fresh data from Firebase
      if (isConnected) {
        try {
          const firebaseProfile = await getUserDocument(user.uid || user.id);
          
          if (firebaseProfile) {
            setProfile(firebaseProfile);
            setIsOfflineData(false);
            await offlineStorage.saveUserProfile(firebaseProfile);
            console.log('🌐 Updated user profile from Firebase');
          } else {
            // Create default profile if none exists
            const defaultProfile = getDefaultProfile(user);
            await createUserDocument(user.uid || user.id, defaultProfile);
            setProfile(defaultProfile);
            setIsOfflineData(false);
            await offlineStorage.saveUserProfile(defaultProfile);
            console.log('🌐 Created new user profile in Firebase');
          }
        } catch (error) {
          console.log('⚠️ Failed to fetch profile from Firebase, using cached version:', error);
          
          // If no cached profile and Firebase fails, create default
          if (!cachedProfile) {
            const defaultProfile = getDefaultProfile(user);
            setProfile(defaultProfile);
            await offlineStorage.saveUserProfile(defaultProfile);
            console.log('📱 Initialized with default profile');
          }
        }
      } else if (!cachedProfile) {
        // Offline and no cache - create default profile
        const defaultProfile = getDefaultProfile(user);
        setProfile(defaultProfile);
        await offlineStorage.saveUserProfile(defaultProfile);
        setIsOfflineData(true);
        console.log('📱 Initialized with default profile (offline)');
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      // Fallback to default profile if everything fails
      const defaultProfile = getDefaultProfile(user);
      setProfile(defaultProfile);
    } finally {
      setLoading(false);
    }
  }, [user, isConnected]);

  // Initialize data loading
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Update user profile
  const updateProfile = useCallback(async (updates) => {
    if (!user || !profile) return null;

    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString(),
      isOffline: !isConnected
    };
    
    // Update local state immediately
    setProfile(updatedProfile);
    
    // Save to offline storage
    await offlineStorage.saveUserProfile(updatedProfile);
    
    // If offline, queue for later sync
    if (!isConnected) {
      await offlineStorage.addToOfflineQueue({
        type: 'UPDATE_PROFILE',
        data: updates,
        userId: user.uid || user.id
      });
      console.log('📱 Profile update queued for sync');
    } else {
      // If online, update Firebase
      try {
        console.log('🌐 Updating profile in Firebase...');
        await createUserDocument(user.uid || user.id, updatedProfile);
        console.log('✅ Profile updated in Firebase');
      } catch (error) {
        console.error('❌ Failed to update profile in Firebase:', error);
        // Queue for retry
        await offlineStorage.addToOfflineQueue({
          type: 'UPDATE_PROFILE',
          data: updates,
          userId: user.uid || user.id
        });
      }
    }
    
    return updatedProfile;
  }, [user, profile, isConnected]);

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences) => {
    if (!user || !profile) return null;

    const updatedProfile = {
      ...profile,
      preferences: {
        ...profile.preferences,
        ...newPreferences
      },
      updatedAt: new Date().toISOString(),
      isOffline: !isConnected
    };
    
    setProfile(updatedProfile);
    await offlineStorage.saveUserProfile(updatedProfile);
    
    if (!isConnected) {
      await offlineStorage.addToOfflineQueue({
        type: 'UPDATE_PREFERENCES',
        data: newPreferences,
        userId: user.uid || user.id
      });
      console.log('📱 Preferences update queued for sync');
    } else {
      try {
        console.log('🌐 Updating preferences in Firebase...');
        await createUserDocument(user.uid || user.id, updatedProfile);
        console.log('✅ Preferences updated in Firebase');
      } catch (error) {
        console.error('❌ Failed to update preferences in Firebase:', error);
        await offlineStorage.addToOfflineQueue({
          type: 'UPDATE_PREFERENCES',
          data: newPreferences,
          userId: user.uid || user.id
        });
      }
    }
    
    return updatedProfile;
  }, [user, profile, isConnected]);

  // Add payment method
  const addPaymentMethod = useCallback(async (paymentMethod) => {
    if (!user || !profile) return null;

    const newPaymentMethod = {
      id: `pm_${Date.now()}`,
      ...paymentMethod,
      addedAt: new Date().toISOString()
    };
    
    const updatedProfile = {
      ...profile,
      paymentMethods: [...(profile.paymentMethods || []), newPaymentMethod],
      updatedAt: new Date().toISOString(),
      isOffline: !isConnected
    };
    
    setProfile(updatedProfile);
    await offlineStorage.saveUserProfile(updatedProfile);
    
    if (!isConnected) {
      await offlineStorage.addToOfflineQueue({
        type: 'ADD_PAYMENT_METHOD',
        data: newPaymentMethod,
        userId: user.uid || user.id
      });
      console.log('📱 Payment method addition queued for sync');
    } else {
      try {
        console.log('🌐 Adding payment method in Firebase...');
        await createUserDocument(user.uid || user.id, updatedProfile);
        console.log('✅ Payment method added in Firebase');
      } catch (error) {
        console.error('❌ Failed to add payment method in Firebase:', error);
        await offlineStorage.addToOfflineQueue({
          type: 'ADD_PAYMENT_METHOD',
          data: newPaymentMethod,
          userId: user.uid || user.id
        });
      }
    }
    
    return newPaymentMethod;
  }, [user, profile, isConnected]);

  // Remove payment method
  const removePaymentMethod = useCallback(async (paymentMethodId) => {
    if (!user || !profile) return null;

    const updatedProfile = {
      ...profile,
      paymentMethods: (profile.paymentMethods || []).filter(pm => pm.id !== paymentMethodId),
      updatedAt: new Date().toISOString(),
      isOffline: !isConnected
    };
    
    setProfile(updatedProfile);
    await offlineStorage.saveUserProfile(updatedProfile);
    
    if (!isConnected) {
      await offlineStorage.addToOfflineQueue({
        type: 'REMOVE_PAYMENT_METHOD',
        data: { paymentMethodId },
        userId: user.uid || user.id
      });
      console.log('📱 Payment method removal queued for sync');
    } else {
      try {
        console.log('🌐 Removing payment method from Firebase...');
        await createUserDocument(user.uid || user.id, updatedProfile);
        console.log('✅ Payment method removed from Firebase');
      } catch (error) {
        console.error('❌ Failed to remove payment method from Firebase:', error);
        await offlineStorage.addToOfflineQueue({
          type: 'REMOVE_PAYMENT_METHOD',
          data: { paymentMethodId },
          userId: user.uid || user.id
        });
      }
    }
    
    return updatedProfile;
  }, [user, profile, isConnected]);

  return {
    profile,
    loading,
    isOfflineData,
    updateProfile,
    updatePreferences,
    addPaymentMethod,
    removePaymentMethod,
    refreshProfile: loadProfile,
  };
};