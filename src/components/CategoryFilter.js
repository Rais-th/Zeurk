import React, { memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../config/designTokens';

const CategoryChip = memo(({ category, isSelected, onPress }) => (
  <TouchableOpacity
    style={[
      styles.chip,
      isSelected && styles.selectedChip
    ]}
    onPress={() => onPress(category.id)}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={`Filtrer par ${category.name}`}
    accessibilityState={{ selected: isSelected }}
  >
    <Ionicons
      name={category.icon}
      size={16}
      color={isSelected ? colors.text.primary : colors.text.secondary}
      style={styles.chipIcon}
    />
    <Text style={[
      styles.chipText,
      isSelected && styles.selectedChipText
    ]}>
      {category.name}
    </Text>
  </TouchableOpacity>
));

CategoryChip.displayName = 'CategoryChip';

const CategoryFilter = memo(({ 
  categories, 
  selectedCategory, 
  onCategorySelect,
  style 
}) => {
  const allCategories = [
    { id: 'all', name: 'Tout', icon: 'grid-outline' },
    ...categories
  ];

  const renderCategory = ({ item }) => (
    <CategoryChip
      category={item}
      isSelected={selectedCategory === item.id}
      onPress={onCategorySelect}
    />
  );

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={allCategories}
        renderItem={renderCategory}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
});

CategoryFilter.displayName = 'CategoryFilter';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  listContainer: {
    paddingHorizontal: 0,
  },
  separator: {
    width: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 40,
  },
  selectedChip: {
    backgroundColor: colors.brand.primary,
  },
  chipIcon: {
    marginRight: spacing.xs,
  },
  chipText: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.3,
  },
  selectedChipText: {
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
});

export default CategoryFilter;