import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Platform, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../contexts/AuthContext';

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
  const [mapRegion, setMapRegion] = useState({
    latitude: -4.4419,
    longitude: 15.2663,
    latitudeDelta: 0.09,
    longitudeDelta: 0.04,
  });

  const handleDrivePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Check if user is authenticated before accessing driver dashboard
    if (user) {
      navigation.navigate('DriverDashboard');
    } else {
      // Show authentication screen for driver access
      Alert.alert(
        'Authentification requise',
        'Vous devez vous connecter pour accéder au tableau de bord conducteur.',
        [
          {
            text: 'Annuler',
            style: 'cancel'
          },
          {
            text: 'Se connecter',
            onPress: () => navigation.navigate('Auth')
          }
        ]
      );
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

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
      <BlurView intensity={20} style={[styles.blurOverlay, { opacity: 0.3 }]} />

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
            <Ionicons name="car" size={20} color="#0A84FF" />
            <Text style={[styles.rideTypeText, { color: '#0A84FF' }]}>Course</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.rideType}
            onPress={() => navigation.navigate('VehicleMarketplace')}
          >
            <Ionicons name="car-sport" size={20} color="rgba(255, 255, 255, 0.7)" />
            <Text style={[styles.rideTypeText, { color: 'rgba(255, 255, 255, 0.7)' }]}>Auto</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.rideType}
            onPress={handleDrivePress}
          >
            <Ionicons name="speedometer" size={20} color="rgba(255, 255, 255, 0.7)" />
            <Text style={[styles.rideTypeText, { color: 'rgba(255, 255, 255, 0.7)' }]}>Drive</Text>
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
    paddingTop: 15,
    paddingBottom: 32,
    paddingHorizontal: 22,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 16,
    flex: 1,
    justifyContent: 'center',
    margin: 3,
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
  rideTypeText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

});