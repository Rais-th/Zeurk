import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_STORAGE_KEY = '@vehicle_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from storage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        const favoritesArray = JSON.parse(storedFavorites);
        setFavorites(new Set(favoritesArray));
      }
    } catch (error) {
      console.warn('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFavorites = async (newFavorites) => {
    try {
      const favoritesArray = Array.from(newFavorites);
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoritesArray));
    } catch (error) {
      console.warn('Error saving favorites:', error);
    }
  };

  const toggleFavorite = useCallback((vehicleId) => {
    setFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      
      if (newFavorites.has(vehicleId)) {
        newFavorites.delete(vehicleId);
      } else {
        newFavorites.add(vehicleId);
      }
      
      // Save to storage
      saveFavorites(newFavorites);
      
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((vehicleId) => {
    return favorites.has(vehicleId);
  }, [favorites]);

  const clearAllFavorites = useCallback(async () => {
    setFavorites(new Set());
    try {
      await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
    } catch (error) {
      console.warn('Error clearing favorites:', error);
    }
  }, []);

  const getFavoritesCount = useCallback(() => {
    return favorites.size;
  }, [favorites]);

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite,
    clearAllFavorites,
    getFavoritesCount,
  };
}; 