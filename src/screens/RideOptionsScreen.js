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
<<<<<<< HEAD
  ActivityIndicator,
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
<<<<<<< HEAD
import * as Haptics from 'expo-haptics';
import { GOOGLE_MAPS_APIKEY } from '@env';
import RideOptionItem from '../components/RideOptionItem';
import locationService from '../utils/locationService';
import { getConfig, shouldEnableDemoMode, devLog, getMessages, isRealDriver } from '../config/productionConfig';
import rideMatchingService from '../services/rideMatchingService';
import { notificationService } from '../services/notificationService';
=======
import { GOOGLE_MAPS_APIKEY } from '@env';
import RideOptionItem from '../components/RideOptionItem';
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b

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
        "color": "#0c1425"
      }
    ]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2E3A32"
      }
    ]
  }
];

<<<<<<< HEAD
//INVESTOR DEMO: Function to generate demo drivers for presentation
const generateDemoDrivers = (centerLocation) => {
  const demoDrivers = [
    {
      id: 'demo_driver_1',
      lat: centerLocation.latitude + 0.005,
      lng: centerLocation.longitude + 0.003,
      latitude: centerLocation.latitude + 0.005,
      longitude: centerLocation.longitude + 0.003,
      available: true,
      name: 'Jean-Baptiste Mukendi',
      vehicle: 'Toyota Corolla',
      rating: 4.8,
      distance: 0.5,
      category: 'standard'
    },
    {
      id: 'demo_driver_2',
      lat: centerLocation.latitude - 0.003,
      lng: centerLocation.longitude + 0.007,
      latitude: centerLocation.latitude - 0.003,
      longitude: centerLocation.longitude + 0.007,
      available: true,
      name: 'Marie Kasongo',
      vehicle: 'Honda Civic',
      rating: 4.9,
      distance: 0.8,
      category: 'standard'
    },
    {
      id: 'demo_driver_3',
      lat: centerLocation.latitude + 0.008,
      lng: centerLocation.longitude - 0.002,
      latitude: centerLocation.latitude + 0.008,
      longitude: centerLocation.longitude - 0.002,
      available: true,
      name: 'Paul Mbuyi',
      vehicle: 'Nissan Sentra',
      rating: 4.7,
      distance: 1.2,
      category: 'standard'
    },
    {
      id: 'demo_driver_4',
      lat: centerLocation.latitude - 0.006,
      lng: centerLocation.longitude - 0.004,
      latitude: centerLocation.latitude - 0.006,
      longitude: centerLocation.longitude - 0.004,
      available: true,
      name: 'Grace Tshimanga',
      vehicle: 'Mercedes-Benz C-Class',
      rating: 4.9,
      distance: 0.7,
      category: 'luxe'
    },
    {
      id: 'demo_driver_5',
      lat: centerLocation.latitude + 0.002,
      lng: centerLocation.longitude + 0.009,
      latitude: centerLocation.latitude + 0.002,
      longitude: centerLocation.longitude + 0.009,
      available: true,
      name: 'Joseph Kabila',
      vehicle: 'BMW 3 Series',
      rating: 4.8,
      distance: 1.1,
      category: 'luxe'
    }
  ];

  devLog('🎭 Generated demo drivers for investor presentation:', demoDrivers.length);
  return demoDrivers;
};

=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
const LuxePreferencesModal = ({ visible, onClose, onConfirm }) => {
  const [temperature, setTemperature] = useState('no_preference');
  const [quietRide, setQuietRide] = useState(false);
  const [helpWithBags, setHelpWithBags] = useState(false);
  const [securityGuard, setSecurityGuard] = useState(false);

  const handleTemperatureToggle = () => {
<<<<<<< HEAD
    Haptics.selectionAsync();
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    // Basculer entre les trois options: no_preference -> cold -> ambient -> external
    if (temperature === 'no_preference') {
      setTemperature('cold');
    } else if (temperature === 'cold') {
      setTemperature('ambient');
    } else if (temperature === 'ambient') {
      setTemperature('external');
    } else {
      setTemperature('no_preference');
    }
  };

  const getTemperatureText = () => {
    switch (temperature) {
      case 'cold':
        return 'Froid';
      case 'ambient':
        return 'Ambiant';
      case 'external':
        return 'Externe';
      default:
        return 'Aucune préférence';
    }
  };

  const getTemperatureIcon = () => {
    switch (temperature) {
      case 'cold':
        return 'snow-outline';
      case 'ambient':
        return 'thermometer-outline';
      case 'external':
        return 'sunny-outline';
      default:
        return 'thermometer-outline';
    }
  };

  const handleConfirm = () => {
<<<<<<< HEAD
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    // Collecter les préférences
    const preferences = {
      temperature,
      quietRide,
      helpWithBags,
      securityGuard
    };
    
    // Fermer le modal et passer les préférences
    onConfirm(preferences);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
<<<<<<< HEAD
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onClose();
        }}
=======
        onPress={onClose}
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
      >
        <TouchableOpacity 
          style={styles.modalContent}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Personnaliser votre trajet</Text>
<<<<<<< HEAD
            <TouchableOpacity 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onClose();
              }} 
              style={styles.closeButton}
            >
=======
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
<<<<<<< HEAD
          <Text style={styles.modalSubtitle}>Nous informerons votre conducteur de vos préférences.</Text>
=======
          <Text style={styles.modalSubtitle}>Nous informerons votre chauffeur de vos préférences.</Text>
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
          
          <View style={styles.preferenceSection}>
            <TouchableOpacity 
              style={styles.preferenceRow}
              onPress={handleTemperatureToggle}
            >
              <Ionicons name={getTemperatureIcon()} size={24} color="#fff" style={styles.preferenceIcon} />
              <Text style={styles.preferenceText}>Température</Text>
              <View style={[styles.tempOption, styles.tempOptionSelected]}>
                <Text style={styles.tempOptionText}>{getTemperatureText()}</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <View style={styles.preferenceRow}>
              <Ionicons name="volume-mute" size={24} color="#fff" style={styles.preferenceIcon} />
              <Text style={styles.preferenceText}>Trajet silencieux</Text>
              <Switch
                value={quietRide}
<<<<<<< HEAD
                onValueChange={(value) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setQuietRide(value);
                }}
=======
                onValueChange={setQuietRide}
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
                trackColor={{ false: '#3e3e3e', true: '#B76E2D' }}
                thumbColor={quietRide ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.preferenceRow}>
              <FontAwesome5 name="luggage-cart" size={20} color="#fff" style={styles.preferenceIcon} />
              <Text style={styles.preferenceText}>Aide avec les bagages</Text>
              <Switch
                value={helpWithBags}
<<<<<<< HEAD
                onValueChange={(value) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setHelpWithBags(value);
                }}
=======
                onValueChange={setHelpWithBags}
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
                trackColor={{ false: '#3e3e3e', true: '#B76E2D' }}
                thumbColor={helpWithBags ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.preferenceRow}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#fff" style={styles.preferenceIcon} />
              <Text style={styles.preferenceText}>Garde rapprochée</Text>
              <Switch
                value={securityGuard}
<<<<<<< HEAD
                onValueChange={(value) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSecurityGuard(value);
                }}
=======
                onValueChange={setSecurityGuard}
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
                trackColor={{ false: '#3e3e3e', true: '#B76E2D' }}
                thumbColor={securityGuard ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            {securityGuard && (
              <View style={styles.securityNoteContainer}>
                <Text style={styles.securityNoteText}>
<<<<<<< HEAD
                  Le conducteur sera informé que vous voyagez avec une sécurité personnelle et prévoira l'espace nécessaire.
=======
                  Le chauffeur sera informé que vous voyagez avec une sécurité personnelle et prévoira l'espace nécessaire.
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity style={styles.nextButton} onPress={handleConfirm}>
            <Text style={styles.nextButtonText}>Suivant</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default function RideOptionsScreen({ route, navigation }) {
  const { startLocation, destination, stops = [] } = route.params;
  
  const [selectedOption, setSelectedOption] = useState('priority');
  const [selectedCategory, setSelectedCategory] = useState('standard');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [arrivalTime, setArrivalTime] = useState(null);
  const [travelDuration, setTravelDuration] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  const [trafficColor, setTrafficColor] = useState('#06D6A0'); // Default color for light traffic
  
<<<<<<< HEAD
  // CONGO: Driver detection states - COMMENTED OUT FOR INVESTOR DEMO
  // const [nearbyDrivers, setNearbyDrivers] = useState([]);
  // const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
  // const [driverListener, setDriverListener] = useState(null);
  const [isInDemoMode, setIsInDemoMode] = useState(true); // 🎭 Mode démo pour afficher tous les chauffeurs
  
  // TEMPS RÉEL: États pour la communication bidirectionnelle - COMMENTED OUT FOR INVESTOR DEMO
  // const [passengerPosition, setPassengerPosition] = useState(null);
  // const [selectedDriverId, setSelectedDriverId] = useState(null);
  // const [driverPositions, setDriverPositions] = useState(new Map()); // Cache des positions chauffeurs
  // const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  // const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting, connected, disconnected
  
  // MATCHING AUTOMATIQUE: États pour le système de matching - COMMENTED OUT FOR INVESTOR DEMO
  // const [isMatching, setIsMatching] = useState(false);
  // const [matchingError, setMatchingError] = useState(null);
  // const [rideRequest, setRideRequest] = useState(null);
  // const [assignedDriver, setAssignedDriver] = useState(null);
  
  // INVESTOR DEMO: Simplified states for demo mode
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connected'); // Always show connected for demo
  
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  const [startCoordinates, setStartCoordinates] = useState(null);
  const [stopCoordinates, setStopCoordinates] = useState([]);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [mapRegion, setMapRegion] = useState({
    latitude: -4.4419,
    longitude: 15.2663,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const [mapPadding, setMapPadding] = useState({ 
    bottom: MENU_HEIGHT, 
    top: 50, 
    right: 20, 
    left: 20 
  });

  const translateY = useRef(new Animated.Value(0)).current;
  const markerAnimation = useRef(new Animated.Value(0)).current;

  const [showLuxePreferences, setShowLuxePreferences] = useState(false);
<<<<<<< HEAD
  
  // INVESTOR DEMO: Removed unused state variables
  // const [selectedDriverId, setSelectedDriverId] = useState(null);
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b

  const filteredOptions = useMemo(() => {
    return rideOptions.filter(option => option.category === selectedCategory);
  }, [selectedCategory]);

  const handleOptionSelect = useCallback((optionId) => {
<<<<<<< HEAD
    Haptics.selectionAsync();
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    setSelectedOption(optionId);
  }, []);

  const handleCategoryChange = useCallback((category) => {
<<<<<<< HEAD
    Haptics.selectionAsync();
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    setSelectedCategory(category);
    const defaultOption = category === 'standard' ? 'priority' : 'priority_luxe';
    setSelectedOption(defaultOption);
  }, []);

  const geocodeAddress = useCallback(async (address) => {
    try {
      if (address === 'Position actuelle') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Permission de géolocalisation refusée');
        }
        const location = await Location.getCurrentPositionAsync({});
        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }

      const response = await fetch(
<<<<<<< HEAD
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_APIKEY}`
=======
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&components=country:CD&key=${GOOGLE_MAPS_APIKEY}`
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      }
      throw new Error('Adresse non trouvée');
    } catch (error) {
      console.error('Erreur géocodage:', error);
      return null;
    }
  }, []);

  const getDirectionsWithStops = useCallback(async (start, stops, end) => {
    try {
      const waypointsParam = stops.map(stop => 
        `${stop.latitude},${stop.longitude}`
      ).join('|');

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}${stops.length ? `&waypoints=${waypointsParam}` : ''}&key=${GOOGLE_MAPS_APIKEY}&language=fr&departure_time=now&traffic_model=best_guess`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const points = decodePolyline(route.overview_polyline.points);
        
        let durationWithTraffic = 0;
        let durationWithoutTraffic = 0;

        route.legs.forEach(leg => {
          durationWithTraffic += leg.duration_in_traffic ? leg.duration_in_traffic.value : leg.duration.value;
          durationWithoutTraffic += leg.duration.value;
        });

        return { points, durationWithTraffic, durationWithoutTraffic };
      }
      return { points: [], durationWithTraffic: null, durationWithoutTraffic: null };
    } catch (error) {
      console.error('Erreur directions:', error);
      return { points: [], durationWithTraffic: null, durationWithoutTraffic: null };
    }
  }, []);

  const decodePolyline = useCallback((encoded) => {
    const points = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return points;
  }, []);

  const calculateMapRegionForAllPoints = useCallback((points) => {
    const latitudes = points.map(p => p.latitude);
    const longitudes = points.map(p => p.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const latDelta = Math.max(maxLat - minLat, 0.01) * 1.5;
    const lngDelta = Math.max(maxLng - minLng, 0.01) * 1.5;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }, []);

  const parsePickupTime = useCallback((timeString) => {
    if (typeof timeString !== 'string') return 0;
    const matches = timeString.match(/(\d+)/);
    if (matches) {
      return parseInt(matches[1], 10);
    }
    return 0;
  }, []);

<<<<<<< HEAD
  // ========================================
  // TEMPS RÉEL: Fonctions de Communication Bidirectionnelle
  // ========================================

  /**
   * Initialiser la position du passager et démarrer le tracking - COMMENTED OUT FOR INVESTOR DEMO
   */
  const initializePassengerPosition = useCallback(async () => {
    // FOR INVESTOR DEMO: Return mock position
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission de géolocalisation refusée');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const position = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: Date.now(),
        accuracy: location.coords.accuracy
      };

      // setPassengerPosition(position); // COMMENTED OUT FOR INVESTOR DEMO
      devLog('📍 Position passager initialisée:', position);
      return position;
    } catch (error) {
      console.error('❌ Erreur initialisation position passager:', error);
      return null;
    }
  }, []);

  /**
   * Mettre à jour le cache des positions chauffeurs - COMMENTED OUT FOR INVESTOR DEMO
   */
  const updateDriverPositionsCache = useCallback((drivers) => {
    // COMMENTED OUT FOR INVESTOR DEMO
    // const newPositions = new Map();
    // 
    // drivers.forEach(driver => {
    //   newPositions.set(driver.id, {
    //     latitude: driver.lat || driver.latitude,
    //     longitude: driver.lng || driver.longitude,
    //     available: driver.available,
    //     distance: driver.distance,
    //     timestamp: driver.timestamp || Date.now(),
    //     isDemoMode: driver.isDemoMode || false
    //   });
    // });
    
    // setDriverPositions(newPositions);
    // setLastUpdateTime(Date.now());
    devLog(`🔄 Cache positions mis à jour: ${drivers?.length || 0} chauffeurs`);
  }, []);

  /**
   * Calculer la distance entre deux points
   */
  const calculateDistance = useCallback((pos1, pos2) => {
    if (!pos1 || !pos2) return null;
    
    const R = 6371; // Rayon de la Terre en km
    const dLat = (pos2.latitude - pos1.latitude) * Math.PI / 180;
    const dLon = (pos2.longitude - pos1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pos1.latitude * Math.PI / 180) * Math.cos(pos2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  /**
   * Sélectionner un chauffeur et démarrer le tracking spécifique
   * COMMENTED OUT FOR INVESTOR DEMO - Real-time tracking disabled
   */
  const selectDriver = useCallback((driverId) => {
    // FOR INVESTOR DEMO: Simplified selection without real-time tracking
    devLog(`🎯 Chauffeur sélectionné: ${driverId} (demo mode)`);
    // In demo mode, we don't use driverPositions or passengerPosition
  }, []);

  /**
   * Obtenir les informations temps réel d'un chauffeur spécifique
   * COMMENTED OUT FOR INVESTOR DEMO - Real-time info disabled
   */
  const getDriverRealTimeInfo = useCallback((driverId) => {
    // FOR INVESTOR DEMO: Return simplified demo info
    return {
      distance: '1.2',
      lastUpdate: Date.now(),
      isStale: false,
      available: true,
      isDemoMode: true
    };
  }, []);

=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  useEffect(() => {
    let isMounted = true;
    
    const loadRouteData = async () => {
      if (!isMounted) return;
      setIsLoadingRoute(true);
      
      try {
        const geocodePromises = [
          geocodeAddress(startLocation),
          ...stops.map(stop => geocodeAddress(stop)),
          geocodeAddress(destination)
        ];

        const coordinates = await Promise.all(geocodePromises);
        
        if (!isMounted) return;

        if (coordinates.some(coord => !coord)) {
          Alert.alert('Erreur', 'Impossible de localiser toutes les adresses');
          return;
        }

        const [startCoords, ...restCoords] = coordinates;
        const destCoords = restCoords.pop();
        const stopCoords = restCoords;

<<<<<<< HEAD
        console.log('📍 Setting startCoordinates:', startCoords);
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
        setStartCoordinates(startCoords);
        setStopCoordinates(stopCoords);
        setDestinationCoordinates(destCoords);

        markerAnimation.setValue(0);
        Animated.spring(markerAnimation, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }).start();

        const allPoints = [startCoords, ...stopCoords, destCoords];
        const region = calculateMapRegionForAllPoints(allPoints);
        setMapRegion(region);

        const { points, durationWithTraffic, durationWithoutTraffic } = await getDirectionsWithStops(startCoords, stopCoords, destCoords);
        
        if (!isMounted) return;
        
        setRouteCoordinates(points);
        setTravelDuration(durationWithTraffic);

        // Determine traffic color
        if (durationWithTraffic && durationWithoutTraffic) {
          const ratio = durationWithTraffic / durationWithoutTraffic;
          if (ratio > 1.6) {
            setTrafficColor('#FF6B6B'); // Red for heavy traffic
          } else if (ratio > 1.2) {
            setTrafficColor('#FFD166'); // Orange for medium traffic
          } else {
            setTrafficColor('#06D6A0'); // Green for light traffic
          }
        }

      } catch (error) {
        if (isMounted) {
          console.error('Erreur chargement route:', error);
          Alert.alert('Erreur', 'Impossible de charger l\'itinéraire');
        }
      } finally {
        if (isMounted) {
          setIsLoadingRoute(false);
        }
      }
    };

    loadRouteData();
    
    return () => {
      isMounted = false;
    };
  }, [startLocation, stops, destination, geocodeAddress, getDirectionsWithStops, calculateMapRegionForAllPoints]);

<<<<<<< HEAD
  // ========================================
  // CONGO: Enhanced Driver Detection with Real-Time Communication - COMMENTED OUT FOR INVESTOR DEMO
  // ========================================
  const findNearbyDrivers = useCallback(async (userLocation = null, forceRefresh = false) => {
    // COMMENTED OUT FOR INVESTOR DEMO - Using simplified demo mode
    // if (isLoadingDrivers && !forceRefresh) {
    //   devLog('🔄 Recherche déjà en cours, ignorée');
    //   return;
    // }

    try {
      // setIsLoadingDrivers(true); // REMOVED - Driver search UI not needed
      setConnectionStatus('connected'); // Always connected for demo
      
      // FOR INVESTOR DEMO: Skip real-time detection and passenger position
      let passengerPos = { latitude: -4.4419, longitude: 15.2663 }; // Default demo location

      const location = userLocation || passengerPos;
      devLog('🔍 Recherche chauffeurs depuis:', location);

      // COMMENTED OUT: Real-time listener cleanup
      // if (driverListener) {
      //   devLog('🧹 Nettoyage ancien listener');
      //   driverListener();
      //   setDriverListener(null);
      // }

      // FOR INVESTOR DEMO: Use demo drivers directly
      const demoDrivers = generateDemoDrivers(location);
      setNearbyDrivers(demoDrivers);
      setIsInDemoMode(true); // Always demo mode for investor presentation
      setConnectionStatus('connected');
      // setIsLoadingDrivers(false); // REMOVED - Driver search UI not needed
      
      devLog('✅ Demo drivers loaded for investor presentation');

    } catch (error) {
      console.error('❌ Erreur recherche chauffeurs:', error);
      // setIsLoadingDrivers(false); // REMOVED - Driver search UI not needed
      setConnectionStatus('connected'); // Always connected for demo
      
      // FOR INVESTOR DEMO: Use demo drivers as fallback
      const location = userLocation || { latitude: -4.4419, longitude: 15.2663 };
      const demoDrivers = generateDemoDrivers(location);
      setNearbyDrivers(demoDrivers);
      setIsInDemoMode(true);
    }
  }, [
    // isLoadingDrivers, // REMOVED - Driver search UI not needed
    // driverListener, // COMMENTED OUT
    // passengerPosition, // COMMENTED OUT FOR INVESTOR DEMO
    initializePassengerPosition,
    // updateDriverPositionsCache, // COMMENTED OUT
    // getDriverRealTimeInfo // COMMENTED OUT
  ]);

  // CONGO: Driver detection useEffect - COMMENTED OUT FOR INVESTOR DEMO
  useEffect(() => {
    // COMMENTED OUT FOR INVESTOR DEMO - Using simplified demo mode
    
    const startDriverDetection = async () => {
      if (!startCoordinates) {
        devLog('🚗 Driver detection: startCoordinates not available yet');
        return;
      }
      
      devLog('🚗 Starting DEMO mode for investor presentation at:', startCoordinates);
      // setIsLoadingDrivers(true); // REMOVED - Driver search UI not needed
      
      try {
        // FOR INVESTOR DEMO: Use demo drivers directly
        await initializePassengerPosition();
        
        const demoDrivers = generateDemoDrivers(startCoordinates);
        setNearbyDrivers(demoDrivers);
        setIsInDemoMode(true); // Always demo mode for investor presentation
        setConnectionStatus('connected'); // Always connected for demo
        // setIsLoadingDrivers(false); // REMOVED - Driver search UI not needed
        
        devLog('✅ Demo drivers loaded for investor presentation:', demoDrivers.length);
        
      } catch (error) {
        console.error('❌ Échec détection chauffeurs:', error);
        // setIsLoadingDrivers(false); // REMOVED - Driver search UI not needed
        setConnectionStatus('connected'); // Always connected for demo
        
        // FOR INVESTOR DEMO: Use demo drivers as fallback
        const demoDrivers = generateDemoDrivers(startCoordinates || { latitude: -4.4419, longitude: 15.2663 });
        setNearbyDrivers(demoDrivers);
        setIsInDemoMode(true);
        devLog('✅ Demo drivers fallback loaded:', demoDrivers.length);
      }
    };

    startDriverDetection();
    
    // COMMENTED OUT: Real-time listener cleanup
    // return () => {
    //   if (unsubscribe) {
    //     devLog('🛑 Nettoyage listener chauffeurs');
    //     unsubscribe();
    //   }
    // };
  }, [startCoordinates, initializePassengerPosition]);

=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  useEffect(() => {
    if (travelDuration !== null) {
      const selected = filteredOptions.find(opt => opt.id === selectedOption);
      const pickupMinutes = selected ? parsePickupTime(selected.time) : 0;
      
      const totalDurationInSeconds = travelDuration + (pickupMinutes * 60);
      const arrival = new Date(Date.now() + totalDurationInSeconds * 1000);
      setArrivalTime(arrival.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    }
  }, [travelDuration, selectedOption, filteredOptions, parsePickupTime]);

  useEffect(() => {
    translateY.setValue(0);
  }, [translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
      onPanResponderGrant: () => {
        translateY.setOffset(translateY._value);
        translateY.setValue(0);
      },
      onPanResponderMove: Animated.event([null, { dy: translateY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();
        
        const targetValue = gestureState.dy > (EXPANDED_HEIGHT - MINIMIZED_HEIGHT) / 2 || gestureState.vy > 0.5
          ? EXPANDED_HEIGHT - MINIMIZED_HEIGHT
          : 0;

        Animated.spring(translateY, {
          toValue: targetValue,
          useNativeDriver: false,
          tension: 80,
          friction: 8,
        }).start();
        
        const newIsExpanded = targetValue === 0;
        setIsExpanded(newIsExpanded);
        
        setMapPadding(prev => ({ ...prev, bottom: newIsExpanded ? MENU_HEIGHT : MINIMIZED_HEIGHT }));
      },
    })
  ).current;

  const markerStyle = {
    opacity: markerAnimation,
    transform: [
      {
        translateY: markerAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [-30, 0],
        }),
      },
      {
        scale: markerAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        }),
      },
    ],
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.selectedPayment) {
        setSelectedPayment(route.params.selectedPayment);
      }
    });
    return unsubscribe;
  }, [navigation, route.params?.selectedPayment]);

<<<<<<< HEAD
  // MATCHING AUTOMATIQUE: Nettoyage des écouteurs - REMOVED FOR INVESTOR DEMO
  // useEffect(() => {
  //   return () => {
  //     // Nettoyer les écouteurs de matching quand le composant se démonte
  //     if (rideRequest) {
  //       rideMatchingService.cancelRideRequest(rideRequest.id).catch(console.error);
  //     }
  //     notificationService.cleanupUserListeners('passenger_123', 'passenger');
  //   };
  // }, [rideRequest]);

=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  const getPaymentDisplay = useCallback(() => {
    if (!selectedPayment) return "Choisir le mode de paiement";
    return selectedPayment.type;
  }, [selectedPayment]);

  const getPaymentIcon = useCallback(() => {
    if (!selectedPayment) return "payment";
    switch (selectedPayment.id) {
      case 'airtel_money': case 'orange_money': case 'mpesa': return "phone-android";
      case 'credit_card': return "credit-card";
      case 'cash': return "attach-money";
      default: return "payment";
    }
  }, [selectedPayment]);

  const getPaymentColor = useCallback(() => {
    if (!selectedPayment) {
      return selectedCategory === 'luxe' ? '#B76E2D' : '#3B82F6';
    }
    return selectedPayment.color || (selectedCategory === 'luxe' ? '#B76E2D' : '#3B82F6');
  }, [selectedPayment, selectedCategory]);

  const handleLuxePreferencesConfirm = (preferences) => {
    setShowLuxePreferences(false);
    
    const selectedRide = filteredOptions.find(opt => opt.id === selectedOption);
    
<<<<<<< HEAD
    // Naviguer directement vers ConfirmPickupScreen avec les préférences luxe
      navigation.navigate('ConfirmPickup', {
=======
    // Naviguer vers l'écran de confirmation du point de départ avec les préférences
    navigation.navigate('ConfirmPickup', {
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
      ride: selectedRide,
      startLocation,
      destination,
      arrivalTime,
      category: selectedCategory,
      luxePreferences: preferences,
      stops
    });
  };

<<<<<<< HEAD
  // REMOVED FOR INVESTOR DEMO: All matching functions removed as navigation goes directly to ConfirmPickupScreen

=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
        <TouchableOpacity 
        style={styles.headerPill}
<<<<<<< HEAD
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
=======
          onPress={() => navigation.goBack()}
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={18} color="#fff" style={styles.backIcon} />
        <View style={styles.routeContainer}>
          <Text style={styles.routeText}>
            {startLocation.split(',')[0]}
            {stops.map((stop, index) => (
              <Text key={index}>
                <Text style={styles.arrow}> → </Text>
                {stop.split(',')[0]}
              </Text>
            ))}
            <Text style={styles.arrow}> → </Text>
            {destination.split(',')[0]}
          </Text>
        </View>
      </TouchableOpacity>

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={mapStyle}
        region={mapRegion}
        mapPadding={mapPadding}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsTraffic={false}
      >
        {routeCoordinates.length > 0 && (
          <Polyline
            key={trafficColor}
            coordinates={routeCoordinates}
            strokeColors={[trafficColor, trafficColor]}
            strokeWidth={4}
          />
        )}
        
        {startCoordinates && (
          <Marker coordinate={startCoordinates} title="Départ" description={startLocation} anchor={{ x: 0.5, y: 0.5 }}>
            <Animated.View style={markerStyle}>
              <View style={styles.startMarker}><View style={styles.startMarkerDot} /></View>
            </Animated.View>
          </Marker>
        )}

        {stopCoordinates.map((coord, index) => (
          <Marker key={index} coordinate={coord} title={`Arrêt ${index + 1}`} description={stops[index]} anchor={{ x: 0.5, y: 0.5 }}>
            <Animated.View style={markerStyle}>
              <View style={styles.stopMarker}><Text style={styles.stopMarkerText}>{index + 1}</Text></View>
            </Animated.View>
          </Marker>
        ))}

        {destinationCoordinates && (
          <Marker coordinate={destinationCoordinates} title="Destination" description={destination} anchor={{ x: 0.5, y: 1 }}>
            <Animated.View style={[styles.pinContainer, markerStyle]}>
              <View style={[styles.pinBody, { backgroundColor: trafficColor }]}>
                <Text style={styles.pinLabel}>Arrive à</Text>
                <Text style={styles.pinTime}>{arrivalTime || '...'}</Text>
              </View>
              <View style={[styles.pinTail, { borderTopColor: trafficColor }]} />
            </Animated.View>
          </Marker>
        )}
<<<<<<< HEAD

        {/* CONGO: Driver markers - COMMENTED OUT FOR INVESTOR DEMO - Car UI not needed */}
        {/* {nearbyDrivers.map((driver) => {
          const realTimeInfo = getDriverRealTimeInfo(driver.id);
          const isSelected = false;
          const isStale = false;
          
          console.log('🚗 Rendering driver marker:', driver.id, driver.lat, driver.lng, realTimeInfo);
          return (
            <Marker
              key={driver.id}
              coordinate={{
                latitude: driver.lat,
                longitude: driver.lng
              }}
              title={`Chauffeur ${driver.id}`}
              description={`Distance: ${realTimeInfo?.distance || driver.distance?.toFixed(1) || '?'}km (Démo)`}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={[
                styles.driverMarker,
                styles.selectedDriverMarker
              ]}>
                <Ionicons 
                  name="car" 
                  size={16} 
                  color="#00C851" 
                />
                <View style={styles.liveIndicator} />
                {realTimeInfo?.distance && (
                  <View style={styles.distanceBadge}>
                    <Text style={styles.distanceText}>
                      {realTimeInfo.distance}km
                    </Text>
                  </View>
                )}
              </View>
            </Marker>
          );
        })} */}

        {/* Marqueur de la position du passager - COMMENTED OUT FOR INVESTOR DEMO */}
        {/* {passengerPosition && (
          <Marker
            coordinate={passengerPosition}
            title="Votre position"
            description="Position actuelle du passager"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.passengerMarker}>
              <View style={styles.passengerDot} />
              <View style={styles.passengerPulse} />
            </View>
          </Marker>
        )} */}
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
      </MapView>

      {isLoadingRoute && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Chargement de l'itinéraire...</Text>
        </View>
      )}

<<<<<<< HEAD
      {/* REMOVED FOR INVESTOR DEMO - Driver search UI not needed
      {isLoadingDrivers && (
        <View style={styles.driversLoadingOverlay}>
          <View style={styles.driversLoadingContainer}>
            <ActivityIndicator size="small" color="#00C851" />
            <Text style={styles.driversLoadingText}>Recherche de chauffeurs...</Text>
          </View>
        </View>
      )}
      */}

      {/* Indicateur de statut de connexion temps réel - COMMENTED OUT FOR INVESTOR DEMO */}
      {/* <View style={styles.connectionStatusOverlay}>
        <View style={[
          styles.connectionStatusContainer,
          connectionStatus === 'connected' && styles.connectedStatus,
          connectionStatus === 'connecting' && styles.connectingStatus,
          connectionStatus === 'disconnected' && styles.disconnectedStatus
        ]}>
          <View style={[
            styles.connectionDot,
            connectionStatus === 'connected' && styles.connectedDot,
            connectionStatus === 'connecting' && styles.connectingDot,
            connectionStatus === 'disconnected' && styles.disconnectedDot
          ]} />
          <Text style={[
            styles.connectionStatusText,
            connectionStatus === 'connected' && styles.connectedText,
            connectionStatus === 'connecting' && styles.connectingText,
            connectionStatus === 'disconnected' && styles.disconnectedText
          ]}>
            {connectionStatus === 'connected' && `${nearbyDrivers.length} chauffeurs en temps réel`}
            {connectionStatus === 'connecting' && 'Connexion...'}
            {connectionStatus === 'disconnected' && 'Hors ligne'}
          </Text>
          {connectionStatus === 'connected' && (
            <Text style={styles.lastUpdateText}>
              Mis à jour il y a {Math.floor((Date.now() - lastUpdateTime) / 1000)}s
            </Text>
          )}
        </View>
      </View> */}

      {/* REMOVED FOR INVESTOR DEMO: All matching UI sections removed */}

=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
      <Animated.View style={[styles.menuContainer, { transform: [{ translateY }] }]}>
        <View style={styles.dragHandle} {...panResponder.panHandlers}>
          <View style={styles.dragIndicator} />
        </View>
        <View style={styles.menuContent}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleButton, selectedCategory === 'standard' && styles.toggleButtonActive]}
              onPress={() => handleCategoryChange('standard')}>
              <Text style={[styles.toggleText, selectedCategory === 'standard' && styles.toggleTextActive]}>Standard</Text>
            </TouchableOpacity>
              <TouchableOpacity
              style={[styles.toggleButton, selectedCategory === 'luxe' && styles.toggleButtonLuxe]}
              onPress={() => handleCategoryChange('luxe')}>
              <View style={styles.luxeContainer}>
                <Ionicons name="star" size={12} color={selectedCategory === 'luxe' ? '#000' : '#B76E2D'} style={styles.luxeIcon} />
                <Text style={[styles.toggleText, selectedCategory === 'luxe' && styles.toggleTextLuxe]}>Luxe</Text>
              </View>
              </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false} scrollEnabled={isExpanded}>
            {filteredOptions.map((option) => (
              <RideOptionItem
                key={option.id}
                option={option}
                isSelected={selectedOption === option.id}
                onSelect={handleOptionSelect}
              />
            ))}
          </ScrollView>

          <View style={styles.paymentSection}>
            <TouchableOpacity 
              style={styles.paymentMethod}
<<<<<<< HEAD
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('Payment', {
                  selectedRide: filteredOptions.find(opt => opt.id === selectedOption),
                  startLocation,
                  destination,
                  arrivalTime,
                  category: selectedCategory,
                  currentPayment: selectedPayment,
                  onSelect: (payment) => setSelectedPayment(payment)
                });
              }}
=======
              onPress={() => navigation.navigate('Payment', {
                selectedRide: filteredOptions.find(opt => opt.id === selectedOption),
                startLocation,
                destination,
                arrivalTime,
                category: selectedCategory,
                currentPayment: selectedPayment,
                onSelect: (payment) => setSelectedPayment(payment)
              })}
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
            >
              <View style={styles.paymentLeft}>
                <View style={[styles.paymentIcon, { backgroundColor: getPaymentColor() }]}>
                  <MaterialIcons name={getPaymentIcon()} size={16} color="#fff" />
                </View>
                <Text style={styles.paymentText}>{getPaymentDisplay()}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
            
<<<<<<< HEAD

=======
            <TouchableOpacity style={styles.scheduleButton}>
              <MaterialIcons name="schedule" size={20} color="#fff" />
              <Text style={styles.scheduleText}>Planifier</Text>
            </TouchableOpacity>
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
          </View>

          <TouchableOpacity 
            style={[styles.confirmButton, selectedCategory === 'standard' ? styles.confirmButtonStandard : styles.confirmButtonLuxe]}
            onPress={() => {
<<<<<<< HEAD
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
              const selectedRide = filteredOptions.find(opt => opt.id === selectedOption);
              
              if (selectedCategory === 'luxe') {
                setShowLuxePreferences(true);
              } else {
<<<<<<< HEAD
                // Naviguer directement vers ConfirmPickupScreen
      navigation.navigate('ConfirmPickup', {
=======
                navigation.navigate('ConfirmPickup', {
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
                  ride: selectedRide,
                  startLocation,
                  destination,
                  arrivalTime,
                  category: selectedCategory,
                  stops
                });
              }
            }}
          >
            <Text style={[styles.confirmButtonText, selectedCategory === 'luxe' && styles.confirmButtonTextLuxe]}>
              Suivant
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <LuxePreferencesModal 
        visible={showLuxePreferences} 
        onClose={() => setShowLuxePreferences(false)}
        onConfirm={handleLuxePreferencesConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  headerPill: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 10,
    alignSelf: 'center',
    backgroundColor: '#000000',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  backIcon: {
    marginRight: 12,
  },
  routeContainer: {
    marginRight: 12,
  },
  routeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
  },
  arrow: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '300',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: MENU_HEIGHT,
    backgroundColor: '#000000',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  dragHandle: {
    width: '100%',
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dragIndicator: {
    width: 36,
    height: 4,
    backgroundColor: '#666',
    borderRadius: 2,
  },
  menuContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  optionsList: {
    flex: 1,
  },
  paymentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 0,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0,
    marginRight: 8,
  },
  paymentIcon: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
  },
  paymentText: {
    color: '#fff',
    fontSize: 16,
  },
<<<<<<< HEAD

=======
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scheduleText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  confirmButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  confirmButtonStandard: {
    backgroundColor: '#3B82F6',
  },
  confirmButtonLuxe: {
    backgroundColor: '#B76E2D',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  confirmButtonTextLuxe: {
    color: '#000',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'rgba(80, 80, 80, 0.3)',
    borderRadius: 25,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 21,
    backgroundColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: '#3B82F6',
  },
  toggleButtonLuxe: {
    backgroundColor: '#B76E2D',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  toggleText: {
    color: '#fff',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
  },
  toggleTextLuxe: {
    color: '#000',
  },
  luxeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  luxeIcon: {
    marginRight: 4,
  },
  stopMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  stopMarkerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  startMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#fff',
  },
  pinContainer: {
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8,
  },
  pinBody: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
  },
  pinLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '600',
  },
  pinTime: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  closeButton: {
    padding: 5,
  },
  modalSubtitle: {
    color: '#8E8E93',
    fontSize: 16,
    marginBottom: 25,
  },
  preferenceSection: {
    marginBottom: 30,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  preferenceIcon: {
    marginRight: 15,
    width: 30,
  },
  preferenceText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
  },
  tempOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  tempOptionSelected: {
    backgroundColor: '#B76E2D',
  },
  tempOptionText: {
    color: '#fff',
    fontSize: 14,
  },
  nextButton: {
    backgroundColor: '#B76E2D',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  nextButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  securityNoteContainer: {
    backgroundColor: 'rgba(183, 110, 45, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    marginBottom: 5,
  },
  securityNoteText: {
    color: '#B76E2D',
    fontSize: 12,
    fontStyle: 'italic',
  },
<<<<<<< HEAD
  // CONGO: Driver marker styles with Real-Time Communication
  driverMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    position: 'relative',
  },
  selectedDriverMarker: {
    backgroundColor: '#00C851',
    borderColor: '#00C851',
    transform: [{ scale: 1.2 }],
  },
  staleDriverMarker: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
    opacity: 0.7,
  },
  statusIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  liveIndicator: {
    backgroundColor: '#00C851',
  },
  staleIndicator: {
    backgroundColor: '#FF6B6B',
  },
  distanceBadge: {
    position: 'absolute',
    bottom: -20,
    left: '50%',
    transform: [{ translateX: -15 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 30,
  },
  distanceText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  passengerMarker: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  passengerDot: {
    width: 12,
    height: 12,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
  },
  passengerPulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    borderRadius: 10,
    zIndex: 1,
  },
  /* REMOVED FOR INVESTOR DEMO - Driver search styles not needed
  driversLoadingOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 60,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  driversLoadingContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 81, 0.3)',
  },
  driversLoadingText: {
    color: '#00C851',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  */
  // Styles pour l'indicateur de statut de connexion temps réel
  connectionStatusOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 140 : 100,
    left: 20,
    right: 20,
    zIndex: 999,
  },
  connectionStatusContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  connectedStatus: {
    borderColor: 'rgba(0, 200, 81, 0.5)',
    backgroundColor: 'rgba(0, 200, 81, 0.1)',
  },
  connectingStatus: {
    borderColor: 'rgba(255, 193, 7, 0.5)',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  disconnectedStatus: {
    borderColor: 'rgba(255, 107, 107, 0.5)',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connectedDot: {
    backgroundColor: '#00C851',
  },
  connectingDot: {
    backgroundColor: '#FFC107',
  },
  disconnectedDot: {
    backgroundColor: '#FF6B6B',
  },
  connectionStatusText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  connectedText: {
    color: '#00C851',
  },
  connectingText: {
    color: '#FFC107',
  },
  disconnectedText: {
    color: '#FF6B6B',
  },
  lastUpdateText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 8,
  },
  // MATCHING AUTOMATIQUE: Styles pour les overlays
  matchingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  matchingContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 40,
    borderWidth: 1,
    borderColor: '#333',
  },
  matchingTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
  matchingSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  // REMOVED FOR INVESTOR DEMO: rideRequestInfo, rideRequestText, rideRequestPrice styles removed
  cancelMatchingButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 20,
  },
  cancelMatchingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  errorContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 40,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  errorTitle: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
=======
}); 
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
