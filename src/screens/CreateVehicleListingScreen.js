import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, spacing, borderRadius, shadows } from '../config/designTokens';
import { vehicleCategories, vehicleConditions, fuelTypes, transmissionTypes } from '../config/vehicleMarketplace';
import { useVehiclesContext } from '../context/VehiclesContext';

export default function CreateVehicleListingScreen({ navigation }) {
  const { addVehicle } = useVehiclesContext();
  
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: '',
    mileage: '',
    price: '',
    priceUSD: '',
    category: '',
    condition: '',
    fuelType: '',
    transmission: '',
    description: '',
    location: '',
    phone: '',
    images: [],
  });

  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de la permission pour accéder à vos photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [4, 3],
<<<<<<< HEAD
      quality: 1.0,
=======
      quality: 0.8,
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    });

    if (!result.canceled) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, result.assets[0]]
      }));
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Titre requis';
    if (!formData.brand.trim()) newErrors.brand = 'Marque requise';
    if (!formData.model.trim()) newErrors.model = 'Modèle requis';
    if (!formData.year.trim()) newErrors.year = 'Année requise';
    if (!formData.mileage.trim()) newErrors.mileage = 'Kilométrage requis';
    if (!formData.price.trim()) newErrors.price = 'Prix en FC requis';
    if (!formData.priceUSD.trim()) newErrors.priceUSD = 'Prix en USD requis';
    if (!formData.category) newErrors.category = 'Catégorie requise';
    if (!formData.condition) newErrors.condition = 'État requis';
    if (!formData.location.trim()) newErrors.location = 'Localisation requise';
    if (!formData.phone.trim()) newErrors.phone = 'Téléphone requis';
    if (formData.images.length === 0) newErrors.images = 'Au moins une photo requise';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs requis');
      return;
    }

    // Ajouter le véhicule au contexte
    const newVehicle = addVehicle(formData);

    Alert.alert(
      'Listing créé',
      'Votre annonce a été créée avec succès et est maintenant visible dans le marketplace.',
      [
        { 
          text: 'Voir l\'annonce', 
          onPress: () => {
            navigation.goBack();
            // Optionnel: naviguer vers les détails du véhicule
            // navigation.navigate('VehicleDetails', { vehicle: newVehicle });
          }
        }
      ]
    );
  };

  const renderImagePicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Photos du véhicule *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
        {formData.images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.selectedImage} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => removeImage(index)}
            >
              <Ionicons name="close-circle" size={20} color={colors.brand.error} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
          <Ionicons name="camera" size={30} color={colors.text.secondary} />
          <Text style={styles.addImageText}>Ajouter une photo</Text>
        </TouchableOpacity>
      </ScrollView>
      {errors.images && <Text style={styles.errorText}>{errors.images}</Text>}
    </View>
  );

  const renderPickerOptions = (options, selectedValue, onSelect, placeholder) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.optionChip,
            selectedValue === option.id && styles.selectedOptionChip
          ]}
          onPress={() => onSelect(option.id)}
        >
          <Text style={[
            styles.optionText,
            selectedValue === option.id && styles.selectedOptionText
          ]}>
            {option.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Créer une annonce</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Images */}
        {renderImagePicker()}

        {/* Informations de base */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de base</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titre de l'annonce *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="Ex: Toyota Camry 2020 - Excellent état"
              placeholderTextColor={colors.text.secondary}
              value={formData.title}
              onChangeText={(text) => updateField('title', text)}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Marque *</Text>
              <TextInput
                style={[styles.input, errors.brand && styles.inputError]}
                placeholder="Toyota"
                placeholderTextColor={colors.text.secondary}
                value={formData.brand}
                onChangeText={(text) => updateField('brand', text)}
              />
              {errors.brand && <Text style={styles.errorText}>{errors.brand}</Text>}
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Modèle *</Text>
              <TextInput
                style={[styles.input, errors.model && styles.inputError]}
                placeholder="Camry"
                placeholderTextColor={colors.text.secondary}
                value={formData.model}
                onChangeText={(text) => updateField('model', text)}
              />
              {errors.model && <Text style={styles.errorText}>{errors.model}</Text>}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Année *</Text>
              <TextInput
                style={[styles.input, errors.year && styles.inputError]}
                placeholder="2020"
                placeholderTextColor={colors.text.secondary}
                value={formData.year}
                onChangeText={(text) => updateField('year', text)}
                keyboardType="numeric"
              />
              {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Kilométrage *</Text>
              <TextInput
                style={[styles.input, errors.mileage && styles.inputError]}
                placeholder="50000"
                placeholderTextColor={colors.text.secondary}
                value={formData.mileage}
                onChangeText={(text) => updateField('mileage', text)}
                keyboardType="numeric"
              />
              {errors.mileage && <Text style={styles.errorText}>{errors.mileage}</Text>}
            </View>
          </View>
        </View>

        {/* Prix */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prix</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Prix en FC *</Text>
              <TextInput
                style={[styles.input, errors.price && styles.inputError]}
                placeholder="50000000"
                placeholderTextColor={colors.text.secondary}
                value={formData.price}
                onChangeText={(text) => updateField('price', text)}
                keyboardType="numeric"
              />
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Prix en USD *</Text>
              <TextInput
                style={[styles.input, errors.priceUSD && styles.inputError]}
                placeholder="25000"
                placeholderTextColor={colors.text.secondary}
                value={formData.priceUSD}
                onChangeText={(text) => updateField('priceUSD', text)}
                keyboardType="numeric"
              />
              {errors.priceUSD && <Text style={styles.errorText}>{errors.priceUSD}</Text>}
            </View>
          </View>
        </View>

        {/* Catégorie */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégorie *</Text>
          {renderPickerOptions(vehicleCategories, formData.category, (value) => updateField('category', value), 'Sélectionner une catégorie')}
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
        </View>

        {/* État */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>État du véhicule *</Text>
          {renderPickerOptions(vehicleConditions, formData.condition, (value) => updateField('condition', value), 'Sélectionner un état')}
          {errors.condition && <Text style={styles.errorText}>{errors.condition}</Text>}
        </View>

        {/* Informations techniques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations techniques</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type de carburant</Text>
            {renderPickerOptions(fuelTypes, formData.fuelType, (value) => updateField('fuelType', value), 'Sélectionner le carburant')}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Transmission</Text>
            {renderPickerOptions(transmissionTypes, formData.transmission, (value) => updateField('transmission', value), 'Sélectionner la transmission')}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Décrivez votre véhicule en détail..."
            placeholderTextColor={colors.text.secondary}
            value={formData.description}
            onChangeText={(text) => updateField('description', text)}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de contact</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Localisation *</Text>
            <TextInput
              style={[styles.input, errors.location && styles.inputError]}
              placeholder="Kinshasa, Gombe"
              placeholderTextColor={colors.text.secondary}
              value={formData.location}
              onChangeText={(text) => updateField('location', text)}
            />
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone *</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="+243 XXX XXX XXX"
              placeholderTextColor={colors.text.secondary}
              value={formData.phone}
              onChangeText={(text) => updateField('phone', text)}
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Publier l'annonce</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  headerButton: {
    padding: spacing.sm,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.separator,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.base,
    fontSize: typography.size.lg,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  inputError: {
    borderColor: colors.brand.error,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  errorText: {
    fontSize: typography.size.sm,
    color: colors.brand.error,
    marginTop: spacing.xs,
  },
  imageScroll: {
    marginBottom: spacing.sm,
  },
  imageContainer: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  selectedImage: {
    width: 100,
    height: 80,
    borderRadius: borderRadius.sm,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.full,
  },
  addImageButton: {
    width: 100,
    height: 80,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.ui.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: typography.size.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  optionsScroll: {
    marginBottom: spacing.sm,
  },
  optionChip: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  selectedOptionChip: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  optionText: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    fontWeight: typography.weight.medium,
  },
  selectedOptionText: {
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
  submitSection: {
    padding: spacing.lg,
  },
  submitButton: {
    backgroundColor: colors.brand.primary,
    borderRadius: borderRadius.base,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.base,
  },
  submitButtonText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
<<<<<<< HEAD
});
=======
}); 
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
