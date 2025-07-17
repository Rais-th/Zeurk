import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '../styles';

const ProfileModal = ({
  visible,
  onClose,
  profileData,
  onSave,
}) => {
  const [name, setName] = useState(profileData.name);
  const [email, setEmail] = useState(profileData.email);
  const [phone, setPhone] = useState(profileData.phone);
  const [avatarUri, setAvatarUri] = useState(null);

  useEffect(() => {
    if (profileData) {
      setName(profileData.name);
      setEmail(profileData.email);
      setPhone(profileData.phone);
    }
  }, [profileData]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Nous avons besoin de la permission pour accéder à votre galerie de photos pour cela.'
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    onSave({
      name,
      email,
      phone,
      avatarUri,
    });
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.profileModalContainer}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.8}
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
      avoidKeyboard={true}
    >
      <View style={styles.profileModalContent}>
        <View style={styles.profileModalHeader}>
          <TouchableOpacity 
            style={styles.profileCloseButton}
            onPress={onClose}
          >
            <Ionicons name="chevron-down" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.profileModalTitle}>MON PROFIL</Text>
          <View style={styles.profileHeaderRight} />
        </View>

        <ScrollView style={styles.profileModalScroll} showsVerticalScrollIndicator={false}>
          {/* Section Avatar */}
          <View style={styles.profileAvatarContainer}>
            <Image 
              source={avatarUri ? { uri: avatarUri } : require('../../../../assets/icons/Jet.png')}
              style={styles.profileAvatar}
            />
            <TouchableOpacity style={styles.editAvatarButton} onPress={pickImage}>
              <MaterialIcons name="edit" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Informations du Profil */}
          <View style={styles.profileInfoSection}>
            <Text style={styles.profileLabel}>Nom complet</Text>
            <TextInput
              style={styles.profileInput}
              value={name}
              onChangeText={setName}
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.profileInfoSection}>
            <Text style={styles.profileLabel}>Email</Text>
            <TextInput
              style={styles.profileInput}
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#8E8E93"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.profileInfoSection}>
            <Text style={styles.profileLabel}>Numéro de téléphone</Text>
            <TextInput
              style={styles.profileInput}
              value={phone}
              onChangeText={setPhone}
              placeholderTextColor="#8E8E93"
              keyboardType="phone-pad"
            />
          </View>

          {/* Bouton de sauvegarde */}
          <TouchableOpacity style={styles.saveProfileButton} onPress={handleSave}>
            <Text style={styles.saveProfileButtonText}>Sauvegarder les modifications</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default ProfileModal; 