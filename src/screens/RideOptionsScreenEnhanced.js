import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
  StatusBar,
  Animated,
  PanResponder,
  ScrollView,
  Image,
  Alert,
  Easing,
  Modal,
  Switch,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_APIKEY } from '@env';
import RideOptionItem from '../components/RideOptionItem';
import { useRouteOptimization, useDriverMatching } from '../hooks/useLocation';

const { width, height } = Dimensions.get('window');
const MENU_HEIGHT = height * 0.61;
const MINIMIZED_HEIGHT = 120;
const EXPANDED_HEIGHT = MENU_HEIGHT;

const rideOptions = [
  {
    id: 'priority',
    name: 'Proche de moi',
    time: 'dans 4 min',
    price: 50.82,
    icon: require('../../assets/icons/flash.png'),
    carColor: '#8B5CF6',
    carImage: require('../../assets/cars/bluecars.png'),
    passengers: null,
    category: 'standard',
  },
  {
    id: 'jet',
    name: 'Jet',
    time: 'dans 2 min',
    price: 25.50,
    icon: require('../../assets/icons/flash.png'),
    carColor: '#FF6B35',
    carImage: require('../../assets/cars/motorbike.png'),
    passengers: null,
    category: 'standard',
  },
  {
    id: 'wait_save',
    name: 'Attendre un peu',
    time: 'dans 20 min',
    price: 41.74,
    icon: require('../../assets/icons/Wait.png'),
    carColor: '#8B5CF6',
    carImage: require('../../assets/cars/bluecars.png'),
    passengers: null,
    category: 'standard',
  },
  {
    id: 'xl',
    name: 'Spacieux',
    time: 'dans 6 min',
    price: 77.66,
    icon: require('../../assets/icons/spacieux.png'),
    carColor: '#3B82F6',
    carImage: require('../../assets/cars/ecd.png'),
    passengers: null,
    category: 'standard',
  },
  {
    id: 'priority_luxe',
    name: 'Proche de moi',
    time: 'dans 3 min',
    price: 75.50,
    icon: require('../../assets/icons/flash.png'),
    carColor: '#8B5CF6',
    carImage: require('../../assets/cars/luxe.png'),
    passengers: null,
    category: 'luxe',
  },
  {
    id: 'wait_save_luxe',
    name: 'Attendre un peu',
    time: 'dans 15 min',
    price: 62.25,
    icon: require('../../assets/icons/Wait.png'),
    carColor: '#8B5CF6',
    carImage: require('../../assets/cars/luxe.png'),
    passengers: null,
    category: 'luxe',
  },
  {
    id: 'xl_luxe',
    name: 'Spacieux',
    time: 'dans 5 min',
    price: 98.40,
    icon: require('../../assets/icons/spacieux.png'),
    carColor: '#3B82F6',
    carImage: require('../../assets/cars/luxe.png'),
    passengers: null,
    category: 'luxe',
  },
];

const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#303030"
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
        "color": "#6a6a6a"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#303030"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#4a4a4a"
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
        "color": "#4a4a4a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4a4a4a"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#525252"
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
        "color": "#1a1a1a"
      }
    ]
  }
];

export default function RideOptionsScreenEnhanced({ route, navigation }) {
  const { startLocation, destination, stops = [] } = route.params;
  
  // Enhanced hooks
  const { 
    route: optimizedRoute, 
    isCalculating, 
    routeError, 
    calculateRoute, 
    clearRoute,
    isOnline 
  } = useRouteOptimization();

  const { 
    nearestDrivers, 
    isSearching, 
    searchDrivers 
  } = useDriverMatching();

  // State management
  const [selectedOption, setSelectedOption] = useState(null);
  const [category, setCategory] = useState('standard');
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [mapRegion, setMapRegion] = useState(null);
  const [routeInfo, setRouteInfo] = useState({
    distance: '',
    duration: '',
    durationWithTraffic: '',
    source: ''
  });
  const [isRouteLoaded, setIsRouteLoaded] = useState(false);

  // Animation values
  const slideAnim = useRef(new Animated.Value(EXPANDED_HEIGHT)).current;
  const [isMinimized, setIsMinimized] = useState(false);

  // Initialize route calculation on component mount
  useEffect(() => {
    if (startLocation && destination) {
      calculateOptimizedRoute();
    }
  }, [startLocation, destination, stops]);

  // Enhanced route calculation using Routes API
  const calculateOptimizedRoute = useCallback(async () => {
    if (!startLocation || !destination) return;

    try {
      setIsRouteLoaded(false);
      
      // Geocode addresses if needed
      const startCoords = await geocodeAddress(startLocation);
      const destCoords = await geocodeAddress(destination);
      
      // Geocode stops if any
      const stopCoords = [];
      for (const stop of stops) {
        const coords = await geocodeAddress(stop);
        if (coords) stopCoords.push(coords);
      }

      // Calculate optimized route using Routes API
      const routeData = await calculateRoute(
        startCoords, 
        destCoords, 
        stopCoords,
        {
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
          computeAlternativeRoutes: false,
          avoidTolls: false,
          avoidHighways: false,
          avoidFerries: true
        }
      );

      if (routeData) {
        // Update route coordinates for map display
        setRouteCoordinates(routeData.points || []);
        
        // Update route information
        setRouteInfo({
          distance: routeData.distance || '',
          duration: routeData.duration || '',
          durationWithTraffic: routeData.durationWithTraffic || routeData.duration || '',
          source: routeData.source || 'unknown'
        });

        // Calculate map region to fit all points
        const allPoints = [startCoords, destCoords, ...stopCoords];
        const region = calculateMapRegionForAllPoints(allPoints);
        setMapRegion(region);

        setIsRouteLoaded(true);

        // Search for nearby drivers
        await searchNearbyDrivers(startCoords);
      }

    } catch (error) {
      console.error('Route calculation failed:', error);
      Alert.alert(
        'Erreur de calcul d\'itinéraire',
        `Impossible de calculer l'itinéraire. ${routeError || 'Vérifiez votre connexion internet.'}`,
        [
          { text: 'Réessayer', onPress: calculateOptimizedRoute },
          { text: 'Annuler', style: 'cancel' }
        ]
      );
    }
  }, [startLocation, destination, stops, calculateRoute, routeError]);

  // Search for nearby drivers
  const searchNearbyDrivers = useCallback(async (location) => {
    // Mock driver data - in real app, this would come from your backend
    const mockDrivers = [
      { id: '1', latitude: location.latitude + 0.001, longitude: location.longitude + 0.001, name: 'Driver 1' },
      { id: '2', latitude: location.latitude - 0.001, longitude: location.longitude + 0.002, name: 'Driver 2' },
      { id: '3', latitude: location.latitude + 0.002, longitude: location.longitude - 0.001, name: 'Driver 3' },
    ];

    try {
      await searchDrivers(location, mockDrivers, { maxDrivers: 10, maxDistance: 5000 });
    } catch (error) {
      console.error('Driver search failed:', error);
    }
  }, [searchDrivers]);

  // Geocode address helper
  const geocodeAddress = useCallback(async (address) => {
    if (typeof address === 'object' && address.latitude && address.longitude) {
      return address;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_APIKEY}&language=fr`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      } else {
        throw new Error(`Geocoding failed: ${data.status}`);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }, []);

  // Calculate map region to fit all points
  const calculateMapRegionForAllPoints = useCallback((points) => {
    if (points.length === 0) return null;

    let minLat = points[0].latitude;
    let maxLat = points[0].latitude;
    let minLng = points[0].longitude;
    let maxLng = points[0].longitude;

    points.forEach(point => {
      minLat = Math.min(minLat, point.latitude);
      maxLat = Math.max(maxLat, point.latitude);
      minLng = Math.min(minLng, point.longitude);
      maxLng = Math.max(maxLng, point.longitude);
    });

    const latDelta = (maxLat - minLat) * 1.5;
    const lngDelta = (maxLng - minLng) * 1.5;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  }, []);

  // Pan responder for bottom sheet
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 20;
      },
      onPanResponderMove: (evt, gestureState) => {
        const newValue = isMinimized 
          ? MINIMIZED_HEIGHT - gestureState.dy
          : EXPANDED_HEIGHT - gestureState.dy;
        
        if (newValue >= MINIMIZED_HEIGHT && newValue <= EXPANDED_HEIGHT) {
          slideAnim.setValue(newValue);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const threshold = (EXPANDED_HEIGHT - MINIMIZED_HEIGHT) / 2;
        const currentValue = slideAnim._value;
        
        if (gestureState.dy > 50 && !isMinimized) {
          // Swipe down - minimize
          Animated.timing(slideAnim, {
            toValue: MINIMIZED_HEIGHT,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }).start();
          setIsMinimized(true);
        } else if (gestureState.dy < -50 && isMinimized) {
          // Swipe up - expand
          Animated.timing(slideAnim, {
            toValue: EXPANDED_HEIGHT,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }).start();
          setIsMinimized(false);
        } else {
          // Return to current state
          Animated.timing(slideAnim, {
            toValue: isMinimized ? MINIMIZED_HEIGHT : EXPANDED_HEIGHT,
            duration: 200,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // Filter ride options by category
  const filteredOptions = useMemo(() => {
    return rideOptions.filter(option => option.category === category);
  }, [category]);

  // Enhanced ride option selection with driver matching
  const handleSelectOption = useCallback((option) => {
    setSelectedOption(option);
    
    // Update estimated arrival times based on nearest drivers
    if (nearestDrivers.length > 0) {
      const nearestDriver = nearestDrivers[0];
      const estimatedTime = nearestDriver.travelTime 
        ? Math.round(nearestDriver.travelTime / 60)
        : parseInt(option.time.match(/\d+/)[0]);
      
      // Update the option with real-time data
      option.time = `dans ${estimatedTime} min`;
    }
  }, [nearestDrivers]);

  const handleConfirmRide = useCallback(() => {
    if (!selectedOption) {
      Alert.alert('Sélection requise', 'Veuillez sélectionner une option de course.');
      return;
    }

    // Pass enhanced route data to confirmation screen
    navigation.navigate('ConfirmPickup', {
      startLocation,
      destination,
      stops,
      selectedOption,
      routeInfo,
      routeCoordinates,
      nearestDrivers: nearestDrivers.slice(0, 3), // Top 3 drivers
      optimizedRoute
    });
  }, [selectedOption, startLocation, destination, stops, routeInfo, routeCoordinates, nearestDrivers, optimizedRoute, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Enhanced Map with route visualization */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={mapStyle}
        region={mapRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsBuildings={false}
        showsTraffic={true}
        showsIndoors={false}
      >
        {/* Start marker */}
        {startLocation && (
          <Marker
            coordinate={typeof startLocation === 'object' ? startLocation : { latitude: 0, longitude: 0 }}
            title="Départ"
            pinColor="#4CAF50"
          />
        )}

        {/* Stop markers */}
        {stops.map((stop, index) => (
          <Marker
            key={index}
            coordinate={typeof stop === 'object' ? stop : { latitude: 0, longitude: 0 }}
            title={`Arrêt ${index + 1}`}
            pinColor="#FF9800"
          />
        ))}

        {/* Destination marker */}
        {destination && (
          <Marker
            coordinate={typeof destination === 'object' ? destination : { latitude: 0, longitude: 0 }}
            title="Destination"
            pinColor="#F44336"
          />
        )}

        {/* Route polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#007AFF"
            strokeWidth={4}
            strokePattern={[1]}
          />
        )}

        {/* Driver markers */}
        {nearestDrivers.map((driver, index) => (
          <Marker
            key={driver.id}
            coordinate={{ latitude: driver.latitude, longitude: driver.longitude }}
            title={`Conducteur ${index + 1}`}
            description={driver.travelTime ? `${Math.round(driver.travelTime / 60)} min` : 'Disponible'}
          >
            <View style={styles.driverMarker}>
              <Ionicons name="car" size={16} color="#fff" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Enhanced route info header */}
      <View style={styles.routeInfoHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.routeDetails}>
          {isCalculating ? (
            <Text style={styles.routeText}>Calcul de l'itinéraire...</Text>
          ) : routeInfo.distance ? (
            <>
              <Text style={styles.routeText}>
                {routeInfo.distance} • {routeInfo.durationWithTraffic}
              </Text>
              <View style={styles.routeSourceIndicator}>
                <Text style={styles.routeSourceText}>
                  {routeInfo.source === 'routes_api' ? 'Routes API' : 
                   routeInfo.source === 'directions_api' ? 'Directions API' : 'Standard'}
                  {!isOnline && ' (Hors ligne)'}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.routeText}>Itinéraire non disponible</Text>
          )}
        </View>

        {nearestDrivers.length > 0 && (
          <View style={styles.driverCount}>
            <Ionicons name="car" size={16} color="#34C759" />
            <Text style={styles.driverCountText}>{nearestDrivers.length}</Text>
          </View>
        )}
      </View>

      {/* Enhanced bottom sheet */}
      <Animated.View 
        style={[styles.bottomSheet, { height: slideAnim }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handle} />
        
        {!isMinimized && (
          <>
            {/* Category selector */}
            <View style={styles.categoryContainer}>
              <TouchableOpacity
                style={[styles.categoryButton, category === 'standard' && styles.activeCategoryButton]}
                onPress={() => setCategory('standard')}
              >
                <Text style={[styles.categoryText, category === 'standard' && styles.activeCategoryText]}>
                  Standard
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.categoryButton, category === 'luxe' && styles.activeCategoryButton]}
                onPress={() => setCategory('luxe')}
              >
                <Text style={[styles.categoryText, category === 'luxe' && styles.activeCategoryText]}>
                  Luxe
                </Text>
              </TouchableOpacity>
            </View>

            {/* Enhanced ride options */}
            <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
              {filteredOptions.map((option) => (
                <RideOptionItem
                  key={option.id}
                  option={option}
                  isSelected={selectedOption?.id === option.id}
                  onSelect={() => handleSelectOption(option)}
                  nearestDriverTime={nearestDrivers.length > 0 ? nearestDrivers[0].travelTime : null}
                />
              ))}
            </ScrollView>

            {/* Enhanced confirm button */}
            <TouchableOpacity
              style={[styles.confirmButton, !selectedOption && styles.disabledButton]}
              onPress={handleConfirmRide}
              disabled={!selectedOption || isCalculating}
            >
              <Text style={styles.confirmButtonText}>
                {isCalculating ? 'Calcul en cours...' : 
                 isSearching ? 'Recherche de conducteurs...' :
                 'Confirmer la course'}
              </Text>
              {selectedOption && !isCalculating && !isSearching && (
                <Text style={styles.confirmButtonPrice}>
                  ${selectedOption.price.toFixed(2)}
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {isMinimized && (
          <TouchableOpacity
            style={styles.minimizedContent}
            onPress={() => {
              Animated.timing(slideAnim, {
                toValue: EXPANDED_HEIGHT,
                duration: 300,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
              }).start();
              setIsMinimized(false);
            }}
          >
            <Text style={styles.minimizedText}>
              {selectedOption ? `${selectedOption.name} • $${selectedOption.price.toFixed(2)}` : 'Sélectionner une option'}
            </Text>
            <Ionicons name="chevron-up" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  map: {
    flex: 1,
  },
  routeInfoHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 12,
  },
  backButton: {
    marginRight: 12,
  },
  routeDetails: {
    flex: 1,
  },
  routeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  routeSourceIndicator: {
    marginTop: 2,
  },
  routeSourceText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  driverCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  driverCountText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  driverMarker: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeCategoryButton: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  activeCategoryText: {
    color: '#fff',
  },
  optionsContainer: {
    maxHeight: 300,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  confirmButtonPrice: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  minimizedContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  minimizedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});