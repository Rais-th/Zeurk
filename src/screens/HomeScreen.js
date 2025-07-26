import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../contexts/AuthContext';
import { driverTokenService } from '../services/driverTokenService';
import { getUserType, promoteToDriver } from '../config/firebase';

const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#1a1a1a"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1a1a1a"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#0a0a0a"
      }
    ]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#1f1f1f"
      }
    ]
  }
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState(null);
  const [userCity, setUserCity] = useState('...');
  const [userName, setUserName] = useState('Rais');
  const [isRegisteredDriver, setIsRegisteredDriver] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: -4.4419,
    longitude: 15.2663,
    latitudeDelta: 0.09,
    longitudeDelta: 0.04,
  });

  const handleDrivePress = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Vérifier si l'utilisateur est bien un driver
      if (user) {
        const userType = await getUserType(user.id);
        const isDriverInService = await driverTokenService.isRegisteredAsDriver(user.id);
        
        if (userType === 'driver' || isDriverInService) {
          // L'utilisateur est un driver, naviguer vers SettingsPanel
          navigation.navigate('DriverDashboard', { 
            screen: 'SettingsPanel',
            initial: false 
          });
        } else {
          // L'utilisateur n'est pas encore un driver, l'encourager à s'inscrire
          Alert.alert(
            'Devenir Conducteur',
            'Vous devez d\'abord vous inscrire comme conducteur pour accéder aux paramètres.',
            [
              { text: 'Annuler', style: 'cancel' },
              { 
                text: 'S\'inscrire', 
                onPress: () => navigation.navigate('Auth')
              }
            ]
          );
        }
      } else {
        // L'utilisateur n'est pas connecté
        Alert.alert(
          'Connexion requise',
          'Vous devez vous connecter pour accéder aux paramètres conducteur.',
          [
            { text: 'Annuler', style: 'cancel' },
            { 
              text: 'Se connecter', 
              onPress: () => navigation.navigate('Auth')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Erreur lors de l\'accès aux paramètres driver:', error);
      Alert.alert('Erreur', 'Impossible d\'accéder aux paramètres conducteur.');
    }
  };

  useEffect(() => {
    if (user) {
      getCurrentLocation();
      checkDriverStatus();
      // Correction automatique si nécessaire
      autoCorrectDriverStatus();
    }
  }, [user]);

  // Fonction pour corriger automatiquement le statut driver si nécessaire
  const autoCorrectDriverStatus = async () => {
    if (user && user.user_metadata?.userType === 'driver') {
      try {
        console.log('🔧 Correction automatique du statut driver pour:', user.id);
        await promoteToDriver(user.id, {
          email: user.email,
          displayName: user.user_metadata?.fullName || 'Driver',
          phoneNumber: user.user_metadata?.phoneNumber || '',
          isVerified: false,
          isAvailable: false,
          rating: 5.0,
          totalRides: 0,
          autoCorrectedAt: new Date().toISOString()
        });
        console.log('✅ Statut driver corrigé automatiquement');
        await checkDriverStatus();
      } catch (error) {
        console.error('❌ Erreur lors de la correction automatique:', error);
      }
    }
  };

  const checkDriverStatus = async () => {
    console.log('🔍 checkDriverStatus appelé avec user:', user ? user.id : 'null');
    
    if (user) {
      try {
        console.log('🔍 Vérification du statut pour user ID:', user.id);
        
        // Vérifier le statut dans Firebase
        const userType = await getUserType(user.id);
        const isDriverInFirebase = userType === 'driver';
        
        console.log('🔍 getUserType résultat:', userType);
        console.log('🔍 isDriverInFirebase:', isDriverInFirebase);
        
        // Vérifier le statut dans driverTokenService
        const isDriverInService = await driverTokenService.isRegisteredAsDriver(user.id);
        
        console.log('🔍 isDriverInService:', isDriverInService);
        
        // Le bouton Drive s'affiche si l'utilisateur est driver dans Firebase OU dans le service
        const shouldShowDriveButton = isDriverInFirebase || isDriverInService;
        
        console.log('🔍 Statut Driver final:', {
          userId: user.id,
          firebaseType: userType,
          isDriverInFirebase,
          isDriverInService,
          shouldShowDriveButton
        });
        
        setIsRegisteredDriver(shouldShowDriveButton);
      } catch (error) {
        console.error('❌ Erreur lors de la vérification du statut conducteur:', error);
        setIsRegisteredDriver(false);
      }
    } else {
      console.log('🔍 Aucun utilisateur connecté, isRegisteredDriver = false');
      setIsRegisteredDriver(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      // Demander la permission d'accès à la localisation
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'L\'accès à la localisation est nécessaire pour déterminer votre ville et vous offrir la meilleure expérience.',
          [
            { text: 'OK', style: 'default' }
          ]
        );
        return;
      }

      // Obtenir la position actuelle
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      
      // Mettre à jour la position de l'utilisateur
      setUserLocation({ latitude, longitude });
      
      // Mettre à jour la région de la carte
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.09,
        longitudeDelta: 0.04,
      });

      // Obtenir l'adresse à partir des coordonnées (géocodage inverse)
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        // Extraire la ville (city ou district ou region)
        const city = address.city || address.district || address.region || address.subregion || 'Ville inconnue';
        setUserCity(city);
      }

    } catch (error) {
      console.error('Erreur lors de la récupération de la localisation:', error);
      Alert.alert(
        'Erreur de localisation',
        'Impossible de déterminer votre position. Vérifiez que la localisation est activée.',
        [
          { text: 'Réessayer', onPress: getCurrentLocation },
          { text: 'Annuler', style: 'cancel' }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={mapStyle}
        region={mapRegion}
        showsUserLocation={false}
      />

      {/* Couches d'ombres superposées */}
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.4)']}
        style={[styles.gradientOverlay, { opacity: 0.7 }]}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientOverlay, { opacity: 0.5 }]}
      />
      <View style={[styles.blurOverlay, { opacity: 0.3 }]} />

      {/* Header minimal avec localisation */}
      <View style={styles.topHeader}>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={18} color="#fff" />
          <Text style={styles.cityText}>{userCity}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche centrale - ÉLÉMENT PRINCIPAL */}
      <View style={styles.searchContainer}>
        <TouchableOpacity 
          style={styles.searchBar}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            
            // Check if user is authenticated before accessing search
            if (user) {
              navigation.navigate('Search');
            } else {
              // Show authentication screen for passenger access
              navigation.navigate('PassengerAuth');
            }
          }}
        >
          <Ionicons name="search" size={24} color="#000" style={{ marginRight: 15, opacity: 0.8 }}/>
          <Text style={styles.searchText}>Où allez-vous ?</Text>
          <Ionicons name="mic" size={22} color="#000" style={{ marginLeft: 'auto', opacity: 0.6 }}/>
        </TouchableOpacity>
        
        {/* Boutons rapides sous la recherche */}
        <View style={styles.quickDestinations}>
          <TouchableOpacity style={styles.quickButton}>
            <MaterialCommunityIcons name="truck-delivery" size={18} color="#fff" />
            <Text style={styles.quickButtonText}>Livraisons</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('InfoChatScreen');
            }}
          >
            <Ionicons name="chatbubbles" size={18} color="#fff" />
            <Text style={styles.quickButtonText}>Zeurk AI</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('ScheduleRide');
            }}
          >
            <Ionicons name="time" size={18} color="#fff" />
            <Text style={styles.quickButtonText}>Planifier</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Panneau d'informations minimal en bas */}
      <View style={styles.bottomPanel}>
        <View style={styles.rideButtons}>
          <TouchableOpacity style={[styles.rideType, styles.activeRideType]}>
            <View style={styles.rideTypeContent}>
              <Ionicons name="car" size={20} color="#0A84FF" />
              <Text style={[styles.rideTypeText, { color: '#0A84FF' }]}>Course</Text>
            </View>
          </TouchableOpacity>
          
          {isRegisteredDriver && (
            <TouchableOpacity 
              style={styles.rideType}
              onPress={handleDrivePress}
            >
              <View style={styles.rideTypeContent}>
                <Ionicons name="speedometer" size={20} color="rgba(255, 255, 255, 0.7)" />
                <Text style={[styles.rideTypeText, { color: 'rgba(255, 255, 255, 0.7)' }]}>Drive</Text>
              </View>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.rideType}
            onPress={() => navigation.navigate('VehicleMarketplace')}
          >
            <View style={styles.rideTypeContent}>
              <Ionicons name="pricetag" size={20} color="rgba(255, 255, 255, 0.7)" />
              <Text style={[styles.rideTypeText, { color: 'rgba(255, 255, 255, 0.7)' }]}>Shopping</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.rideType}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('Profile');
            }}
          >
            <View style={styles.rideTypeContent}>
              <Ionicons name="person" size={20} color="rgba(255, 255, 255, 0.7)" />
              <Text style={[styles.rideTypeText, { color: 'rgba(255, 255, 255, 0.7)' }]}>Profil</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  topHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    zIndex: 1001,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.4,
        shadowRadius: 15,
      },
      android: {
        elevation: 15,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    padding: 8,
    borderRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.4,
        shadowRadius: 15,
      },
      android: {
        elevation: 15,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cityText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  searchContainer: {
    position: 'absolute',
    top: '42%',
    left: 20,
    right: 20,
    zIndex: 1001,
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 35,
    paddingHorizontal: 25,
    paddingVertical: 22,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 15,
        },
        shadowOpacity: 0.35,
        shadowRadius: 25,
      },
      android: {
        elevation: 20,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  searchText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '500',
    flex: 1,
    letterSpacing: 0.3,
  },
  quickDestinations: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
    width: '100%',
    gap: 15,
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 30,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: -13,
    backgroundColor: '#000',
    paddingTop: 20,
    paddingBottom: 35,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 50,
    zIndex: 1001,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -12,
        },
        shadowOpacity: 0.6,
        shadowRadius: 25,
      },
      android: {
        elevation: 25,
      },
    }),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  rideButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  rideType: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    flex: 1,
    justifyContent: 'center',
    margin: 2,
    minHeight: 60,
  },
  activeRideType: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#0A84FF',
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  rideTypeContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  rideTypeText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

});