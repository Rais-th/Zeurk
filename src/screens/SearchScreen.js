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
  Linking,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_APIKEY } from '@env';
import { searchLandmarks, getPopularLandmarks } from '../data/landmarks';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { SMS_CONFIG, formatSMSBody } from '../config/smsConfig';

const popularPlaces = [
  {
    name: "Centre Commercial Zando",
    address: "Avenue du Commerce, Kinshasa",
    icon: "storefront",
  },
  {
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
  const [activeInput, setActiveInput] = useState('destination'); // Start with destination since departure is default
  const { isOnline } = useNetworkStatus();

  const startInputRef = useRef(null);
  const destinationInputRef = useRef(null);

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

  // Auto-focus on destination input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      destinationInputRef.current?.focus();
    }, 500); // Small delay to ensure component is fully mounted

    return () => clearTimeout(timer);
  }, []);

  const searchPlaces = async (text, isStart = true) => {
    if (isStart && text === 'Position actuelle') {
      setStartSuggestions([]);
      setDestinationSuggestions([]);
      return;
    }

    if (text.length < 2) {
      if (isStart) {
        setStartSuggestions([]);
      } else {
        setDestinationSuggestions([]);
      }
      return;
    }

    try {
      // Search landmarks first
      const landmarkResults = searchLandmarks(text, 3);
      
      // Search Google Places
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&components=country:cd&location=-4.4419,15.2663&radius=50000&strictbounds=true&key=${GOOGLE_MAPS_APIKEY}&language=fr`
      );
      const data = await response.json();
      
      let googleSuggestions = [];
      if (data.predictions) {
        googleSuggestions = data.predictions.map(prediction => {
          const parts = prediction.description.split(',');
          const mainText = parts[0];
          const secondaryText = parts[1] ? parts[1].trim() : '';
          return {
            ...prediction,
            description: `${mainText}${secondaryText ? ` • ${secondaryText}` : ''}`,
            isLandmark: false
          };
        });
      }
      
      // Combine landmarks and Google suggestions
      const combinedSuggestions = [
        ...landmarkResults.map(landmark => ({ ...landmark, isLandmark: true })),
        ...googleSuggestions
      ].slice(0, 6);
      
      if (isStart) {
        setStartSuggestions(combinedSuggestions);
        setDestinationSuggestions([]);
      } else {
        setDestinationSuggestions(combinedSuggestions);
        setStartSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleAddStop = () => {
    if (stops.length >= 2) {
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
    const newStops = stops.filter((_, i) => i !== index);
    setStops(newStops);
    setStopSuggestions([]);
  };

  const handleStopChange = (text, index) => {
    const newStops = [...stops];
    newStops[index] = text;
    setStops(newStops);
    searchPlaces(text, false);
  };

  const handleSelectPlace = (place, isStart = true, stopIndex = -1) => {
    const address = place.description;
    
    if (isStart) {
      setStartLocation(address);
      setStartSuggestions([]);
      setDestinationSuggestions([]);
      setActiveInput('destination');
      // Auto-focus on destination input after selecting departure
      setTimeout(() => {
        destinationInputRef.current?.focus();
      }, 100);
    } else if (stopIndex >= 0) {
      // Vérifier si l'arrêt n'est pas identique aux autres adresses
      if (address === startLocation || 
          address === destination || 
          stops.some((stop, i) => i !== stopIndex && stop === address)) {
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
      
      // Focus sur le prochain champ vide
      const nextEmptyStopIndex = newStops.findIndex(stop => !stop);
      if (nextEmptyStopIndex !== -1) {
        // Focus sur le prochain arrêt vide
        setTimeout(() => {
          // Logique pour focus sur le prochain champ d'arrêt
        }, 100);
      } else if (!destination) {
        // Si tous les arrêts sont remplis, focus sur la destination
        setActiveInput('destination');
        setTimeout(() => {
          destinationInputRef.current?.focus();
        }, 100);
      }
    } else {
      // C'est la destination finale
      if (address === startLocation || stops.includes(address)) {
        Alert.alert(
          'Adresse invalide',
          'Le point de départ, les arrêts et la destination doivent être différents.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Vérifier que tous les arrêts sont remplis avant de naviguer
      if (stops.some(stop => !stop)) {
        Alert.alert(
          'Arrêts incomplets',
          'Veuillez remplir tous les arrêts avant de sélectionner la destination finale.',
          [{ text: 'OK' }]
        );
        return;
      }

      setDestination(address);
      setDestinationSuggestions([]);
      setStartSuggestions([]);

      navigation.navigate('RideOptions', {
        startLocation: startLocation,
        stops: stops,
        destination: address
      });
    }
  };

  const handleOrderBySMS = () => {
    const smsBody = formatSMSBody(startLocation, destination);
    
    Alert.alert(
      'Commander par SMS',
      SMS_CONFIG.MESSAGES.INSTRUCTION,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Ouvrir SMS',
          onPress: () => {
            const url = `sms:${SMS_CONFIG.TWILIO_NUMBER}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(smsBody)}`;
            Linking.openURL(url).catch(err => {
              Alert.alert('Erreur', SMS_CONFIG.MESSAGES.ERROR);
            });
          }
        }
      ]
    );
  };



  const handleSelectPopularPlace = (place) => {
    if (activeInput === 'start') {
      setStartLocation(place.name);
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
      if (place.name === startLocation || 
          place.name === destination || 
          stops.some((stop, i) => i !== stopIndex && stop === place.name)) {
        Alert.alert(
          'Lieu invalide',
          'Chaque arrêt doit avoir une adresse différente.',
          [{ text: 'OK' }]
        );
        return;
      }
      const newStops = [...stops];
      newStops[stopIndex] = place.name;
      setStops(newStops);
    } else {
      // C'est la destination finale
      if (place.name === startLocation || stops.includes(place.name)) {
        Alert.alert(
          'Lieu invalide',
          'Le point de départ, les arrêts et la destination doivent être différents.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Vérifier que tous les arrêts sont remplis
      if (stops.some(stop => !stop)) {
        Alert.alert(
          'Arrêts incomplets',
          'Veuillez remplir tous les arrêts avant de sélectionner la destination finale.',
          [{ text: 'OK' }]
        );
        return;
      }

      setDestination(place.name);
      setDestinationSuggestions([]);
      setStartSuggestions([]);

      navigation.navigate('RideOptions', {
        startLocation: startLocation,
        stops: stops,
        destination: place.name
      });
    }
  };

  const renderSuggestions = () => {
    const suggestions = activeInput === 'start' ? startSuggestions : destinationSuggestions;
    const iconColor = activeInput === 'start' ? '#4CAF50' : '#2196F3';

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
                onPress={() => handleSelectPlace(suggestion, activeInput === 'start')}
              >
                <MaterialIcons 
                  name={suggestion.isLandmark ? "place" : "location-on"} 
                  size={24} 
                  color={suggestion.isLandmark ? "#FF9800" : iconColor}
                />
                <View style={styles.suggestionTextContainer}>
                  <Text style={styles.suggestionMainText}>{mainText}</Text>
                  {secondaryText && (
                    <Text style={styles.suggestionSecondaryText}>{secondaryText}</Text>
                  )}
                  {suggestion.isLandmark && (
                    <Text style={[styles.suggestionSecondaryText, { color: '#FF9800', fontSize: 11 }]}>
                      Point de repère local
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Options spéciales */}
          <TouchableOpacity
            style={styles.specialOption}
            onPress={() => {/* TODO: Implémenter la sélection sur carte */}}
          >
            <MaterialIcons name="map" size={24} color={iconColor} />
            <Text style={styles.specialOptionText}>Choisir sur la carte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.specialOption}
            onPress={() => {/* TODO: Implémenter la géolocalisation */}}
          >
            <MaterialIcons name="my-location" size={24} color={iconColor} />
            <Text style={styles.specialOptionText}>Ma localisation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.specialOption, { borderBottomWidth: 0 }]}
            onPress={() => {/* TODO: Implémenter le signalement d'adresse manquante */}}
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
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Départ</Text>
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
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddStop}
            >
              <Ionicons name="add" size={24} color="#2196F3" />
            </TouchableOpacity>
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
  },
  searchContainer: {
    paddingHorizontal: 20,
  },
  locationInputs: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    gap: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
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
  },
  suggestionsList: {
    padding: 0,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
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
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 2,
  },
  divider: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  dividerText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  placesContainer: {
    paddingHorizontal: 20,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 15,
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
    color: '#8E8E93',
    fontSize: 14,
  },
  specialOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
    backgroundColor: '#1a1a1a',
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
    marginLeft: 5,
  },
  smsInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FF9800',
    borderStyle: 'dashed',
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
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
});