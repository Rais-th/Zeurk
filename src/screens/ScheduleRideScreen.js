import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, typography, spacing, borderRadius } from '../config/designTokens';

const { width, height } = Dimensions.get('window');

export default function ScheduleRideScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [slideAnim] = useState(new Animated.Value(0));
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [tempDate, setTempDate] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const [spinAnim] = useState(new Animated.Value(0));
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    when: 'now',
    customDateTime: new Date(Date.now() + 60 * 60 * 1000),
    category: '',
  });

  const quickTimes = [
    { id: '1hour', label: '1 heure', icon: 'time', minutes: 60 },
    { id: 'custom', label: 'Choisir', icon: 'calendar' },
  ];

  const vehicleCategories = [
    { 
      id: 'standard', 
      name: 'Standard', 
      price: '2,500 FC',
      icon: 'car-outline',
    },
    { 
      id: 'luxe', 
      name: 'Luxe', 
      price: '5,000 FC',
      icon: 'car-sport-outline',
    },
    { 
      id: 'diplomate', 
      name: 'Diplomate', 
      price: '8,500 FC',
      icon: 'shield-checkmark-outline',
    }
  ];

  const steps = [
    {
      title: "D'où partez-vous ?",
      subtitle: "Votre adresse de départ",
      field: 'from',
      placeholder: 'Entrez votre adresse de départ',
      icon: 'location-outline',
    },
    {
      title: "Où allez-vous ?",
      subtitle: "Votre destination",
      field: 'to',
      placeholder: 'Entrez votre destination',
      icon: 'flag-outline',
    },
    {
      title: "Quand partir ?",
      subtitle: "Choisissez votre moment",
      field: 'when',
      isTime: true,
      icon: 'time-outline',
    },
    {
      title: "Choisissez votre catégorie",
      subtitle: "Sélectionnez le type de véhicule",
      field: 'category',
      isCategory: true,
      icon: 'car-sport-outline',
    },
    {
      title: "Récapitulatif",
      subtitle: "Vérifiez votre commande",
      field: 'summary',
      isSummary: true,
      icon: 'receipt-outline',
    }
  ];

  const animateToStep = (step) => {
    Animated.spring(slideAnim, {
      toValue: -step * width,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    setCurrentStep(step);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      animateToStep(currentStep + 1);
    } else {
      handleSchedule();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      animateToStep(currentStep - 1);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTimeSelect = (timeOption) => {
    updateField('when', timeOption.id);
    if (timeOption.id === 'custom') {
      setTempDate(formData.customDateTime);
      setPickerMode('date');
      setShowDateTimePicker(true);
    }
  };

  const handleCategorySelect = (category) => {
    updateField('category', category.id);
  };

  const onDateTimeChange = (event, selectedDate) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const confirmDate = () => {
    setPickerMode('time');
  };

  const confirmTime = () => {
    updateField('customDateTime', tempDate);
    setShowDateTimePicker(false);
  };

  const cancelPicker = () => {
    setShowDateTimePicker(false);
  };

  const startSpinAnimation = () => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  const handleSchedule = async () => {
    setIsScheduling(true);
    startSpinAnimation();
    
    // Simulation d'une requête API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsScheduling(false);
    setScheduleSuccess(true);
    spinAnim.setValue(0);
  };

  const getTimeText = () => {
    const selected = quickTimes.find(t => t.id === formData.when);
    if (selected?.minutes) return `Départ dans ${selected.label}`;
    if (selected?.id === 'custom') {
      return `Le ${formData.customDateTime.toLocaleDateString()} à ${formData.customDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return 'Heure personnalisée';
  };

  const getSelectedCategory = () => {
    return vehicleCategories.find(cat => cat.id === formData.category);
  };

  const calculatePrice = () => {
    const category = getSelectedCategory();
    if (!category) return '0 FC';
    return category.price;
  };

  const canProceed = () => {
    const step = steps[currentStep];
    if (step.field === 'from') return formData.from.length > 2;
    if (step.field === 'to') return formData.to.length > 2;
    if (step.field === 'when') return formData.when !== null;
    if (step.field === 'category') return formData.category !== '';
    if (step.field === 'summary') return true;
    return false;
  };

  const renderStep = (step, index) => (
    <View key={index} style={styles.stepContainer}>
      {/* Header Simplifié */}
      <View style={styles.stepHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={step.icon} size={28} color={colors.primary} />
        </View>
        <View style={styles.stepTitleContainer}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
        </View>
      </View>

      {/* Content Épuré */}
      <View style={styles.stepContent}>
        {step.isTime ? (
          <View style={styles.optionsList}>
            {quickTimes.map((timeOption) => (
              <TouchableOpacity
                key={timeOption.id}
                style={[
                  styles.optionButton,
                  formData.when === timeOption.id && styles.selectedOptionButton
                ]}
                onPress={() => handleTimeSelect(timeOption)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={timeOption.icon} 
                  size={24} 
                  color={formData.when === timeOption.id ? 'white' : colors.primary} 
                />
                <Text style={[
                  styles.optionButtonText,
                  formData.when === timeOption.id && styles.selectedOptionButtonText
                ]}>
                  {timeOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : step.isCategory ? (
          <View style={styles.optionsList}>
            {vehicleCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.optionButton,
                  formData.category === category.id && styles.selectedOptionButton
                ]}
                onPress={() => handleCategorySelect(category)}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={category.icon} 
                  size={28} 
                  color={formData.category === category.id ? 'white' : colors.primary} 
                />
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.optionButtonText,
                    formData.category === category.id && styles.selectedOptionButtonText
                  ]}>{category.name}</Text>
                  <Text style={[
                    styles.optionPriceText,
                    formData.category === category.id && styles.selectedOptionPriceText
                  ]}>{category.price}</Text>
                </View>
                {formData.category === category.id && (
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : step.isSummary ? (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
                <View style={styles.summaryTextContainer}>
                  <Text style={styles.summaryLabel}>Départ</Text>
                  <Text style={styles.summaryText} numberOfLines={1}>{formData.from || 'Non défini'}</Text>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="flag-outline" size={20} color={colors.textSecondary} />
                <View style={styles.summaryTextContainer}>
                  <Text style={styles.summaryLabel}>Destination</Text>
                  <Text style={styles.summaryText} numberOfLines={1}>{formData.to || 'Non défini'}</Text>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                <View style={styles.summaryTextContainer}>
                  <Text style={styles.summaryLabel}>Horaire</Text>
                  <Text style={styles.summaryText}>{getTimeText()}</Text>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="car-sport-outline" size={20} color={colors.textSecondary} />
                <View style={styles.summaryTextContainer}>
                  <Text style={styles.summaryLabel}>Catégorie</Text>
                  <Text style={styles.summaryText}>{getSelectedCategory()?.name || 'Non définie'}</Text>
                </View>
              </View>
              <View style={styles.priceSeparator} />
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Prix Est.</Text>
                <Text style={styles.priceValue}>{calculatePrice()}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <Ionicons name={step.icon} size={24} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={step.placeholder}
              placeholderTextColor={colors.textSecondary}
              value={formData[step.field]}
              onChangeText={(text) => updateField(step.field, text)}
              autoFocus={index === 0}
              returnKeyType="done"
            />
            {formData[step.field].length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => updateField(step.field, '')}
              >
                <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Sobree */}
      <LinearGradient
        colors={['#111', '#000']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header Minimaliste */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={currentStep > 0 ? prevStep : () => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentStep && { backgroundColor: colors.primary, width: 24 },
                index < currentStep && { backgroundColor: colors.primary }
              ]}
            />
          ))}
        </View>
        
        <View style={styles.backButton} />
      </View>

      {/* Steps Container */}
      <Animated.View 
        style={[
          styles.stepsContainer,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        {steps.map(renderStep)}
      </Animated.View>

      {/* Bottom Actions Épurées */}
      <View style={styles.bottomContainer}>
        {currentStep < steps.length - 1 ? (
          <TouchableOpacity
            style={[
              styles.nextButton,
              !canProceed() && styles.nextButtonDisabled
            ]}
            onPress={nextStep}
            disabled={!canProceed()}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              Continuer
            </Text>
            <Ionicons 
              name="arrow-forward-outline" 
              size={22} 
              color={'white'} 
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.scheduleButton,
              (isScheduling || scheduleSuccess) && styles.scheduleButtonDisabled
            ]}
            onPress={handleSchedule}
            disabled={isScheduling || scheduleSuccess}
            activeOpacity={0.8}
          >
            {isScheduling ? (
              <>
                <Animated.View 
                  style={[
                    styles.loadingSpinner,
                    {
                      transform: [{
                        rotate: spinAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        })
                      }]
                    }
                  ]} 
                />
                <Text style={styles.scheduleButtonText}>Planification...</Text>
              </>
            ) : scheduleSuccess ? (
              <>
                <Ionicons name="checkmark-circle" size={24} color="white" />
                <Text style={styles.scheduleButtonText}>Planifié !</Text>
              </>
            ) : (
              <>
                <Ionicons name="calendar-outline" size={24} color="white" />
                <Text style={styles.scheduleButtonText}>Planifier pour {calculatePrice()}</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Success Animation */}
      {scheduleSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={60} color="white" />
            </View>
            <Text style={styles.successTitle}>Course planifiée !</Text>
            <Text style={styles.successSubtitle}>
              Les détails de votre course sont dans votre historique.
            </Text>
            <View style={styles.successDetails}>
              <Text style={styles.successDetail}>📍 {formData.from}</Text>
              <Text style={styles.successDetail}>🏁 {formData.to}</Text>
              <Text style={styles.successDetail}>⏰ {getTimeText()}</Text>
              <Text style={styles.successDetail}>🚗 {getSelectedCategory()?.name} - {calculatePrice()}</Text>
            </View>
            <TouchableOpacity 
              style={styles.finishButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.finishButtonText}>Terminer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modern DateTime Picker Modal */}
      {showDateTimePicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerModalContainer}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>
                  {pickerMode === 'date' ? 'Choisir la date' : 'Choisir l\'heure'}
                </Text>
                <TouchableOpacity 
                  style={styles.pickerCloseButton}
                  onPress={cancelPicker}
                >
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={tempDate}
                  mode={pickerMode}
                  display="spinner"
                  onChange={onDateTimeChange}
                  minimumDate={new Date()}
                  textColor={colors.text}
                  themeVariant="dark"
                  style={styles.dateTimePicker}
                />
              </View>
              
              <View style={styles.pickerButtons}>
                {pickerMode === 'date' ? (
                  <TouchableOpacity 
                    style={styles.confirmButton}
                    onPress={confirmDate}
                  >
                    <Text style={styles.confirmButtonText}>Suivant</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.confirmButton}
                    onPress={confirmTime}
                  >
                    <Text style={styles.confirmButtonText}>Confirmer</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.small,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressDot: {
    height: 4,
    width: 8,
    borderRadius: 2,
    backgroundColor: colors.backgroundSecondary,
  },
  stepsContainer: {
    flexDirection: 'row',
    width: width * 5, // 5 steps
  },
  stepContainer: {
    width: width,
    flex: 1,
    paddingHorizontal: spacing.large,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.large,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    marginRight: spacing.medium,
  },
  stepTitleContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.h2,
    fontWeight: 'bold',
    color: colors.text,
  },
  stepSubtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  stepContent: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.medium,
  },
  inputIcon: {
    marginRight: spacing.medium,
  },
  input: {
    flex: 1,
    height: 60,
    fontSize: typography.body,
    color: colors.text,
  },
  clearButton: {
    padding: spacing.small,
  },
  optionsList: {
    gap: spacing.medium,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.medium,
    borderRadius: borderRadius.medium,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOptionButton: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: spacing.medium,
  },
  optionButtonText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  selectedOptionButtonText: {
    color: colors.primary,
  },
  optionPriceText: {
    fontSize: typography.small,
    color: colors.textSecondary,
  },
  selectedOptionPriceText: {
    color: colors.primary,
  },
  summaryContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  summaryContent: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.large,
    padding: spacing.large,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.medium,
  },
  summaryTextContainer: {
    flex: 1,
    marginLeft: spacing.medium,
  },
  summaryLabel: {
    fontSize: typography.small,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  summaryText: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  priceSeparator: {
    height: 1,
    backgroundColor: colors.background,
    marginVertical: spacing.medium,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.small,
  },
  priceLabel: {
    fontSize: typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: typography.h2,
    color: colors.text,
    fontWeight: 'bold',
  },
  bottomContainer: {
    paddingHorizontal: spacing.large,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.small,
  },
  nextButtonDisabled: {
    backgroundColor: colors.backgroundSecondary,
  },
  nextButtonText: {
    color: 'white',
    fontSize: typography.body,
    fontWeight: 'bold',
  },
  scheduleButton: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.medium,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.small,
  },
  scheduleButtonDisabled: {
    backgroundColor: 'rgba(46, 204, 113, 0.5)',
  },
  scheduleButtonText: {
    color: 'white',
    fontSize: typography.body,
    fontWeight: 'bold',
  },
  loadingSpinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopColor: 'white',
  },
  successOverlay: {
    position: 'absolute',
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  successContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.large,
    padding: spacing.large,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.large,
  },
  successTitle: {
    fontSize: typography.h1,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.small,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.large,
    textAlign: 'center',
  },
  successDetails: {
    alignSelf: 'stretch',
    gap: spacing.medium,
    marginBottom: spacing.large,
  },
  successDetail: {
    fontSize: typography.body,
    color: colors.text,
    textAlign: 'center',
  },
  finishButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  finishButtonText: {
    color: 'white',
    fontSize: typography.body,
    fontWeight: 'bold',
  },
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 1000,
  },
  pickerModalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: borderRadius.large,
    overflow: 'hidden',
  },
  pickerModal: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.medium,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.small,
  },
  pickerTitle: {
    fontSize: typography.h3,
    fontWeight: 'bold',
    color: colors.text,
  },
  pickerCloseButton: {
    padding: spacing.small,
  },
  pickerContainer: {
    padding: spacing.small,
  },
  dateTimePicker: {
    height: 200,
  },
  pickerButtons: {
    padding: spacing.small,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: typography.body,
    fontWeight: 'bold',
  },
}); 