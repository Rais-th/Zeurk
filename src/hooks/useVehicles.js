import { useState, useCallback } from 'react';
import { mockVehiclesForSale } from '../config/vehicleMarketplace';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState(mockVehiclesForSale);

  const addVehicle = useCallback((vehicleData) => {
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