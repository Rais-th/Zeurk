import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Animated,
  Image,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { height } = Dimensions.get('window');

const vehiclesData = [
  {
    id: '1',
    brand: 'Mercedes-Benz',
    model: 'Classe G',
    image: require('../../../../assets/cars/luxe.png'),
    plate: 'AB-123-CD',
    status: 'Actif',
  },
];

const VehiclesAndDocumentsModal = ({
  visible,
  onClose,
  vehiclesModalY,
}) => {

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleVehiclePress = () => {
    Haptics.selectionAsync();
  };

  const handleAddVehicle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Navigate to add vehicle screen or open add vehicle modal
    console.log('Add vehicle pressed');
  };

  const renderVehicleItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.vehicleItemContainer}
      onPress={handleVehiclePress}
      activeOpacity={0.7}
    >
      <Image source={item.image} style={styles.vehicleImage} resizeMode="contain" />
      <View style={styles.vehicleInfoContainer}>
        <Text style={styles.vehicleBrand}>{item.brand} {item.model}</Text>
        <Text style={styles.vehiclePlate}>{item.plate}</Text>
      </View>
      <View style={[
        styles.vehicleStatusBadge, 
        item.status === 'Actif' ? styles.activeBadge : styles.pendingBadge
      ]}>
        <Text style={styles.vehicleStatusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View 
          style={[
            styles.modalContent,
            { transform: [{ translateY: vehiclesModalY }] }
          ]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Ionicons name="chevron-down" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>VÉHICULES & DOCUMENTS</Text>
            <View style={styles.headerRight} />
          </View>

          <FlatList
            data={vehiclesData}
            renderItem={renderVehicleItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.vehiclesListContainer}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.addVehicleContainer}>
            <TouchableOpacity 
              style={styles.addVehicleButton}
              onPress={handleAddVehicle}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={24} color="#fff" />
              <Text style={styles.addVehicleText}>Ajouter un véhicule</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal container and overlay
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: height * 0.8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
      },
      android: {
        elevation: 25,
        shadowColor: '#000000',
      },
    }),
  },

  // Modal header
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    padding: 8,
    // No background - following exit arrow guidelines
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },

  // Vehicles list
  vehiclesListContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  vehicleItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  vehicleImage: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  vehicleInfoContainer: {
    flex: 1,
  },
  vehicleBrand: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.24,
  },
  vehiclePlate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },

  // Status badges
  vehicleStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  activeBadge: {
    backgroundColor: 'rgba(81, 207, 102, 0.1)',
    borderColor: '#51cf66',
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 212, 59, 0.1)',
    borderColor: '#ffd43b',
  },
  vehicleStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  // Add Vehicle Button
  addVehicleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  addVehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  addVehicleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    letterSpacing: -0.24,
  },
});

export default VehiclesAndDocumentsModal;