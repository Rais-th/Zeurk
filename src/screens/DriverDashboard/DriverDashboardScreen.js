import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
  Animated,
  Vibration,
  PanResponder,
  ScrollView,
  Switch,
  Modal,
  TextInput,
  Alert,
  Image,
  PermissionsAndroid,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { PROVIDER_GOOGLE, Circle, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { styles } from './styles';
import { mapStyle, revenusData, chartData, chartLabels, paymentMethods, mockRideRequests } from './constants';
import { PerformanceModal, FinancesModal, WithdrawModal, DepositModal, ProfileModal, SettingsPanel, RideRequestModal } from './shared/exports';
import VehiclesAndDocumentsModal from './modals/VehiclesAndDocumentsModal';

// Import des logos des opérateurs
const airtelLogo = require('../../../assets/icons/airtel.jpg');
const orangeLogo = require('../../../assets/icons/orange.png');
const mpesaLogo = require('../../../assets/icons/mpesa.png');

const { width, height } = Dimensions.get('window');

// La déclaration de mapStyle est maintenant supprimée car elle est importée de constants.js

export default function DriverDashboardScreen({ navigation }) {
  console.log('🚗 DriverDashboard: Initialisation du composant');
  
  // États principaux
  const [driverStatus, setDriverStatus] = useState('offline'); // 'offline', 'online', 'request', 'toPickup', 'inTrip'
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: -4.4419,
    longitude: 15.2663,
    latitudeDelta: 0.09,
    longitudeDelta: 0.04,
  });
  
  console.log('🚗 DriverDashboard: États initialisés');
  
  // Données professionnelles
  const [activeRequests, setActiveRequests] = useState(8); // Nombre de requêtes actives
  const [todayRides, setTodayRides] = useState(0);
  const [timeWorked] = useState("4h30");
  const [clientsServed, setClientsServed] = useState(0);

  // État pour contrôler l'affichage de l'indicateur de glissement
  const [showGestureHint, setShowGestureHint] = useState(true);

  // État pour le toggle "Apparaître en ligne"
  const [isOnlineEnabled, setIsOnlineEnabled] = useState(false);

  // États pour la section finances
  const [showFinancesModal, setShowFinancesModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('jour');
  
  // États pour la modal de retrait
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  
  // États pour la modal de versement
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositPaymentMethod, setDepositPaymentMethod] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);

  // États pour la modal de performances
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);

  // États pour la modal Véhicules & Documents
  const [showVehiclesModal, setShowVehiclesModal] = useState(false);

  // États pour la modal Profil
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+243 812 345 678',
    avatarUri: null, // Initialiser avatarUri à null
  });

  // États pour les courses
  const [availableRides, setAvailableRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showRideRequestModal, setShowRideRequestModal] = useState(false);

  // Animation pour les modals
  const financesModalY = useRef(new Animated.Value(height)).current;
  const withdrawModalY = useRef(new Animated.Value(height)).current;
  const depositModalY = useRef(new Animated.Value(height)).current;
  const performanceModalY = useRef(new Animated.Value(height)).current;
  const vehiclesModalY = useRef(new Animated.Value(height)).current;
  const performanceOverlayOpacity = useRef(new Animated.Value(0)).current;
  
  // Références pour les animations
  const mapRef = useRef(null);
  const buttonScale = useRef(new Animated.Value(1)).current;

  // ANIMATION DU PANNEAU GLISSANT
  const initialPanelHeight = useRef(new Animated.Value(height * 0.35)).current;
  const expandedPanelHeight = height * 0.9;
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Ne réagit qu'aux gestes de glissement, pas aux clics
        return Math.abs(gestureState.dy) > 5;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Ne réagit qu'aux mouvements verticaux significatifs
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        // Léger feedback au début du glissement
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Masquer l'indicateur pendant le glissement
        setShowGestureHint(false);
      },
      onPanResponderMove: (evt, gestureState) => {
        const currentHeight = initialPanelHeight._value;
        const newHeight = currentHeight - gestureState.dy;
        initialPanelHeight.setValue(Math.max(height * 0.35, Math.min(expandedPanelHeight, newHeight)));
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Ne réagir qu'aux gestes de glissement significatifs
        if (Math.abs(gestureState.dy) < 10) {
          // Si c'est un petit mouvement (presque un clic), ne rien faire
          return;
        }
        
        if (gestureState.vy < -0.5 || gestureState.dy < -50) {
          // Feedback medium quand on étend le panneau
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Animated.spring(initialPanelHeight, {
            toValue: expandedPanelHeight,
            useNativeDriver: false,
            bounciness: 0,
            speed: 10,
          }).start(() => {
            setIsPanelExpanded(true);
            // Garder l'indicateur caché quand le panneau est étendu
            setShowGestureHint(false);
          });
        } else if (gestureState.vy > 0.5 || gestureState.dy > 50) {
          // Feedback light quand on réduit le panneau
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Animated.spring(initialPanelHeight, {
            toValue: height * 0.35,
            useNativeDriver: false,
            bounciness: 0,
            speed: 10,
          }).start(() => {
            setIsPanelExpanded(false);
            // Réafficher l'indicateur quand le panneau est réduit
            setShowGestureHint(true);
          });
        } else {
          Animated.spring(initialPanelHeight, {
            toValue: isPanelExpanded ? expandedPanelHeight : height * 0.35,
            useNativeDriver: false,
            bounciness: 0,
            speed: 10,
          }).start(() => {
            // Mettre à jour l'état d'expansion et l'indicateur en conséquence
            if (!isPanelExpanded) {
              setIsPanelExpanded(true);
              setShowGestureHint(false);
            } else {
              setIsPanelExpanded(false);
              setShowGestureHint(true);
            }
          });
        }
      },
    })
  ).current;

  // Animation de la flèche
  const arrowTranslateY = useRef(new Animated.Value(0)).current;
  const arrowOpacity = useRef(new Animated.Value(1)).current;

  // Animation du conteneur
  const containerBounceY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('🚗 DriverDashboard: useEffect démarré');
    try {
      requestLocationPermission();
      startAnimations();
      console.log('🚗 DriverDashboard: Animations démarrées');
      // Animation continue de la flèche
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(arrowTranslateY, {
              toValue: -10,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(arrowOpacity, {
              toValue: 0.4,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(arrowTranslateY, {
              toValue: 0,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(arrowOpacity, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
      console.log('🚗 DriverDashboard: useEffect terminé avec succès');
    } catch (error) {
      console.log('❌ DriverDashboard: Erreur dans useEffect:', error);
    }
  }, []);

  const requestLocationPermission = async () => {
    try {
      console.log('🚗 DriverDashboard: Demande de permission de localisation...');
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('❌ DriverDashboard: Permission de localisation refusée');
        Alert.alert(
          'Permission de localisation refusée',
          'Veuillez activer les services de localisation pour utiliser cette application.'
        );
        return;
      }

      console.log('✅ DriverDashboard: Permission accordée, récupération de la position...');
      let location = await Location.getCurrentPositionAsync({});
      console.log('✅ DriverDashboard: Position récupérée:', location.coords);
      setUserLocation(location.coords);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.log('❌ DriverDashboard: Erreur lors de la demande de localisation:', error);
      // Utiliser une position par défaut en cas d'erreur
      setRegion({
        latitude: -4.4419,
        longitude: 15.2663,
        latitudeDelta: 0.09,
        longitudeDelta: 0.04,
      });
    }
  };

  const startAnimations = () => {
    // Animation de pulsation pour le bouton
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Ouvrir la modal finances
  const openFinancesModal = () => {
    setShowFinancesModal(true);
    Animated.spring(financesModalY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
      speed: 12,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Fermer la modal finances
  const closeFinancesModal = () => {
    Animated.spring(financesModalY, {
      toValue: height,
      useNativeDriver: true,
      bounciness: 0,
      speed: 12,
    }).start(() => setShowFinancesModal(false));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // ---- Définitions pour les modales ----
  const openWithdrawModal = () => {
    setShowWithdrawModal(true);
    Animated.spring(withdrawModalY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
      speed: 12,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const closeWithdrawModal = () => {
    Animated.spring(withdrawModalY, {
      toValue: height,
      useNativeDriver: true,
      bounciness: 0,
      speed: 12,
    }).start(() => {
      setShowWithdrawModal(false);
      setSelectedPaymentMethod(null);
      setPhoneNumber('');
      setWithdrawAmount('');
      setIsProcessingWithdraw(false);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const openDepositModal = () => {
    setShowDepositModal(true);
    Animated.spring(depositModalY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
      speed: 12,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const closeDepositModal = () => {
    Animated.spring(depositModalY, {
      toValue: height,
      useNativeDriver: true,
      bounciness: 0,
      speed: 12,
    }).start(() => {
      setShowDepositModal(false);
      setDepositPaymentMethod(null);
      setDepositAmount('');
      setIsProcessingDeposit(false);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Ouvrir/Fermer la modal Véhicules
  const openVehiclesModal = () => {
    setShowVehiclesModal(true);
    Animated.spring(vehiclesModalY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
      speed: 12,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const closeVehiclesModal = () => {
    Animated.spring(vehiclesModalY, {
      toValue: height,
      useNativeDriver: true,
      bounciness: 0,
      speed: 12,
    }).start(() => setShowVehiclesModal(false));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Ouvrir/Fermer la modal Profil
  const openProfileModal = () => {
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
  };

  const handleSaveProfile = (newProfileData) => {
    setProfileData(newProfileData);
    closeProfileModal();
  };

  // Ouvrir la modal de performances
  const openPerformanceModal = () => {
    setShowPerformanceModal(true);
    Animated.parallel([
      Animated.spring(performanceModalY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 12,
      }),
      Animated.timing(performanceOverlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Fermer la modal de performances
  const closePerformanceModal = () => {
    Animated.parallel([
      Animated.spring(performanceModalY, {
        toValue: height,
        useNativeDriver: true,
        bounciness: 0,
        speed: 12,
      }),
      Animated.spring(initialPanelHeight, {
        toValue: expandedPanelHeight,
        useNativeDriver: false,
        bounciness: 0,
        speed: 10,
      }),
      Animated.timing(performanceOverlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowPerformanceModal(false);
      setIsPanelExpanded(true);
      setShowGestureHint(false);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Calculer le montant disponible (en supprimant les espaces et "FC")
  const getAvailableAmount = () => {
    return parseInt(revenusData[selectedPeriod].replace(/\s/g, '').replace('FC', ''));
  };

  // Calculer les frais de retrait (2%)
  const calculateWithdrawFees = (amount) => {
    return Math.round(amount * 0.02);
  };

  // Calculer le montant net à recevoir
  const calculateNetAmount = (amount) => {
    return amount - calculateWithdrawFees(amount);
  };

  // Traiter le retrait
  const processWithdraw = () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Erreur', 'Veuillez sélectionner une méthode de paiement');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre numéro de téléphone');
      return;
    }

    if (!withdrawAmount.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le montant à retirer');
      return;
    }

    const amount = parseInt(withdrawAmount.replace(/\s/g, ''));
    const availableAmount = getAvailableAmount();

    if (amount > availableAmount) {
      Alert.alert('Erreur', `Montant insuffisant. Votre solde est de ${availableAmount.toLocaleString()} FC`);
      return;
    }

    if (amount < 1000) {
      Alert.alert('Erreur', 'Le montant minimum de retrait est de 1 000 FC');
      return;
    }

    const fees = calculateWithdrawFees(amount);
    const netAmount = calculateNetAmount(amount);

    Alert.alert(
      'Confirmer le retrait',
      `Montant: ${amount.toLocaleString()} FC\nFrais (2%): ${fees.toLocaleString()} FC\nVous recevrez: ${netAmount.toLocaleString()} FC\n\nEnvoyer vers ${selectedPaymentMethod.name}: ${phoneNumber}?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: executeWithdraw },
      ]
    );
  };

  // Exécuter le retrait
  const executeWithdraw = () => {
    setIsProcessingWithdraw(true);

    // Simuler le traitement du retrait
    setTimeout(() => {
      setIsProcessingWithdraw(false);
      Alert.alert(
        'Retrait initié',
        `Votre demande de retrait a été envoyée à ${selectedPaymentMethod.name}. Vous recevrez le paiement dans quelques minutes.`,
        [{ text: 'OK', onPress: closeWithdrawModal }]
      );
    }, 3000);
  };

  // Traiter le versement
  const processDeposit = () => {
    if (!depositPaymentMethod) {
      Alert.alert('Erreur', 'Veuillez sélectionner un opérateur');
      return;
    }

    if (!depositAmount.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le montant à verser');
      return;
    }

    const amount = parseInt(depositAmount.replace(/\s/g, ''));

    if (amount < 1000) {
      Alert.alert('Erreur', 'Le montant minimum de versement est de 1 000 FC');
      return;
    }

    setIsProcessingDeposit(true);

    Alert.alert(
      'Confirmer le versement',
      `Montant: ${amount.toLocaleString()} FC\nOpérateur: ${depositPaymentMethod.name}\n\nConfirmez le versement via ${depositPaymentMethod.name}. Une notification vous sera envoyée pour confirmer la transaction.`,
      [
        { text: 'Annuler', style: 'cancel', onPress: () => setIsProcessingDeposit(false) },
        { text: 'Confirmer', onPress: executeDeposit },
      ]
    );
  };

  // Exécuter le versement
  const executeDeposit = () => {
    // Simuler l'envoi d'une requête de versement par message
    Alert.alert(
      'Requête de versement envoyée',
      `Veuillez confirmer le versement de ${depositAmount} FC via ${depositPaymentMethod.name}. Vous recevrez une notification pour la validation.`
    );

    // Simuler le succès après 5 secondes
    setTimeout(() => {
      setIsProcessingDeposit(false);
      Alert.alert(
        'Versement réussi',
        `Votre versement de ${depositAmount} FC a été confirmé avec succès.`,
        [{ text: 'OK', onPress: closeDepositModal }]
      );
    }, 5000);
  };

  const toggleDriverStatus = () => {
    setDriverStatus(prevStatus => {
      const newStatus = prevStatus === 'offline' ? 'online' : 'offline';
      if (newStatus === 'online') {
        // Charger les courses disponibles
        setAvailableRides(mockRideRequests);
      } else {
        // Vider la liste des courses
        setAvailableRides([]);
      }
      return newStatus;
    });
  };

  const handleGoOnline = () => {
    // Feedback lourd pour action importante
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    setDriverStatus('online');
    setAvailableRides(mockRideRequests); // Charger les courses disponibles
    Vibration.vibrate(100);
    
    // Simulation : Sélectionner automatiquement un client après 5 secondes
    setTimeout(() => {
      const randomRide = mockRideRequests[Math.floor(Math.random() * mockRideRequests.length)];
      setSelectedRide(randomRide);
      setShowRideRequestModal(true);
      Vibration.vibrate(200); // Vibration pour notifier la nouvelle demande
    }, 5000);
    
    // Commencer les animations d'activité
    startAnimations();
  };

  const handleGoOffline = () => {
    // Feedback d'avertissement pour la déconnexion
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    setDriverStatus('offline');
    setAvailableRides([]); // Vider la liste des courses
    Vibration.vibrate(100);
    // Reset pour la prochaine session
    setActiveRequests(Math.floor(Math.random() * 15) + 5);
    setClientsServed(0);
    setTimeWorked('0h00');
    setTodayEarnings(0);
    
    // Arrêter toutes les animations
    clearInterval();
  };

  // Réinitialiser l'indicateur quand on revient à l'état offline
  useEffect(() => {
    if (driverStatus === 'offline') {
      // Réinitialiser l'indicateur uniquement si on revient à l'état initial
      setShowGestureHint(!isPanelExpanded);
    }
  }, [driverStatus, isPanelExpanded]);

  const handleAcceptRide = () => {
    console.log('Course acceptée:', selectedRide);
    setShowRideRequestModal(false);
    
    // Navigation vers l'écran de navigation
    setTimeout(() => {
      navigation.navigate('NavigationScreen', { 
        rideData: selectedRide 
      });
      setSelectedRide(null);
    }, 100);
  };

  const handleDeclineRide = () => {
    console.log('Course refusée:', selectedRide);
    setShowRideRequestModal(false);
    setSelectedRide(null);
  };

  // Fonction pour rendre le contenu selon l'état
  const renderStateContent = () => {
    switch (driverStatus) {
      case 'offline':
        return (
          <Animated.View 
            style={[
              styles.offlineContainer,
              {
                transform: [{ translateY: containerBounceY }]
              }
            ]}
          >
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity 
                style={styles.startButton}
                onPress={handleGoOnline}
                activeOpacity={0.8}
              >
                <Text style={styles.startButtonText}>Commencer ma journée</Text>
              </TouchableOpacity>
            </Animated.View>

            {showGestureHint && (
              <View style={styles.gestureHintContainer}>
                <Animated.View 
                  style={[
                    styles.downArrowContainer,
                    {
                      transform: [{ translateY: arrowTranslateY }],
                      opacity: arrowOpacity,
                    }
                  ]}
                >
                  <Ionicons 
                    name="chevron-up" 
                    size={28} 
                    color="rgba(255, 255, 255, 0.8)" 
                  />
                  <Ionicons 
                    name="chevron-up" 
                    size={28} 
                    color="rgba(255, 255, 255, 0.4)" 
                    style={styles.secondArrow} 
                  />
                </Animated.View>
                <Animated.Text 
                  style={[
                    styles.gestureHintText,
                    {
                      opacity: arrowOpacity,
                    }
                  ]}
                >
                  Glisser pour accéder au tableau de bord
                </Animated.Text>
              </View>
            )}

            <Animated.View 
              style={[
                styles.settingsWrapper, 
                { 
                  opacity: isPanelExpanded ? 1 : 0,
                  height: isPanelExpanded ? 'auto' : 0,
                }
              ]}
              pointerEvents={isPanelExpanded ? 'auto' : 'none'}
            >
              <SettingsPanel
                isOnlineEnabled={isOnlineEnabled}
                setIsOnlineEnabled={setIsOnlineEnabled}
                onOpenFinances={openFinancesModal}
                onOpenPerformances={openPerformanceModal}
                onOpenVehicles={openVehiclesModal}
                onOpenProfile={openProfileModal}
                navigation={navigation}
              />
            </Animated.View>
            
            {/* Zone de glissement invisible pour le panneau */}
            <View 
              style={styles.dragHandleArea}
              {...panResponder.panHandlers}
            />
          </Animated.View>
        );
      
      case 'online':
        return (
          <View style={styles.onlineContainer}>
            {/* Le Présent : Performance en Direct */}
            <View style={styles.todaySummary}>
              <Text style={styles.todayNumber}>{clientsServed}</Text>
              <Text style={styles.todayUnit}>clients servis</Text>
              <Text style={styles.todayTime}>en {timeWorked}</Text>
            </View>
            
            {/* L'État : Bouton de Contrôle */}
            <TouchableOpacity 
              style={styles.activeButton}
              onPress={handleGoOffline}
            >
              <View style={styles.onlineIndicator} />
              <Text style={styles.activeButtonText}>Disponible</Text>
            </TouchableOpacity>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Dynamic Island pour les requêtes actives */}
      <Animated.View style={styles.dynamicIsland}>
        <View style={styles.dynamicIslandContent}>
          <Text style={styles.dynamicIslandNumber}>{activeRequests}</Text>
          <Text style={styles.dynamicIslandText}>requêtes actives</Text>
        </View>
      </Animated.View>

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={[styles.map, { opacity: driverStatus === 'offline' ? 0.6 : 1 }]}
        customMapStyle={mapStyle}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        followsUserLocation={false}
      >
        {/* Afficher les marqueurs pour les courses disponibles */}
        {availableRides.map(ride => (
          <Marker
            key={ride.id}
            coordinate={ride.coordinates}
            title={`Course pour ${ride.price} FC`}
            description={ride.startAddress}
          >
            {/* Utiliser un marqueur personnalisé pour les courses */}
            <View style={styles.rideRequestMarker}>
              <Text style={styles.rideRequestMarkerText}>
                {ride.price / 1000}k
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Bouton de retour discret */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={30} color="#fff" />
      </TouchableOpacity>

      {/* PANNEAU GLISSANT */}
      <Animated.View
        style={[
          styles.draggablePanel,
          { height: initialPanelHeight }, // Contrôlé par l'animation
        ]}
        {...panResponder.panHandlers}
      >
        {/* Poignée du panneau */}
        <View style={styles.panelHandle} />

        <ScrollView
          style={styles.panelContent}
          scrollEnabled={isPanelExpanded} // Activer le défilement uniquement lorsque le panneau est étendu
        >
          {/* Contenu principal du tableau de bord (toujours visible initialement) */}
          {renderStateContent()}
        </ScrollView>
      </Animated.View>
      
      {/* Modal Finances */}
      <FinancesModal
        visible={showFinancesModal}
        onClose={closeFinancesModal}
        financesModalY={financesModalY}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        onWithdraw={openWithdrawModal}
        onDeposit={openDepositModal}
      />

      {/* Modal de retrait */}
      <WithdrawModal
        visible={showWithdrawModal}
        onClose={closeWithdrawModal}
        withdrawModalY={withdrawModalY}
        selectedPeriod={selectedPeriod}
        selectedPaymentMethod={selectedPaymentMethod}
        setSelectedPaymentMethod={setSelectedPaymentMethod}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        withdrawAmount={withdrawAmount}
        setWithdrawAmount={setWithdrawAmount}
        isProcessingWithdraw={isProcessingWithdraw}
        onProcessWithdraw={processWithdraw}
      />

      {/* Modal de versement */}
      <DepositModal
        visible={showDepositModal}
        onClose={closeDepositModal}
        depositModalY={depositModalY}
        depositAmount={depositAmount}
        setDepositAmount={setDepositAmount}
        depositPaymentMethod={depositPaymentMethod}
        setDepositPaymentMethod={setDepositPaymentMethod}
        isProcessingDeposit={isProcessingDeposit}
        onProcessDeposit={processDeposit}
      />

      {/* Modal de performances */}
      <PerformanceModal 
        visible={showPerformanceModal}
        onClose={closePerformanceModal}
        performanceModalY={performanceModalY}
        performanceOverlayOpacity={performanceOverlayOpacity}
      />

      {/* Modal Véhicules & Documents */}
      <VehiclesAndDocumentsModal
        visible={showVehiclesModal}
        onClose={closeVehiclesModal}
        vehiclesModalY={vehiclesModalY}
      />

      {/* Modal Profil */}
      <ProfileModal
        visible={showProfileModal}
        onClose={closeProfileModal}
        profileData={profileData}
        onSave={handleSaveProfile}
      />

      {/* Modal de demande de course */}
      <RideRequestModal
        visible={showRideRequestModal}
        onAccept={handleAcceptRide}
        onDecline={handleDeclineRide}
        rideData={selectedRide}
      />
    </View>
  );
}