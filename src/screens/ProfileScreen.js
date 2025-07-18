import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, Pressable, Button, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNetworkStatus } from '../utils/networkManager';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = ({ navigation }) => {
  // Use offline-capable user profile hook
  const { 
    profile, 
    loading, 
    isOfflineData, 
    updateProfile, 
    updatePreferences 
  } = useUserProfile();
  const { isConnected } = useNetworkStatus();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      Alert.alert(
        'Déconnexion',
        'Êtes-vous sûr de vouloir vous déconnecter ?',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Déconnexion',
            style: 'destructive',
            onPress: async () => {
              const { error } = await signOut();
              if (error) {
                Alert.alert('Erreur', 'Impossible de se déconnecter. Veuillez réessayer.');
              }
              // Navigation will be handled automatically by AuthContext state change
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion.');
    }
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Auth');
  };

  // Different menu items based on authentication status
  const authenticatedMenuItems = [
    { id: '1', title: 'Modifier le profil', icon: 'person-outline', screen: 'EditProfile' },
    { id: '2', title: 'Historique des courses', icon: 'time-outline', screen: 'RideHistory' },
    { id: '3', title: 'Préférences', icon: 'settings-outline', screen: 'Preferences' },
    { 
      id: '4', 
      title: 'Inviter un ami', 
      icon: 'gift-outline', 
      screen: 'InviteFriendScreen',
      promotion: 'Gagnez 5$',
      promotionColor: '#4CAF50'
    },
    { id: '5', title: 'Support & Assistance', icon: 'help-circle-outline', screen: 'SupportAndAssistanceScreen' },
    { id: '6', title: 'Proposer une nouvelle fonctionnalité', icon: 'bulb-outline', screen: 'SuggestFeatureScreen' },
  ];

  const guestMenuItems = [
    { id: '5', title: 'Support & Assistance', icon: 'help-circle-outline', screen: 'SupportAndAssistanceScreen' },
    { id: '6', title: 'Proposer une nouvelle fonctionnalité', icon: 'bulb-outline', screen: 'SuggestFeatureScreen' },
  ];

  const menuItems = user ? authenticatedMenuItems : guestMenuItems;

  const renderSettingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.menuItemContainer}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate(item.screen);
      }}
    >
      <View style={styles.menuItemContent}>
        <Ionicons name={item.icon} size={24} color="#fff" />
        <Text style={styles.menuItemTitle}>{item.title}</Text>
        {item.promotion && (
          <Text style={[styles.promotion, { color: item.promotionColor }]}>
            {item.promotion}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.6)" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header avec photo de profil et nom complet */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.goBack();
        }}>
          {/* <Ionicons name="arrow-back" size={28} color="#fff" /> */}
        </TouchableOpacity>
        
        {/* Offline indicator */}
        {isOfflineData && (
          <View style={styles.offlineIndicator}>
            <Ionicons name="cloud-offline" size={16} color="#FF9500" />
            <Text style={styles.offlineText}>Mode hors ligne</Text>
          </View>
        )}
        
        {loading && user ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Chargement du profil...</Text>
          </View>
        ) : user ? (
          <>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person-circle-outline" size={80} color="#ccc" />
              </View>
            )}
            <Text style={styles.fullName}>
              {profile?.full_name || profile?.name || 'Utilisateur'}
            </Text>
            {profile?.email && (
              <Text style={styles.email}>{profile.email}</Text>
            )}
          </>
        ) : (
          <>
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person-circle-outline" size={80} color="#ccc" />
            </View>
            <Text style={styles.fullName}>Invité</Text>
            <Text style={styles.email}>Connectez-vous pour accéder à toutes les fonctionnalités</Text>
          </>
        )}
      </View>

      {/* Liste des réglages */}
      <FlatList
        data={menuItems}
        renderItem={renderSettingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.settingsList}
      />

      {/* Bouton de déconnexion ou connexion */}
      {user ? (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Déconnexion</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>
      )}

      {/* Nouveau bouton Annuler */}
      <TouchableOpacity style={styles.cancelButton} onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.goBack();
      }}>
        <Text style={styles.cancelButtonText}>Quitter</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    alignItems: 'center',
    paddingTop: 90,
    paddingBottom: 20,
    backgroundColor: '#000',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginBottom: 10,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  offlineIndicator: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offlineText: {
    color: '#FF9500',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginTop: 12,
  },
  settingsList: {
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingIcon: {
    marginRight: 15,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  chevronIcon: {
    marginLeft: 'auto',
  },
  logoutButton: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  menuItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemTitle: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  promotion: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
});

export default ProfileScreen;