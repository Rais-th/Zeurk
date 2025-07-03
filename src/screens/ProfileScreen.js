import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, Pressable, Button, Alert } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const ProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Supprimez ou commentez la ligne Supabase suivante
        // const { data: { user } } = await supabase.auth.getUser();
        // setUser(user);

        // Simulation d'un utilisateur pour le développement
        setUser({ email: 'utilisateur_simule@example.com' });
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error.message);
        Alert.alert('Erreur', 'Impossible de charger les informations de l\'utilisateur.');
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    // Supprimez ou commentez la ligne Supabase suivante
    // await supabase.auth.signOut();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Déconnexion', 'Vous avez été déconnecté.');
    // Rediriger vers l'écran de connexion ou d'accueil
    navigation.replace('Home'); // Ou l'écran de connexion approprié
  };

  const menuItems = [
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
        {profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Ionicons name="person-circle-outline" size={80} color="#ccc" />
          </View>
        )}
        <Text style={styles.fullName}>{profile?.full_name || 'Chargement...'}</Text>
      </View>

      {/* Liste des réglages */}
      <FlatList
        data={menuItems}
        renderItem={renderSettingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.settingsList}
      />

      {/* Bouton de déconnexion */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Déconnexion</Text>
      </TouchableOpacity>

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