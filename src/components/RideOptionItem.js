import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
<<<<<<< HEAD
import * as Haptics from 'expo-haptics';
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b

const CarIcon = ({ color, icon, isMotorcycle, carImage, isLuxe }) => (
  <View style={styles.carContainer}>
    {carImage ? (
      <Image 
        source={carImage} 
        style={[styles.carImageStyle, isLuxe && styles.luxeCarImageStyle]} 
      />
    ) : isMotorcycle ? (
      <View style={[styles.motorcycleBody, { backgroundColor: color }]}>
        <View style={styles.motorcycleDetails}>
          <View style={[styles.motorcycleWheel, styles.frontWheel]} />
          <View style={[styles.motorcycleWheel, styles.rearWheel]} />
        </View>
      </View>
    ) : (
      <View style={[styles.carBody, { backgroundColor: color }]}>
        <View style={styles.carWindshield} />
        <View style={styles.carDetails}>
          <View style={[styles.carWheel, styles.frontWheel]} />
          <View style={[styles.carWheel, styles.rearWheel]} />
        </View>
      </View>
    )}
    {icon && (
      <View style={styles.carIconOverlay}>
        {typeof icon === 'string' ? (
          <Text style={styles.carIconText}>{icon}</Text>
        ) : (
          <Image source={icon} style={styles.carIconImage} />
        )}
      </View>
    )}
  </View>
);

const RideOptionItem = ({ option, isSelected, onSelect }) => {
  return (
    <TouchableOpacity
      style={styles.optionItem}
<<<<<<< HEAD
      onPress={() => {
        Haptics.selectionAsync();
        onSelect(option.id);
      }}
=======
      onPress={() => onSelect(option.id)}
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    >
      <View 
        style={[
          styles.optionItemInner,
          isSelected && styles.selectedOption,
        ]}
      >
        <View style={styles.optionLeft}>
          <CarIcon 
            color={option.carColor} 
            icon={option.icon} 
            isMotorcycle={option.id === 'jet'} 
            carImage={option.carImage}
            isLuxe={option.category === 'luxe'}
          />
          <View style={styles.optionInfo}>
            <View style={styles.optionHeader}>
              <Text style={styles.optionName}>{option.name}</Text>
              {option.passengers && (
                <View style={styles.passengersContainer}>
                  <Ionicons name="person" size={12} color="#8E8E93" />
                  <Text style={styles.passengersText}>
                    {option.passengers}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.optionTime}>{option.time}</Text>
          </View>
        </View>
        <Text style={styles.price}>{option.price.toFixed(2)} €</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  optionItem: {
    marginBottom: 6,
  },
  optionItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  selectedOption: {
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
    borderColor: '#fff',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  carContainer: {
    width: 65,
    height: 45,
    marginRight: 14,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carBody: {
    width: 50,
    height: 20,
    borderRadius: 12,
    position: 'relative',
  },
  carWindshield: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 15,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
  },
  carDetails: {
    position: 'absolute',
    bottom: -8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  carWheel: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  carIconOverlay: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carIconText: {
    fontSize: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  passengersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  passengersText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 2,
  },
  optionTime: {
    fontSize: 13,
    color: '#8E8E93',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  motorcycleBody: {
    width: 50,
    height: 25,
    borderRadius: 12,
    position: 'relative',
  },
  motorcycleDetails: {
    position: 'absolute',
    bottom: -8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  motorcycleWheel: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  carIconImage: {
    width: 20,
    height: 20,
  },
  carImageStyle: {
    width: 75,
    height: 50,
    resizeMode: 'contain',
  },
  luxeCarImageStyle: {
    width: 90,
    height: 65,
  },
  frontWheel: {},
  rearWheel: {},
});

<<<<<<< HEAD
export default React.memo(RideOptionItem);
=======
export default React.memo(RideOptionItem); 
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
