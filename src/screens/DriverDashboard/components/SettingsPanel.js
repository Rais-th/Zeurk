import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { styles } from '../styles';
import * as Haptics from 'expo-haptics';

const SettingsPanel = ({
  isOnlineEnabled,
  setIsOnlineEnabled,
  onOpenFinances,
  onOpenPerformances,
  onOpenVehicles,
  navigation,
  onOpenProfile,
}) => {
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