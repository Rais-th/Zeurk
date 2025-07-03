import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_APIKEY } from '@env';

const { width, height } = Dimensions.get('window');

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

export default function ConfirmPickupScreen({ route, navigation }) {
  const { 
    ride, 
    startLocation, 
    destination, 
    arrivalTime, 
    category,
    luxePreferences,
    stops = []
  } = route.params;
  
  const [startCoordinates, setStartCoordinates] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState(null);
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [preciseAddress, setPreciseAddress] = useState(startLocation);
  
  const markerAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(0)).current;
  const mapRef = useRef(null);
  
  // Fonction pour nettoyer les adresses (supprimer les codes plus)
  const cleanAddress = (address) => {
    if (!address) return '';
    
    // Supprimer les codes plus (formats variés comme "j8x7+w7m", "XXXX+XXX", etc.)
    let cleaned = address.replace(/\b[A-Z0-9]{1,5}\+[A-Z0-9]{1,5}\b/gi, '');
    
    // Nettoyer les espaces multiples et virgules consécutives
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.replace(/,\s*,/g, ',');
    cleaned = cleaned.replace(/,\s*$/g, '');
    
    return cleaned.trim();
  };
  
  // Effet de pulsation pour le marqueur
  useEffect(() => {
    const animateMarker = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(markerAnimation, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(markerAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ])
      ).start();
    };
    
    const animatePulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          })
        ])
      ).start();
    };
    
    animateMarker();
    animatePulse();
    
    return () => {
      markerAnimation.stopAnimation();
      pulseAnimation.stopAnimation();
    };
  }, [markerAnimation, pulseAnimation]);

  // Géocodage de l'adresse de départ
  useEffect(() => {
    const geocodeAddress = async () => {
      setIsLoading(true);
      try {
        if (startLocation === 'Position actuelle') {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            throw new Error('Permission de géolocalisation refusée');
          }
          const location = await Location.getCurrentPositionAsync({});
          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setStartCoordinates(coords);
          
          // Zoom sur la position de départ - augmentation du niveau de zoom
          setMapRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.001, // Zoom beaucoup plus prononcé (était 0.003)
            longitudeDelta: 0.001, // Zoom beaucoup plus prononcé (était 0.003)
          });
          
          // Obtenir l'adresse précise
          await getReverseGeocodedAddress(coords);
        } else {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(startLocation)}&components=country:CD&key=${GOOGLE_MAPS_APIKEY}`
          );
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            const coords = {
              latitude: location.lat,
              longitude: location.lng,
            };
            setStartCoordinates(coords);
            
            // Zoom sur la position de départ - augmentation du niveau de zoom
            setMapRegion({
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.001, // Zoom beaucoup plus prononcé (était 0.003)
              longitudeDelta: 0.001, // Zoom beaucoup plus prononcé (était 0.003)
            });
            
            // Utiliser l'adresse formatée de Google
            if (data.results[0].formatted_address) {
              setPreciseAddress(cleanAddress(data.results[0].formatted_address));
            }
          }
        }
      } catch (error) {
        console.error('Erreur géocodage:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    geocodeAddress();
  }, [startLocation]);

  // Fonction pour obtenir l'adresse à partir des coordonnées (géocodage inverse)
  const getReverseGeocodedAddress = async (coordinates) => {
    try {
      setIsReverseGeocoding(true);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.latitude},${coordinates.longitude}&key=${GOOGLE_MAPS_APIKEY}&language=fr`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        setPreciseAddress(cleanAddress(data.results[0].formatted_address));
      }
    } catch (error) {
      console.error('Erreur géocodage inverse:', error);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleMapRegionChangeComplete = (region) => {
    if (isDraggingMap) {
      // Mettre à jour les coordonnées du marqueur au centre de la carte
      const newCoordinates = {
        latitude: region.latitude,
        longitude: region.longitude
      };
      setStartCoordinates(newCoordinates);
      
      // Obtenir l'adresse précise pour les nouvelles coordonnées
      getReverseGeocodedAddress(newCoordinates);
      
      setIsDraggingMap(false);
    }
  };

  const handleConfirm = () => {
    // Naviguer vers l'écran de recherche de chauffeur au lieu de l'écran d'accueil
    navigation.navigate('FindDriver', {
      ride,
      startLocation,
      destination,
      arrivalTime,
      category,
      luxePreferences,
      stops,
      preciseAddress
    });
  };

  const centerMapOnUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission de géolocalisation refusée');
      }
      
      setIsLoading(true);
      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      // Animer la carte vers la position de l'utilisateur avec un zoom plus prononcé
      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.001, // Zoom beaucoup plus prononcé (était 0.003)
        longitudeDelta: 0.001, // Zoom beaucoup plus prononcé (était 0.003)
      }, 500);
      
      // Mettre à jour les coordonnées et l'adresse
      setStartCoordinates(coords);
      await getReverseGeocodedAddress(coords);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur localisation:', error);
      setIsLoading(false);
    }
  };

  // Styles pour l'animation du marqueur
  const markerStyle = {
    transform: [{ scale: markerAnimation }],
  };
  
  const pulseStyle = {
    opacity: pulseAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.6, 0]
    }),
    transform: [
      { 
        scale: pulseAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.5]
        })
      }
    ]
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Confirmer le point de départ</Text>
      </View>

      {mapRegion && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          customMapStyle={mapStyle}
          initialRegion={mapRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsTraffic={false}
          onPanDrag={() => setIsDraggingMap(true)}
          onRegionChangeComplete={handleMapRegionChangeComplete}
        />
      )}
      
      {/* Marqueur fixe au centre de la carte */}
      {startCoordinates && (
        <View style={styles.fixedMarkerContainer} pointerEvents="none">
          <Animated.View style={[styles.markerPulse, pulseStyle]} />
          <Animated.View style={[markerStyle, styles.markerShadow]}>
            <View style={styles.startMarker}>
              <View style={styles.startMarkerInner}>
                <View style={[
                  styles.startMarkerDot, 
                  { backgroundColor: category === 'luxe' ? '#B76E2D' : '#3B82F6' }
                ]} />
              </View>
            </View>
          </Animated.View>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Chargement de la position...</Text>
        </View>
      )}
      
      <View style={styles.addressContainer}>
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Glissez pour préciser votre position
          </Text>
        </View>
        
        <View style={styles.navigationRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.compactAddressBox}>
            {isReverseGeocoding ? (
              <View style={styles.addressLoadingContainer}>
                <ActivityIndicator size="small" color={category === 'luxe' ? '#B76E2D' : '#3B82F6'} />
                <Text style={styles.addressLoadingText}>Recherche...</Text>
              </View>
            ) : (
              <Text style={styles.compactAddressText} numberOfLines={1} ellipsizeMode="tail">
                {preciseAddress}
              </Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.locateButton}
            onPress={centerMapOnUserLocation}
          >
            <Ionicons name="locate" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {ride && (
          <View style={[styles.priceContainer, category === 'luxe' ? styles.priceContainerLuxe : styles.priceContainerStandard]}>
            <Text style={styles.priceLabel}>Prix verrouillé</Text>
            <Text style={styles.priceValue}>{ride.price.toFixed(2)} FC</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.confirmButton, category === 'luxe' ? styles.confirmButtonLuxe : styles.confirmButtonStandard]}
          onPress={handleConfirm}
          disabled={isReverseGeocoding}
        >
          <Text style={[styles.confirmButtonText, category === 'luxe' && styles.confirmButtonTextLuxe]}>
            Confirmer
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  headerContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
  },
  instructionsContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  instructionsText: {
    color: '#8E8E93',
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  fixedMarkerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -48,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 150,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    zIndex: 1000,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  startMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#FFFFFF',
  },
  startMarkerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startMarkerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
  },
  addressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactAddressBox: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactAddressText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  addressLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressLoadingText: {
    color: '#8E8E93',
    fontSize: 13,
    marginLeft: 5,
    fontStyle: 'italic',
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceContainerStandard: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  priceContainerLuxe: {
    backgroundColor: 'rgba(183, 110, 45, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  priceLabel: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  priceValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  confirmButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
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
  markerShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  markerPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
}); 