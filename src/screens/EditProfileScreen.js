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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const STATUSBAR_HEIGHT = StatusBar.currentHeight || (Platform.OS === 'ios' ? 44 : 0);

const EditProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [initialProfile, setInitialProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    avatar_url: null,
    is_verified: false
  });
  const [profile, setProfile] = useState(initialProfile);

  // Vérifier si des modifications ont été apportées
  const hasChanges = () => {
    return JSON.stringify(profile) !== JSON.stringify(initialProfile);
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

    if (!result.canceled) {
      setProfile(prev => ({ ...prev, avatar_url: result.assets[0].uri }));
    }
  };

  const handleSave = () => {
    try {
      setLoading(true);
      // Pour l'instant, on simule juste la sauvegarde
      setTimeout(() => {
        Alert.alert('Succès', 'Profil mis à jour avec succès');
        setInitialProfile(profile); // Mettre à jour le profil initial après la sauvegarde
        navigation.goBack();
      }, 1000);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour votre profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modifier le profil</Text>
          <View style={styles.headerRight} /> {/* Espace vide pour maintenir la symétrie */}
        </View>

        {/* Photo de profil */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={pickImage}>
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#fff" />
              </View>
            )}
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Champs de formulaire */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prénom</Text>
            <TextInput
              style={styles.input}
              value={profile.first_name}
              onChangeText={(text) => setProfile(prev => ({ ...prev, first_name: text }))}
              placeholder="Votre prénom"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              value={profile.last_name}
              onChangeText={(text) => setProfile(prev => ({ ...prev, last_name: text }))}
              placeholder="Votre nom"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Numéro de téléphone</Text>
            <TextInput
              style={styles.input}
              value={profile.phone_number}
              onChangeText={(text) => setProfile(prev => ({ ...prev, phone_number: text }))}
              placeholder="Votre numéro"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={profile.email}
              onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
              placeholder="Votre email"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Vérification d'identité */}
          <TouchableOpacity 
            style={[
              styles.verificationButton,
              profile.is_verified && styles.verifiedButton
            ]}
          >
            <View style={styles.verificationContent}>
              <Ionicons 
                name={profile.is_verified ? "shield-checkmark" : "shield-outline"} 
                size={24} 
                color="#fff" 
              />
              <View style={styles.verificationText}>
                <Text style={styles.verificationTitle}>
                  {profile.is_verified ? 'Identité vérifiée' : 'Vérifier mon identité'}
                </Text>
                <Text style={styles.verificationSubtitle}>
                  {profile.is_verified 
                    ? 'Votre identité a été vérifiée avec succès' 
                    : 'Ajoutez vos documents d\'identité pour plus de sécurité'}
                </Text>
              </View>
              {!profile.is_verified && (
                <Ionicons name="chevron-forward" size={24} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
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
            <Text style={styles.saveButtonText}>
              {loading ? 'Sauvegarde...' : 'Enregistrer'}
            </Text>
          </TouchableOpacity>
        </View>
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
});

export default EditProfileScreen;