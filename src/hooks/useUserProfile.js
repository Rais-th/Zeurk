import { useState, useCallback, useEffect } from 'react';
import offlineStorage from '../utils/offlineStorage';
import { useNetworkStatus } from '../utils/networkManager';

// Mock user profile data
const mockUserProfile = {
  id: 'user_123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+243123456789',
  avatar: 'https://via.placeholder.com/150/1a1a1a/ffffff?text=JD',
  location: 'Kinshasa, RDC',
  rating: 4.8,
  totalRides: 45,
  memberSince: '2023-06-15',
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
  paymentMethods: [
    {
      id: 'pm_1',
      type: 'mobile_money',
      provider: 'M-Pesa',
      number: '+243123456789',
      isDefault: true
    }
  ]
};

export const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineData, setIsOfflineData] = useState(false);
  const { isConnected } = useNetworkStatus();

  // Load user profile from cache and/or server
  const loadProfile = useCallback(async () => {
    setLoading(true);
    
    try {
      // Always load from cache first for instant display
      const cachedProfile = await offlineStorage.getUserProfile();
      if (cachedProfile) {
        setProfile(cachedProfile);
        setIsOfflineData(true);
        setLoading(false);
        console.log('📱 Loaded user profile from offline cache');
      } else {
        // If no cache, use mock data as fallback
        setProfile(mockUserProfile);
        await offlineStorage.saveUserProfile(mockUserProfile);
        setIsOfflineData(true);
        setLoading(false);
        console.log('📱 Initialized user profile with mock data');
      }

      // If online, try to fetch fresh data
      if (isConnected) {
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 600));
          
          // In a real app, this would be an actual API call
          // For now, we'll use the cached profile or mock data
          const freshProfile = cachedProfile || mockUserProfile;
          
          setProfile(freshProfile);
          setIsOfflineData(false);
          await offlineStorage.saveUserProfile(freshProfile);
          console.log('🌐 Updated user profile from server');
        } catch (error) {
          console.log('⚠️ Failed to fetch fresh profile data, using cached version');
        }
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      // Fallback to mock data if everything fails
      setProfile(mockUserProfile);
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  // Initialize data loading
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Update user profile
  const updateProfile = useCallback(async (updates) => {
    const updatedProfile = {
      ...profile,
      ...updates,
      lastModified: new Date().toISOString(),
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
        data: updates
      });
      console.log('📱 Profile update queued for sync');
    } else {
      // If online, simulate API call
      try {
        console.log('🌐 Updating profile on server...');
        await new Promise(resolve => setTimeout(resolve, 400));
        console.log('✅ Profile updated on server');
      } catch (error) {
        console.error('❌ Failed to update profile on server:', error);
        // Queue for retry
        await offlineStorage.addToOfflineQueue({
          type: 'UPDATE_PROFILE',
          data: updates
        });
      }
    }
    
    return updatedProfile;
  }, [profile, isConnected]);

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences) => {
    const updatedProfile = {
      ...profile,
      preferences: {
        ...profile.preferences,
        ...newPreferences
      },
      lastModified: new Date().toISOString(),
      isOffline: !isConnected
    };
    
    setProfile(updatedProfile);
    await offlineStorage.saveUserProfile(updatedProfile);
    
    if (!isConnected) {
      await offlineStorage.addToOfflineQueue({
        type: 'UPDATE_PREFERENCES',
        data: newPreferences
      });
      console.log('📱 Preferences update queued for sync');
    } else {
      try {
        console.log('🌐 Updating preferences on server...');
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('✅ Preferences updated on server');
      } catch (error) {
        console.error('❌ Failed to update preferences on server:', error);
      }
    }
  }, [profile, isConnected]);

  // Add payment method
  const addPaymentMethod = useCallback(async (paymentMethod) => {
    const newPaymentMethod = {
      id: `pm_${Date.now()}`,
      ...paymentMethod,
      addedAt: new Date().toISOString()
    };
    
    const updatedProfile = {
      ...profile,
      paymentMethods: [...profile.paymentMethods, newPaymentMethod],
      lastModified: new Date().toISOString(),
      isOffline: !isConnected
    };
    
    setProfile(updatedProfile);
    await offlineStorage.saveUserProfile(updatedProfile);
    
    if (!isConnected) {
      await offlineStorage.addToOfflineQueue({
        type: 'ADD_PAYMENT_METHOD',
        data: newPaymentMethod
      });
      console.log('📱 Payment method addition queued for sync');
    } else {
      try {
        console.log('🌐 Adding payment method on server...');
        await new Promise(resolve => setTimeout(resolve, 400));
        console.log('✅ Payment method added on server');
      } catch (error) {
        console.error('❌ Failed to add payment method on server:', error);
      }
    }
    
    return newPaymentMethod;
  }, [profile, isConnected]);

  // Remove payment method
  const removePaymentMethod = useCallback(async (paymentMethodId) => {
    const updatedProfile = {
      ...profile,
      paymentMethods: profile.paymentMethods.filter(pm => pm.id !== paymentMethodId),
      lastModified: new Date().toISOString(),
      isOffline: !isConnected
    };
    
    setProfile(updatedProfile);
    await offlineStorage.saveUserProfile(updatedProfile);
    
    if (!isConnected) {
      await offlineStorage.addToOfflineQueue({
        type: 'REMOVE_PAYMENT_METHOD',
        data: { paymentMethodId }
      });
      console.log('📱 Payment method removal queued for sync');
    } else {
      try {
        console.log('🌐 Removing payment method from server...');
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('✅ Payment method removed from server');
      } catch (error) {
        console.error('❌ Failed to remove payment method from server:', error);
      }
    }
  }, [profile, isConnected]);

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