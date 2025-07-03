import React, { memo, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../config/designTokens';

const SearchBar = memo(({ 
  value, 
  onChangeText, 
  onFilterPress,
  placeholder = "Rechercher une voiture...",
  style 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    Animated.spring(scaleValue, {
      toValue: 1.02,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [scaleValue]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [scaleValue]);

  const clearSearch = useCallback(() => {
    onChangeText('');
  }, [onChangeText]);

  return (
    <View style={[styles.container, style]}>
      <Animated.View 
        style={[
          styles.searchContainer,
          isFocused && styles.focusedContainer,
          { transform: [{ scale: scaleValue }] }
        ]}
      >
        <Ionicons 
          name="search-outline" 
          size={20} 
          color={isFocused ? colors.brand.primary : colors.text.secondary} 
          style={styles.searchIcon}
        />
        
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.text.secondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Champ de recherche"
          accessibilityHint="Tapez pour rechercher des véhicules"
        />
        
        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearSearch}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Effacer la recherche"
          >
            <Ionicons 
              name="close-circle" 
              size={18} 
              color={colors.text.secondary} 
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      
      <TouchableOpacity 
        style={styles.filterButton} 
        onPress={onFilterPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Ouvrir les filtres"
      >
        <Ionicons 
          name="options-outline" 
          size={20} 
          color={colors.text.primary} 
        />
      </TouchableOpacity>
    </View>
  );
});

SearchBar.displayName = 'SearchBar';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.base,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  focusedContainer: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.background.secondary,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.normal,
    padding: 0, // Remove default padding
  },
  clearButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  filterButton: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.base,
    padding: spacing.base,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
    minHeight: 48,
  },
});

export default SearchBar; 