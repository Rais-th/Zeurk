import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Platform, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useLocation, useDriverMatching } from '../hooks/useLocation';
import { useRequestQueue } from '../hooks/useRequestQueue';
import NetworkQualityIndicator from '../components/NetworkQualityIndicator';

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
  const [userCity, setUserCity] = useState('...');
  const [userName, setUserName] = useState('Rais');
  const [mapRegion, setMapRegion] = useState({
    latitude: -4.4419,
    longitude: 15.2663,
    latitudeDelta: 0.09,
    longitudeDelta: 0.04,
  });

  // Enhanced location hooks
  const { 
    currentLocation, 
    isLoading: locationLoading, 
    error: locationError, 
    locationSource,
    getCurrentLocation,
    isOnline 
  } = useLocation();

  const { 
    nearestDrivers, 
    isSearching, 
    searchDrivers 
  } = useDriverMatching();

  // Request queue integration
  const {
    queueRideRequest,
    queueLocationUpdate,
    queueProfileUpdate,
    queueAnalytics,
    networkQuality,
    networkType,
    queuedRequestsCount
  } = useRequestQueue();

  useEffect(() => {
    initializeLocation();
    
    // Track screen view analytics
    queueAnalytics({
      event: 'screen_view',
      screen: 'home',
      timestamp: Date.now(),
      user_id: userName
    });
  }, []);

  const initializeLocation = async () => {
    try {
      // Request location permissions
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

      // Get current location using enhanced service
      const location = await getCurrentLocation({
        accuracy: Location.Accuracy.High,
        fallbackToGeolocation: true
      });

      if (location) {
        const { latitude, longitude } = location;
        
        // Update map region
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.09,
          longitudeDelta: 0.04,
        });

        // Get city name using reverse geocoding
        await getCityFromLocation(latitude, longitude);
      }

    } catch (error) {
      console.error('Erreur lors de la récupération de la localisation:', error);
      Alert.alert(
        'Erreur de localisation',
        `Impossible de déterminer votre position. ${locationError || 'Vérifiez que la localisation est activée.'}`,
        [
          { text: 'Réessayer', onPress: initializeLocation },
          { text: 'Annuler', style: 'cancel' }
        ]
      );
    }
  };

  const getCityFromLocation = async (latitude, longitude) => {
    try {
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const city = address.city || address.district || address.region || address.subregion || 'Ville inconnue';
        setUserCity(city);
      }
    } catch (error) {
      console.error('Erreur lors du géocodage inverse:', error);
      setUserCity('Kinshasa'); // Fallback for Kinshasa context
    }
  };

  // Mock driver data for demonstration
  const mockDrivers = [
    { id: '1', latitude: -4.4419, longitude: 15.2663, name: 'Driver 1' },
    { id: '2', latitude: -4.4500, longitude: 15.2700, name: 'Driver 2' },
    { id: '3', latitude: -4.4350, longitude: 15.2600, name: 'Driver 3' },
  ];

  const handleSearchDrivers = async () => {
    if (currentLocation) {
      try {
        // Queue location update first
        await queueLocationUpdate({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          timestamp: Date.now()
        });

        // Queue ride request for driver search
        await queueRideRequest({
          pickup: currentLocation,
          destination: null, // Will be set when user selects destination
          rideType: 'standard',
          timestamp: Date.now()
        });

        await searchDrivers(currentLocation, mockDrivers, { maxDrivers: 5, maxDistance: 3000 });
      } catch (error) {
        console.error('Driver search failed:', error);
      }
    }
  };

  const getLocationStatusIcon = () => {
    if (locationLoading) return 'location-outline';
    if (locationError) return 'location-off';
    if (locationSource === 'gps') return 'location';
    if (locationSource === 'geolocation') return 'wifi';
    return 'location-outline';
  };

  const getLocationStatusColor = () => {
    if (locationLoading) return '#FFA500';
    if (locationError) return '#FF3B30';
    if (locationSource === 'gps') return '#34C759';
    if (locationSource === 'geolocation') return '#007AFF';
    return '#fff';
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

      {/* Enhanced Header with location status */}
      <View style={styles.topHeader}>
        <View style={styles.locationContainer}>
          <Ionicons 
            name={getLocationStatusIcon()} 
            size={18} 
            color={getLocationStatusColor()} 
          />
          <Text style={styles.cityText}>{userCity}</Text>
          {!isOnline && (
            <Ionicons name="cloud-offline" size={14} color="#FF9500" style={{ marginLeft: 5 }} />
          )}
        </View>
        
        {/* Network Quality Indicator */}
        <NetworkQualityIndicator />
        
        <TouchableOpacity style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Enhanced search container with driver info */}
      <View style={styles.searchContainer}>
        <TouchableOpacity 
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search" size={24} color="#000" style={{ marginRight: 15, opacity: 0.8 }}/>
          <Text style={styles.searchText}>Où allez-vous ?</Text>
          <Ionicons name="mic" size={22} color="#000" style={{ marginLeft: 'auto', opacity: 0.6 }}/>
        </TouchableOpacity>
        
        {/* Driver availability indicator */}
        {nearestDrivers.length > 0 && (
          <View style={styles.driverInfo}>
            <Ionicons name="car" size={16} color="#34C759" />
            <Text style={styles.driverInfoText}>
              {nearestDrivers.length} conducteur{nearestDrivers.length > 1 ? 's' : ''} à proximité
            </Text>
            {nearestDrivers[0].travelTime && (
              <Text style={styles.driverTimeText}>
                • {Math.round(nearestDrivers[0].travelTime / 60)} min
              </Text>
            )}
          </View>
        )}
        
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
              queueAnalytics({
                event: 'button_click',
                button: 'zeurk_ai',
                screen: 'home',
                timestamp: Date.now()
              });
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
              queueAnalytics({
                event: 'button_click',
                button: 'schedule_ride',
                screen: 'home',
                timestamp: Date.now()
              });
              navigation.navigate('ScheduleRide');
            }}
          >
            <Ionicons name="time" size={18} color="#fff" />
            <Text style={styles.quickButtonText}>Planifier</Text>
          </TouchableOpacity>

          {/* New driver search button */}
          <TouchableOpacity 
            style={[styles.quickButton, isSearching && styles.quickButtonLoading]}
            onPress={handleSearchDrivers}
            disabled={isSearching || !currentLocation}
          >
            <Ionicons 
              name={isSearching ? "refresh" : "people"} 
              size={18} 
              color="#fff" 
            />
            <Text style={styles.quickButtonText}>
              {isSearching ? 'Recherche...' : 'Conducteurs'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Enhanced bottom panel with location source info */}
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
            onPress={() => navigation.navigate('DriverDashboard')}
          >
            <Ionicons name="speedometer" size={20} color="rgba(255, 255, 255, 0.7)" />
            <Text style={[styles.rideTypeText, { color: 'rgba(255, 255, 255, 0.7)' }]}>Drive</Text>
          </TouchableOpacity>
        </View>

        {/* Location source indicator */}
        {locationSource && (
          <View style={styles.locationSourceIndicator}>
            <Text style={styles.locationSourceText}>
              {locationSource === 'gps' ? 'GPS' : 
               locationSource === 'geolocation' ? 'WiFi/Cell' : 'Location'}
              {!isOnline && ' (Hors ligne)'}
            </Text>
          </View>
        )}
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
  },
  cityText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  profileButton: {
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    padding: 12,
    borderRadius: 25,
  },
  searchContainer: {
    position: 'absolute',
    top: '40%',
    left: 20,
    right: 20,
    zIndex: 1000,
    alignItems: 'center',
  },
  searchBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  searchText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  driverInfoText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  driverTimeText: {
    color: '#34C759',
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.8,
  },
  quickDestinations: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  quickButton: {
    backgroundColor: 'rgba(28, 28, 30, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 3,
  },
  quickButtonLoading: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  rideButtons: {
    flexDirection: 'row',
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderRadius: 15,
    padding: 8,
  },
  rideType: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  activeRideType: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
  },
  rideTypeText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  locationSourceIndicator: {
    alignItems: 'center',
    marginTop: 8,
  },
  locationSourceText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '500',
  },
});