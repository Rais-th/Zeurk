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
<<<<<<< HEAD
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  focusedContainer: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
=======
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
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
<<<<<<< HEAD
    fontSize: typography.size.body,
    fontWeight: typography.weight.medium,
    letterSpacing: 0.5,
    padding: 0,
=======
    fontSize: typography.size.lg,
    fontWeight: typography.weight.normal,
    padding: 0, // Remove default padding
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  },
  clearButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  filterButton: {
<<<<<<< HEAD
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
=======
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.base,
    padding: spacing.base,
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
    minHeight: 48,
  },
});

<<<<<<< HEAD
export default SearchBar;
=======
export default SearchBar; 
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
