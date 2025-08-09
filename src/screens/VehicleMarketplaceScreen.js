import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Modal,
  ScrollView,
  TextInput,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// Design tokens and utilities
import { colors, typography, spacing, borderRadius, layout, shadows } from '../config/designTokens';
import {
  vehicleCategories,
  vehicleConditions,
} from '../config/vehicleMarketplace';

// Custom hooks
import { useVehicleFilters } from '../hooks/useVehicleFilters';
import { useFavorites } from '../hooks/useFavorites';
import { useVehiclesContext } from '../context/VehiclesContext';

// Components
import VehicleCard from '../components/VehicleCard';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';

// Header Component
const MarketplaceHeader = React.memo(({ navigation }) => (
  <View style={styles.header}>
    <TouchableOpacity
      style={styles.headerButton}
      onPress={() => navigation.goBack()}
      accessibilityRole="button"
      accessibilityLabel="Retour"
    >
      <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
    </TouchableOpacity>
    
    <Text style={styles.headerTitle}>Marketplace</Text>
    
    <View style={styles.headerButton} />
  </View>
));

// Results Header Component
const ResultsHeader = React.memo(({ count, sortDisplayName, onSortPress }) => (
  <View style={styles.resultsHeader}>
    <Text style={styles.resultsCount}>
      {count} résultat{count !== 1 ? 's' : ''}
    </Text>
    <TouchableOpacity
      style={styles.sortButton}
      onPress={onSortPress}
      accessibilityRole="button"
      accessibilityLabel={`Trier par ${sortDisplayName}`}
    >
      <Ionicons name="swap-vertical-outline" size={16} color={colors.text.secondary} />
      <Text style={styles.sortText}>{sortDisplayName}</Text>
    </TouchableOpacity>
  </View>
));

// Filter Modal Component
const FilterModal = React.memo(({
  visible,
  onClose,
  minPrice,
  maxPrice,
  selectedCondition,
  onMinPriceChange,
  onMaxPriceChange,
  onConditionChange,
  onResetFilters,
}) => {
  const [modalY] = useState(new Animated.Value(layout.screen.height));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(modalY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(modalY, {
        toValue: layout.screen.height,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible, modalY]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ translateY: modalY }] }
          ]}
        >
          <LinearGradient
            colors={[colors.background.secondary, colors.background.tertiary]}
            style={styles.modalGradient}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtres</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Price Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Budget (USD)</Text>
                <View style={styles.priceInputs}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Min"
                    placeholderTextColor={colors.text.secondary}
                    value={minPrice}
                    onChangeText={onMinPriceChange}
                    keyboardType="numeric"
                  />
                  <Text style={styles.priceSeparator}>-</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Max"
                    placeholderTextColor={colors.text.secondary}
                    value={maxPrice}
                    onChangeText={onMaxPriceChange}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Condition Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>État du véhicule</Text>
                <View style={styles.conditionOptions}>
                  <TouchableOpacity
                    style={[
                      styles.conditionOption,
                      selectedCondition === 'all' && styles.selectedConditionOption
                    ]}
                    onPress={() => onConditionChange('all')}
                  >
                    <Text style={[
                      styles.conditionOptionText,
                      selectedCondition === 'all' && styles.selectedConditionOptionText
                    ]}>
                      Tous
                    </Text>
                  </TouchableOpacity>
                  {vehicleConditions.map(condition => (
                    <TouchableOpacity
                      key={condition.id}
                      style={[
                        styles.conditionOption,
                        selectedCondition === condition.id && styles.selectedConditionOption
                      ]}
                      onPress={() => onConditionChange(condition.id)}
                    >
                      <Text style={[
                        styles.conditionOptionText,
                        selectedCondition === condition.id && styles.selectedConditionOptionText
                      ]}>
                        {condition.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Actions */}
              <View style={styles.filterActions}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={onResetFilters}
                >
                  <Text style={styles.resetButtonText}>Réinitialiser</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={onClose}
                >
                  <Text style={styles.applyButtonText}>Appliquer</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
});

// Main Component
export default function VehicleMarketplaceScreen({ navigation }) {
  const [showFilters, setShowFilters] = useState(false);
  
  // Custom hooks
  const { vehicles } = useVehiclesContext();
  const filters = useVehicleFilters(vehicles);
  const { toggleFavorite, isFavorite } = useFavorites();

  // Callbacks
  const handleVehiclePress = useCallback((vehicle) => {
    navigation.navigate('VehicleDetails', { vehicle });
  }, [navigation]);

  const openFilters = useCallback(() => {
    setShowFilters(true);
  }, []);

  const closeFilters = useCallback(() => {
    setShowFilters(false);
  }, []);

  // Memoized render functions
  const renderVehicleCard = useCallback(({ item, index }) => (
    <VehicleCard
      vehicle={item}
      onPress={handleVehiclePress}
      onToggleFavorite={toggleFavorite}
      isFavorite={isFavorite(item.id)}
      testID={`vehicle-card-${index}`}
    />
  ), [handleVehiclePress, toggleFavorite, isFavorite]);

  const keyExtractor = useCallback((item) => item.id, []);

  const getItemLayout = useCallback((data, index) => ({
    length: layout.card.imageHeight + layout.card.padding * 2 + 100, // Approximate height
    offset: (layout.card.imageHeight + layout.card.padding * 2 + 100) * Math.floor(index / 2),
    index,
  }), []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />
      
      {/* Fixed Header */}
      <View style={styles.headerContainer}>
        <MarketplaceHeader 
          navigation={navigation} 
        />
        
        <SearchBar
          value={filters.searchQuery}
          onChangeText={filters.setSearchQuery}
          onFilterPress={openFilters}
        />
        
        <CategoryFilter
          categories={vehicleCategories}
          selectedCategory={filters.selectedCategory}
          onCategorySelect={filters.setSelectedCategory}
        />
      </View>

      {/* Vehicle List */}
      <FlatList
        data={filters.filteredVehicles}
        renderItem={renderVehicleCard}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={6}
        ListHeaderComponent={
          <ResultsHeader
            count={filters.resultsCount}
            sortDisplayName={filters.getSortDisplayName()}
            onSortPress={filters.cycleSortOption}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={64} color={colors.text.secondary} />
            <Text style={styles.emptyTitle}>Aucun véhicule trouvé</Text>
            <Text style={styles.emptySubtitle}>
              Essayez de modifier vos critères de recherche
            </Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={closeFilters}
        minPrice={filters.minPrice}
        maxPrice={filters.maxPrice}
        selectedCondition={filters.selectedCondition}
        onMinPriceChange={filters.setMinPrice}
        onMaxPriceChange={filters.setMaxPrice}
        onConditionChange={filters.setSelectedCondition}
        onResetFilters={filters.resetFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  headerContainer: {
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: spacing.md,
    height: Platform.OS === 'ios' ? layout.header.height + 30 : layout.header.height,
  },
  headerButton: {
    padding: spacing.sm,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginLeft: 0,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  resultsCount: {
    color: colors.text.primary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sortText: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    color: colors.text.primary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.size.base,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.ui.overlay,
  },
  modalOverlay: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    minHeight: '50%',
  },
  modalGradient: {
    flex: 1,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  modalTitle: {
    color: colors.text.primary,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
  },
  modalScroll: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  filterSection: {
    marginVertical: spacing.lg,
  },
  filterSectionTitle: {
    color: colors.text.primary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.base,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  priceInput: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
    color: colors.text.primary,
    fontSize: typography.size.lg,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  priceSeparator: {
    color: colors.text.secondary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
  },
  conditionOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  conditionOption: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  selectedConditionOption: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  conditionOptionText: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
  },
  selectedConditionOptionText: {
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
  filterActions: {
    flexDirection: 'row',
    gap: spacing.base,
    paddingVertical: spacing.lg,
  },
  resetButton: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.base,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  resetButtonText: {
    color: colors.text.secondary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
  },
  applyButton: {
    flex: 1,
    backgroundColor: colors.brand.primary,
    borderRadius: borderRadius.base,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  applyButtonText: {
    color: colors.text.primary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
  },
});