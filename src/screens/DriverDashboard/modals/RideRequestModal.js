import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { styles } from '../styles';

const RideRequestModal = ({ visible, rideData, onAccept, onDecline }) => {
  if (!rideData) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
    >
      <View style={styles.rideRequestModalOverlay}>
        <View style={styles.rideRequestModalContent}>
          {/* En-tête avec photo du client */}
          <View style={styles.rideRequestHeader}>
            <Image 
              source={require('../../../../assets/icons/Jet.png')} 
              style={styles.clientAvatar}
            />
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>Client {rideData.id.slice(-1)}</Text>
              <Text style={styles.clientRating}>⭐ 4.8 • 127 courses</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceAmount}>{rideData.price.toLocaleString()} FC</Text>
              <Text style={styles.priceLabel}>Prix estimé</Text>
            </View>
          </View>

          {/* Informations de la course */}
          <View style={styles.rideDetailsContainer}>
            {/* Point de départ */}
            <View style={styles.locationRow}>
              <View style={styles.locationDot} />
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>Départ</Text>
                <Text style={styles.locationAddress}>{rideData.startAddress}</Text>
              </View>
              <Text style={styles.durationText}>{rideData.duration} min</Text>
            </View>

            {/* Ligne de séparation */}
            <View style={styles.routeLine} />

            {/* Point d'arrivée */}
            <View style={styles.locationRow}>
              <View style={[styles.locationDot, styles.destinationDot]} />
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>Destination</Text>
                <Text style={styles.locationAddress}>{rideData.endAddress}</Text>
              </View>
            </View>
          </View>

          {/* Informations supplémentaires */}
          <View style={styles.additionalInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#8E8E93" />
              <Text style={styles.infoText}>Temps d'arrivée: {rideData.duration} min</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="car-outline" size={20} color="#8E8E93" />
              <Text style={styles.infoText}>Course standard</Text>
            </View>
          </View>

          {/* Boutons d'action */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              style={styles.declineButton}
              onPress={onDecline}
            >
              <Text style={styles.declineButtonText}>Refuser</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={onAccept}
            >
              <Text style={styles.acceptButtonText}>Accepter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RideRequestModal; 