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
<<<<<<< HEAD
=======
import {
  formatPrice,
  formatPriceUSD,
  getConditionColor,
  getCategoryName,
  getConditionName,
  calculateDaysAgo,
} from '../config/vehicleMarketplace';
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b

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
<<<<<<< HEAD
      accessibilityLabel={`${vehicle.title}, ${vehicle.price}$ TTC`}
=======
      accessibilityLabel={`${vehicle.title}, ${formatPriceUSD(vehicle.priceUSD)}`}
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image 
          source={vehicle.images[0]} 
          style={styles.image} 
<<<<<<< HEAD
          resizeMode="contain"
=======
          resizeMode="cover"
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
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
<<<<<<< HEAD
=======
        
        {/* Condition Badge */}
        <View style={[
          styles.conditionBadge, 
          { backgroundColor: getConditionColor(vehicle.condition) }
        ]}>
          <Text style={styles.conditionText}>
            {getConditionName(vehicle.condition)}
          </Text>
        </View>
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
      </View>

      {/* Content */}
      <View style={styles.content}>
<<<<<<< HEAD
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
=======
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {vehicle.title}
        </Text>
        
        {/* Location */}
        <Text style={styles.location} numberOfLines={1}>
          {vehicle.location}
        </Text>
        
        {/* Details */}
        <View style={styles.details}>
          <Text style={styles.detailText}>{vehicle.year}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.detailText}>{vehicle.mileage.toLocaleString()} km</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.detailText} numberOfLines={1}>
            {getCategoryName(vehicle.category)}
          </Text>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceFC} numberOfLines={1}>
            {formatPrice(vehicle.price)}
          </Text>
          <Text style={styles.priceUSD} numberOfLines={1}>
            {formatPriceUSD(vehicle.priceUSD)}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.sellerInfo}>
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color={colors.brand.warning} />
              <Text style={styles.ratingText}>{vehicle.seller.rating}</Text>
              {vehicle.seller.verified && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={12} 
                  color={colors.brand.success} 
                  style={styles.verifiedIcon} 
                />
              )}
            </View>
          </View>
          <Text style={styles.postedTime}>
            {calculateDaysAgo(vehicle.posted)}
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
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
<<<<<<< HEAD
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
=======
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.base,
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    position: 'relative',
    height: layout.card.imageHeight,
<<<<<<< HEAD
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    overflow: 'hidden',
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
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
<<<<<<< HEAD
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
=======
  conditionBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  conditionText: {
    color: colors.text.primary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  content: {
    padding: layout.card.padding,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.lineHeight.tight * typography.size.base,
    marginBottom: spacing.xs,
  },
  location: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    marginBottom: spacing.sm,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailText: {
    color: colors.text.secondary,
    fontSize: typography.size.xs,
    flex: 1,
  },
  separator: {
    color: colors.text.secondary,
    fontSize: typography.size.xs,
    marginHorizontal: spacing.xs,
  },
  priceContainer: {
    marginBottom: spacing.sm,
  },
  priceFC: {
    color: colors.text.primary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    lineHeight: typography.lineHeight.tight * typography.size.base,
  },
  priceUSD: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerInfo: {
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  ratingText: {
    color: colors.text.secondary,
    fontSize: typography.size.xs,
  },
  verifiedIcon: {
    marginLeft: spacing.xs / 2,
  },
  postedTime: {
    color: colors.text.tertiary,
    fontSize: typography.size.xs,
  },
});

export default VehicleCard; 
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
