import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

const vehiclesData = [
  {
    id: '1',
    brand: 'Mercedes-Benz',
    model: 'Classe G',
    image: require('../../../../assets/cars/luxe.png'),
    plate: 'AB-123-CD',
    status: 'Actif',
  },
  {
    id: '2',
    brand: 'Yamaha',
    model: 'DT 125',
    image: require('../../../../assets/cars/motorbike.png'),
    plate: 'XYZ-789',
    status: 'En attente',
  },
];

const VehiclesAndDocumentsModal = ({
  visible,
  onClose,
  vehiclesModalY,
}) => {

  const renderVehicleItem = ({ item }) => (
    <View style={styles.vehicleItemContainer}>
      <Image source={item.image} style={styles.vehicleImage} resizeMode="contain" />
      <View style={styles.vehicleInfoContainer}>
        <Text style={styles.vehicleBrand}>{item.brand} {item.model}</Text>
        <Text style={styles.vehiclePlate}>{item.plate}</Text>
      </View>
      <View style={[styles.vehicleStatusBadge, item.status === 'Actif' ? styles.activeBadge : styles.pendingBadge]}>
        <Text style={styles.vehicleStatusText}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.withdrawModalContainer}>
        <TouchableOpacity 
          style={styles.withdrawModalOverlay}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View 
          style={[
            styles.withdrawModalContent,
            { transform: [{ translateY: vehiclesModalY }] }
          ]}
        >
          <View style={styles.withdrawModalHeader}>
            <TouchableOpacity 
              style={styles.withdrawCloseButton}
              onPress={onClose}
            >
              <Ionicons name="chevron-down" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.vehiclesModalTitle}>VÉHICULES & DOCUMENTS</Text>
            <View style={styles.withdrawHeaderRight} />
          </View>

          <FlatList
            data={vehiclesData}
            renderItem={renderVehicleItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.vehiclesListContainer}
            showsVerticalScrollIndicator={false}
          />

        </Animated.View>
      </View>
    </Modal>
  );
};

export default VehiclesAndDocumentsModal; 