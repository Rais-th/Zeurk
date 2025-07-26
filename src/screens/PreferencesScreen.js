import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Switch,
  Image,
  Animated,
  LayoutAnimation,
  UIManager,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { doc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { firestore, deleteImageFromStorage } from '../config/firebase';
import * as Haptics from 'expo-haptics';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const STATUSBAR_HEIGHT = StatusBar.currentHeight || (Platform.OS === 'ios' ? 44 : 0);

// Données de démonstration
const DEMO_PAYMENT_METHODS = [
  { id: '1', type: 'Airtel Money', icon: require('../../assets/icons/airtel.jpg') },
  { id: '2', type: 'M-Pesa', icon: require('../../assets/icons/mpesa.png') },
  { id: '3', type: 'Orange Money', icon: require('../../assets/icons/orange.png') },
];

const DEMO_ADDRESSES = [
  { id: '1', name: 'Maison', address: '123 Rue de la Paix, Abidjan' },
  { id: '2', name: 'Bureau', address: 'Zone 4C, Marcory' },
  { id: '3', name: 'Gym', address: 'Complexe Sportif, Cocody' },
];

const PreferencesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [preferredClass, setPreferredClass] = useState('Standard');
  const [preferredLanguage, setPreferredLanguage] = useState('Français');
  const [selectedPayment, setSelectedPayment] = useState('1');
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    payments: true,
    addresses: false,
    class: false,
    language: false,
    deleteAccount: false,
  });

  const toggleSection = (section) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const Section = ({ title, name, children }) => (
    <View style={styles.section}>
      <TouchableOpacity 
        style={styles.sectionHeader} 
        onPress={() => toggleSection(name)}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Ionicons 
          name={expandedSections[name] ? "chevron-up" : "chevron-down"} 
          size={24} 
          color="#fff" 
        />
      </TouchableOpacity>
      {expandedSections[name] && (
        <View style={styles.sectionContent}>
          {children}
        </View>
      )}
    </View>
  );

  const handleClassSelection = (newClass) => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setPreferredClass(newClass);
  };

  const handleLanguageSelection = (language) => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setPreferredLanguage(language);
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et supprimera définitivement toutes vos données.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer définitivement',
          style: 'destructive',
          onPress: async () => {
            // Deuxième confirmation
            Alert.alert(
              'Confirmation finale',
              'Cette action supprimera définitivement votre compte et toutes vos données. Êtes-vous absolument sûr ?',
              [
                {
                  text: 'Annuler',
                  style: 'cancel',
                },
                {
                  text: 'OUI, SUPPRIMER',
                  style: 'destructive',
                  onPress: async () => {
                    setLoading(true);
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                      
                      // Supprimer l'avatar de Firebase Storage s'il existe
                      if (user.photoURL && user.photoURL.includes('firebase')) {
                        try {
                          const oldFileName = user.photoURL.split('/').pop();
                          if (oldFileName) {
                            await deleteImageFromStorage(`avatars/${user.uid}/${oldFileName}`);
                          }
                        } catch (error) {
                          console.log('Impossible de supprimer l\'avatar:', error);
                        }
                      }

                      // Supprimer le document utilisateur de Firestore
                      const userRef = doc(firestore, 'passengers', user.uid);
                      await deleteDoc(userRef);

                      // Supprimer le compte utilisateur de Firebase Auth
                      await deleteUser(user);

                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      Alert.alert(
                        'Compte supprimé',
                        'Votre compte a été supprimé avec succès.',
                        [
                          {
                            text: 'OK',
                            onPress: () => {
                              // Rediriger vers l'écran de connexion
                              navigation.reset({
                                index: 0,
                                routes: [{ name: 'PassengerAuth' }],
                              });
                            },
                          },
                        ]
                      );
                    } catch (error) {
                      console.error('Erreur lors de la suppression du compte:', error);
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                      Alert.alert(
                        'Erreur',
                        'Impossible de supprimer le compte. Veuillez réessayer ou contacter le support.',
                        [{ text: 'OK' }]
                      );
                    } finally {
                      setLoading(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Préférences</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Méthodes de paiement */}
        <Section title="Méthodes de paiement" name="payments">
          <View style={styles.paymentMethods}>
            {DEMO_PAYMENT_METHODS.map(method => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedPayment === method.id && styles.selectedPayment
                ]}
                onPress={() => setSelectedPayment(method.id)}
              >
                <Image source={method.icon} style={styles.paymentIcon} />
                <Text style={styles.paymentText}>{method.type}</Text>
                {selectedPayment === method.id && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addPaymentButton}>
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text style={styles.addPaymentText}>Ajouter un moyen de paiement</Text>
            </TouchableOpacity>
          </View>
        </Section>

        {/* Section Adresses */}
        <Section title="Adresses raccourcies" name="addresses">
          <View style={styles.addresses}>
            {DEMO_ADDRESSES.map(address => (
              <TouchableOpacity key={address.id} style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <Text style={styles.addressName}>{address.name}</Text>
                  <TouchableOpacity>
                    <Ionicons name="create-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.addressText}>{address.address}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addAddressButton}>
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text style={styles.addAddressText}>Ajouter une adresse</Text>
            </TouchableOpacity>
          </View>
        </Section>

        {/* Section Véhicule */}
        <Section title="Véhicule préféré" name="class">
          <View style={styles.classContainer}>
            <TouchableOpacity
              style={[
                styles.classCard,
                preferredClass === 'Standard' ? styles.classCardSelected : null
              ]}
              onPress={() => handleClassSelection('Standard')}
            >
              <View style={[
                styles.classContent,
                preferredClass === 'Standard' && styles.classContentSelected
              ]}>
                <Text style={[
                  styles.classCardTitle,
                  preferredClass === 'Standard' ? styles.classCardTitleSelected : null
                ]}>
                  Standard
                </Text>
                {preferredClass === 'Standard' && (
                  <Text style={styles.classCardDescription}>
                    Véhicules confortables pour vos trajets quotidiens
                  </Text>
                )}
              </View>
              <View style={[
                styles.classImageContainer,
                preferredClass !== 'Standard' && styles.classImageSmall
              ]}>
                <Image 
                  source={require('../../assets/cars/bluecars.png')} 
                  style={{ 
                    width: preferredClass === 'Standard' ? 70 : 45, 
                    height: preferredClass === 'Standard' ? 70 : 45, 
                    resizeMode: 'contain',
                    opacity: preferredClass === 'Standard' ? 1 : 0.6,
                  }} 
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.classCard,
                preferredClass === 'Luxe' ? styles.luxeCardSelected : null
              ]}
              onPress={() => handleClassSelection('Luxe')}
            >
              <View style={[
                styles.classContent,
                preferredClass === 'Luxe' && styles.classContentSelected
              ]}>
                <Text style={[
                  styles.classCardTitle,
                  styles.luxeTitle
                ]}>
                  Luxe
                </Text>
                {preferredClass === 'Luxe' && (
                  <Text style={styles.classCardDescription}>
                    Véhicules haut de gamme avec conducteurs professionnels pour une expérience luxueuse
                  </Text>
                )}
              </View>
              <View style={[
                styles.classImageContainer,
                preferredClass !== 'Luxe' && styles.classImageSmall
              ]}>
                <Image 
                  source={require('../../assets/cars/luxe.png')} 
                  style={{ 
                    width: preferredClass === 'Luxe' ? 70 : 45, 
                    height: preferredClass === 'Luxe' ? 70 : 45, 
                    resizeMode: 'contain',
                    opacity: preferredClass === 'Luxe' ? 1 : 0.6,
                  }} 
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.classCard,
                preferredClass === 'Diplomate' ? styles.diplomateCardSelected : null
              ]}
              onPress={() => handleClassSelection('Diplomate')}
            >
              <View style={[
                styles.classContent,
                preferredClass === 'Diplomate' && styles.classContentSelected
              ]}>
                <Text style={[
                  styles.classCardTitle,
                  styles.diplomateTitle
                ]}>
                  Diplomate
                </Text>
                {preferredClass === 'Diplomate' && (
                  <Text style={styles.classCardDescription}>
                    Service exclusif avec garde rapprochée pour vous sécuriser.
                  </Text>
                )}
              </View>
              <View style={[
                styles.classImageContainer,
                preferredClass !== 'Diplomate' && styles.classImageSmall
              ]}>
                <Image 
                  source={require('../../assets/cars/j.png')} 
                  style={{ 
                    width: preferredClass === 'Diplomate' ? 70 : 45, 
                    height: preferredClass === 'Diplomate' ? 70 : 45, 
                    resizeMode: 'contain',
                    opacity: preferredClass === 'Diplomate' ? 1 : 0.6,
                  }} 
                />
              </View>
            </TouchableOpacity>
          </View>
        </Section>

        {/* Section Langue */}
        <Section title="Langue" name="language">
          <View style={styles.classContainer}>
            <TouchableOpacity
              style={[
                styles.classCard,
                preferredLanguage === 'Français' ? styles.classCardSelected : null
              ]}
              onPress={() => handleLanguageSelection('Français')}
            >
              <View style={[
                styles.classContent,
                preferredLanguage === 'Français' && styles.classContentSelected
              ]}>
                <Text style={[
                  styles.classCardTitle,
                  preferredLanguage === 'Français' ? styles.classCardTitleSelected : null
                ]}>
                  Français
                </Text>
                {preferredLanguage === 'Français' && (
                  <Text style={styles.classCardDescription}>
                    Utiliser l'application en français
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.classCard,
                preferredLanguage === 'Lingala' ? styles.classCardSelected : null
              ]}
              onPress={() => handleLanguageSelection('Lingala')}
            >
              <View style={[
                styles.classContent,
                preferredLanguage === 'Lingala' && styles.classContentSelected
              ]}>
                <Text style={[
                  styles.classCardTitle,
                  preferredLanguage === 'Lingala' ? styles.classCardTitleSelected : null
                ]}>
                  Lingala
                </Text>
                {preferredLanguage === 'Lingala' && (
                  <Text style={styles.classCardDescription}>
                    Bosalela application na Lingala
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.classCard,
                preferredLanguage === 'Swahili' ? styles.classCardSelected : null
              ]}
              onPress={() => handleLanguageSelection('Swahili')}
            >
              <View style={[
                styles.classContent,
                preferredLanguage === 'Swahili' && styles.classContentSelected
              ]}>
                <Text style={[
                  styles.classCardTitle,
                  preferredLanguage === 'Swahili' ? styles.classCardTitleSelected : null
                ]}>
                  Swahili
                </Text>
                {preferredLanguage === 'Swahili' && (
                  <Text style={styles.classCardDescription}>
                    Tumia programu kwa Kiswahili
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </Section>

        {/* Section Suppression de compte */}
        <Section title="Suppression de compte" name="deleteAccount">
          <View style={styles.deleteAccountContainer}>
            <Text style={styles.deleteAccountWarning}>
              ⚠️ Cette action est irréversible et supprimera définitivement toutes vos données
            </Text>
            <TouchableOpacity
              style={[styles.deleteAccountButton, loading && styles.deleteAccountButtonDisabled]}
              onPress={handleDeleteAccount}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FF6B6B" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                  <Text style={styles.deleteAccountText}>Supprimer mon compte</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Section>
      </ScrollView>
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
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
    backgroundColor: '#000',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  sectionContent: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedPayment: {
    borderColor: '#fff',
  },
  paymentIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
    borderRadius: 6,
    resizeMode: 'contain',
  },
  paymentText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  checkmark: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 2,
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  addPaymentText: {
    color: '#fff',
    marginLeft: 12,
    fontSize: 16,
  },
  addresses: {
    gap: 12,
  },
  addressCard: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  addressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  addAddressText: {
    color: '#fff',
    marginLeft: 12,
    fontSize: 16,
  },
  classContainer: {
    gap: 12,
  },
  classCard: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    height: 60,
    transition: '0.3s',
  },
  classCardSelected: {
    borderColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    height: 100,
  },
  luxeCardSelected: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    height: 100,
  },
  diplomateCardSelected: {
    borderColor: '#C0A062',
    backgroundColor: 'rgba(192, 160, 98, 0.05)',
    height: 100,
  },
  classContent: {
    flex: 1,
    paddingRight: 16,
  },
  classContentSelected: {
    paddingVertical: 8,
  },
  classCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  luxeTitle: {
    color: '#FFD700',
  },
  diplomateTitle: {
    color: '#C0A062',
  },
  classCardTitleSelected: {
    color: '#fff',
  },
  classCardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 20,
  },
  classImageContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  classImageSmall: {
    width: 50,
    height: 50,
    opacity: 0.6,
  },
  deleteAccountContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  deleteAccountWarning: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderStyle: 'dashed',
  },
  deleteAccountButtonDisabled: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'solid',
  },
  deleteAccountText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default PreferencesScreen;