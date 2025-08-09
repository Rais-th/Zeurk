import React, { createContext, useContext } from 'react';
import { useVehicles } from '../hooks/useVehicles';

const VehiclesContext = createContext();

export const VehiclesProvider = ({ children }) => {
  const vehiclesData = useVehicles();
  
  return (
    <VehiclesContext.Provider value={vehiclesData}>
      {children}
    </VehiclesContext.Provider>
  );
};

export const useVehiclesContext = () => {
  const context = useContext(VehiclesContext);
  if (!context) {
    throw new Error('useVehiclesContext must be used within a VehiclesProvider');
  }
  return context;
}; 