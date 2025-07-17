import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const SMSRideRequestScreen = ({ route, navigation }) => {
  const { rideData } = route.params || {};
  const [isAccepted, setIsAccepted] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

  // Données par défaut si pas de rideData
  const defaultRideData = {
    from: 'Bandal',
    to: 'Gombe',
    time: '18h00',
    reference: 'Grand Hôtel',
    clientPhone: '+243123456789',
    isValid: true
  };

  const ride = rideData || defaultRideData;

  const handleAccept = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsAccepted(true);
      
      Alert.alert(
        '✅ Course Acceptée',
        `Vous avez accepté la course de ${ride.from} vers ${ride.to}.\n\nLe client sera notifié par SMS.`,
        [
          {
            text: 'Commencer la course',
            onPress: () => {
              // Naviguer vers l'écran de navigation
              navigation.navigate('Navigation', { rideData: ride });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erreur acceptation course:', error);
    }
  };

  const handleReject = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setIsRejected(true);
      
      Alert.alert(
        '❌ Course Refusée',
        'La course a été refusée. Elle sera proposée à d\'autres chauffeurs.',
        [
          {
            text: 'Retour',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Erreur refus course:', error);
    }
  };

  const handleCallClient = () => {
    Alert.alert(
      '📞 Appeler le Client',
      `Voulez-vous appeler ${ride.clientPhone} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Appeler', 
          onPress: () => {
            // Ici on pourrait ouvrir l'app téléphone
            console.log('Appel vers:', ride.clientPhone);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course SMS</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Badge SMS */}
        <View style={styles.smsBadge}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#FF6B35" />
          <Text style={styles.smsBadgeText}>Commande par SMS</Text>
        </View>

        {/* Informations de la course */}
        <View style={styles.rideCard}>
          <View style={styles.rideHeader}>
            <Ionicons name="car" size={24} color="#FF6B35" />
            <Text style={styles.rideTitle}>Détails de la Course</Text>
          </View>

          {/* Trajet */}
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: '#4CAF50' }]} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Départ</Text>
                <Text style={styles.routeText}>{ride.from}</Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: '#FF6B35' }]} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Destination</Text>
                <Text style={styles.routeText}>{ride.to}</Text>
              </View>
            </View>
          </View>

          {/* Informations supplémentaires */}
          <View style={styles.additionalInfo}>
            {ride.time && (
              <View style={styles.infoRow}>
                <Ionicons name="time" size={20} color="#666" />
                <Text style={styles.infoText}>Heure: {ride.time}</Text>
              </View>
            )}
            
            {ride.reference && (
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color="#666" />
                <Text style={styles.infoText}>Référence: {ride.reference}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color="#666" />
              <Text style={styles.infoText}>Client: {ride.clientPhone}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        {!isAccepted && !isRejected && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.callButton}
              onPress={handleCallClient}
            >
              <Ionicons name="call" size={20} color="#007AFF" />
              <Text style={styles.callButtonText}>Appeler Client</Text>
            </TouchableOpacity>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.rejectButton}
                onPress={handleReject}
              >
                <Ionicons name="close" size={20} color="#fff" />
                <Text style={styles.rejectButtonText}>Refuser</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.acceptButton}
                onPress={handleAccept}
              >
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.acceptButtonText}>Accepter</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* État accepté */}
        {isAccepted && (
          <View style={styles.statusContainer}>
            <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
            <Text style={styles.statusText}>Course Acceptée</Text>
            <Text style={styles.statusSubtext}>Le client a été notifié</Text>
          </View>
        )}

        {/* État refusé */}
        {isRejected && (
          <View style={styles.statusContainer}>
            <Ionicons name="close-circle" size={48} color="#FF3B30" />
            <Text style={styles.statusText}>Course Refusée</Text>
            <Text style={styles.statusSubtext}>Proposée à d'autres chauffeurs</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  smsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  smsBadgeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B35',
  },
  rideCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rideTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  routeContainer: {
    marginBottom: 20,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 15,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#e1e5e9',
    marginLeft: 5,
    marginVertical: 8,
  },
  additionalInfo: {
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    paddingTop: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    marginBottom: 30,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  callButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    borderRadius: 12,
  },
  rejectButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 12,
  },
  acceptButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  statusSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default SMSRideRequestScreen;