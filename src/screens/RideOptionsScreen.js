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

const LuxePreferencesModal = ({ visible, onClose, onConfirm }) => {
  const [temperature, setTemperature] = useState('no_preference');
  const [quietRide, setQuietRide] = useState(false);
  const [helpWithBags, setHelpWithBags] = useState(false);
  const [securityGuard, setSecurityGuard] = useState(false);

  const handleTemperatureToggle = () => {
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
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.modalContent}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Personnaliser votre trajet</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalSubtitle}>Nous informerons votre chauffeur de vos préférences.</Text>
          
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
                onValueChange={setQuietRide}
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
                onValueChange={setHelpWithBags}
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
                onValueChange={setSecurityGuard}
                trackColor={{ false: '#3e3e3e', true: '#B76E2D' }}
                thumbColor={securityGuard ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            {securityGuard && (
              <View style={styles.securityNoteContainer}>
                <Text style={styles.securityNoteText}>
                  Le chauffeur sera informé que vous voyagez avec une sécurité personnelle et prévoira l'espace nécessaire.
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

  const filteredOptions = useMemo(() => {
    return rideOptions.filter(option => option.category === selectedCategory);
  }, [selectedCategory]);

  const handleOptionSelect = useCallback((optionId) => {
    setSelectedOption(optionId);
  }, []);

  const handleCategoryChange = useCallback((category) => {
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
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&components=country:CD&key=${GOOGLE_MAPS_APIKEY}`
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
    
    // Naviguer vers l'écran de confirmation du point de départ avec les préférences
    navigation.navigate('ConfirmPickup', {
      ride: selectedRide,
      startLocation,
      destination,
      arrivalTime,
      category: selectedCategory,
      luxePreferences: preferences,
      stops
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
        <TouchableOpacity 
        style={styles.headerPill}
          onPress={() => navigation.goBack()}
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
      </MapView>

      {isLoadingRoute && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Chargement de l'itinéraire...</Text>
        </View>
      )}

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
              onPress={() => navigation.navigate('Payment', {
                selectedRide: filteredOptions.find(opt => opt.id === selectedOption),
                startLocation,
                destination,
                arrivalTime,
                category: selectedCategory,
                currentPayment: selectedPayment,
                onSelect: (payment) => setSelectedPayment(payment)
              })}
            >
              <View style={styles.paymentLeft}>
                <View style={[styles.paymentIcon, { backgroundColor: getPaymentColor() }]}>
                  <MaterialIcons name={getPaymentIcon()} size={16} color="#fff" />
                </View>
                <Text style={styles.paymentText}>{getPaymentDisplay()}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.scheduleButton}>
              <MaterialIcons name="schedule" size={20} color="#fff" />
              <Text style={styles.scheduleText}>Planifier</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.confirmButton, selectedCategory === 'standard' ? styles.confirmButtonStandard : styles.confirmButtonLuxe]}
            onPress={() => {
              const selectedRide = filteredOptions.find(opt => opt.id === selectedOption);
              
              if (selectedCategory === 'luxe') {
                setShowLuxePreferences(true);
              } else {
                navigation.navigate('ConfirmPickup', {
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
}); 