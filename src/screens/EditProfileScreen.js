import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Platform,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

const STATUSBAR_HEIGHT = StatusBar.currentHeight || (Platform.OS === 'ios' ? 44 : 0);

const EditProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [initialProfile, setInitialProfile] = useState({
    full_name: '',
    phone: '',
    avatar_url: null,
    emergency_contact: '',
    date_of_birth: null
  });
  const [profile, setProfile] = useState(initialProfile);

  // Charger le profil utilisateur depuis Supabase
  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    setInitialLoading(true);
    try {
      const { data, error } = await supabase
        .from('passengers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erreur lors du chargement du profil:', error);
        Alert.alert('Erreur', 'Impossible de charger votre profil');
        return;
      }

      if (data) {
        const profileData = {
          full_name: data.full_name || '',
          phone: data.phone || '',
          avatar_url: data.avatar_url || null,
          emergency_contact: data.emergency_contact || '',
          date_of_birth: data.date_of_birth || null
        };
        setProfile(profileData);
        setInitialProfile(profileData);
      } else {
        // Créer un nouveau profil si aucun n'existe
        const newProfile = {
          full_name: user.user_metadata?.full_name || '',
          phone: '',
          avatar_url: null,
          emergency_contact: '',
          date_of_birth: null
        };
        setProfile(newProfile);
        setInitialProfile(newProfile);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      Alert.alert('Erreur', 'Impossible de charger votre profil');
    } finally {
      setInitialLoading(false);
    }
  };

  // Vérifier si des modifications ont été apportées
  const hasChanges = () => {
    return JSON.stringify(profile) !== JSON.stringify(initialProfile);
  };

  // Fonction pour uploader une image vers Supabase Storage
  const uploadImage = async (imageUri) => {
    try {
      // Compresser l'image pour optimiser la taille
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 400, height: 400 } }],
        { 
          compress: 0.8, 
          format: ImageManipulator.SaveFormat.JPEG 
        }
      );

      // Créer un nom de fichier unique avec structure de dossier
      const fileName = `${user.id}/avatar_${Date.now()}.jpg`;
      
      // Convertir l'image en blob pour l'upload
      const response = await fetch(manipulatedImage.uri);
      const blob = await response.blob();

      // Supprimer l'ancien avatar s'il existe
      if (initialProfile.avatar_url && initialProfile.avatar_url.includes('supabase')) {
        try {
          const oldFileName = initialProfile.avatar_url.split('/').pop();
          if (oldFileName) {
            await supabase.storage
              .from('avatars')
              .remove([`${user.id}/${oldFileName}`]);
          }
        } catch (error) {
          console.log('Impossible de supprimer l\'ancien avatar:', error);
        }
      }

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error);
      throw error;
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à vos photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1.0,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      
      // Afficher immédiatement l'image sélectionnée
      setProfile(prev => ({ ...prev, avatar_url: imageUri }));
      
      // Uploader l'image en arrière-plan
      setImageUploading(true);
      try {
        const uploadedUrl = await uploadImage(imageUri);
        // Mettre à jour avec l'URL uploadée
        setProfile(prev => ({ ...prev, avatar_url: uploadedUrl }));
      } catch (error) {
        // En cas d'erreur, revenir à l'image précédente
        setProfile(prev => ({ ...prev, avatar_url: initialProfile.avatar_url }));
        Alert.alert(
          'Erreur d\'upload', 
          'Impossible d\'uploader l\'image. Veuillez réessayer.',
          [{ text: 'OK' }]
        );
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    setLoading(true);
    try {
      // Préparer les données à sauvegarder
      const updateData = {
        full_name: profile.full_name,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        email: user.email,
        emergency_contact: profile.emergency_contact,
        date_of_birth: profile.date_of_birth,
        updated_at: new Date().toISOString()
      };

      // Vérifier si le profil existe déjà
      const { data: existingProfile } = await supabase
        .from('passengers')
        .select('id')
        .eq('id', user.id)
        .single();

      let result;
      if (existingProfile) {
        // Mettre à jour le profil existant
        result = await supabase
          .from('passengers')
          .update(updateData)
          .eq('id', user.id);
      } else {
        // Créer un nouveau profil
        result = await supabase
          .from('passengers')
          .insert([{
            id: user.id,
            ...updateData
          }]);
      }

      if (result.error) {
        throw result.error;
      }

      Alert.alert('Succès', 'Profil mis à jour avec succès');
      setInitialProfile(profile); // Mettre à jour le profil initial après la sauvegarde
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour votre profil. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {initialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollView}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Modifier le profil</Text>
              <View style={styles.headerRight} />
            </View>

            {/* Photo de profil */}
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={pickImage} disabled={imageUploading}>
                {profile.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={40} color="#fff" />
                  </View>
                )}
                <View style={styles.editIconContainer}>
                  {imageUploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="camera" size={20} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
              {imageUploading && (
                <Text style={styles.uploadingText}>Upload en cours...</Text>
              )}
            </View>

        {/* Champs de formulaire */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom complet</Text>
            <TextInput
              style={styles.input}
              value={profile.full_name}
              onChangeText={(text) => setProfile(prev => ({ ...prev, full_name: text }))}
              placeholder="Votre nom complet"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Numéro de téléphone</Text>
            <TextInput
              style={styles.input}
              value={profile.phone}
              onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
              placeholder="Votre numéro"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={user?.email || ''}
              placeholder="Votre email"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />
            <Text style={styles.helperText}>L'email ne peut pas être modifié</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact d'urgence</Text>
            <TextInput
              style={styles.input}
              value={profile.emergency_contact}
              onChangeText={(text) => setProfile(prev => ({ ...prev, emergency_contact: text }))}
              placeholder="Numéro d'urgence"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
            />
            <Text style={styles.helperText}>Personne à contacter en cas d'urgence</Text>
          </View>
        </View>
          </ScrollView>

          {/* Bouton Enregistrer en bas */}
          {hasChanges() && (
            <View style={styles.saveButtonContainer}>
              <TouchableOpacity 
                style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.saveButtonText}>Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: STATUSBAR_HEIGHT,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerRight: {
    width: 40, // Même largeur que le bouton retour pour la symétrie
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  saveButtonContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    marginTop: -20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#000',
  },
  saveButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
  },
  verificationButton: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  verifiedButton: {
    borderColor: '#fff',
  },
  verificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationText: {
    flex: 1,
    marginLeft: 15,
  },
  verificationTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  verificationSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  disabledInput: {
    opacity: 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  helperText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 5,
  },
  uploadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default EditProfileScreen;