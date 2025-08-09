<<<<<<< HEAD
import { useState, useEffect, useCallback } from 'react';
import { useNetworkStatus } from '../utils/networkManager';
import { mockVehiclesForSale } from '../config/vehicleMarketplace';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineData, setIsOfflineData] = useState(false);
  const { isConnected } = useNetworkStatus();

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    try {
      // Always load from mock data (no persistent storage)
      console.log('📱 Loading vehicles from mock data only');
      setVehicles(mockVehiclesForSale);
      
      if (isConnected) {
        // If online, simulate API call to get latest data
        console.log('🌐 Fetching latest vehicles from server...');
        await new Promise(resolve => setTimeout(resolve, 800));
        // In a real app, this would fetch from API and merge with local data
        console.log('✅ Vehicles loaded from server');
      }
    } catch (error) {
      console.error('❌ Error loading vehicles:', error);
      // Fallback to mock data
      setVehicles(mockVehiclesForSale);
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  // Initialize data loading
  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const addVehicle = useCallback(async (vehicleData) => {
=======
import { useState, useCallback } from 'react';
import { mockVehiclesForSale } from '../config/vehicleMarketplace';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState(mockVehiclesForSale);

  const addVehicle = useCallback((vehicleData) => {
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    const newVehicle = {
      id: `user_${Date.now()}`,
      title: vehicleData.title,
      brand: vehicleData.brand,
      model: vehicleData.model,
      year: parseInt(vehicleData.year),
      mileage: parseInt(vehicleData.mileage),
      price: parseInt(vehicleData.price),
      priceUSD: parseInt(vehicleData.priceUSD),
      category: vehicleData.category,
      condition: vehicleData.condition,
      fuelType: vehicleData.fuelType || 'essence',
      transmission: vehicleData.transmission || 'manuelle',
      description: vehicleData.description || '',
      location: vehicleData.location,
      images: vehicleData.images.length > 0 ? vehicleData.images.map(img => ({ uri: img.uri })) : [{ uri: 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=Voiture' }],
      posted: new Date().toISOString(),
      views: 0,
      seller: {
        name: 'Vous',
        rating: 5.0,
        verified: true,
        phone: vehicleData.phone,
      },
<<<<<<< HEAD
      isOffline: !isConnected, // Mark as offline if created while offline
    };

    // Update local state immediately (in-memory only)
    const updatedVehicles = [newVehicle, ...vehicles];
    setVehicles(updatedVehicles);
    
    // No persistent storage - data will be lost on app restart
    console.log('📱 Vehicle added to memory only (no persistent storage)');
    
    if (isConnected) {
      // If online, simulate API call
      try {
        console.log('🌐 Syncing new vehicle to server...');
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('✅ Vehicle synced to server');
      } catch (error) {
        console.error('❌ Failed to sync vehicle to server:', error);
      }
    }
    
    return newVehicle;
  }, [vehicles, isConnected]);

  const removeVehicle = useCallback(async (vehicleId) => {
    const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== vehicleId);
    setVehicles(updatedVehicles);
    
    // No persistent storage - changes are in-memory only
    console.log('📱 Vehicle removed from memory only (no persistent storage)');
    
    if (isConnected) {
      // If online, simulate API call
      try {
        console.log('🌐 Removing vehicle from server...');
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('✅ Vehicle removed from server');
      } catch (error) {
        console.error('❌ Failed to remove vehicle from server:', error);
      }
    }
  }, [vehicles, isConnected]);

  const updateVehicle = useCallback(async (vehicleId, updates) => {
    const updatedVehicles = vehicles.map(vehicle => 
      vehicle.id === vehicleId ? { 
        ...vehicle, 
        ...updates,
        lastModified: new Date().toISOString(),
        isOffline: !isConnected
      } : vehicle
    );
    
    setVehicles(updatedVehicles);
    
    // No persistent storage - changes are in-memory only
    console.log('📱 Vehicle updated in memory only (no persistent storage)');
    
    if (isConnected) {
      // If online, simulate API call
      try {
        console.log('🌐 Updating vehicle on server...');
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('✅ Vehicle updated on server');
      } catch (error) {
        console.error('❌ Failed to update vehicle on server:', error);
      }
    }
  }, [vehicles, isConnected]);

  return {
    vehicles,
    loading,
    isOfflineData,
    addVehicle,
    removeVehicle,
    updateVehicle,
    refreshVehicles: loadVehicles,
  };
};
=======
    };

    setVehicles(prev => [newVehicle, ...prev]);
    return newVehicle;
  }, []);

  const removeVehicle = useCallback((vehicleId) => {
    setVehicles(prev => prev.filter(vehicle => vehicle.id !== vehicleId));
  }, []);

  const updateVehicle = useCallback((vehicleId, updates) => {
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === vehicleId ? { ...vehicle, ...updates } : vehicle
    ));
  }, []);

  return {
    vehicles,
    addVehicle,
    removeVehicle,
    updateVehicle,
  };
}; 
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
