import React, { memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, layout, shadows } from '../config/designTokens';

const VehicleCard = memo(({ 
  vehicle, 
  onPress, 
  onToggleFavorite, 
  isFavorite = false,
  testID 
}) => {
  const handlePress = () => {
    onPress?.(vehicle);
  };

  const handleFavoritePress = () => {
    onToggleFavorite?.(vehicle.id);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={handlePress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${vehicle.title}, ${vehicle.price}$ TTC`}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image 
          source={vehicle.images[0]} 
          style={styles.image} 
          resizeMode="contain"
        />
        
        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? colors.brand.accent : colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Marque et modèle */}
        <Text style={styles.title} numberOfLines={2}>
          {vehicle.brand} {vehicle.model} {vehicle.year}
        </Text>
        
        {/* Prix total */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceTotal}>
            {vehicle.price.toLocaleString()}$
          </Text>
          <Text style={styles.installmentText}>
            Payable en 2 tranches
          </Text>
        </View>

        {/* Kilométrage */}
        <View style={styles.mileageContainer}>
          <Ionicons name="speedometer-outline" size={16} color={colors.text.secondary} style={styles.mileageIcon} />
          <Text style={styles.mileageText}>
            {vehicle.mileage.toLocaleString()} km
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

VehicleCard.displayName = 'VehicleCard';

const styles = StyleSheet.create({
  container: {
    width: layout.card.width,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    position: 'relative',
    height: layout.card.imageHeight,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.ui.overlay,
    borderRadius: borderRadius.full,
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  title: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: typography.weight.bold,
    letterSpacing: 0.5,
    lineHeight: 24,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
    textShadowColor: 'rgba(0, 122, 255, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    includeFontPadding: false,
  },
  priceContainer: {
    marginBottom: spacing.md,
  },
  priceTotal: {
    color: colors.brand.primary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    lineHeight: typography.lineHeight.tight * typography.size.xl,
    marginBottom: spacing.xs,
  },
  installmentText: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  installmentContainer: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  installmentDetail: {
    color: colors.text.primary,
    fontSize: typography.size.sm,
    marginBottom: spacing.xs / 2,
  },
  mileageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.ui.border,
    paddingTop: spacing.sm,
  },
  mileageIcon: {
    marginRight: spacing.xs,
  },
  mileageText: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
  },
});

export default VehicleCard;