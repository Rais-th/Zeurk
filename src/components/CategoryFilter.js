import React, { memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
<<<<<<< HEAD
import * as Haptics from 'expo-haptics';
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
import { colors, typography, spacing, borderRadius } from '../config/designTokens';

const CategoryChip = memo(({ category, isSelected, onPress }) => (
  <TouchableOpacity
    style={[
      styles.chip,
      isSelected && styles.selectedChip
    ]}
<<<<<<< HEAD
    onPress={() => {
      Haptics.selectionAsync();
      onPress(category.id);
    }}
=======
    onPress={() => onPress(category.id)}
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
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
<<<<<<< HEAD
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  listContainer: {
    paddingHorizontal: 0,
=======
    paddingVertical: spacing.sm,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
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
<<<<<<< HEAD
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.3,
=======
    fontWeight: typography.weight.medium,
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  },
  selectedChipText: {
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
});

<<<<<<< HEAD
export default CategoryFilter;
=======
export default CategoryFilter; 
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
