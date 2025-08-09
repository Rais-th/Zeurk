import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  StyleSheet,
  Platform,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, spacing, borderRadius } from '../../../config/designTokens';

const { height } = Dimensions.get('window');

const VehiclesAndDocumentsModal = ({
  visible,
  onClose,
  vehiclesModalY,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Informations du véhicule
    marque: '',
    modele: '',
    annee: '',
    vin: '',
    couleur: '',
    nombrePortes: '',
    capacitePassagers: '',
    typeCarburant: '',
    typeTransmission: '',
    numeroMoteur: '',
    kilometrage: '',
    climatisation: false,
    
    // Documents du véhicule
    certificatImmatriculation: null,
    certificatOrigine: null,
    declarationImportation: null,
    certificatBIVAC: null,
    
    // Assurance
    compagnieAssurance: '',
    numeroPoliceDAssurance: '',
    dateValiditeAssurance: '',
    contratTransportPublic: null,
    
    // Informations personnelles
    numeroPermis: '',
    categoriePermis: '',
    dateEmissionPermis: '',
    dateExpirationPermis: '',
    copiePermis: null,
    numeroCarteIdentite: '',
    copieCarteIdentite: null,
    certificatMedical: null,
    examenVue: null,
    extraitCasierJudiciaire: null,
    
    // Propriété
    documentProprietaire: null,
    lettreAutorisation: null,
    
    // Enregistrement commercial
    numeroRCCM: '',
    autorisationMinistere: null,
    carteConduiteCommerciale: null,
    conformiteFiscale: null,
    
    // Équipements de sécurité
    extincteur: false,
    trousseSecours: false,
    trianglesSignalisation: false,
    roueSecours: false,
    
    // Plateforme Zeurk
    versionOS: '',
    typeBanque: '',
    contactUrgence1: '',
    contactUrgence2: '',
    
    // Évaluation financière
    valeurMarche: '',
    deviseValeur: 'CDF',
    
    // Photos
    photoVehiculeExterieur: null,
    photoVehiculeInterieur: null,
    photoVIN: null,
    photoCompteur: null,
    photoProfilConducteur: null,
  });

  const totalSteps = 7;

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImagePicker = async (field) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission requise", "L'accès à la galerie photo est nécessaire pour télécharger des documents.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      handleInputChange(field, result.assets[0]);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          style={[
            styles.stepDot,
            index + 1 <= currentStep ? styles.stepDotActive : styles.stepDotInactive
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Informations du véhicule</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Marque *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.marque}
          onChangeText={(value) => handleInputChange('marque', value)}
          placeholder="Ex: Toyota, Mercedes, Honda..."
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Modèle *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.modele}
          onChangeText={(value) => handleInputChange('modele', value)}
          placeholder="Ex: Corolla, Classe C, Civic..."
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
        />
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.inputLabel}>Année *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.annee}
            onChangeText={(value) => handleInputChange('annee', value)}
            placeholder="2020"
            keyboardType="numeric"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.inputLabel}>Couleur *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.couleur}
            onChangeText={(value) => handleInputChange('couleur', value)}
            placeholder="Blanc"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Numéro VIN *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.vin}
          onChangeText={(value) => handleInputChange('vin', value)}
          placeholder="17 caractères alphanumériques"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.inputLabel}>Nombre de portes</Text>
          <TextInput
            style={styles.textInput}
            value={formData.nombrePortes}
            onChangeText={(value) => handleInputChange('nombrePortes', value)}
            placeholder="4"
            keyboardType="numeric"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.inputLabel}>Capacité passagers</Text>
          <TextInput
            style={styles.textInput}
            value={formData.capacitePassagers}
            onChangeText={(value) => handleInputChange('capacitePassagers', value)}
            placeholder="5"
            keyboardType="numeric"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.inputLabel}>Type de carburant</Text>
          <TextInput
            style={styles.textInput}
            value={formData.typeCarburant}
            onChangeText={(value) => handleInputChange('typeCarburant', value)}
            placeholder="Essence/Diesel"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.inputLabel}>Transmission</Text>
          <TextInput
            style={styles.textInput}
            value={formData.typeTransmission}
            onChangeText={(value) => handleInputChange('typeTransmission', value)}
            placeholder="Manuelle/Automatique"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Kilométrage actuel</Text>
        <TextInput
          style={styles.textInput}
          value={formData.kilometrage}
          onChangeText={(value) => handleInputChange('kilometrage', value)}
          placeholder="Ex: 50000"
          keyboardType="numeric"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
        />
      </View>

      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => handleInputChange('climatisation', !formData.climatisation)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, formData.climatisation && styles.checkboxChecked]}>
          {formData.climatisation && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
        <Text style={styles.checkboxLabel}>Climatisation fonctionnelle</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Documents du véhicule</Text>
      
      <TouchableOpacity
        style={styles.documentUpload}
        onPress={() => handleImagePicker('certificatImmatriculation')}
        activeOpacity={0.7}
      >
        <Ionicons name="document-outline" size={24} color="#fff" />
        <Text style={styles.documentUploadText}>
          {formData.certificatImmatriculation ? 'Certificat d\'immatriculation ✓' : 'Certificat d\'immatriculation *'}
        </Text>
        <Ionicons name="camera-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.documentUpload}
        onPress={() => handleImagePicker('certificatOrigine')}
        activeOpacity={0.7}
      >
        <Ionicons name="document-outline" size={24} color="#fff" />
        <Text style={styles.documentUploadText}>
          {formData.certificatOrigine ? 'Certificat d\'origine ✓' : 'Certificat d\'origine du véhicule'}
        </Text>
        <Ionicons name="camera-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.documentUpload}
        onPress={() => handleImagePicker('declarationImportation')}
        activeOpacity={0.7}
      >
        <Ionicons name="document-outline" size={24} color="#fff" />
        <Text style={styles.documentUploadText}>
          {formData.declarationImportation ? 'Déclaration d\'importation ✓' : 'Déclaration d\'importation (si applicable)'}
        </Text>
        <Ionicons name="camera-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.documentUpload}
        onPress={() => handleImagePicker('certificatBIVAC')}
        activeOpacity={0.7}
      >
        <Ionicons name="document-outline" size={24} color="#fff" />
        <Text style={styles.documentUploadText}>
          {formData.certificatBIVAC ? 'Certificat BIVAC ✓' : 'Certificat BIVAC (véhicules importés)'}
        </Text>
        <Ionicons name="camera-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
        <Text style={styles.infoText}>
          Assurez-vous que tous les documents sont lisibles et à jour. Les documents expirés ne seront pas acceptés.
        </Text>
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Assurance</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Compagnie d'assurance *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.compagnieAssurance}
          onChangeText={(value) => handleInputChange('compagnieAssurance', value)}
          placeholder="Ex: SONAS, SORAS, UAP..."
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Numéro de police d'assurance *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.numeroPoliceDAssurance}
          onChangeText={(value) => handleInputChange('numeroPoliceDAssurance', value)}
          placeholder="Numéro de votre police"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Date de validité *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.dateValiditeAssurance}
          onChangeText={(value) => handleInputChange('dateValiditeAssurance', value)}
          placeholder="JJ/MM/AAAA"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
        />
      </View>

      <TouchableOpacity
        style={styles.documentUpload}
        onPress={() => handleImagePicker('contratTransportPublic')}
        activeOpacity={0.7}
      >
        <Ionicons name="document-outline" size={24} color="#fff" />
        <Text style={styles.documentUploadText}>
          {formData.contratTransportPublic ? 'Contrat transport public ✓' : 'Contrat d\'assurance transport public *'}
        </Text>
        <Ionicons name="camera-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Ionicons name="shield-checkmark-outline" size={20} color="#51cf66" />
        <Text style={styles.infoText}>
          L'assurance transport public de personnes est obligatoire pour opérer sur la plateforme Zeurk.
        </Text>
      </View>
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Informations personnelles</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Numéro de permis de conduire *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.numeroPermis}
          onChangeText={(value) => handleInputChange('numeroPermis', value)}
          placeholder="Numéro de votre permis"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
        />
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.inputLabel}>Catégorie *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.categoriePermis}
            onChangeText={(value) => handleInputChange('categoriePermis', value)}
            placeholder="B, C, D..."
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.inputLabel}>Date d'expiration *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.dateExpirationPermis}
            onChangeText={(value) => handleInputChange('dateExpirationPermis', value)}
            placeholder="JJ/MM/AAAA"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.documentUpload}
        onPress={() => handleImagePicker('copiePermis')}
        activeOpacity={0.7}
      >
        <Ionicons name="card-outline" size={24} color="#fff" />
        <Text style={styles.documentUploadText}>
          {formData.copiePermis ? 'Copie du permis ✓' : 'Copie du permis de conduire *'}
        </Text>
        <Ionicons name="camera-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Numéro carte d'identité *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.numeroCarteIdentite}
          onChangeText={(value) => handleInputChange('numeroCarteIdentite', value)}
          placeholder="Numéro de votre carte d'identité"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
        />
      </View>

      <TouchableOpacity
        style={styles.documentUpload}
        onPress={() => handleImagePicker('copieCarteIdentite')}
        activeOpacity={0.7}
      >
        <Ionicons name="card-outline" size={24} color="#fff" />
        <Text style={styles.documentUploadText}>
          {formData.copieCarteIdentite ? 'Copie carte d\'identité ✓' : 'Copie carte d\'identité *'}
        </Text>
        <Ionicons name="camera-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.documentUpload}
        onPress={() => handleImagePicker('certificatMedical')}
        activeOpacity={0.7}
      >
        <Ionicons name="medical-outline" size={24} color="#fff" />
        <Text style={styles.documentUploadText}>
          {formData.certificatMedical ? 'Certificat médical ✓' : 'Certificat médical *'}
        </Text>
        <Ionicons name="camera-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.documentUpload}
        onPress={() => handleImagePicker('examenVue')}
        activeOpacity={0.7}
      >
        <Ionicons name="eye-outline" size={24} color="#fff" />
        <Text style={styles.documentUploadText}>
          {formData.examenVue ? 'Examen de la vue ✓' : 'Examen de la vue *'}
        </Text>
        <Ionicons name="camera-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.documentUpload}
        onPress={() => handleImagePicker('extraitCasierJudiciaire')}
        activeOpacity={0.7}
      >
        <Ionicons name="shield-outline" size={24} color="#fff" />
        <Text style={styles.documentUploadText}>
          {formData.extraitCasierJudiciaire ? 'Casier judiciaire ✓' : 'Extrait de casier judiciaire (recommandé)'}
        </Text>
        <Ionicons name="camera-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>
    </ScrollView>
  );

  const renderStep5 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Enregistrement commercial</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Numéro RCCM</Text>
        <TextInput
          style={styles.textInput}
          value={formData.numeroRCCM}
          onChangeText={(value) => handleInputChange('numeroRCCM', value)}
          placeholder="Numéro d'enregistrement commercial"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
        />
      </View>

      <TouchableOpacity
        style={styles.documentUpload}
        onPress={() => handleImagePicker('autorisationMinistere')}
        activeOpacity={0.7}
      >
        <Ionicons name="document-text-outline" size={24} color="#fff" />
        <Text style={styles.documentUploadText}>
          {formData.autorisationMinistere ? 'Autorisation Ministère ✓' : 'Autorisation du Ministère des Transports'}
        </Text>
        <Ionicons name="camera-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.documentUpload}
        onPress={() => handleImagePicker('carteConduiteCommerciale')}
        activeOpacity={0.7}
      >
        <Ionicons name="card-outline" size={24} color="#fff" />
        <Text style={styles.documentUploadText}>
          {formData.carteConduiteCommerciale ? 'Carte conduite commerciale ✓' : 'Carte de conduite commerciale'}
        </Text>
        <Ionicons name="camera-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.documentUpload}
        onPress={() => handleImagePicker('conformiteFiscale')}
        activeOpacity={0.7}
      >
        <Ionicons name="receipt-outline" size={24} color="#fff" />
        <Text style={styles.documentUploadText}>
          {formData.conformiteFiscale ? 'Conformité fiscale ✓' : 'Attestation de conformité fiscale'}
        </Text>
        <Ionicons name="camera-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>

      <View style={styles.checkboxGroup}>
        <Text style={styles.sectionTitle}>Équipements de sécurité obligatoires</Text>
        
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => handleInputChange('extincteur', !formData.extincteur)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, formData.extincteur && styles.checkboxChecked]}>
            {formData.extincteur && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>Extincteur</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => handleInputChange('trousseSecours', !formData.trousseSecours)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, formData.trousseSecours && styles.checkboxChecked]}>
            {formData.trousseSecours && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>Trousse de premiers secours</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => handleInputChange('trianglesSignalisation', !formData.trianglesSignalisation)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, formData.trianglesSignalisation && styles.checkboxChecked]}>
            {formData.trianglesSignalisation && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>Triangles de signalisation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => handleInputChange('roueSecours', !formData.roueSecours)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, formData.roueSecours && styles.checkboxChecked]}>
            {formData.roueSecours && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>Roue de secours fonctionnelle</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStep6 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Configuration</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Version OS du smartphone *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.versionOS}
          onChangeText={(value) => handleInputChange('versionOS', value)}
          placeholder="Ex: iOS 15+ ou Android 8+"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Type de compte bancaire *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.typeBanque}
          onChangeText={(value) => handleInputChange('typeBanque', value)}
          placeholder="Banque locale (CDF/USD)"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Contact d'urgence 1 *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.contactUrgence1}
          onChangeText={(value) => handleInputChange('contactUrgence1', value)}
          placeholder="Nom et numéro de téléphone"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Contact d'urgence 2 *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.contactUrgence2}
          onChangeText={(value) => handleInputChange('contactUrgence2', value)}
          placeholder="Nom et numéro de téléphone"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
        />
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 2, marginRight: 10 }]}>
          <Text style={styles.inputLabel}>Valeur marchande du véhicule</Text>
          <TextInput
            style={styles.textInput}
            value={formData.valeurMarche}
            onChangeText={(value) => handleInputChange('valeurMarche', value)}
            placeholder="Montant"
            keyboardType="numeric"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.inputLabel}>Devise</Text>
          <TouchableOpacity style={styles.textInput}>
            <Text style={styles.inputText}>{formData.deviseValeur}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="phone-portrait-outline" size={20} color="#007AFF" />
        <Text style={styles.infoText}>
          Assurez-vous que votre smartphone est compatible avec l'application Zeurk et dispose d'une connexion internet stable.
        </Text>
      </View>
    </ScrollView>
  );

  const renderStep7 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Photos requises</Text>
      
      <TouchableOpacity
        style={styles.documentUpload}
        onPress={() => handleImagePicker('photoVehiculeExterieur')}
        activeOpacity={0.7}
      >
        <Ionicons name="car-outline" size={24} color="#fff" />
        <Text style={styles.documentUploadText}>
          {formData.photoVehiculeExterieur ? 'Photo extérieur véhicule ✓' : 'Photo extérieur du véhicule *'}
        </Text>
        <Ionicons name="camera-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.documentUpload}
        onPress={() => handleImagePicker('photoVehiculeInterieur')}
        activeOpacity={0.7}
      >
        <Ionicons name="car-outline" size={24} color="#fff" />
        <Text style={styles.documentUploadText}>
          {formData.photoVehiculeInterieur ? 'Photo intérieur véhicule ✓' : 'Photo intérieur du véhicule *'}
        </Text>
        <Ionicons name="camera-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.documentUpload}
        onPress={() => handleImagePicker('photoVIN')}
        activeOpacity={0.7}
      >
        <Ionicons name="barcode-outline" size={24} color="#fff" />
        <Text style={styles.documentUploadText}>
          {formData.photoVIN ? 'Photo numéro VIN ✓' : 'Photo du numéro VIN *'}
        </Text>
        <Ionicons name="camera-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.documentUpload}
        onPress={() => handleImagePicker('photoCompteur')}
        activeOpacity={0.7}
      >
        <Ionicons name="speedometer-outline" size={24} color="#fff" />
        <Text style={styles.documentUploadText}>
          {formData.photoCompteur ? 'Photo compteur kilométrique ✓' : 'Photo du compteur kilométrique *'}
        </Text>
        <Ionicons name="camera-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.documentUpload}
        onPress={() => handleImagePicker('photoProfilConducteur')}
        activeOpacity={0.7}
      >
        <Ionicons name="person-outline" size={24} color="#fff" />
        <Text style={styles.documentUploadText}>
          {formData.photoProfilConducteur ? 'Photo de profil ✓' : 'Photo de profil conducteur *'}
        </Text>
        <Ionicons name="camera-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Ionicons name="camera-outline" size={20} color="#51cf66" />
        <Text style={styles.infoText}>
          Toutes les photos doivent être nettes, bien éclairées et montrer clairement les détails demandés.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert(
            "Demande soumise",
            "Votre demande d'enregistrement a été soumise avec succès. Vous recevrez une notification une fois la vérification terminée.",
            [{ text: "OK", onPress: handleClose }]
          );
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.submitButtonText}>Soumettre la demande</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      case 7: return renderStep7();
      default: return renderStep1();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View 
          style={[
            styles.modalContent,
            { transform: [{ translateY: vehiclesModalY }] }
          ]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Ionicons name="chevron-down" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={styles.currentStepTitle}>
              <Text style={styles.currentStepText}>
                {currentStep === 1 && "Détails de base de votre véhicule"}
                {currentStep === 2 && "Téléchargez les documents requis"}
                {currentStep === 3 && "Informations sur votre assurance véhicule"}
                {currentStep === 4 && "Vos documents d'identité et permis"}
                {currentStep === 5 && "Documents pour l'activité commerciale"}
                {currentStep === 6 && "Paramètres de la plateforme"}
                {currentStep === 7 && "Dernière étape : téléchargez les photos"}
              </Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          {renderStepIndicator()}
          
          <View style={styles.contentWrapper}>
            {renderCurrentStep()}
          </View>

          <View style={styles.navigationButtons}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.previousButton}
                onPress={handlePrevious}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={20} color="#fff" />
                <Text style={styles.previousButtonText}>Précédent</Text>
              </TouchableOpacity>
            )}
            
            {currentStep < totalSteps && (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                activeOpacity={0.7}
              >
                <Text style={styles.nextButtonText}>Suivant</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal container and overlay
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.modal,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    height: height * 0.85, // Fixed height instead of maxHeight
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
      },
      android: {
        elevation: 25,
        shadowColor: '#000000',
      },
    }),
  },

  // Modal header following project standards
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg, // Reduced from spacing.xl
    paddingBottom: spacing.lg, // Reduced from spacing.xl
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  closeButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    // No background - following exit arrow guidelines
  },
  modalTitle: {
    fontSize: typography.size.h2, // Reduced from typography.size.display
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  currentStepTitle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentStepText: {
    fontSize: 18,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.3,
  },
  headerRight: {
    width: 40,
  },

  // Step indicator
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md, // Reduced from spacing.lg
    paddingHorizontal: spacing.lg,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    marginHorizontal: spacing.xs,
  },
  stepDotActive: {
    backgroundColor: colors.brand.primary,
  },
  stepDotInactive: {
    backgroundColor: colors.ui.border,
  },

  // Content wrapper to ensure proper layout
  contentWrapper: {
    flex: 1,
    minHeight: 400,
    paddingTop: spacing.sm, // Added small top padding
  },

  // Step content
  stepContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    minHeight: 400, // Ensure minimum height for content visibility
  },
  stepTitle: {
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: typography.size.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  // Form inputs following project standards
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    fontSize: typography.size.lg,
    color: colors.text.primary,
    minHeight: 50,
  },
  textInputFocused: {
    borderColor: colors.brand.primary,
  },
  inputText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Document upload following project standards
  documentUpload: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderStyle: 'dashed',
  },
  documentUploadText: {
    flex: 1,
    fontSize: typography.size.lg,
    color: colors.text.primary,
    marginLeft: spacing.base,
    marginRight: spacing.base,
  },

  // Checkboxes following project standards
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: spacing.xs,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.base,
  },
  checkboxChecked: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  checkboxLabel: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    flex: 1,
  },
  checkboxGroup: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },

  // Info box following project standards
  infoBox: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: borderRadius.base,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  infoText: {
    flex: 1,
    fontSize: typography.size.base,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: spacing.base,
    lineHeight: 20,
  },

  // Navigation buttons following project standards
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.ui.border,
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    minWidth: 120,
  },
  previousButtonText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    minWidth: 120,
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  submitButton: {
    backgroundColor: colors.brand.success,
    borderRadius: borderRadius.base,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  submitButtonText: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },

  // Vehicles list following project standards
  vehiclesListContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  vehicleItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.ui.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  vehicleImage: {
    width: 60,
    height: 60,
    marginRight: spacing.lg,
  },
  vehicleInfoContainer: {
    flex: 1,
  },
  vehicleBrand: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: -0.24,
  },
  vehiclePlate: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    fontWeight: typography.weight.normal,
  },

  // Status badges following project standards
  vehicleStatusBadge: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.base,
    borderWidth: 1,
  },
  activeBadge: {
    backgroundColor: 'rgba(81, 207, 102, 0.1)',
    borderColor: colors.brand.success,
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 212, 59, 0.1)',
    borderColor: colors.brand.warning,
  },
  vehicleStatusText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },

  // Add Vehicle Button following project standards
  addVehicleContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  addVehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderStyle: 'dashed',
  },
  addVehicleText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    letterSpacing: -0.24,
  }
});

export default VehiclesAndDocumentsModal;