import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
  Image,
  Vibration,
  ActivityIndicator,
  Easing,
  Modal,
  Pressable,
  Linking,
  Share,
  ScrollView,
  TextInput,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { GOOGLE_MAPS_APIKEY } from '@env';
import { LinearGradient } from 'expo-linear-gradient';
import { rideMatchingService } from '../services/rideMatchingService';
import { notificationService } from '../services/notificationService';

const { width, height } = Dimensions.get('window');

// Style de carte sombre cohérent avec le reste de l'application
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

// Données fictives pour le chauffeur (fallback)
// Updated to fix driverData reference error
const fallbackDriverData = {
  name: "Anderson",
  rating: 4.9,
  licensePlate: "3M53AF2",
  car: "Honda Civic",
  carColor: "Silver",
  eta: 5, // minutes
  walkingTime: 2, // minutes pour rejoindre le point de départ
  pickupLocation: "Mission St",
  avatar: require('../../assets/cars/luxe.png'), // Utiliser l'image luxe.png comme suggéré
  carImage: require('../../assets/cars/white.png'), // Utiliser une image existante
};

export default function FindDriverScreen({ route, navigation }) {
  const { 
    ride, 
    startLocation, 
    destination, 
    arrivalTime, 
    category,
    luxePreferences,
    stops = []
  } = route.params;
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [findingState, setFindingState] = useState('searching'); // 'searching', 'driverFound', 'driverArrived', 'inTrip', 'tripEnded'
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [startCoordinates, setStartCoordinates] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [driverCoordinates, setDriverCoordinates] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [mapRegion, setMapRegion] = useState(null);
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [tip, setTip] = useState(0);
  
  // États pour le matching automatique
  const [rideRequest, setRideRequest] = useState(null);
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [matchingError, setMatchingError] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  
  // Utiliser les données du chauffeur assigné ou les données de fallback
  const driverData = assignedDriver || fallbackDriverData;
  
  const mapRef = useRef(null);
  const routeIndexRef = useRef(0);
  const zoomStateRef = useRef('out'); // Pour suivre l'état du zoom
  
  const panelSlideUpAnim = useRef(new Animated.Value(height)).current;
  const searchingOpacityAnim = useRef(new Animated.Value(1)).current;
  const driverInfoOpacityAnim = useRef(new Animated.Value(0)).current;

  // Animations pour les transitions du panneau
  const panelElementsAnim = useRef(new Animated.Value(0)).current; // 0: driverFound, 1: driverArrived, 2: inTrip
  const inTripPanelAnim = useRef(new Animated.Value(height)).current; // Pour le panneau "en course"
  const ratingPanelAnim = useRef(new Animated.Value(height)).current; // Pour le panneau de notation

  const pulseAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  const handleNormalCall = () => {
    const phoneNumber = '+13464553673';
    Linking.openURL(`tel:${phoneNumber}`);
    setIsModalVisible(false);
  };

  const handleWhatsAppCall = () => {
    const phoneNumber = '13464553673';
    Linking.openURL(`https://wa.me/${phoneNumber}`);
    setIsModalVisible(false);
  };

  const handleShareTrip = async () => {
    try {
      await Share.share({
        message: `Je suis en route vers ${destination}. Suivez mon trajet ici : [lien de suivi fictif]`,
        title: 'Suivi de mon trajet Zeurk'
      });
    } catch (error) {
      console.error('Erreur partage:', error.message);
    }
  };

  const handleCancellation = (reason) => {
    console.log(`Course annulée pour la raison : ${reason}`);
    setCancelModalVisible(false);
    navigation.pop(2);
  };

  // Animation initiale du panneau
  useEffect(() => {
    Animated.spring(panelSlideUpAnim, {
      toValue: 0,
      tension: 60,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, []);

  // Animation pour le radar de recherche
  useEffect(() => {
    if (findingState !== 'searching') {
      pulseAnims.forEach(anim => anim.stopAnimation());
      return;
    }
      const animations = pulseAnims.map(anim =>
        Animated.loop(
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
        ),
      );
      const staggerAnimation = Animated.stagger(1000, animations);
      staggerAnimation.start();
      return () => staggerAnimation.stop();
  }, [findingState]);

  // Géocodage des adresses
  useEffect(() => {
    const geocodeAddresses = async () => {
      try {
        // Utiliser des coordonnées réelles à Kinshasa
        const start = {
          latitude: -4.3217,
          longitude: 15.3125, // Boulevard du 30 Juin
        };
        
        const destination = {
          latitude: -4.3115,
          longitude: 15.2940, // Gombe
        };
        
        // Position du chauffeur à une distance réaliste
        const driver = {
          latitude: -4.3310,
          longitude: 15.3250, // Quelques blocs plus loin
        };
        
        setStartCoordinates(start);
        setDestinationCoordinates(destination);
        setDriverCoordinates(driver);
        
        // Centrer la carte sur le point de départ
        setMapRegion({
          latitude: start.latitude,
          longitude: start.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        
        // Simuler un itinéraire avec des points intermédiaires réalistes
        setRouteCoordinates([
          driver,
          { latitude: -4.3290, longitude: 15.3220 },
          { latitude: -4.3270, longitude: 15.3180 },
          { latitude: -4.3250, longitude: 15.3150 },
          start,
          { latitude: -4.3200, longitude: 15.3080 },
          { latitude: -4.3170, longitude: 15.3030 },
          { latitude: -4.3140, longitude: 15.2990 },
          destination
        ]);
      } catch (error) {
        console.error('Erreur géocodage:', error);
      }
    };
    
    geocodeAddresses();
  }, []);

  // Animation de zoom de la carte pendant la recherche (LOGIQUE CORRIGÉE)
  useEffect(() => {
    if (findingState !== 'searching' || !startCoordinates) return;

    const intervalId = setInterval(() => {
      if (mapRef.current) {
        // Alterner entre un zoom normal et un zoom plus proche en utilisant une ref
        const newZoom = zoomStateRef.current === 'out' ? 0.007 : 0.01;
        zoomStateRef.current = zoomStateRef.current === 'out' ? 'in' : 'out';
        
        mapRef.current.animateToRegion({
          latitude: startCoordinates.latitude,
          longitude: startCoordinates.longitude,
          latitudeDelta: newZoom,
          longitudeDelta: newZoom,
        }, 1500); // Animation douce sur 1.5s
      }
    }, 2000); // Toutes les 2 secondes

    return () => clearInterval(intervalId);
  }, [findingState, startCoordinates]);

  // Simuler la recherche -> chauffeur trouvé -> chauffeur arrivé
  useEffect(() => {
    // Phase 1: Recherche -> Chauffeur trouvé (après 5s)
    const searchTimeout = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFindingState('driverFound');
      
      // Phase 2: Chauffeur trouvé -> Chauffeur arrivé (après 10s)
      const arrivalTimeout = setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setFindingState('driverArrived');

        // Phase 3: Chauffeur arrivé -> En course (après 5s)
        const inTripTimeout = setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setFindingState('inTrip');
        }, 5000); // 5 secondes
        
        // Cleanup pour le timeout de la course
        return () => clearTimeout(inTripTimeout);
      }, 10000); // 10 secondes

      // Cleanup pour le timeout d'arrivée
      return () => clearTimeout(arrivalTimeout);

    }, 5000); // 5 secondes

    return () => clearTimeout(searchTimeout);
  }, []); // Se lance une seule fois

  // Gérer les animations du panneau et le zoom de la carte en fonction de l'état
  useEffect(() => {
    if (findingState === 'driverFound') {
      // Dézoomer pour afficher le chauffeur et l'utilisateur
      if (mapRef.current && startCoordinates && driverCoordinates) {
        const points = [startCoordinates, driverCoordinates];
        const lats = points.map(p => p.latitude);
        const lngs = points.map(p => p.longitude);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        const finalRegion = {
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: (maxLat - minLat) * 1.7, // Ajouter du padding
          longitudeDelta: (maxLng - minLng) * 1.7,
        };
        mapRef.current.animateToRegion(finalRegion, 1000);
      }

      // Animation de transition pour le panneau
      Animated.parallel([
        Animated.timing(searchingOpacityAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(driverInfoOpacityAnim, {
          toValue: 1,
          duration: 600,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(panelElementsAnim, { // Animer vers l'état 'driverFound'
          toValue: 0,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (findingState === 'driverArrived') {
      Animated.timing(panelElementsAnim, { // Animer vers l'état 'driverArrived'
        toValue: 1,
        duration: 400,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    } else if (findingState === 'inTrip') {
      // 1. Cacher l'ancien panneau
      Animated.timing(panelElementsAnim, {
        toValue: 1.5, // Valeur intermédiaire pour faire disparaître "driverArrived"
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
      
      // 2. Faire monter le nouveau panneau "en course"
      Animated.spring(inTripPanelAnim, {
        toValue: 0,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }).start();
    } else if (findingState === 'tripEnded') {
      Animated.parallel([
        Animated.timing(inTripPanelAnim, { // Cacher le panneau de course
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(ratingPanelAnim, { // Monter le panneau de notation
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [findingState, startCoordinates, driverCoordinates]);

  // Compte à rebours pour le départ du chauffeur
  useEffect(() => {
    if (findingState === 'driverArrived') {
      const intervalId = setInterval(() => {
        setCountdown(prevCountdown => {
          if (prevCountdown <= 1) {
            clearInterval(intervalId);
            // Gérer la fin du compte à rebours ici (ex: annuler la course)
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [findingState]);

  // Animer la voiture pendant la course
  useEffect(() => {
    if (findingState === 'inTrip') {
      // Trouver l'index de départ de la course (le point où se trouve l'utilisateur)
      const tripStartIndex = routeCoordinates.findIndex(
        coord => coord.latitude === startCoordinates.latitude && coord.longitude === startCoordinates.longitude
      );
      
      if (tripStartIndex === -1) return;

      // S'assurer que la voiture est bien à la position de départ au début
      setDriverCoordinates(routeCoordinates[tripStartIndex]);
      routeIndexRef.current = tripStartIndex;

      const intervalId = setInterval(() => {
        if (routeIndexRef.current < routeCoordinates.length - 1) {
          routeIndexRef.current += 1;
          const nextPosition = routeCoordinates[routeIndexRef.current];
          
          // Mettre à jour la position du chauffeur
          setDriverCoordinates(nextPosition);
          
          // Animer la caméra pour suivre la voiture
          mapRef.current?.animateCamera({
            center: nextPosition,
            pitch: 45, // Donne un effet 3D
            zoom: 16,
            heading: mapRef.current?.getCamera().heading // Garder l'orientation actuelle
          }, { duration: 1500 });

        } else {
          clearInterval(intervalId);
          // Gérer la fin de la course
          setTimeout(() => setFindingState('tripEnded'), 1000);
        }
      }, 1250); // Déplacer toutes les 1.25 secondes pour une durée de 5s

      return () => clearInterval(intervalId);
    }
  }, [findingState, routeCoordinates, startCoordinates]);

  // Calcul de la progression de la course
  const tripProgress = useMemo(() => {
    const tripStartIndex = routeCoordinates.findIndex(
      coord => coord.latitude === startCoordinates?.latitude && coord.longitude === startCoordinates?.longitude
    );
    if (tripStartIndex === -1) return 0;
    
    // Le nombre total d'étapes est le nombre de points après le départ
    const totalSteps = routeCoordinates.length - 1 - tripStartIndex;
    if (totalSteps <= 0) return 100;

    // Le nombre d'étapes complétées
    const completedSteps = routeIndexRef.current - tripStartIndex;
    if (completedSteps < 0) return 0;
    
    return (completedSteps / totalSteps) * 100;
  }, [findingState, routeCoordinates, startCoordinates, driverCoordinates]);

  // Helper pour formater le temps
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Styles d'animation pour les transitions
  // -- Éléments "Chauffeur en route"
  const driverOnRouteOpacity = panelElementsAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
    extrapolate: 'clamp',
  });
  const driverOnRouteTranslateY = panelElementsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  // -- Éléments "Chauffeur arrivé"
  const driverArrivedOpacity = panelElementsAnim.interpolate({
    inputRange: [0, 1, 1.5],
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });
  const driverArrivedTranslateY = panelElementsAnim.interpolate({
    inputRange: [0, 1, 1.5],
    outputRange: [20, 0, -20],
    extrapolate: 'clamp',
  });

  // -- Éléments "En course"
  const inTripOpacity = panelElementsAnim.interpolate({
    inputRange: [1, 2],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const inTripTranslateY = panelElementsAnim.interpolate({
    inputRange: [1, 2],
    outputRange: [20, 0],
    extrapolate: 'clamp',
  });

  const handleFinishRating = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    console.log(`Rating: ${rating}, Tip: ${tip}`);
    // Animer la sortie et naviguer
    Animated.timing(ratingPanelAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      navigation.popToTop();
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={mapStyle}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsTraffic={false}
      >
        {/* Itinéraire - afficher la ligne uniquement quand le chauffeur est trouvé */}
        {findingState !== 'searching' && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#FFFFFF"
            strokeWidth={4}
          />
        )}
        
        {/* Marqueur de point de départ */}
        {startCoordinates && (
          <Marker 
            coordinate={startCoordinates}
            title="Point de départ"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.pickupMarker}>
              <Text style={styles.pickupMarkerText}>{findingState === 'driverFound' ? `${driverData.eta} min` : ''}</Text>
            </View>
          </Marker>
        )}
        
        {/* Marqueur de destination */}
        {destinationCoordinates && (
          <Marker 
            coordinate={destinationCoordinates}
            title="Destination"
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.destinationMarker} />
          </Marker>
        )}
        
        {/* Marqueur du chauffeur */}
        {findingState !== 'searching' && driverCoordinates && (
          <Marker 
            coordinate={driverCoordinates}
            title={`${driverData.name} - ${driverData.licensePlate}`}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[
              styles.carMarker, 
              { backgroundColor: category === 'luxe' ? '#B76E2D' : '#3B82F6' }
            ]}>
              <FontAwesome name="car" size={20} color="#FFFFFF" />
            </View>
          </Marker>
        )}
      </MapView>
      
      {/* Panneau d'informations animé */}
      <Animated.View style={[styles.panelContainer, { transform: [{ translateY: panelSlideUpAnim }] }]}>
        <LinearGradient
          colors={['rgba(26,26,26,0.0)', 'rgba(26,26,26,0.9)', '#1a1a1a']}
          locations={[0, 0.4, 1]}
          style={styles.infoPanel}
        >
          {/* État de recherche avec animation radar */}
          <Animated.View style={[styles.searchingContainer, { opacity: searchingOpacityAnim }]}>
            <View style={styles.radarContainer}>
              {pulseAnims.map((anim, i) => {
                const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });
                const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });
                return (
                  <Animated.View
                    key={`pulse-${i}`}
                    style={[
                      styles.pulse,
                      {
                        transform: [{ scale }],
                        opacity,
                        borderColor: category === 'luxe' ? '#D4AF37' : '#3B82F6',
                      },
                    ]}
                  />
                );
              })}
              <FontAwesome name="car" size={32} color={category === 'luxe' ? '#D4AF37' : '#3B82F6'} />
            </View>
            <Text style={styles.searchingText}>Recherche d'un conducteur...</Text>
          </Animated.View>

          {/* Panneau unifié avec transitions */}
          <Animated.View style={{ opacity: driverInfoOpacityAnim, flex: 1 }}>
            
            {/* -- Vue : Chauffeur en route -- */}
            <Animated.View style={{
              opacity: driverOnRouteOpacity,
              transform: [{ translateY: driverOnRouteTranslateY }],
              position: 'absolute',
              width: '100%',
              alignSelf: 'center',
            }}>
              <View style={styles.headerContainer}>
                <Text style={styles.etaText}>
                  {driverData.eta}
                  <Text style={{ fontSize: 24, fontWeight: '500' }}> min</Text>
                </Text>
                <Text style={styles.mainInfoText}>
                  <Text style={{color: category === 'luxe' ? '#D4AF37' : '#3B82F6', fontWeight: '600'}}>{driverData.name}</Text> est en route
                </Text>
                <Text style={styles.secondaryInfoText}>
                  À bientôt
                </Text>
              </View>
              
              <View style={styles.driverInfoContainer}>
                <Image source={driverData.avatar} style={styles.driverAvatar} />
                <View style={styles.driverDetailsContainer}>
                  <Text style={styles.driverName}>{driverData.name}</Text>
                  <Text style={styles.carDetails}>{driverData.carColor} {driverData.car}</Text>
                </View>
                <View style={styles.carInfoContainer}>
                  <Text style={styles.licensePlate}>{driverData.licensePlate}</Text>
                  <Text style={styles.driverRating}>{driverData.rating} ★</Text>
                </View>
              </View>

              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate('ChatScreen', { driverData, category });
                  }}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={26} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, {backgroundColor: 'rgba(255, 107, 107, 0.15)'}]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setCancelModalVisible(true);
                  }}
                >
                  <MaterialIcons name="cancel" size={26} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            </Animated.View>
            
            {/* -- Vue : Chauffeur arrivé -- */}
            <Animated.View style={{
              opacity: driverArrivedOpacity,
              transform: [{ translateY: driverArrivedTranslateY }],
              position: 'absolute',
              width: '100%',
              alignSelf: 'center',
            }}>
              <View style={styles.waitingContainer}>
                <Ionicons name="time-outline" size={50} color="#FFC700" />
                <Text style={styles.waitingTitle}>Votre conducteur vous attend</Text>
                <Text style={styles.waitingSubtitle}>
                  Départ dans <Text style={{fontWeight: 'bold'}}>{formatTime(countdown)}</Text>
                </Text>
                <View style={styles.waitingCarInfo}>
                  <Image source={driverData.avatar} style={styles.driverAvatarSmall} />
                  <Text style={styles.waitingCarText}>{driverData.name} - {driverData.licensePlate}</Text>
                </View>
              </View>
            </Animated.View>

            {/* -- Vue : En course -- */}
            <Animated.View style={{
              opacity: inTripOpacity,
              transform: [{ translateY: inTripTranslateY }],
              position: 'absolute',
              width: '100%',
              alignSelf: 'center',
            }}>
              <View style={styles.inTripContainer}>
                <View style={styles.tripHeader}>
                  <Text style={styles.tripDestinationLabel}>Destination</Text>
                  <Text style={styles.tripDestinationAddress} numberOfLines={1}>{destination}</Text>
                </View>
                
                <View style={styles.driverInfoContainer}>
                  <Image source={driverData.avatar} style={styles.driverAvatar} />
                  <View style={styles.driverDetailsContainer}>
                    <Text style={styles.driverName}>{driverData.name}</Text>
                    <Text style={styles.carDetails}>{driverData.carColor} {driverData.car}</Text>
                  </View>
                  <View style={styles.carInfoContainer}>
                    <Text style={styles.licensePlate}>{driverData.licensePlate}</Text>
                    <Text style={styles.driverRating}>{driverData.rating} ★</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.shareTripButton} onPress={handleShareTrip}>
                  <Ionicons name="share-social-outline" size={24} color="#fff" />
                  <Text style={styles.shareTripButtonText}>Partager mon trajet</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* Panneau de course interactif */}
      <Animated.View style={[
        styles.inTripPanelContainer,
        { transform: [{ translateY: inTripPanelAnim }] }
      ]}>
        <View style={styles.inTripPanelHeader}>
          <View style={styles.inTripPanelHandle} />
        </View>
        <ScrollView contentContainerStyle={styles.inTripPanelContent}>
          <View style={styles.tripProgressContainer}>
            <View>
              <Text style={styles.tripProgressLabel}>Arrivée estimée à</Text>
              <Text style={styles.tripProgressEta}>{arrivalTime || '...'}</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <Animated.View style={[styles.progressBarForeground, { width: `${tripProgress}%` }]} />
            </View>
          </View>

          <View style={styles.tripDestinationContainer}>
            <FontAwesome5 name="map-marker-alt" size={20} color="#FF6B6B" />
            <Text style={styles.tripDestinationText}>{destination}</Text>
          </View>
          
          <View style={styles.divider} />
          
          {/* Reprise du composant d'info chauffeur */}
          <View style={[styles.driverInfoContainer, { backgroundColor: 'transparent' }]}>
            <Image source={driverData.avatar} style={styles.driverAvatar} />
            <View style={styles.driverDetailsContainer}>
              <Text style={styles.driverName}>{driverData.name}</Text>
              <Text style={styles.carDetails}>{driverData.carColor} {driverData.car}</Text>
            </View>
            <View style={styles.carInfoContainer}>
              <Text style={styles.licensePlate}>{driverData.licensePlate}</Text>
              <Text style={styles.driverRating}>{driverData.rating} ★</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.tripActionsContainer}>
            <TouchableOpacity style={styles.tripActionButton} onPress={handleShareTrip}>
              <Ionicons name="share-social-outline" size={24} color="#fff" />
              <Text style={styles.tripActionButtonText}>Partager</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tripActionButton}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#fff" />
              <Text style={styles.tripActionButtonText}>Sécurité</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tripActionButton}>
              <FontAwesome5 name="plus" size={20} color="#fff" />
              <Text style={styles.tripActionButtonText}>Ajouter un arrêt</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Panneau de Notation */}
      <Animated.View style={[styles.ratingPanelContainer, { transform: [{ translateY: ratingPanelAnim }] }]}>
        <ScrollView contentContainerStyle={styles.ratingPanelContent}>
          <Text style={styles.ratingTitle}>Comment s'est passé votre trajet ?</Text>
          <Text style={styles.ratingSubtitle}>Votre avis nous aide à nous améliorer</Text>

          <View style={styles.ratingDriverInfo}>
            <Image source={driverData.avatar} style={styles.driverAvatar} />
            <Text style={styles.driverName}>{driverData.name}</Text>
          </View>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity 
                key={star} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setRating(star);
                }}
              >
                <Ionicons 
                  name={rating >= star ? "star" : "star-outline"} 
                  size={40} 
                  color={rating >= star ? '#FFC700' : '#8E8E93'} 
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.tipTitle}>Ajouter un pourboire</Text> 
           <View style={styles.tipOptionsContainer}> 
             {[2000, 5000, 10000].map(amount => ( 
               <TouchableOpacity 
                 key={amount} 
                 style={[styles.tipButton, tip === amount && styles.tipButtonSelected]} 
                 onPress={() => {
                   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                   setTip(amount);
                 }} 
               > 
                 <Text style={[styles.tipButtonText, tip === amount && styles.tipButtonTextSelected]}>{amount} FC</Text> 
               </TouchableOpacity> 
             ))} 
             <View style={styles.customTipContainer}> 
               <TextInput 
                 style={styles.customTipInput} 
                 placeholder="Autre" 
                 placeholderTextColor="#8E8E93" 
                 keyboardType="numeric" 
                 onChangeText={(text) => setTip(Number(text))} 
               /> 
             </View> 
           </View>

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              handleFinishRating();
            }}
          >
            <Text style={styles.submitButtonText}>Terminer</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              handleFinishRating();
            }}
          >
            <Text style={styles.notNowText}>Pas maintenant</Text>
          </TouchableOpacity>

        </ScrollView>
      </Animated.View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isCancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setCancelModalVisible(false)}>
          <View style={[styles.modalContent, styles.cancelModalContent]}>
            <Text style={styles.cancelModalTitle}>Confirmer l'annulation</Text>
            <Text style={styles.cancelModalSubtitle}>Veuillez sélectionner la raison de votre annulation.</Text>
            
            <View style={styles.cancelReasonsContainer}>
              {['Le conducteur met trop de temps', 'J\'ai changé d\'avis', 'Problème de prix', 'Le conducteur a demandé d\'annuler', 'Autre'].map((reason, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.reasonButton} 
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    handleCancellation(reason);
                  }}
                >
                  <Text style={styles.reasonButtonText}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.backButtonModal} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCancelModalVisible(false);
              }}
            >
              <Text style={styles.backButtonModalText}>Retour</Text>
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
    backgroundColor: '#1a1a1a',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  panelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  infoPanel: {
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    minHeight: 320, // Augmenter la hauteur pour l'animation
  },
  searchingContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
  },
  searchingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  etaText: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#fff',
  },
  mainInfoText: {
    fontSize: 20,
    fontWeight: '400',
    color: '#fff',
    textAlign: 'center',
    marginTop: 4,
  },
  secondaryInfoText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 6,
  },
  driverInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 24,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  driverDetailsContainer: {
    flex: 1,
    marginLeft: 12,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  carDetails: {
    fontSize: 15,
    color: '#8E8E93',
  },
  carInfoContainer: {
    alignItems: 'flex-end',
  },
  licensePlate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  driverRating: {
    fontSize: 15,
    color: '#8E8E93',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupMarker: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  pickupMarkerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  destinationMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: '#fff',
  },
  carMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  // Styles pour le Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: '95%',
    marginBottom: 20,
  },
  modalOptionsContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalOption: {
    paddingVertical: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalOptionText: {
    color: '#007AFF',
    fontSize: 20,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#2C2C2E',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 20,
    fontWeight: '600',
  },
  // Styles pour la modale d'annulation
  cancelModalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  cancelModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  cancelModalSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  cancelReasonsContainer: {
    width: '100%',
    marginBottom: 10,
  },
  reasonButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  reasonButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  backButtonModal: {
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
  },
  backButtonModalText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  // Styles pour la vue d'attente
  waitingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    minHeight: 280,
    position: 'absolute',
    top: 0,
    width: '100%',
    alignSelf: 'center',
  },
  waitingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
  },
  waitingSubtitle: {
    fontSize: 18,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  waitingCarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  driverAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  waitingCarText: {
    fontSize: 14,
    color: '#fff',
  },
  // Styles pour la vue en course
  inTripContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 10,
    minHeight: 280,
    position: 'absolute',
    top: 0,
    width: '100%',
    alignSelf: 'center',
  },
  tripHeader: {
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tripDestinationLabel: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  tripDestinationAddress: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  shareTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 30,
    paddingVertical: 16,
    marginTop: 10,
  },
  shareTripButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  // Nouveaux styles pour le panneau "en course"
  inTripPanelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.45, // Hauteur du panneau
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  inTripPanelHeader: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inTripPanelHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#4A4A4A',
  },
  inTripPanelContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  tripProgressContainer: {
    marginBottom: 20,
  },
  tripProgressLabel: {
    color: '#8E8E93',
    fontSize: 14,
  },
  tripProgressEta: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBarForeground: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  tripDestinationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  tripDestinationText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 10,
  },
  tripActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  tripActionButton: {
    alignItems: 'center',
    maxWidth: 80,
  },
  tripActionButtonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  // Styles pour le panneau de notation
  ratingPanelContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  ratingPanelContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  ratingTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  ratingSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  ratingDriverInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 15,
  },
  tipTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  tipOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  tipButton: {
    borderWidth: 1,
    borderColor: '#4A4A4A',
    borderRadius: 30,
    paddingVertical: 12,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  tipButtonSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  tipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipButtonTextSelected: {
    color: '#fff',
  },
  customTipContainer: {
    borderWidth: 1,
    borderColor: '#4A4A4A',
    borderRadius: 30,
    flex: 1,
    marginHorizontal: 5,
  },
  customTipInput: {
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  notNowText: {
    color: '#8E8E93',
    textAlign: 'center',
    fontSize: 16,
  },
});