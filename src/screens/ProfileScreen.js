import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, Pressable, Button, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNetworkStatus } from '../utils/networkManager';
import { useAuth } from '../contexts/AuthContext';
import { createUserDocument, getUserDocument, uploadImageToStorage, deleteImageFromStorage, getUserType } from '../config/firebase';
import { driverTokenService } from '../services/driverTokenService';

const ProfileScreen = ({ navigation }) => {
  // Simplified state management - no problematic hooks
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isOfflineData, setIsOfflineData] = useState(false);
  const [userType, setUserType] = useState(null);
  const [isRegisteredDriver, setIsRegisteredDriver] = useState(false);
  const [profileType, setProfileType] = useState('passenger');
  
  const { isConnected } = useNetworkStatus();
  const { signOut, user } = useAuth();

  // Simple profile loading
  useEffect(() => {
    loadUserProfile();
  }, [user]);

  // Robust profile type detection
  const detectProfileType = async (user, userTypeFromFirestore) => {
    let type = userTypeFromFirestore;
    // Check driverTokenService
    const isDriverInService = await driverTokenService.isRegisteredAsDriver(user.id);
    // Fallback to user metadata
    const metaType = user.user_metadata?.userType;
    if (type === 'driver' || isDriverInService || metaType === 'driver') {
      return 'driver';
    }
    return 'passenger';
  };

  const loadUserProfile = async (isRefreshing = false) => {
    if (user) {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      try {
        console.log('🔄 Chargement du profil pour user:', user.id);
        
        // Try to get user data from Firestore first
        const userData = await getUserDocument(user.id);
        console.log('📄 Données Firestore:', userData);
        
        if (userData) {
          // Use data from Firestore
          const profileData = {
            id: user.id || user.uid,
            fullName: userData.fullName || user.user_metadata?.fullName || 'Utilisateur',
            email: user.email || '',
            phoneNumber: userData.phoneNumber || user.user_metadata?.phoneNumber || '',
            avatar_url: userData.avatar_url || user.user_metadata?.avatar_url || '',
            location: 'Kinshasa, RDC',
            rating: 5.0,
            totalRides: 0,
            memberSince: new Date().toISOString(),
            preferences: {
              language: 'fr',
              currency: 'FC',
              notifications: {
                rideUpdates: true,
                promotions: false,
                newsletter: true
              },
              privacy: {
                shareLocation: true,
                showProfile: true
              }
            },
            paymentMethods: [],
            emergency_contact: userData.emergency_contact || '',
            date_of_birth: userData.date_of_birth || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          console.log('📸 Avatar URL dans le profil:', profileData.avatar_url);
          setProfile(profileData);
        } else {
          console.log('⚠️ Aucune donnée Firestore trouvée, utilisation des données auth');
          // Fallback to basic user data
          const fallbackProfile = {
            id: user.id || user.uid,
            fullName: user.user_metadata?.fullName || 'Utilisateur',
            email: user.email || '',
            phoneNumber: user.user_metadata?.phoneNumber || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            location: 'Kinshasa, RDC',
            rating: 5.0,
            totalRides: 0,
            memberSince: new Date().toISOString(),
            preferences: {
              language: 'fr',
              currency: 'FC',
              notifications: {
                rideUpdates: true,
                promotions: false,
                newsletter: true
              },
              privacy: {
                shareLocation: true,
                showProfile: true
              }
            },
            paymentMethods: [],
            emergency_contact: '',
            date_of_birth: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          console.log('📸 Avatar URL fallback:', fallbackProfile.avatar_url);
          setProfile(fallbackProfile);
        }
        const type = await getUserType(user.id);
        setUserType(type);
        const detectedType = await detectProfileType(user, type);
        setProfileType(detectedType);
        const isDriverInService = await driverTokenService.isRegisteredAsDriver(user.id);
        setIsRegisteredDriver(type === 'driver' || isDriverInService);
      } catch (error) {
        console.error('❌ Erreur lors du chargement du profil:', error);
        // Fallback to basic user data on error
        const errorProfile = {
          id: user.id || user.uid,
          fullName: user.user_metadata?.fullName || 'Utilisateur',
          email: user.email || '',
          phoneNumber: user.user_metadata?.phoneNumber || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          location: 'Kinshasa, RDC',
          rating: 5.0,
          totalRides: 0,
          memberSince: new Date().toISOString(),
          preferences: {
            language: 'fr',
            currency: 'FC',
            notifications: {
              rideUpdates: true,
              promotions: false,
              newsletter: true
            },
            privacy: {
              shareLocation: true,
              showProfile: true
            }
          },
          paymentMethods: [],
          emergency_contact: '',
          date_of_birth: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        console.log('📸 Avatar URL error fallback:', errorProfile.avatar_url);
        setProfile(errorProfile);
        setUserType(null);
        setIsRegisteredDriver(false);
        setProfileType('passenger');
      } finally {
        if (isRefreshing) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    } else {
      setProfile(null);
      setUserType(null);
      setIsRegisteredDriver(false);
      setProfileType('passenger');
    }
  };

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadUserProfile(true);
  };

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
    
    Alert.alert(
      'Type de compte',
      'Quel type de compte souhaitez-vous créer ou utiliser ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Compte Passager',
          onPress: () => navigation.navigate('PassengerAuth'),
        },
        {
          text: 'Compte Conducteur',
          onPress: () => navigation.navigate('Auth'),
        },
      ]
    );
  };

  const handleImagePick = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin de votre permission pour accéder à votre galerie.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];
        
        // Show loading state
        setLoading(true);
        
        try {
          // Compress and resize the image
          const manipulatedImage = await ImageManipulator.manipulateAsync(
            selectedImage.uri,
            [{ resize: { width: 400, height: 400 } }],
            { 
              compress: 0.8, 
              format: ImageManipulator.SaveFormat.JPEG 
            }
          );

          // Create unique filename with user ID
          const fileName = `avatars/${user.id}/avatar_${Date.now()}.jpg`;
          
          // Delete old avatar if it exists in Firebase Storage
          if (profile?.avatar_url && typeof profile.avatar_url === 'string' && profile.avatar_url.includes('firebase')) {
            try {
              const urlParts = profile.avatar_url.split('/');
              const oldFileName = urlParts[urlParts.length - 1];
              if (oldFileName && oldFileName.trim() !== '') {
                await deleteImageFromStorage(`avatars/${user.id}/${oldFileName}`);
              }
            } catch (error) {
              console.log('Impossible de supprimer l\'ancien avatar:', error);
            }
          }

          // Upload to Firebase Storage
          const downloadURL = await uploadImageToStorage(manipulatedImage.uri, fileName);
          console.log('📤 URL de téléchargement obtenue:', downloadURL);
          
          // Update user document in Firestore
          await createUserDocument(user.id, {
            fullName: profile.fullName,
            phoneNumber: profile.phoneNumber,
            avatar_url: downloadURL,
            email: user.email,
            updatedAt: new Date().toISOString()
          });
          console.log('💾 Document Firestore mis à jour avec avatar_url:', downloadURL);

          // Update profile with new image URL immediately
          const updatedProfile = {
            ...profile,
            avatar_url: downloadURL
          };
          
          console.log('🔄 Mise à jour du profil local avec avatar_url:', updatedProfile.avatar_url);
          setProfile(updatedProfile);

          console.log('📸 Photo de profil uploadée avec succès:', downloadURL);
          
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Succès', 'Photo de profil mise à jour !');
          
        } catch (uploadError) {
          console.error('❌ Erreur lors de l\'upload:', uploadError);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert('Erreur', 'Impossible d\'uploader l\'image. Veuillez réessayer.');
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sélection d\'image:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image. Veuillez réessayer.');
      setLoading(false);
    }
  };

  const handleBecomeDriver = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Naviguer vers AuthScreen avec le mode inscription activé
      navigation.navigate('Auth', { forceSignUp: true });
    } catch (error) {
      console.error('❌ Erreur dans handleBecomeDriver:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    }
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
      promotionColor: '#51cf66'
    },
    { id: '5', title: 'Support & Assistance', icon: 'help-circle-outline', screen: 'SupportAndAssistanceScreen' },
    { id: '6', title: 'Proposer une nouvelle fonctionnalité', icon: 'bulb-outline', screen: 'SuggestFeatureScreen' },
  ];

  const guestMenuItems = [
    { id: '1', title: 'Devenir passager', icon: 'person-add-outline', action: 'createPassengerAccount' },
    { id: '2', title: 'Devenir Conducteur', icon: 'car-outline', action: 'createDriverAccount' },
    { id: '3', title: 'Se connecter', icon: 'log-in-outline', action: 'login' },
  ];

  const menuItems = user ? authenticatedMenuItems : guestMenuItems;

  const renderSettingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        if (item.action === 'createPassengerAccount') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate('PassengerAuth', { forceSignUp: true });
        } else if (item.action === 'createDriverAccount') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate('Auth', { forceSignUp: true });
        } else if (item.action === 'login') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          handleLogin();
        } else if (item.screen) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate(item.screen);
        }
      }}
    >
      <View style={styles.settingItemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon} size={24} color="#fff" />
        </View>
        <View style={styles.settingItemContent}>
          <Text style={styles.settingItemTitle}>{item.title}</Text>
          {item.promotion && (
            <Text style={[styles.promotionText, { color: item.promotionColor }]}>
              {item.promotion}
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.6)" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        {user && (
          <View style={styles.headerProfileCenter}>
            <View style={styles.avatarContainerHeader}>
              {profile?.avatar_url && profile.avatar_url.trim() !== '' ? (
                <Image 
                  source={{ 
                    uri: profile.avatar_url,
                    headers: {
                      'Cache-Control': 'no-cache'
                    }
                  }} 
                  style={styles.avatarHeader}
                  onError={(error) => {
                    setProfile(prev => ({ ...prev, avatar_url: '' }));
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholderHeader}>
                  <Ionicons name="person" size={32} color="#fff" />
                </View>
              )}
              <TouchableOpacity style={styles.editAvatarButtonHeader} onPress={handleImagePick}>
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.profileNameHeader}>{profile?.fullName || 'Utilisateur'}</Text>
            <Text style={styles.profileEmailHeader}>{profile?.email || ''}</Text>
          </View>
        )}
        {user && (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {user ? (
            <>
              {/* Remove avatar, name, email from here */}
              <View style={styles.profileInfo}>
                <View style={styles.profileDetails}>
                  <View style={styles.profileStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{profile?.rating || 5.0}</Text>
                      <Text style={styles.statLabel}>Note</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{profile?.totalRides || 0}</Text>
                      <Text style={styles.statLabel}>Courses</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{profile?.memberSince ? new Date(profile.memberSince).getFullYear() : new Date().getFullYear()}</Text>
                      <Text style={styles.statLabel}>Membre</Text>
                    </View>
                  </View>
                  
                  {/* Bouton pour devenir conducteur - seulement pour les passagers */}
                  {profileType === 'passenger' && (
                    <TouchableOpacity 
                      style={styles.becomeDriverButton}
                      onPress={handleBecomeDriver}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#00C851', '#007E33', '#0099CC']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.becomeDriverButtonContent}
                      >
                        <View style={styles.becomeDriverIconContainer}>
                          <Ionicons name="car-sport" size={24} color="#fff" />
                        </View>
                        <View style={styles.becomeDriverTextContainer}>
                          <Text style={styles.becomeDriverTitle}>Devenir Conducteur</Text>
                          <Text style={styles.becomeDriverSubtitle}>Gagnez de l'argent en conduisant</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#fff" />
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              {isOfflineData && (
                <View style={styles.offlineIndicator}>
                  <Ionicons name="cloud-offline-outline" size={16} color="#FF9500" />
                  <Text style={styles.offlineText}>Mode hors ligne</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.guestSection}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={32} color="#fff" />
              </View>
              <Text style={styles.guestTitle}>Connectez-vous</Text>
              <Text style={styles.guestSubtitle}>Accédez à toutes les fonctionnalités</Text>
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <FlatList
            data={menuItems}
            renderItem={renderSettingItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF9500']} />
            }
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Primary background per design standards
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)', // Secondary text per standards
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 90, // Standard header padding per design standards
    paddingBottom: 40, // Standard header padding per design standards
  },
  backButton: {
    padding: 8,
  },
  logoutButton: {
    padding: 8,
  },
  headerProfileCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 4,
  },
  avatarContainerHeader: {
    position: 'relative',
    marginBottom: 6,
  },
  avatarHeader: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholderHeader: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  editAvatarButtonHeader: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000000',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileNameHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
    textAlign: 'center',
  },
  profileEmailHeader: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20, // Standard screen padding per design standards
  },
  profileSection: {
    paddingBottom: 1, // Réduit de 20 à 16
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // Réduit de 20 à 16
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16, // Réduit de 20 à 16
  },
  avatar: {
    width: 80, // Réduit de 100 à 80
    height: 80, // Réduit de 100 à 80
    borderRadius: 40, // Réduit de 50 à 40
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 80, // Réduit de 100 à 80
    height: 80, // Réduit de 100 à 80
    borderRadius: 40, // Réduit de 50 à 40
    backgroundColor: '#000000', // Primary background per standards
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Default border per standards
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000000',
    borderRadius: 16, // Réduit de 20 à 16
    width: 28, // Réduit de 32 à 28
    height: 28, // Réduit de 32 à 28
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', // Active border per standards
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 22, // Réduit de 24 à 22
    fontWeight: 'bold',
    color: '#FFFFFF', // Primary text per standards
    marginBottom: 2, // Réduit de 4 à 2
  },
  profileEmail: {
    fontSize: 16, // Body text per standards
    color: 'rgba(255, 255, 255, 0.7)', // Secondary text per standards
    marginBottom: 12, // Réduit de 16 à 12
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF', // Primary text per standards
  },
  statLabel: {
    fontSize: 12, // Small text per standards
    color: 'rgba(255, 255, 255, 0.4)', // Tertiary text per standards
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Default border per standards
    marginHorizontal: 10,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)', // Warning state per standards
    borderColor: '#FF9500', // Accent orange per standards
    borderWidth: 1,
    borderRadius: 15, // Standard border radius
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
  },
  offlineText: {
    color: '#FF9500', // Accent orange per standards
    marginLeft: 8,
    fontSize: 14, // Caption size per standards
  },
  guestSection: {
    alignItems: 'center',
    paddingVertical: 10, // Réduit de 40 à 20 pour remonter la section
  },
  guestTitle: {
    fontSize: 24, // h2 size per standards
    fontWeight: 'bold',
    color: '#FFFFFF', // Primary text per standards
    marginTop: 16,
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 16, // Body text per standards
    color: 'rgba(255, 255, 255, 0.7)', // Secondary text per standards
    textAlign: 'center',
    marginBottom: 24, // Standard spacing per design standards
  },
  loginButton: {
    backgroundColor: '#000000', // Primary button background per standards
    paddingHorizontal: 32,
    paddingVertical: 16, // Standard button padding per standards
    borderRadius: 15, // Standard border radius per standards
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', // Primary button border per standards
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF', // Primary text per standards
    fontSize: 16, // Body text per standards
    fontWeight: '600', // Semibold per standards
  },
  menuSection: {
    flex: 1,
  },
  menuList: {
    paddingBottom: 20, // Standard spacing per design standards
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000', // Primary background per standards
    paddingHorizontal: 20, // Standard padding per standards
    paddingVertical: 16, // Standard padding per standards
    borderRadius: 15, // Standard border radius per standards
    marginBottom: 16, // Standard spacing per standards
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Default border per standards
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20, // Circle per standards
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Glass surface per standards
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16, // Standard spacing per design standards
  },
  settingItemContent: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16, // Body text per standards
    color: '#FFFFFF', // Primary text per standards
    fontWeight: '500', // Medium per standards
  },
  promotionText: {
    fontSize: 12, // Small text per standards
    marginTop: 2,
    fontWeight: '600', // Semibold per standards
  },
  becomeDriverButton: {
    marginTop: 20,
    marginHorizontal: 4,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#00C851',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  becomeDriverButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    position: 'relative',
  },
  becomeDriverIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  becomeDriverTextContainer: {
    flex: 1,
  },
  becomeDriverTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  becomeDriverSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.1,
  },
  becomeDriverText: {
    color: '#FF9500', // Accent orange per standards
    fontSize: 14, // Body text per standards
    fontWeight: '600', // Semibold per standards
    marginLeft: 8,
    marginRight: 8,
  },
});

export default ProfileScreen;