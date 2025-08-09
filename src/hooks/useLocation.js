import { useState, useEffect, useCallback } from 'react';
import locationService from '../utils/locationService';
import { useNetworkStatus } from './useNetworkStatus';

/**
 * Enhanced Location Hook for Zeurk
 * Provides easy access to location services with fallback strategies
 */
export const useLocation = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationSource, setLocationSource] = useState(null);
  const { isOnline } = useNetworkStatus();

  /**
   * Get current location with fallback strategy
   */
  const getCurrentLocation = useCallback(async (options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const location = await locationService.getCurrentLocation({
        ...options,
        fallbackToGeolocation: isOnline // Only use Geolocation API when online
      });
      
      setCurrentLocation(location);
      setLocationSource(location.source);
      return location;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isOnline]);

  /**
   * Get optimized route between two points
   */
  const getRoute = useCallback(async (origin, destination, waypoints = [], options = {}) => {
    if (!isOnline) {
      throw new Error('Route calculation requires internet connection');
    }

    try {
      return await locationService.getOptimizedRoute(origin, destination, waypoints, options);
    } catch (error) {
      console.error('Route calculation failed:', error);
      throw error;
    }
  }, [isOnline]);

  /**
   * Find nearest drivers to a rider
   */
  const findNearestDrivers = useCallback(async (riderLocation, driverLocations, maxDrivers = 10) => {
    if (!isOnline) {
      // Fallback to straight-line distance when offline
      return locationService.calculateStraightLineDistances(riderLocation, driverLocations, maxDrivers);
    }

    try {
      return await locationService.findNearestDrivers(riderLocation, driverLocations, maxDrivers);
    } catch (error) {
      console.error('Driver search failed:', error);
      // Fallback to straight-line distance
      return locationService.calculateStraightLineDistances(riderLocation, driverLocations, maxDrivers);
    }
  }, [isOnline]);

  /**
   * Calculate straight-line distance between two points
   */
  const calculateDistance = useCallback((point1, point2) => {
    return locationService.calculateHaversineDistance(
      point1.latitude,
      point1.longitude,
      point2.latitude,
      point2.longitude
    );
  }, []);

  return {
    currentLocation,
    isLoading,
    error,
    locationSource,
    getCurrentLocation,
    getRoute,
    findNearestDrivers,
    calculateDistance,
    isOnline
  };
};

/**
 * Hook for driver matching functionality
 */
export const useDriverMatching = () => {
  const [nearestDrivers, setNearestDrivers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const { isOnline } = useNetworkStatus();

  /**
   * Search for drivers near a specific location
   */
  const searchDrivers = useCallback(async (riderLocation, availableDrivers, options = {}) => {
    const { maxDrivers = 10, maxDistance = 5000 } = options; // 5km default max distance
    
    setIsSearching(true);
    setSearchError(null);

    try {
      // Filter drivers by maximum distance first (straight-line)
      const driversInRange = availableDrivers.filter(driver => {
        const distance = locationService.calculateHaversineDistance(
          riderLocation.latitude,
          riderLocation.longitude,
          driver.latitude,
          driver.longitude
        );
        return distance * 1000 <= maxDistance; // Convert km to meters
      });

      if (driversInRange.length === 0) {
        setNearestDrivers([]);
        return [];
      }

      // Get accurate travel times using Distance Matrix API or fallback
      const driversWithTravelTime = isOnline 
        ? await locationService.findNearestDrivers(riderLocation, driversInRange, maxDrivers)
        : locationService.calculateStraightLineDistances(riderLocation, driversInRange, maxDrivers);

      setNearestDrivers(driversWithTravelTime);
      return driversWithTravelTime;
    } catch (error) {
      setSearchError(error.message);
      console.error('Driver search failed:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [isOnline]);

  /**
   * Clear search results
   */
  const clearSearch = useCallback(() => {
    setNearestDrivers([]);
    setSearchError(null);
  }, []);

  return {
    nearestDrivers,
    isSearching,
    searchError,
    searchDrivers,
    clearSearch
  };
};

/**
 * Hook for route optimization
 */
export const useRouteOptimization = () => {
  const [route, setRoute] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const { isOnline } = useNetworkStatus();

  /**
   * Calculate optimized route
   */
  const calculateRoute = useCallback(async (origin, destination, waypoints = [], options = {}) => {
    if (!isOnline) {
      setRouteError('Route calculation requires internet connection');
      return null;
    }

    setIsCalculating(true);
    setRouteError(null);

    try {
      const routeData = await locationService.getOptimizedRoute(origin, destination, waypoints, options);
      setRoute(routeData);
      return routeData;
    } catch (error) {
      setRouteError(error.message);
      console.error('Route calculation failed:', error);
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [isOnline]);

  /**
   * Clear route data
   */
  const clearRoute = useCallback(() => {
    setRoute(null);
    setRouteError(null);
  }, []);

  return {
    route,
    isCalculating,
    routeError,
    calculateRoute,
    clearRoute,
    isOnline
  };
};