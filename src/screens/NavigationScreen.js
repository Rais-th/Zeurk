import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
  Image,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import InviteFriendScreen from './InviteFriendScreen';

const { width, height } = Dimensions.get('window');

// Style de carte pour la navigation (plus clair pour la lisibilité)
const navigationMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
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
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dadada"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c9c9c9"
      }
    ]
  }
];

export default function NavigationScreen({ route, navigation }) {
  const { rideData } = route.params;
  
  const [userLocation, setUserLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const [region, setRegion] = useState({
    latitude: rideData.coordinates.latitude,
    longitude: rideData.coordinates.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distance, setDistance] = useState('2.3 km');
  const [estimatedTime, setEstimatedTime] = useState(rideData.duration);
  const [eta, setEta] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [averageSpeed, setAverageSpeed] = useState(0);
  const [trafficData, setTrafficData] = useState({
    level: 'moderate', // low, moderate, high, severe
    factor: 1.2 // Facteur de ralentissement
  });
  const [isNavigating, setIsNavigating] = useState(false);
  const [routeDistance, setRouteDistance] = useState(0);
  const [isCallModalVisible, setIsCallModalVisible] = useState(false);
  
  const mapRef = useRef(null);
  const locationSubscription = useRef(null);
  const headingSubscription = useRef(null);
  const speedHistory = useRef([]);
  const trafficCheckInterval = useRef(null);
  const lastLocationUpdate = useRef(Date.now());

  useEffect(() => {
    getCurrentLocation();
    simulateRoute();
    startLocationTracking();
    startHeadingTracking();
    
    // Cleanup lors du démontage
    return () => {
      stopLocationTracking();
      stopHeadingTracking();
      if (trafficCheckInterval.current) {
        clearInterval(trafficCheckInterval.current);
      }
    };
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission de localisation refusée');
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      setUserLocation(location.coords);
      setCurrentSpeed(location.coords.speed || 0);
      
      // Créer un itinéraire initial vers le client
      const route = generateRoute(location.coords, rideData.coordinates);
      setRouteCoordinates(route);
      
      // Centrer la carte sur la position actuelle en mode navigation
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      
    } catch (error) {
      console.error('Erreur de localisation:', error);
    }
  };

  // Générer un itinéraire réaliste entre deux points
  const generateRoute = (start, end) => {
    const route = [start];
    
    // Créer des points intermédiaires pour un itinéraire plus réaliste
    const latDiff = end.latitude - start.latitude;
    const lonDiff = end.longitude - start.longitude;
    const steps = 12; // Plus de points pour plus de précision
    
    for (let i = 1; i < steps; i++) {
      const progress = i / steps;
      // Ajouter une légère variation pour simuler des routes réelles
      const variation = (Math.random() - 0.5) * 0.001;
      
      route.push({
        latitude: start.latitude + (latDiff * progress) + variation,
        longitude: start.longitude + (lonDiff * progress) + variation,
      });
    }
    
    route.push(end);
    
    // Calculer la distance totale de l'itinéraire
    const totalDistance = calculateRouteDistance(route);
    setRouteDistance(totalDistance);
    
    return route;
  };

  // Calculer la distance totale d'un itinéraire
  const calculateRouteDistance = (route) => {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      totalDistance += calculateDistance(route[i], route[i + 1]);
    }
    return totalDistance;
  };

  // Analyser le trafic en temps réel basé sur la vitesse
  const analyzeTraffic = () => {
    if (speedHistory.current.length < 3) return;
    
    const recentSpeeds = speedHistory.current.slice(-10); // 10 dernières mesures
    const avgSpeed = recentSpeeds.reduce((sum, speed) => sum + speed, 0) / recentSpeeds.length;
    
    // Vitesses de référence pour Kinshasa (km/h)
    const citySpeedLimits = {
      residential: 30,
      urban: 50,
      arterial: 60
    };
    
    const expectedSpeed = citySpeedLimits.urban; // Vitesse attendue
    const speedRatio = avgSpeed / expectedSpeed;
    
    let trafficLevel, trafficFactor;
    
    if (speedRatio > 0.8) {
      trafficLevel = 'low';
      trafficFactor = 1.0;
    } else if (speedRatio > 0.6) {
      trafficLevel = 'moderate';
      trafficFactor = 1.3;
    } else if (speedRatio > 0.3) {
      trafficLevel = 'high';
      trafficFactor = 1.8;
    } else {
      trafficLevel = 'severe';
      trafficFactor = 2.5;
    }
    
    setTrafficData({ level: trafficLevel, factor: trafficFactor });
    return { level: trafficLevel, factor: trafficFactor };
  };

  // Calculer l'ETA précis
  const calculatePreciseETA = (currentLocation, currentSpeedMs) => {
    const distanceRemaining = calculateRemainingDistance(currentLocation);
    
    // Vitesse actuelle en km/h
    const currentSpeedKmh = currentSpeedMs * 3.6;
    
    // Vitesse moyenne basée sur l'historique
    const avgSpeedKmh = averageSpeed > 0 ? averageSpeed : currentSpeedKmh || 30; // Fallback 30 km/h
    
    // Appliquer le facteur de trafic
    const adjustedSpeed = Math.max(avgSpeedKmh / trafficData.factor, 5); // Minimum 5 km/h
    
    // Calculer le temps en minutes
    const timeHours = distanceRemaining / adjustedSpeed;
    const timeMinutes = Math.ceil(timeHours * 60);
    
    // Calculer l'ETA (heure d'arrivée)
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + (timeMinutes * 60 * 1000));
    
    return {
      timeMinutes: Math.max(1, timeMinutes),
      eta: arrivalTime,
      distance: distanceRemaining,
      traffic: trafficData.level
    };
  };

  // Calculer la distance restante sur l'itinéraire
  const calculateRemainingDistance = (currentLocation) => {
    if (routeCoordinates.length === 0) {
      return calculateDistance(currentLocation, rideData.coordinates);
    }
    
    // Trouver le point le plus proche sur l'itinéraire
    let closestPointIndex = 0;
    let minDistance = Infinity;
    
    for (let i = 0; i < routeCoordinates.length; i++) {
      const distance = calculateDistance(currentLocation, routeCoordinates[i]);
      if (distance < minDistance) {
        minDistance = distance;
        closestPointIndex = i;
      }
    }
    
    // Calculer la distance restante à partir du point le plus proche
    let remainingDistance = 0;
    for (let i = closestPointIndex; i < routeCoordinates.length - 1; i++) {
      remainingDistance += calculateDistance(routeCoordinates[i], routeCoordinates[i + 1]);
    }
    
    return remainingDistance;
  };

  // Mettre à jour la vitesse moyenne
  const updateAverageSpeed = (newSpeed) => {
    const speedKmh = newSpeed * 3.6;
    speedHistory.current.push(speedKmh);
    
    // Garder seulement les 20 dernières mesures
    if (speedHistory.current.length > 20) {
      speedHistory.current.shift();
    }
    
    // Calculer la moyenne mobile
    if (speedHistory.current.length > 0) {
      const avg = speedHistory.current.reduce((sum, speed) => sum + speed, 0) / speedHistory.current.length;
      setAverageSpeed(avg);
    }
  };

  // Suivi de la localisation en temps réel
  const startLocationTracking = async () => {
    setIsNavigating(true);
    
<<<<<<< HEAD
    // Optimize location updates for battery and data usage
    // Using Location.Accuracy.Balanced for a good balance between accuracy and power consumption.
    // timeInterval: minimum time between updates in milliseconds.
    // distanceInterval: minimum distance (in meters) a device must move before an update is generated.
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
         timeInterval: 5000, // Update every 5 seconds
         distanceInterval: 10, // Update every 10 meters
        
=======
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000, // Mise à jour chaque seconde
        distanceInterval: 1, // Mise à jour chaque mètre
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
      },
             (location) => {
         const newCoords = location.coords;
         const currentTime = Date.now();
         
         setUserLocation(newCoords);
         setCurrentSpeed(newCoords.speed || 0);
         
         // Mettre à jour l'historique des vitesses
         updateAverageSpeed(newCoords.speed || 0);
         
         // Analyser le trafic toutes les 5 secondes
         if (currentTime - lastLocationUpdate.current > 5000) {
           analyzeTraffic();
           lastLocationUpdate.current = currentTime;
         }
         
         // Mettre à jour la région de la carte pour suivre l'utilisateur
         const newRegion = {
           latitude: newCoords.latitude,
           longitude: newCoords.longitude,
           latitudeDelta: 0.01,
           longitudeDelta: 0.01,
         };
         setRegion(newRegion);
         
         // Animer la caméra pour suivre l'utilisateur avec l'orientation
         if (mapRef.current) {
           mapRef.current.animateCamera({
             center: newCoords,
             pitch: 60, // Vue 3D inclinée
             heading: heading, // Rotation selon l'orientation
             altitude: 500,
             zoom: 18,
           }, { duration: 1000 });
         }
         
         // Recalculer l'itinéraire si nécessaire
         updateRouteIfNeeded(newCoords);
         
         // Calculer l'ETA précis et la distance restante
         updatePreciseNavigation(newCoords);
       }
    );
  };

  // Suivi de l'orientation (boussole)
  const startHeadingTracking = async () => {
    headingSubscription.current = await Location.watchHeadingAsync((headingData) => {
      const newHeading = headingData.trueHeading || headingData.magHeading;
      setHeading(newHeading);
      
      // Mettre à jour l'orientation de la carte
      if (mapRef.current && isNavigating) {
        mapRef.current.animateCamera({
          heading: newHeading,
        }, { duration: 500 });
      }
    });
  };

  // Arrêter le suivi
  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  const stopHeadingTracking = () => {
    if (headingSubscription.current) {
      headingSubscription.current.remove();
      headingSubscription.current = null;
    }
  };

<<<<<<< HEAD
  // Mettre à jour l'itinéraire si le conducteur dévie
  const updateRouteIfNeeded = (currentLocation) => {
    if (routeCoordinates.length === 0) return;
    
    // Vérifier si le conducteur est toujours sur la route
    const distanceFromRoute = calculateDistanceFromRoute(currentLocation);
    
    // Si le conducteur dévie de plus de 50 mètres, recalculer l'itinéraire
=======
  // Mettre à jour l'itinéraire si le chauffeur dévie
  const updateRouteIfNeeded = (currentLocation) => {
    if (routeCoordinates.length === 0) return;
    
    // Vérifier si le chauffeur est toujours sur la route
    const distanceFromRoute = calculateDistanceFromRoute(currentLocation);
    
    // Si le chauffeur dévie de plus de 50 mètres, recalculer l'itinéraire
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    if (distanceFromRoute > 0.0005) { // Approximativement 50 mètres
      console.log('Recalcul de l\'itinéraire - déviation détectée');
      const newRoute = generateRoute(currentLocation, rideData.coordinates);
      setRouteCoordinates(newRoute);
    }
  };

  // Calculer la distance par rapport à l'itinéraire
  const calculateDistanceFromRoute = (currentLocation) => {
    if (routeCoordinates.length < 2) return 0;
    
    let minDistance = Infinity;
    
    for (let i = 0; i < routeCoordinates.length - 1; i++) {
      const distance = distanceToLineSegment(
        currentLocation,
        routeCoordinates[i],
        routeCoordinates[i + 1]
      );
      minDistance = Math.min(minDistance, distance);
    }
    
    return minDistance;
  };

  // Calculer la distance d'un point à un segment de ligne
  const distanceToLineSegment = (point, lineStart, lineEnd) => {
    const A = point.latitude - lineStart.latitude;
    const B = point.longitude - lineStart.longitude;
    const C = lineEnd.latitude - lineStart.latitude;
    const D = lineEnd.longitude - lineStart.longitude;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = lineStart.latitude;
      yy = lineStart.longitude;
    } else if (param > 1) {
      xx = lineEnd.latitude;
      yy = lineEnd.longitude;
    } else {
      xx = lineStart.latitude + param * C;
      yy = lineStart.longitude + param * D;
    }

    const dx = point.latitude - xx;
    const dy = point.longitude - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Mettre à jour la navigation avec calculs précis
  const updatePreciseNavigation = (currentLocation) => {
    const preciseData = calculatePreciseETA(currentLocation, currentSpeed);
    
    // Mettre à jour la distance affichée
    setDistance(`${preciseData.distance.toFixed(1)} km`);
    
    // Mettre à jour le temps estimé
    setEstimatedTime(preciseData.timeMinutes);
    
    // Mettre à jour l'ETA
    setEta(preciseData.eta);
    
    // Vérifier si on est arrivé (moins de 50 mètres)
    if (preciseData.distance < 0.05) {
      stopLocationTracking();
      stopHeadingTracking();
      navigation.replace('FindDriverScreen', {
        ride: rideData,
        startLocation: rideData.startAddress,
        destination: rideData.endAddress,
        arrivalTime: 'Maintenant',
      });
    }
  };

  // Calculer la distance entre deux points (en km)
  const calculateDistance = (point1, point2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const simulateRoute = () => {
    // Cette fonction n'est plus nécessaire car on utilise le suivi GPS réel
    // Mais on peut garder une simulation de backup
    console.log('Navigation en temps réel activée');
  };

  // Fonctions utilitaires pour l'affichage du trafic
  const getTrafficColor = (level) => {
    switch (level) {
      case 'low': return '#4CAF50';      // Vert
      case 'moderate': return '#FFD600';  // Jaune
      case 'high': return '#FF3B30';      // Rouge
      case 'severe': return '#FF3B30';    // Rouge aussi pour severe
      default: return '#8E8E93';         // Gris pour inconnu
    }
  };

  const getTrafficText = (level) => {
    switch (level) {
      case 'low': return 'Fluide';
      case 'moderate': return 'Modéré';
      case 'high': return 'Dense';
      case 'severe': return 'Bloqué';
      default: return 'Inconnu';
    }
  };

  const formatETA = (etaDate) => {
    if (!etaDate) return '';
    const hours = etaDate.getHours().toString().padStart(2, '0');
    const minutes = etaDate.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleWhatsAppCall = () => {
    setIsCallModalVisible(false);
    // Logique d'appel WhatsApp à implémenter
    Alert.alert('WhatsApp', 'Appel WhatsApp simulé');
  };

  const handleNormalCall = () => {
    setIsCallModalVisible(false);
    // Logique d'appel normal à implémenter
    Alert.alert('Appel', 'Appel normal simulé');
  };

  const handleCallClient = () => {
    setIsCallModalVisible(true);
  };

  const handleCancelNavigation = () => {
    Alert.alert(
      'Annuler la navigation',
      'Êtes-vous sûr de vouloir annuler cette course ?',
      [
        { text: 'Non', style: 'cancel' },
        { 
          text: 'Oui', 
          style: 'destructive',
          onPress: () => {
            stopLocationTracking();
            stopHeadingTracking();
            navigation.navigate('DriverDashboard');
          }
        }
      ]
    );
  };

  const handleArrived = () => {
    stopLocationTracking();
    stopHeadingTracking();
    navigation.replace('FindDriverScreen', {
      ride: rideData,
      startLocation: rideData.startAddress,
      destination: rideData.endAddress,
      arrivalTime: 'Maintenant',
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Carte en mode navigation */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={navigationMapStyle}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        followsUserLocation={false} // Désactivé car on gère manuellement
        showsTraffic={true}
        loadingEnabled={true}
        userLocationPriority="high"
        userLocationUpdateInterval={1000}
        userLocationFastestInterval={500}
        userLocationAnnotationTitle="Ma position"
        rotateEnabled={true}
        pitchEnabled={true}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {/* Itinéraire */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#007AFF"
            strokeWidth={6}
            lineCap="round"
            lineJoin="round"
          />
        )}
        
        {/* Marqueur du client */}
        <Marker 
          coordinate={rideData.coordinates}
          title="Client à récupérer"
          description={rideData.startAddress}
        >
          <View style={styles.clientMarker}>
            <MaterialIcons name="person" size={24} color="#FFFFFF" />
          </View>
        </Marker>
      </MapView>

      {/* En-tête de navigation */}
      <View style={styles.navigationHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleCancelNavigation}
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.navigationInfo}>
          <Text style={styles.estimatedTime}>{estimatedTime} min</Text>
          <Text style={styles.distance}>{distance}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.callButton}
          onPress={handleCallClient}
        >
          <Ionicons name="call" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Panneau d'informations en bas */}
      <View style={styles.bottomPanel}>
        <View style={styles.clientInfoHeader}>
          <Image 
            source={require('../../assets/icons/Jet.png')} 
            style={styles.clientAvatar}
          />
          <View style={styles.clientDetails}>
            <Text style={styles.clientName}>Client {rideData.id.slice(-1)}</Text>
            <Text style={styles.pickupAddress}>{rideData.startAddress}</Text>
          </View>
          <View style={styles.priceInfo}>
            <Text style={styles.price}>{rideData.price.toLocaleString()} FC</Text>
            <Text style={styles.priceLabel}>Prix estimé</Text>
          </View>
        </View>
        
        <View style={styles.navigationInstructions}>
          {isNavigating ? (
            <View style={styles.navigationStatsContainer}>
              {/* Section Distance et Temps */}
              <View style={styles.statSection}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Distance </Text>
                  <Text style={styles.statValue}>{distance}</Text>
                </View>
              </View>

              {/* Section ETA */}
              <View style={styles.statSection}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Arrive à </Text>
                  <Text style={styles.statValue}>
                    {eta ? formatETA(eta) : '--:--'}
                  </Text>
                </View>
              </View>

              {/* Section Trafic */}
              <View style={styles.statSection}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Trafic</Text>
                  <Text style={[styles.statValue, { color: getTrafficColor(trafficData.level) }]}>
                    {getTrafficText(trafficData.level)}
                  </Text>
                </View>
              </View>

              {/* Section Vitesse */}
              <View style={styles.speedSection}>
                <Text style={styles.speedLabel}>
                  Vitesse: {Math.round(currentSpeed * 3.6)} km/h
                </Text>
                <Text style={styles.avgSpeedLabel}>
                  Moyenne: {Math.round(averageSpeed)} km/h
                </Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.instructionRow}>
                <Ionicons name="navigate" size={20} color="#007AFF" />
                <Text style={styles.instructionText}>
                  Continuez tout droit sur Boulevard du 30 Juin
                </Text>
              </View>
              <Text style={styles.nextInstruction}>
                Dans 800m, tournez à droite sur Avenue de la Gombe
              </Text>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.arrivedButton} onPress={handleArrived}>
          <Text style={styles.arrivedButtonText}>Je suis arrivé</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isCallModalVisible}
        onRequestClose={() => setIsCallModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsCallModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalOptionsContainer}>
              <TouchableOpacity style={[styles.modalOption, styles.whatsappButton]} onPress={handleWhatsAppCall}>
                <FontAwesome5 name="whatsapp" size={24} color="#fff" style={{marginRight: 10}}/>
                <Text style={styles.whatsappButtonText}>Appel via WhatsApp</Text>
              </TouchableOpacity>
              <View style={styles.separator} />
              <TouchableOpacity style={styles.modalOption} onPress={handleNormalCall}>
                <Ionicons name="call" size={22} color="#007AFF" style={{marginRight: 10}}/>
                <Text style={[styles.modalOptionText]}>Appel normal</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsCallModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  navigationHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    padding: 8,
  },
  navigationInfo: {
    flex: 1,
    alignItems: 'center',
  },
  estimatedTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  distance: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  navigationStatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statSection: {
    width: '48%',
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  speedSection: {
    width: '100%',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#3A3A3C',
  },
  speedLabel: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  avgSpeedLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '400',
  },
  trafficDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  callButton: {
    padding: 8,
  },
  clientMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  clientInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  clientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pickupAddress: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  priceLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  navigationInstructions: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  nextInstruction: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 28,
  },
  arrivedButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  arrivedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 8,
  },
  modalOptionsContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    margin: 8,
    marginBottom: 8,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  whatsappButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  modalOptionText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  separator: {
    height: 0.5,
    backgroundColor: '#3A3A3C',
    marginHorizontal: 0,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    margin: 8,
    marginTop: 0,
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FF3B30',
  },
<<<<<<< HEAD
});
=======
}); 
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
