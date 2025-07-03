import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Modal,
  Linking,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const STATUSBAR_HEIGHT = StatusBar.currentHeight || (Platform.OS === 'ios' ? 44 : 0);

// Données temporaires pour la démo
const DEMO_RIDES = [
  {
    id: '1',
    date: '2024-03-20',
    time: '14:30',
    type: 'Standard',
    price: '15.50',
    from: 'Place de la République',
    to: 'Aéroport Charles de Gaulle',
    driverName: 'Jean Dupont',
    driverPhone: '+33612345678',
  },
  {
    id: '2',
    date: '2024-03-18',
    time: '09:15',
    type: 'Luxe',
    price: '45.00',
    from: 'Avenue des Champs-Élysées',
    to: 'Tour Eiffel',
    driverName: 'Marie Curie',
    driverPhone: '+33698765432',
  },
  {
    id: '3',
    date: '2024-03-15',
    time: '20:45',
    type: 'Standard',
    price: '12.75',
    from: 'Gare du Nord',
    to: 'Montmartre',
    driverName: 'Pierre Laurent',
    driverPhone: '+33667890123',
  },
  {
    id: '4',
    date: '2024-03-12',
    time: '16:20',
    type: 'Luxe',
    price: '38.50',
    from: 'Le Marais',
    to: 'Versailles',
    driverName: 'Sophie Martin',
    driverPhone: '+33623456789',
  },
];

const RideHistoryScreen = ({ navigation, route }) => {
  const purpose = route.params?.purpose;
  const [selectedRide, setSelectedRide] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Formater la date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleRidePress = (ride) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRide(ride);
    setModalVisible(true);
  };

  const handleCall = () => {
    if (selectedRide?.driverPhone) {
      Linking.openURL(`tel:${selectedRide.driverPhone}`);
    }
    setModalVisible(false);
  };

  const handleWhatsApp = () => {
    if (selectedRide?.driverPhone) {
      // Enlever le + et les espaces du numéro pour WhatsApp
      const phoneNumber = selectedRide.driverPhone.replace(/\+|\s/g, '');
      Linking.openURL(`whatsapp://send?phone=${phoneNumber}`);
    }
    setModalVisible(false);
  };

  const RideCard = ({ ride }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleRidePress(ride)}>
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>{formatDate(ride.date)}</Text>
          <Text style={styles.time}>{ride.time}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{ride.price}€</Text>
        </View>
      </View>

      <View style={styles.rideType}>
        <Text style={[
          styles.rideTypeText,
          ride.type === 'Luxe' && styles.luxeText
        ]}>
          {ride.type}
        </Text>
      </View>

      <View style={styles.locationContainer}>
        <View style={styles.locationRow}>
          <View style={styles.dot} />
          <Text style={styles.locationText} numberOfLines={1}>{ride.from}</Text>
        </View>
        <View style={styles.verticalLine} />
        <View style={styles.locationRow}>
          <View style={[styles.dot, styles.destinationDot]} />
          <Text style={styles.locationText} numberOfLines={1}>{ride.to}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {purpose === 'lost_item' ? 'Sélectionnez une course' : 'Historique des courses'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {DEMO_RIDES.map(ride => (
          <RideCard key={ride.id} ride={ride} />
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Course du {selectedRide && formatDate(selectedRide.date)}</Text>
                <Text style={styles.modalSubtitle}>{selectedRide?.driverName}</Text>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.callButton]}
                  onPress={handleCall}
                >
                  <View style={styles.buttonContent}>
                    <Ionicons name="call" size={22} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Appeler</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.whatsappButton]}
                  onPress={handleWhatsApp}
                >
                  <View style={styles.buttonContent}>
                    <FontAwesome name="whatsapp" size={22} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>WhatsApp</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: STATUSBAR_HEIGHT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginRight: 29,
  },
  headerRight: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  dateContainer: {
    flex: 1,
  },
  date: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  priceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 8,
  },
  price: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rideType: {
    marginBottom: 15,
  },
  rideTypeText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  luxeText: {
    color: '#FFD700',
  },
  locationContainer: {
    marginTop: 5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 10,
  },
  destinationDot: {
    backgroundColor: '#F44336',
  },
  verticalLine: {
    width: 2,
    height: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 3,
  },
  locationText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  // Styles du modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 8,
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 16,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  actionButtons: {
    marginBottom: 8,
  },
  actionButton: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  callButton: {
    backgroundColor: '#2C2C2E',
  },
  whatsappButton: {
    backgroundColor: '#25D366', // Couleur officielle WhatsApp
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF453A',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default RideHistoryScreen; 