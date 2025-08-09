import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  Alert,
  Animated,
<<<<<<< HEAD
  Linking,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { GOOGLE_MAPS_APIKEY } from '@env';
import { searchLandmarks, getPopularLandmarks } from '../data/landmarks';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { SMS_CONFIG, formatSMSBody } from '../config/smsConfig';
=======
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_APIKEY } from '@env';
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b

const popularPlaces = [
  {
    name: "Centre Commercial Zando",
    address: "Avenue du Commerce, Kinshasa",
    icon: "storefront",
  },
  {
<<<<<<< HEAD
=======
    name: "Hôtel Pullman",
    address: "4 Avenue Batetela, Kinshasa",
    icon: "hotel",
  },
  {
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    name: "Aéroport de N'djili",
    address: "N'djili, Kinshasa",
    icon: "local-airport",
  },
  {
    name: "Marché Central",
    address: "Boulevard du 30 Juin, Kinshasa",
    icon: "shopping-cart",
  },
  {
    name: "Université de Kinshasa",
    address: "Mont Amba, Kinshasa",
    icon: "school",
  },
  {
    name: "Stade des Martyrs",
    address: "Boulevard Triomphal, Kinshasa",
    icon: "sports-soccer",
  },
];

export default function SearchScreen({ navigation }) {
  const [startLocation, setStartLocation] = useState('Position actuelle');
  const [destination, setDestination] = useState('');
  const [stops, setStops] = useState([]); // Tableau pour les arrêts
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [stopSuggestions, setStopSuggestions] = useState([]); // Suggestions pour les arrêts
  const [currentLocation, setCurrentLocation] = useState(null);
<<<<<<< HEAD
  const [activeInput, setActiveInput] = useState('destination'); // Start with destination since departure is default
  const { isOnline } = useNetworkStatus();

  const startInputRef = useRef(null);
  const destinationInputRef = useRef(null);
=======
  const [activeInput, setActiveInput] = useState('start'); // 'start', 'stop_0', 'stop_1', etc., ou 'destination'
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Nous avons besoin de votre position pour cette fonctionnalité',
          [{ text: 'OK' }]
        );
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location);
      } catch (error) {
        console.error('Error getting location:', error);
      }
    })();
  }, []);

<<<<<<< HEAD
  // Auto-focus on destination input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      destinationInputRef.current?.focus();
    }, 500); // Small delay to ensure component is fully mounted

    return () => clearTimeout(timer);
  }, []);

  // Fonction pour préprocesser la requête avant l'envoi à Google Places API
  const preprocessQuery = (query) => {
    // Dictionnaire d'abréviations pour Google Places
    const abbreviationMap = {
      'av': 'avenue',
      'ave': 'avenue',
      'bd': 'boulevard',
      'blvd': 'boulevard',
      'r': 'rue',
      'rd': 'rond',
      'rp': 'rond-point',
      'pl': 'place',
      'ctr': 'centre',
      'ctre': 'centre',
      'univ': 'université',
      'uni': 'université',
      'hop': 'hôpital',
      'hosp': 'hôpital',
      'aero': 'aéroport',
      'aéro': 'aéroport',
      'march': 'marché',
      'kin': 'kinshasa'
    };

    // Corrections orthographiques courantes
    const spellCorrections = {
      'kinchasa': 'kinshasa',
      'kinchassa': 'kinshasa',
      'kinsasa': 'kinshasa',
      'ndjilli': 'ndjili',
      'ndjily': 'ndjili',
      'gombe': 'gombe',
      'gomba': 'gombe',
      'kalamu': 'kalamu',
      'kalamo': 'kalamu',
      'lingwala': 'lingwala',
      'lingwalla': 'lingwala',
      'barumbu': 'barumbu',
      'barumbo': 'barumbu',
      'universite': 'université',
      'hopital': 'hôpital',
      'marche': 'marché',
      'aeroport': 'aéroport'
    };

    let processed = query.toLowerCase().trim();
    
    // Appliquer les corrections orthographiques
    Object.keys(spellCorrections).forEach(incorrect => {
      const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
      processed = processed.replace(regex, spellCorrections[incorrect]);
    });
    
    // Étendre les abréviations
    const words = processed.split(/\s+/);
    const expandedWords = words.map(word => {
      const cleanWord = word.replace(/[.,;:!?]/g, '');
      return abbreviationMap[cleanWord] || word;
    });
    
    const expandedQuery = expandedWords.join(' ');
    
    // Ne plus forcer Kinshasa pour permettre la recherche mondiale
    return expandedQuery;
  };

  const searchPlaces = async (text, isStart = true, isStop = false) => {
    if (isStart && text === 'Position actuelle') {
      setStartSuggestions([]);
      setDestinationSuggestions([]);
      setStopSuggestions([]);
=======
  const searchPlaces = async (text, isStart = true) => {
    if (isStart && text === 'Position actuelle') {
      setStartSuggestions([]);
      setDestinationSuggestions([]);
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
      return;
    }

    if (text.length < 2) {
      if (isStart) {
        setStartSuggestions([]);
<<<<<<< HEAD
      } else if (isStop) {
        setStopSuggestions([]);
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
      } else {
        setDestinationSuggestions([]);
      }
      return;
    }

    try {
<<<<<<< HEAD
      // Search landmarks first (utilise déjà la recherche intelligente)
      const landmarkResults = searchLandmarks(text, 1);
      
      // Préprocesser la requête pour Google Places
      const processedQuery = preprocessQuery(text);
      
      // Search Google Places avec recherche mondiale (plus de restriction géographique)
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(processedQuery)}&key=${GOOGLE_MAPS_APIKEY}&language=fr`
      );
      const data = await response.json();
      
      let googleSuggestions = [];
      if (data.predictions) {
        googleSuggestions = data.predictions.map(prediction => {
=======
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&components=country:cd&location=-4.4419,15.2663&radius=50000&strictbounds=true&key=${GOOGLE_MAPS_APIKEY}&language=fr`
      );
      const data = await response.json();
      if (data.predictions) {
        const simplifiedSuggestions = data.predictions.map(prediction => {
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
          const parts = prediction.description.split(',');
          const mainText = parts[0];
          const secondaryText = parts[1] ? parts[1].trim() : '';
          return {
            ...prediction,
<<<<<<< HEAD
            description: `${mainText}${secondaryText ? ` • ${secondaryText}` : ''}`,
            isLandmark: false
          };
        });
      }
      
      // Filtrer les doublons entre landmarks et Google Places
      const filteredGoogleSuggestions = googleSuggestions.filter(googlePlace => {
        return !landmarkResults.some(landmark => {
          const landmarkName = landmark.name.toLowerCase();
          const googleName = googlePlace.description.toLowerCase();
          return landmarkName.includes(googleName.split('•')[0].trim()) || 
                 googleName.includes(landmarkName);
        });
      });
      
      // Combine landmarks and Google suggestions
      const combinedSuggestions = [
        ...landmarkResults.map(landmark => ({ ...landmark, isLandmark: true })),
        ...filteredGoogleSuggestions
      ].slice(0, 6);
      
      if (isStart) {
        setStartSuggestions(combinedSuggestions);
        setDestinationSuggestions([]);
        setStopSuggestions([]);
      } else if (isStop) {
        setStopSuggestions(combinedSuggestions);
        setStartSuggestions([]);
        setDestinationSuggestions([]);
      } else {
        setDestinationSuggestions(combinedSuggestions);
        setStartSuggestions([]);
        setStopSuggestions([]);
=======
            description: `${mainText}${secondaryText ? ` • ${secondaryText}` : ''}`
          };
        });
        if (isStart) {
          setStartSuggestions(simplifiedSuggestions);
          setDestinationSuggestions([]);
        } else {
          setDestinationSuggestions(simplifiedSuggestions);
          setStartSuggestions([]);
        }
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleAddStop = () => {
<<<<<<< HEAD
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (stops.length >= 2) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
=======
    if (stops.length >= 2) {
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
      Alert.alert(
        'Maximum atteint',
        'Vous ne pouvez pas ajouter plus de 2 arrêts.',
        [{ text: 'OK' }]
      );
      return;
    }
    setStops([...stops, '']);
  };

  const handleRemoveStop = (index) => {
<<<<<<< HEAD
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    const newStops = stops.filter((_, i) => i !== index);
    setStops(newStops);
    setStopSuggestions([]);
  };

  const handleStopChange = (text, index) => {
    const newStops = [...stops];
    newStops[index] = text;
    setStops(newStops);
<<<<<<< HEAD
    searchPlaces(text, false, true);
  };

  const handleSelectPlace = (place, isStart = true, stopIndex = -1) => {
    Haptics.selectionAsync();
=======
    searchPlaces(text, false);
  };

  const handleSelectPlace = (place, isStart = true, stopIndex = -1) => {
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    const address = place.description;
    
    if (isStart) {
      setStartLocation(address);
      setStartSuggestions([]);
<<<<<<< HEAD
      setDestinationSuggestions([]);
      setActiveInput('destination');
      // Auto-focus on destination input after selecting departure
      setTimeout(() => {
        destinationInputRef.current?.focus();
      }, 100);
=======
      if (!destination) {
        setTimeout(() => {
          destinationInputRef.current?.focus();
        }, 100);
      }
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    } else if (stopIndex >= 0) {
      // Vérifier si l'arrêt n'est pas identique aux autres adresses
      if (address === startLocation || 
          address === destination || 
          stops.some((stop, i) => i !== stopIndex && stop === address)) {
<<<<<<< HEAD
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
        Alert.alert(
          'Adresse invalide',
          'Chaque arrêt doit avoir une adresse différente.',
          [{ text: 'OK' }]
        );
        return;
      }
      const newStops = [...stops];
      newStops[stopIndex] = address;
      setStops(newStops);
      setStopSuggestions([]);
      
<<<<<<< HEAD
      // Toujours naviguer vers le champ de destination après avoir sélectionné un arrêt
      setActiveInput('destination');
      setTimeout(() => {
        destinationInputRef.current?.focus();
      }, 100);
    } else {
      // C'est la destination finale
      if (address === startLocation || stops.includes(address)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
=======
      // Focus sur le prochain champ vide
      const nextEmptyStopIndex = newStops.findIndex(stop => !stop);
      if (nextEmptyStopIndex !== -1) {
        // Focus sur le prochain arrêt vide
        setTimeout(() => {
          // Logique pour focus sur le prochain champ d'arrêt
        }, 100);
      } else if (!destination) {
        // Si tous les arrêts sont remplis, focus sur la destination
        setTimeout(() => {
          destinationInputRef.current?.focus();
        }, 100);
      }
    } else {
      // C'est la destination finale
      if (address === startLocation || stops.includes(address)) {
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
        Alert.alert(
          'Adresse invalide',
          'Le point de départ, les arrêts et la destination doivent être différents.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Vérifier que tous les arrêts sont remplis avant de naviguer
      if (stops.some(stop => !stop)) {
<<<<<<< HEAD
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
        Alert.alert(
          'Arrêts incomplets',
          'Veuillez remplir tous les arrêts avant de sélectionner la destination finale.',
          [{ text: 'OK' }]
        );
        return;
      }

<<<<<<< HEAD
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDestination(address);
      setDestinationSuggestions([]);
      setStartSuggestions([]);

=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
      navigation.navigate('RideOptions', {
        startLocation: startLocation,
        stops: stops,
        destination: address
      });
    }
  };

<<<<<<< HEAD
  const handleOrderBySMS = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const smsBody = formatSMSBody(startLocation, destination);
    
    Alert.alert(
      'Commander par SMS',
      SMS_CONFIG.MESSAGES.INSTRUCTION,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Ouvrir SMS',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const url = `sms:${SMS_CONFIG.TWILIO_NUMBER}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(smsBody)}`;
            Linking.openURL(url).catch(err => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Erreur', SMS_CONFIG.MESSAGES.ERROR);
            });
          }
        }
      ]
    );
  };



  const handleSelectPopularPlace = (place) => {
    Haptics.selectionAsync();
    // Utiliser l'adresse complète pour un géocodage réussi
    const fullAddress = place.address || place.name;
    
    if (activeInput === 'start') {
      setStartLocation(fullAddress);
      setStartSuggestions([]);
      setDestinationSuggestions([]);
      setActiveInput('destination');
      // Auto-focus on destination input after selecting departure
      setTimeout(() => {
        destinationInputRef.current?.focus();
      }, 100);
    } else if (activeInput.startsWith('stop_')) {
      // Gérer la sélection d'un lieu populaire pour un arrêt
      const stopIndex = parseInt(activeInput.split('_')[1]);
      if (fullAddress === startLocation || 
          fullAddress === destination || 
          stops.some((stop, i) => i !== stopIndex && stop === fullAddress)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
=======
  const handleSelectPopularPlace = (place) => {
    if (activeInput === 'start') {
      setStartLocation(place.name);
    } else if (activeInput.startsWith('stop_')) {
      // Gérer la sélection d'un lieu populaire pour un arrêt
      const stopIndex = parseInt(activeInput.split('_')[1]);
      if (place.name === startLocation || 
          place.name === destination || 
          stops.some((stop, i) => i !== stopIndex && stop === place.name)) {
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
        Alert.alert(
          'Lieu invalide',
          'Chaque arrêt doit avoir une adresse différente.',
          [{ text: 'OK' }]
        );
        return;
      }
      const newStops = [...stops];
<<<<<<< HEAD
      newStops[stopIndex] = fullAddress;
      setStops(newStops);
    } else {
      // C'est la destination finale
      if (fullAddress === startLocation || stops.includes(fullAddress)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
=======
      newStops[stopIndex] = place.name;
      setStops(newStops);
    } else {
      // C'est la destination finale
      if (place.name === startLocation || stops.includes(place.name)) {
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
        Alert.alert(
          'Lieu invalide',
          'Le point de départ, les arrêts et la destination doivent être différents.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Vérifier que tous les arrêts sont remplis
      if (stops.some(stop => !stop)) {
<<<<<<< HEAD
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
        Alert.alert(
          'Arrêts incomplets',
          'Veuillez remplir tous les arrêts avant de sélectionner la destination finale.',
          [{ text: 'OK' }]
        );
        return;
      }

<<<<<<< HEAD
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDestination(fullAddress);
      setDestinationSuggestions([]);
      setStartSuggestions([]);

      navigation.navigate('RideOptions', {
        startLocation: startLocation,
        stops: stops,
        destination: fullAddress
=======
      navigation.navigate('RideOptions', {
        startLocation: startLocation,
        stops: stops,
        destination: place.name
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
      });
    }
  };

<<<<<<< HEAD
  const renderSuggestions = () => {
    let suggestions = [];
    let iconColor = '#2196F3';
    
    if (activeInput === 'start') {
      suggestions = startSuggestions;
      iconColor = '#4CAF50';
    } else if (activeInput.startsWith('stop_')) {
      suggestions = stopSuggestions;
      iconColor = '#FF9800';
    } else {
      suggestions = destinationSuggestions;
      iconColor = '#2196F3';
    }
=======
  const startInputRef = useRef(null);
  const destinationInputRef = useRef(null);

  const renderSuggestions = () => {
    const suggestions = activeInput === 'start' ? startSuggestions : destinationSuggestions;
    const iconColor = activeInput === 'start' ? '#4CAF50' : '#2196F3';
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b

    if (suggestions.length === 0) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <ScrollView style={styles.suggestionsList}>
          {suggestions.slice(0, 6).map((suggestion, index) => {
            const parts = suggestion.description.split(',');
            const mainText = parts[0];
            const secondaryText = parts[1] ? parts[1].trim() : '';

            return (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
<<<<<<< HEAD
                activeOpacity={0.7}
                onPress={() => {
                  console.log('Suggestion clicked:', suggestion.description, 'activeInput:', activeInput);
                  
                  if (activeInput === 'start') {
                    handleSelectPlace(suggestion, true);
                  } else if (activeInput.startsWith('stop_')) {
                    const stopIndex = parseInt(activeInput.split('_')[1]);
                    handleSelectPlace(suggestion, false, stopIndex);
                  } else {
                    handleSelectPlace(suggestion, false);
                  }
                }}
              >
                <MaterialIcons 
                  name={suggestion.isLandmark ? "place" : "location-on"} 
                  size={24} 
                  color={suggestion.isLandmark ? "#FF9800" : iconColor}
=======
                onPress={() => handleSelectPlace(suggestion, activeInput === 'start')}
              >
                <MaterialIcons 
                  name="location-on" 
                  size={24} 
                  color={iconColor}
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
                />
                <View style={styles.suggestionTextContainer}>
                  <Text style={styles.suggestionMainText}>{mainText}</Text>
                  {secondaryText && (
                    <Text style={styles.suggestionSecondaryText}>{secondaryText}</Text>
                  )}
<<<<<<< HEAD
                  {suggestion.isLandmark && (
                    <Text style={[styles.suggestionSecondaryText, { color: '#FF9800', fontSize: 11 }]}>
                      Point de repère local
                    </Text>
                  )}
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Options spéciales */}
          <TouchableOpacity
            style={styles.specialOption}
<<<<<<< HEAD
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              /* TODO: Implémenter la sélection sur carte */
            }}
=======
            onPress={() => {/* TODO: Implémenter la sélection sur carte */}}
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
          >
            <MaterialIcons name="map" size={24} color={iconColor} />
            <Text style={styles.specialOptionText}>Choisir sur la carte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.specialOption}
<<<<<<< HEAD
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              /* TODO: Implémenter la géolocalisation */
            }}
=======
            onPress={() => {/* TODO: Implémenter la géolocalisation */}}
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
          >
            <MaterialIcons name="my-location" size={24} color={iconColor} />
            <Text style={styles.specialOptionText}>Ma localisation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.specialOption, { borderBottomWidth: 0 }]}
<<<<<<< HEAD
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              /* TODO: Implémenter le signalement d'adresse manquante */
            }}
=======
            onPress={() => {/* TODO: Implémenter le signalement d'adresse manquante */}}
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
          >
            <MaterialIcons name="add-location" size={24} color={iconColor} />
            <Text style={styles.specialOptionText}>Adresse Manquante</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderStops = () => {
    return stops.map((stop, index) => (
      <View key={index} style={styles.inputWrapper}>
        <View style={styles.inputIcon}>
          <View style={[styles.dot, { backgroundColor: '#FFA500' }]} />
        </View>
        <TextInput
          style={styles.input}
          placeholder={`Arrêt ${index + 1}`}
          placeholderTextColor="#666"
          value={stop}
          onFocus={() => {
            setActiveInput(`stop_${index}`);
            setStartSuggestions([]);
            setDestinationSuggestions([]);
          }}
          onChangeText={(text) => handleStopChange(text, index)}
        />
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveStop(index)}
        >
          <Ionicons name="close" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    ));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
<<<<<<< HEAD
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Retourner vers HomeScreen en réinitialisant la pile de navigation
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recherche</Text>
=======
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Départ</Text>
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.locationInputs}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputIcon}>
              <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
            </View>
            <TextInput
              ref={startInputRef}
              style={styles.input}
              placeholder="Point de départ"
              placeholderTextColor="#666"
              value={startLocation}
              selectTextOnFocus={true}
              onFocus={() => {
                setActiveInput('start');
                if (startLocation === 'Position actuelle') {
                  startInputRef.current?.setNativeProps({ selection: { start: 0, end: 'Position actuelle'.length } });
                }
              }}
              onChangeText={(text) => {
                setStartLocation(text);
                searchPlaces(text, true);
              }}
            />
            {startLocation === 'Position actuelle' && (
              <MaterialIcons name="my-location" size={20} color="#4CAF50" style={{ marginRight: 8 }} />
            )}
<<<<<<< HEAD
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddStop}
            >
              <Ionicons name="add" size={24} color="#4CAF50" />
            </TouchableOpacity>
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
          </View>

          {renderStops()}

          <View style={styles.inputWrapper}>
            <View style={styles.inputIcon}>
              <View style={[styles.dot, { backgroundColor: '#2196F3' }]} />
            </View>
            <TextInput
              ref={destinationInputRef}
              style={styles.input}
              placeholder="Destination"
              placeholderTextColor="#666"
              value={destination}
              onFocus={() => {
                setActiveInput('destination');
                if (!startLocation.trim()) {
                  setStartLocation('Position actuelle');
                  setStartSuggestions([]);
                  setDestinationSuggestions([]);
                }
              }}
              onChangeText={(text) => {
                setDestination(text);
                searchPlaces(text, false);
              }}
            />
<<<<<<< HEAD
          </View>

          {!isOnline && (
            <TouchableOpacity 
              style={styles.smsInputWrapper}
              onPress={handleOrderBySMS}
            >
              <View style={styles.inputIcon}>
                <MaterialIcons name="sms" size={20} color="#FF9800" />
              </View>
              <View style={styles.smsInputContent}>
                <Text style={styles.smsInputText}>Ou commander par SMS</Text>
                <Text style={styles.smsInputSubtext}>Mode hors ligne</Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={16} color="#666" />
            </TouchableOpacity>
          )}

=======
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddStop}
            >
              <Ionicons name="add" size={24} color="#2196F3" />
            </TouchableOpacity>
          </View>
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
        </View>

        {renderSuggestions()}

        {!startSuggestions.length && !destinationSuggestions.length && (
          <>
            <View style={styles.divider}>
              <Text style={styles.dividerText}>Lieux populaires</Text>
            </View>
            <View style={styles.placesContainer}>
              {popularPlaces.map((place, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.placeItem}
                  onPress={() => handleSelectPopularPlace(place)}
                >
                  <MaterialIcons 
                    name={place.icon} 
                    size={24} 
                    color={activeInput === 'start' ? '#4CAF50' : '#2196F3'} 
                  />
                  <View style={styles.placeInfo}>
                    <Text style={styles.placeTitle}>{place.name}</Text>
                    <Text style={styles.placeAddress}>{place.address}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
<<<<<<< HEAD
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    borderRadius: 20,
    padding: 8,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
=======
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginRight: 40,
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  },
  searchContainer: {
    paddingHorizontal: 20,
  },
  locationInputs: {
<<<<<<< HEAD
    backgroundColor: '#000000',
    borderRadius: 15,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
=======
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    gap: 15,
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
    gap: 12,
    backgroundColor: '#000000',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
=======
    gap: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  },
  inputIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#fff',
    fontSize: 16,
  },
  addButton: {
    width: 40,
    height: 40,
<<<<<<< HEAD
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  suggestionsContainer: {
    backgroundColor: '#000000',
    borderRadius: 15,
    marginTop: 16,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
=======
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginTop: 10,
    maxHeight: 300,
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  },
  suggestionsList: {
    padding: 0,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
=======
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  },
  suggestionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionMainText: {
    color: '#fff',
    fontSize: 16,
  },
  suggestionSecondaryText: {
<<<<<<< HEAD
    color: 'rgba(255, 255, 255, 0.7)',
=======
    color: '#8E8E93',
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    fontSize: 14,
    marginTop: 2,
  },
  divider: {
    paddingHorizontal: 20,
<<<<<<< HEAD
    paddingVertical: 16,
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.7)',
=======
    paddingVertical: 15,
  },
  dividerText: {
    color: '#8E8E93',
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    fontSize: 14,
    fontWeight: '500',
  },
  placesContainer: {
    paddingHorizontal: 20,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
    paddingVertical: 16,
    gap: 16,
=======
    paddingVertical: 15,
    gap: 15,
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  },
  placeInfo: {
    flex: 1,
  },
  placeTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  placeAddress: {
<<<<<<< HEAD
    color: 'rgba(255, 255, 255, 0.7)',
=======
    color: '#8E8E93',
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    fontSize: 14,
  },
  specialOption: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#000000',
=======
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
    backgroundColor: '#1a1a1a',
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  },
  specialOptionText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
<<<<<<< HEAD
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  smsInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#000000',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  smsInputContent: {
    flex: 1,
  },
  smsInputText: {
    color: '#FF9800',
    fontSize: 16,
    fontWeight: '500',
  },
  smsInputSubtext: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    marginTop: 2,
  },
});
=======
    marginLeft: 5,
  },
}); 
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
