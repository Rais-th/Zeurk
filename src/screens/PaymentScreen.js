import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Animated,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Import des logos
const airtelLogo = require('../../assets/icons/airtel.jpg');
const orangeLogo = require('../../assets/icons/orange.png');
const mpesaLogo = require('../../assets/icons/mpesa.png');

const paymentMethods = [
  {
    id: 'cash',
    type: 'Espèces',
    number: '',
    icon: 'money',
    color: '#4CAF50',
    selected: true,
  },
  {
    id: 'airtel_money',
    type: 'Airtel Money',
    number: '0978 123 456',
    logo: airtelLogo,
    color: '#e70000',
    selected: false,
  },
  {
    id: 'orange_money',
    type: 'Orange Money',
    number: '0898 765 432',
    logo: orangeLogo,
    color: '#FF6600',
    selected: false,
  },
  {
    id: 'mpesa',
    type: 'M-Pesa',
    number: '0971 234 567',
    logo: mpesaLogo,
    color: '#00A651',
    selected: false,
  },
  {
    id: 'credit_card',
    type: 'Carte de crédit',
    number: '5795',
    icon: 'credit-card',
    color: '#1a5490',
    selected: false,
  },
];

export default function PaymentScreen({ route, navigation }) {
  const { currentPayment } = route.params || {};
  const [selectedPayment, setSelectedPayment] = useState(currentPayment?.id || 'cash');
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentType, setPaymentType] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [animation] = useState(new Animated.Value(0));
  
  // États pour l'OTP
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [detectedOTP, setDetectedOTP] = useState(null);
  const [showOTPSuggestion, setShowOTPSuggestion] = useState(false);
  
  // États pour la carte bancaire
  const [showCameraOption, setShowCameraOption] = useState(false);
  
  // Références pour les champs OTP
  const otpRefs = useRef([]);

  // Animations
  const slideUp = Animated.timing(animation, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  });

  const slideDown = Animated.timing(animation, {
    toValue: 0,
    duration: 200,
    useNativeDriver: true,
  });

  const handleModalOpen = () => {
    setModalVisible(true);
    slideUp.start();
  };

  const handleModalClose = () => {
    slideDown.start(() => {
      setModalVisible(false);
      setPaymentType('');
      setPhoneNumber('');
      setCardNumber('');
      setShowOTP(false);
      setOtpCode(['', '', '', '', '', '']);
      setOtpLoading(false);
      setResendTimer(0);
      setDetectedOTP(null);
      setShowOTPSuggestion(false);
      setShowCameraOption(false);
    });
  };

  // Thèmes modernisés
  const themeColors = {
    airtel_money: {
      primary: ['#D00000', '#B00000'],
      secondary: ['#FF2D2D', '#FF0000'],
      text: '#FFFFFF',
      input: 'rgba(255, 255, 255, 0.2)',
      inputText: '#FFFFFF',
      placeholder: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(255, 255, 255, 0.3)',
    },
    orange_money: {
      primary: ['#1a1a1a', '#000000'],
      secondary: ['#FF6600', '#E65C00'],
      text: '#FFFFFF',
      input: 'rgba(255, 102, 0, 0.2)',
      inputText: '#FFFFFF',
      placeholder: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(255, 102, 0, 0.4)',
    },
    mpesa: {
      primary: ['#8B0000', '#6B0000'],
      secondary: ['#00A651', '#008C45'],
      text: '#FFFFFF',
      input: 'rgba(0, 166, 81, 0.15)',
      inputText: '#FFFFFF',
      placeholder: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(0, 166, 81, 0.4)',
    },
    default: {
      primary: ['#1a1a1a', '#2a2a2a'],
      secondary: ['#4CAF50', '#45a049'],
      text: '#FFFFFF',
      input: 'rgba(255, 255, 255, 0.1)',
      inputText: '#FFFFFF',
      placeholder: 'rgba(255, 255, 255, 0.4)',
      border: 'rgba(255, 255, 255, 0.1)',
    }
  };

  const currentTheme = 
    paymentType === 'airtel_money' ? themeColors.airtel_money : 
    paymentType === 'orange_money' ? themeColors.orange_money :
    paymentType === 'mpesa' ? themeColors.mpesa :
    themeColors.default;

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const handlePaymentSelect = (paymentId) => {
    const payment = paymentMethods.find(method => method.id === paymentId);
    navigation.goBack();
    // Envoyer les données à l'écran précédent
    if (route.params?.onSelect) {
      route.params.onSelect(payment);
    }
  };

  // Fonction pour obtenir les couleurs de sélection selon la méthode
  const getSelectionColors = (method) => {
    const baseColor = method.color;
    
    // Convertir la couleur en version plus sombre pour le fond
    const getDarkerColor = (color) => {
      if (color === '#4CAF50') return '#1a4d3a'; // Espèces - vert foncé
      if (color === '#e70000') return '#4d0000'; // Airtel - rouge foncé
      if (color === '#FF6600') return '#4d1f00'; // Orange - orange foncé
      if (color === '#00A651') return '#003d1f'; // M-Pesa - vert foncé
      if (color === '#1a5490') return '#0d2a4a'; // Carte - bleu foncé
      return '#2a2a2a'; // Couleur par défaut
    };

    // Convertir en version plus claire avec transparence pour l'ombre
    const getLighterColor = (color) => {
      if (color === '#4CAF50') return 'rgba(76, 175, 80, 0.3)';
      if (color === '#e70000') return 'rgba(231, 0, 0, 0.3)';
      if (color === '#FF6600') return 'rgba(255, 102, 0, 0.3)';
      if (color === '#00A651') return 'rgba(0, 166, 81, 0.3)';
      if (color === '#1a5490') return 'rgba(26, 84, 144, 0.3)';
      return 'rgba(76, 175, 80, 0.3)';
    };

    return {
      backgroundColor: getDarkerColor(baseColor),
      borderColor: baseColor,
      shadowColor: getLighterColor(baseColor)
    };
  };

  const handleAddPayment = () => {
    // Validation des champs selon le type
    if (paymentType === '') {
      alert('Veuillez sélectionner un type de paiement');
      return;
    }

    if ((paymentType === 'airtel_money' || paymentType === 'orange_money' || paymentType === 'mpesa') && !phoneNumber) {
      alert('Veuillez entrer un numéro de téléphone');
      return;
    }

    if (paymentType === 'credit_card' && !cardNumber) {
      alert('Veuillez entrer un numéro de carte');
      return;
    }

    // Pour les mobile money, appeler notre backend pour initier le paiement
    if (paymentType === 'airtel_money' || paymentType === 'orange_money' || paymentType === 'mpesa') {
      console.log(`Initiating backend payment for ${paymentType} with number ${phoneNumber}`);
      // Remplacer la simulation OTP par un appel au backend
      // fetch('https://votre-backend.com/api/payments/airtel/initiate-collection', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ phoneNumber, type: paymentType })
      // })
      // .then(res => res.json())
      // .then(data => {
      //   if(data.success) {
      //      alert('Veuillez confirmer le paiement sur votre téléphone en entrant votre code PIN.');
      //      // Ici, on pourrait commencer à vérifier le statut de la transaction (polling)
      //      handleModalClose();
      //   } else {
      //      alert(`Erreur: ${data.message}`);
      //   }
      // })
      // .catch(err => alert('Une erreur de réseau est survenue.'));

      // Pour l'instant, on garde une alerte simple pour montrer le nouveau flux
      alert('Une demande de paiement a été envoyée sur votre téléphone. Veuillez la valider avec votre code PIN.');
      handleModalClose();
      return;
    }

    // Pour les cartes de crédit, ajouter directement
    if (paymentType === 'credit_card') {
      alert('Carte de crédit ajoutée avec succès');
      handleModalClose();
    }
  };

  // Fonction pour gérer le timer de renvoi
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Fonction pour gérer la saisie OTP
  const handleOtpChange = (value, index) => {
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    
    // Saut automatique au champ suivant
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Fonction pour gérer la suppression (backspace)
  const handleOtpKeyPress = (key, index) => {
    if (key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Fonction pour vérifier l'OTP
  const handleVerifyOTP = () => {
    const otp = otpCode.join('');
    if (otp.length !== 6) {
      alert('Veuillez entrer le code OTP complet');
      return;
    }

    setOtpLoading(true);
    
    // Simuler la vérification OTP
    setTimeout(() => {
      setOtpLoading(false);
      alert('Méthode de paiement ajoutée avec succès');
      handleModalClose();
    }, 2000);
  };

  // Fonction pour renvoyer l'OTP
  const handleResendOTP = () => {
    if (resendTimer > 0) return;
    
    setOtpCode(['', '', '', '', '', '']);
    startResendTimer();
    alert(`Nouveau code OTP envoyé au ${phoneNumber}`);
  };

  // Fonction pour extraire l'OTP des SMS
  const extractOTPFromMessage = (message) => {
    // Patterns pour différents opérateurs
    const patterns = [
      /(\d{6})/g, // Code à 6 chiffres général
      /code.*?(\d{6})/gi, // "code: 123456"
      /otp.*?(\d{6})/gi, // "OTP: 123456"
      /verification.*?(\d{6})/gi, // "verification code: 123456"
      /airtel.*?(\d{6})/gi, // Messages Airtel
      /orange.*?(\d{6})/gi, // Messages Orange
      /mpesa.*?(\d{6})/gi, // Messages M-Pesa
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // Fonction pour simuler la détection de SMS (en production, utiliser une vraie API SMS)
  const simulateSMSDetection = () => {
    // Simuler la réception d'un SMS après 3 secondes
    setTimeout(() => {
      const mockSMS = `Votre code de verification ${paymentType === 'airtel_money' ? 'Airtel Money' : 
                       paymentType === 'orange_money' ? 'Orange Money' : 'M-Pesa'} est: 123456. Ne le partagez avec personne.`;
      
      const extractedOTP = extractOTPFromMessage(mockSMS);
      if (extractedOTP) {
        setDetectedOTP(extractedOTP);
        setShowOTPSuggestion(true);
      }
    }, 3000);
  };

  // Fonction pour utiliser l'OTP détecté
  const useDetectedOTP = () => {
    if (detectedOTP) {
      const otpArray = detectedOTP.split('');
      setOtpCode(otpArray);
      setShowOTPSuggestion(false);
      setDetectedOTP(null);
    }
  };

  // Fonction pour rejeter l'OTP détecté
  const rejectDetectedOTP = () => {
    setShowOTPSuggestion(false);
    setDetectedOTP(null);
  };

  // Fonction pour prendre une photo de la carte
  const takeCardPhoto = async () => {
    try {
      // Simuler la prise de photo et l'extraction des données
      setShowCameraOption(false);
      
      // Simuler l'extraction des données de carte
      setTimeout(() => {
        const mockCardData = '4532 1234 5678 9012';
        setCardNumber(mockCardData);
        Alert.alert(
          'Carte détectée',
          `Numéro de carte extrait: ${mockCardData}`,
          [{ text: 'OK' }]
        );
      }, 1500);
      
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de prendre la photo');
    }
  };

  // Fonction pour choisir une photo depuis la galerie
  const pickCardImage = async () => {
    try {
      setShowCameraOption(false);
      
      // Simuler la sélection d'image et l'extraction
      setTimeout(() => {
        const mockCardData = '5555 4444 3333 2222';
        setCardNumber(mockCardData);
        Alert.alert(
          'Carte détectée',
          `Numéro de carte extrait: ${mockCardData}`,
          [{ text: 'OK' }]
        );
      }, 1000);
      
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Méthodes de paiement</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Payment Methods */}
        <View style={styles.paymentMethodsSection}>
          {paymentMethods.map((method) => {
            const selectionColors = getSelectionColors(method);
            return (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodItem,
                  selectedPayment === method.id && {
                    backgroundColor: selectionColors.backgroundColor,
                    borderColor: selectionColors.borderColor,
                    shadowColor: method.color,
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 5,
                  }
                ]}
                onPress={() => handlePaymentSelect(method.id)}
              >
              <View style={styles.paymentMethodLeft}>
                {method.id === 'cash' && (
                  <View style={[styles.paymentIcon, { backgroundColor: method.color }]}>
                    <MaterialIcons name="attach-money" size={20} color="#fff" />
                  </View>
                )}
                {method.id === 'airtel_money' && (
                  <View style={styles.paymentIcon}>
                    <Image source={method.logo} style={styles.paymentMethodLogo} resizeMode="contain" />
                  </View>
                )}
                {method.id === 'orange_money' && (
                  <View style={styles.paymentIcon}>
                    <Image source={method.logo} style={styles.paymentMethodLogo} resizeMode="contain" />
                  </View>
                )}
                {method.id === 'mpesa' && (
                  <View style={styles.paymentIcon}>
                    <Image source={method.logo} style={styles.paymentMethodLogo} resizeMode="contain" />
                  </View>
                )}
                {method.id === 'credit_card' && (
                  <View style={[styles.paymentIcon, { backgroundColor: method.color }]}>
                    <MaterialIcons name="credit-card" size={20} color="#fff" />
                  </View>
                )}
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodName}>
                    {method.type} {method.number}
                  </Text>
                </View>
              </View>
              

            </TouchableOpacity>
            );
          })}

          {/* Add Payment Method */}
          <TouchableOpacity 
            style={styles.addPaymentMethod}
            onPress={handleModalOpen}
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addPaymentText}>Ajouter une méthode de paiement</Text>
          </TouchableOpacity>
        </View>


      </ScrollView>

      {/* Add Payment Method Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={Keyboard.dismiss}
          >
            <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardAvoidingView}
            >
              <Animated.View 
                style={[
                  styles.modalContent,
                  { transform: [{ translateY }] }
                ]}
              >
              <LinearGradient
                colors={currentTheme.primary}
                style={styles.modalGradient}
              >
                <View style={[
                  styles.modalHeader,
                  { borderBottomColor: currentTheme.border }
                ]}>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={handleModalClose}
                  >
                    <Ionicons name="chevron-down" size={24} color={currentTheme.text} />
                  </TouchableOpacity>
                  <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                    {
                      paymentType === 'airtel_money' ? 'Ajouter Airtel Money' : 
                      paymentType === 'orange_money' ? 'Ajouter Orange Money' :
                      paymentType === 'mpesa' ? 'Ajouter M-Pesa' :
                      'Ajouter un moyen de paiement'
                    }
                  </Text>
                  <View style={styles.headerRight} />
                </View>

                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  {!showOTP && (
                    <View style={styles.paymentTypeSection}>
                      <View style={styles.paymentTypeGrid}>
                      {[
                        { id: 'airtel_money', icon: airtelLogo },
                        { id: 'orange_money', icon: orangeLogo },
                        { id: 'mpesa', icon: mpesaLogo },
                        { id: 'credit_card', name: 'Carte bancaire', iconName: 'credit-card' }
                      ].map((method) => (
                        <TouchableOpacity 
                          key={method.id}
                          style={[
                            styles.paymentTypeButton,
                            paymentType === method.id && (method.id === 'airtel_money' || method.id === 'mpesa') && {
                              backgroundColor: '#FFFFFF',
                              borderColor: method.id === 'airtel_money' ? '#e70000' : '#00A651',
                              borderWidth: 2,
                            },
                            paymentType === method.id && method.id !== 'airtel_money' && method.id !== 'mpesa' && {
                              borderColor: currentTheme.text,
                              borderWidth: 2,
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                            paymentType !== method.id && {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                              backgroundColor: 'transparent',
                            }
                          ]}
                          onPress={() => setPaymentType(method.id)}
                        >
                          <View style={styles.buttonGradient}>
                            {method.icon ? (
                              <Image 
                                source={method.icon} 
                                style={styles.paymentLogo} 
                                resizeMode="contain"
                              />
                            ) : (
                              <FontAwesome5 
                                name={method.iconName} 
                                size={28} 
                                color={paymentType === method.id ? 
                                  (method.id === 'airtel_money' ? '#e70000' : 
                                   method.id === 'mpesa' ? '#00A651' : 
                                   currentTheme.text) : 
                                  'rgba(255,255,255,0.9)'} 
                              />
                            )}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  )}

                  {(paymentType === 'airtel_money' || paymentType === 'orange_money' || paymentType === 'mpesa') && !showOTP && (
                    <View style={styles.inputSection}>
                      <Text style={[styles.modalLabel, { color: currentTheme.text }]}>
                        Numéro de téléphone
                      </Text>
                      <View style={[
                        styles.inputWrapper, 
                        { 
                          backgroundColor: currentTheme.input,
                          borderWidth: (paymentType === 'orange_money' || paymentType === 'mpesa') ? 1 : 0,
                          borderColor: paymentType === 'orange_money' ? 'rgba(255, 102, 0, 0.6)' : 
                                      paymentType === 'mpesa' ? 'rgba(0, 166, 81, 0.6)' : 
                                      'transparent'
                        }
                      ]}>
                        <FontAwesome5 
                          name="phone" 
                          size={16} 
                          color={paymentType === 'orange_money' ? '#FF6600' : 
                                paymentType === 'mpesa' ? '#00A651' : 
                                currentTheme.text} 
                          style={styles.inputIcon} 
                        />
                        <TextInput
                          style={[styles.input, { color: currentTheme.inputText }]}
                          placeholder={
                            paymentType === 'airtel_money' ? '0978 XXX XXX' : 
                            paymentType === 'orange_money' ? '0898 XXX XXX' : 
                            '0971 XXX XXX'
                          }
                          placeholderTextColor={currentTheme.placeholder}
                          value={phoneNumber}
                          onChangeText={setPhoneNumber}
                          keyboardType="phone-pad"
                        />
                      </View>
                    </View>
                  )}

                  {paymentType === 'credit_card' && (
                    <View style={styles.inputSection}>
                      <Text style={[styles.modalLabel, { color: currentTheme.text }]}>
                        Numéro de carte
                      </Text>
                      <View style={[styles.inputWrapper, { backgroundColor: currentTheme.input }]}>
                        <FontAwesome5 name="credit-card" size={16} color={currentTheme.text} style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, { color: currentTheme.inputText }]}
                          placeholder="1234 5678 9012 3456"
                          placeholderTextColor={currentTheme.placeholder}
                          value={cardNumber}
                          onChangeText={setCardNumber}
                          keyboardType="number-pad"
                        />
                        <TouchableOpacity 
                          style={styles.cameraButton}
                          onPress={() => setShowCameraOption(true)}
                        >
                          <FontAwesome5 name="camera" size={16} color={currentTheme.text} />
                        </TouchableOpacity>
                      </View>
                      
                      {/* Options d'appareil photo */}
                      {showCameraOption && (
                        <View style={[styles.cameraOptions, { backgroundColor: currentTheme.input }]}>
                          <TouchableOpacity 
                            style={[styles.cameraOptionButton, { borderBottomColor: currentTheme.border }]}
                            onPress={takeCardPhoto}
                          >
                            <FontAwesome5 name="camera" size={18} color={currentTheme.text} />
                            <Text style={[styles.cameraOptionText, { color: currentTheme.text }]}>
                              Prendre une photo
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.cameraOptionButton}
                            onPress={pickCardImage}
                          >
                            <FontAwesome5 name="image" size={18} color={currentTheme.text} />
                            <Text style={[styles.cameraOptionText, { color: currentTheme.text }]}>
                              Choisir depuis la galerie
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.cameraOptionButton, styles.cancelOption]}
                            onPress={() => setShowCameraOption(false)}
                          >
                            <FontAwesome5 name="times" size={18} color="#FF6B6B" />
                            <Text style={[styles.cameraOptionText, { color: '#FF6B6B' }]}>
                              Annuler
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Section OTP pour Mobile Money */}
                  {showOTP && (paymentType === 'airtel_money' || paymentType === 'orange_money' || paymentType === 'mpesa') && (
                    <View style={styles.otpSection}>
                      <View style={styles.otpHeader}>
                        <Text style={[styles.otpServiceTitle, { 
                          color: paymentType === 'airtel_money' ? '#e70000' : 
                                 paymentType === 'orange_money' ? '#FF6600' : 
                                 '#00A651'
                        }]}>
                          {paymentType === 'airtel_money' ? 'Airtel Money' : 
                           paymentType === 'orange_money' ? 'Orange Money' : 
                           'M-Pesa'}
                        </Text>
                        <Text style={[styles.otpPhoneNumber, { color: currentTheme.placeholder }]}>
                          {phoneNumber}
                        </Text>
                      </View>
                      <Text style={[styles.modalLabel, { color: currentTheme.text }]}>
                        Code de vérification
                      </Text>
                      <Text style={[styles.otpDescription, { color: currentTheme.placeholder }]}>
                        Un code à 6 chiffres a été envoyé au {phoneNumber}
                      </Text>
                      
                      <View style={styles.otpContainer}>
                        {otpCode.map((digit, index) => (
                          <TextInput
                            key={index}
                            ref={(ref) => (otpRefs.current[index] = ref)}
                            style={[
                              styles.otpInput,
                              {
                                borderColor: digit ? 
                                  (paymentType === 'airtel_money' ? '#e70000' : 
                                   paymentType === 'orange_money' ? '#FF6600' : 
                                   '#00A651') : 
                                  'rgba(255, 255, 255, 0.3)',
                                backgroundColor: currentTheme.input,
                                color: currentTheme.inputText
                              }
                            ]}
                            value={digit}
                            onChangeText={(value) => handleOtpChange(value, index)}
                            onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            textAlign="center"
                            selectTextOnFocus
                          />
                        ))}
                      </View>

                                             <View style={styles.otpActions}>
                         <TouchableOpacity 
                           style={[styles.resendButton, { opacity: resendTimer > 0 ? 0.5 : 1 }]}
                           onPress={handleResendOTP}
                           disabled={resendTimer > 0}
                         >
                           <Text style={[styles.resendButtonText, { color: currentTheme.text }]}>
                             {resendTimer > 0 ? `Renvoyer dans ${resendTimer}s` : 'Renvoyer le code'}
                           </Text>
                         </TouchableOpacity>
                       </View>

                       {/* Suggestion OTP détecté */}
                       {showOTPSuggestion && detectedOTP && (
                         <View style={[styles.otpSuggestion, { 
                           backgroundColor: paymentType === 'airtel_money' ? 'rgba(231, 0, 0, 0.1)' : 
                                           paymentType === 'orange_money' ? 'rgba(255, 102, 0, 0.1)' : 
                                           'rgba(0, 166, 81, 0.1)',
                           borderColor: paymentType === 'airtel_money' ? '#e70000' : 
                                       paymentType === 'orange_money' ? '#FF6600' : 
                                       '#00A651'
                         }]}>
                           <View style={styles.otpSuggestionHeader}>
                             <Ionicons 
                               name="mail" 
                               size={16} 
                               color={paymentType === 'airtel_money' ? '#e70000' : 
                                      paymentType === 'orange_money' ? '#FF6600' : 
                                      '#00A651'} 
                             />
                             <Text style={[styles.otpSuggestionTitle, { 
                               color: paymentType === 'airtel_money' ? '#e70000' : 
                                      paymentType === 'orange_money' ? '#FF6600' : 
                                      '#00A651'
                             }]}>
                               SMS reçu
                             </Text>
                           </View>
                           <Text style={[styles.otpSuggestionText, { color: currentTheme.text }]}>
                             Code détecté: {detectedOTP}
                           </Text>
                           <View style={styles.otpSuggestionActions}>
                             <TouchableOpacity 
                               style={[styles.otpSuggestionButton, styles.otpUseButton, {
                                 backgroundColor: paymentType === 'airtel_money' ? '#e70000' : 
                                                 paymentType === 'orange_money' ? '#FF6600' : 
                                                 '#00A651'
                               }]}
                               onPress={useDetectedOTP}
                             >
                               <Text style={styles.otpUseButtonText}>Utiliser</Text>
                             </TouchableOpacity>
                             <TouchableOpacity 
                               style={[styles.otpSuggestionButton, styles.otpRejectButton]}
                               onPress={rejectDetectedOTP}
                             >
                               <Text style={[styles.otpRejectButtonText, { color: currentTheme.text }]}>
                                 Ignorer
                               </Text>
                             </TouchableOpacity>
                           </View>
                         </View>
                       )}
                     </View>
                   )}

                  <TouchableOpacity 
                    style={[styles.addButton]}
                    onPress={showOTP ? handleVerifyOTP : handleAddPayment}
                    disabled={otpLoading}
                  >
                    <LinearGradient
                      colors={
                        paymentType === 'airtel_money' ? ['#FF2D2D', '#FF0000'] : 
                        paymentType === 'orange_money' ? ['#FF6600', '#E65C00'] :
                        paymentType === 'mpesa' ? ['#00A651', '#008C45'] :
                        paymentType === 'credit_card' ? ['#000000', '#1a1a1a'] :
                        ['#4CAF50', '#45a049']
                      }
                      style={styles.addButtonGradient}
                    >
                      <Text style={[styles.addButtonText, { 
                        color: '#FFFFFF',
                        fontWeight: '700',
                        fontSize: 17,
                        textShadowColor: 'rgba(0, 0, 0, 0.2)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2
                      }]}>
                        {
                          showOTP ? (otpLoading ? 'Vérification...' : 'Vérifier le code') :
                          paymentType === 'airtel_money' ? 'Ajouter Airtel Money' : 
                          paymentType === 'orange_money' ? 'Ajouter Orange Money' :
                          paymentType === 'mpesa' ? 'Ajouter M-Pesa' :
                          'Ajouter'
                        }
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </ScrollView>
              </LinearGradient>
            </Animated.View>
            </KeyboardAvoidingView>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  rightPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  paymentMethodsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 17,
    color: '#fff',
    fontWeight: '500',
  },

  addPaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  addPaymentText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: '50%',
  },
  modalGradient: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 30,
  },
  modalScroll: {
    flex: 1,
    padding: 20,
    paddingBottom: 10,
  },
  paymentTypeSection: {
    marginBottom: 15,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  paymentTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  paymentTypeButton: {
    width: (width - 60) / 2,
    height: 80,
    margin: 5,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    width: '100%',
    height: '100%',
  },
  paymentTypeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  cameraButton: {
    padding: 8,
    marginLeft: 8,
  },
  cameraOptions: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cameraOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  cameraOptionText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  cancelOption: {
    borderBottomWidth: 0,
  },
  addButton: {
    marginTop: 20,
    marginBottom: Platform.OS === 'ios' ? 20 : 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  airtelText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  orangeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  mpesaText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },

  paymentLogo: {
    width: '70%',
    height: '70%',
  },
  paymentMethodLogo: {
    width: '100%',
    height: '100%',
  },
  // Styles pour l'OTP
  otpSection: {
    marginBottom: 15,
  },
  otpHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  otpServiceTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 5,
  },
  otpPhoneNumber: {
    fontSize: 16,
    fontWeight: '500',
  },
  otpDescription: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: '600',
  },
  otpActions: {
    alignItems: 'center',
  },
  resendButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  resendButtonText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  // Styles pour la suggestion OTP
  otpSuggestion: {
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  otpSuggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  otpSuggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  otpSuggestionText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  otpSuggestionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpSuggestionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  otpUseButton: {
    marginRight: 8,
  },
  otpUseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  otpRejectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginLeft: 8,
  },
  otpRejectButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 