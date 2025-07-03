import { useState, useEffect, useMemo, useCallback } from 'react';

export const useVehicleFilters = (vehicles) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('all');

  // Memoized filter function for better performance
  const filteredVehicles = useMemo(() => {
    let filtered = [...vehicles];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(vehicle =>
        vehicle.title.toLowerCase().includes(query) ||
        vehicle.brand.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query) ||
        vehicle.location.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.category === selectedCategory);
    }

    // Condition filter
    if (selectedCondition !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.condition === selectedCondition);
    }

    // Price filters
    const minPriceNum = minPrice ? parseInt(minPrice, 10) : 0;
    const maxPriceNum = maxPrice ? parseInt(maxPrice, 10) : Infinity;
    
    if (minPrice || maxPrice) {
      filtered = filtered.filter(vehicle => 
        vehicle.priceUSD >= minPriceNum && vehicle.priceUSD <= maxPriceNum
      );
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.priceUSD - b.priceUSD);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.priceUSD - a.priceUSD);
        break;
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.posted) - new Date(a.posted));
        break;
    }

    return filtered;
  }, [vehicles, searchQuery, selectedCategory, selectedCondition, sortBy, minPrice, maxPrice]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCondition('all');
    setSortBy('newest');
    setMinPrice('');
    setMaxPrice('');
  }, []);

  // Get sort display name
  const getSortDisplayName = useCallback(() => {
    switch (sortBy) {
      case 'newest': return 'Plus récent';
      case 'price_low': return 'Prix croissant';
      case 'price_high': return 'Prix décroissant';
      case 'popular': return 'Plus populaire';
      default: return 'Plus récent';
    }
  }, [sortBy]);

  // Cycle through sort options
  const cycleSortOption = useCallback(() => {
    const sortOptions = ['newest', 'price_low', 'price_high', 'popular'];
    const currentIndex = sortOptions.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    setSortBy(sortOptions[nextIndex]);
  }, [sortBy]);

  return {
    // State
    searchQuery,
    selectedCategory,
    selectedCondition,
    sortBy,
    minPrice,
    maxPrice,
    
    // Setters
    setSearchQuery,
    setSelectedCategory,
    setSelectedCondition,
    setSortBy,
    setMinPrice,
    setMaxPrice,
    
    // Computed
    filteredVehicles,
    resultsCount: filteredVehicles.length,
    
    // Actions
    resetFilters,
    getSortDisplayName,
    cycleSortOption,
  };
}; 