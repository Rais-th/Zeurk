import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { styles } from '../styles';
import * as Haptics from 'expo-haptics';
import { driverTokenService } from '../../../services/driverTokenService';
import { notificationService } from '../../../services/notificationService';

const SettingsPanel = ({
  isOnlineEnabled,
  setIsOnlineEnabled,
  onOpenFinances,
  onOpenPerformances,
  onOpenVehicles,
  navigation,
  onOpenProfile,
}) => {
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSmsNotificationStatus();
  }, []);

  const checkSmsNotificationStatus = async () => {
    try {
      const isRegistered = await driverTokenService.isRegisteredAsDriver();
      setSmsNotificationsEnabled(isRegistered);
    } catch (error) {
      console.error('Error checking SMS notification status:', error);
    }
  };

  const toggleSmsNotifications = async (value) => {
    if (loading) return;
    
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (value) {
        // Enable SMS notifications
        const token = await driverTokenService.registerAsDriver();
        if (token) {
          setSmsNotificationsEnabled(true);
          Alert.alert(
            'Notifications SMS activées',
            'Vous recevrez maintenant les demandes de course par SMS.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Erreur',
            'Impossible d\'activer les notifications. Vérifiez les permissions.',
            [{ text: 'OK' }]
          );
        }
      } else {
        // Disable SMS notifications
        await driverTokenService.unregisterDriver();
        setSmsNotificationsEnabled(false);
        Alert.alert(
          'Notifications SMS désactivées',
          'Vous ne recevrez plus les demandes de course par SMS.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error toggling SMS notifications:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors du changement de paramètre.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const testSmsNotification = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    notificationService.simulateSMSRideNotification({
      origin: 'Bandal',
      destination: 'Gombe',
      time: 'Maintenant',
      passengerName: 'Client Test',
      passengerPhone: '+243123456789'
    });
  };
  return (
    <ScrollView 
      style={styles.settingsContainer}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={false}
      scrollEventThrottle={16}
    >
      <Text style={styles.settingsTitle}>Paramètres</Text>
      
      <View style={styles.settingItemWithToggle}>
        <View style={styles.settingMainContent}>
          <View style={styles.settingIconContainer}>
            <MaterialIcons name="online-prediction" size={22} color="#007AFF" />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingText}>Apparaître en ligne</Text>
            <Text style={styles.settingSubtitle}>Restez visible pour les clients même en arrière-plan</Text>
          </View>
        </View>
        <Switch
          value={isOnlineEnabled}
          onValueChange={(value) => {
            setIsOnlineEnabled(value);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          trackColor={{ false: '#3A3A3C', true: 'rgba(48, 209, 88, 0.8)' }}
          thumbColor={isOnlineEnabled ? '#FFFFFF' : '#FFFFFF'}
          ios_backgroundColor="#3A3A3C"
          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
        />
      </View>
      
      <View style={styles.settingItemWithToggle}>
        <View style={styles.settingMainContent}>
          <View style={styles.settingIconContainer}>
            <MaterialIcons name="sms" size={22} color="#FF9500" />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingText}>Notifications SMS</Text>
            <Text style={styles.settingSubtitle}>Recevez les demandes de course par SMS</Text>
          </View>
        </View>
        <Switch
          value={smsNotificationsEnabled}
          onValueChange={toggleSmsNotifications}
          disabled={loading}
          trackColor={{ false: '#3A3A3C', true: 'rgba(255, 149, 0, 0.8)' }}
          thumbColor={smsNotificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
          ios_backgroundColor="#3A3A3C"
          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
        />
      </View>

      {smsNotificationsEnabled && (
        <TouchableOpacity 
          style={styles.settingItem} 
          activeOpacity={0.7}
          onPress={testSmsNotification}
        >
          <View style={styles.settingIconContainer}>
            <MaterialIcons name="notification-add" size={22} color="#5AC8FA" />
          </View>
          <Text style={styles.settingText}>Tester une notification</Text>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" style={styles.settingArrow} />
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={styles.settingItem} 
        activeOpacity={0.7}
        onPress={onOpenFinances}
      >
        <View style={styles.settingIconContainer}>
          <MaterialIcons name="attach-money" size={22} color="#30D158" />
        </View>
        <Text style={styles.settingText}>Mes Finances</Text>
        <Ionicons name="chevron-forward" size={20} color="#8E8E93" style={styles.settingArrow} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.settingItem} activeOpacity={0.7} onPress={onOpenPerformances}>
        <View style={styles.settingIconContainer}>
          <Ionicons name="stats-chart" size={22} color="#FF9500" />
        </View>
        <Text style={styles.settingText}>Performances</Text>
        <Ionicons name="chevron-forward" size={20} color="#8E8E93" style={styles.settingArrow} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.settingItem} activeOpacity={0.7} onPress={onOpenVehicles}>
        <View style={styles.settingIconContainer}>
          <FontAwesome5 name="car-alt" size={18} color="#AF52DE" />
        </View>
        <Text style={styles.settingText}>Véhicule & Documents</Text>
        <Ionicons name="chevron-forward" size={20} color="#8E8E93" style={styles.settingArrow} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.settingItem} 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('SupportAndAssistanceScreen')}
      >
        <View style={styles.settingIconContainer}>
          <MaterialIcons name="support-agent" size={22} color="#5AC8FA" />
        </View>
        <Text style={styles.settingText}>Support et assistance</Text>
        <Ionicons name="chevron-forward" size={20} color="#8E8E93" style={styles.settingArrow} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.settingItem} 
        activeOpacity={0.7}
        onPress={onOpenProfile}
      >
        <View style={styles.settingIconContainer}>
          <Ionicons name="person" size={22} color="#FF2D55" />
        </View>
        <Text style={styles.settingText}>Profil</Text>
        <Ionicons name="chevron-forward" size={20} color="#8E8E93" style={styles.settingArrow} />
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SettingsPanel;