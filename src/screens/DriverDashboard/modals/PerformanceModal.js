import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

const PerformanceModal = ({ visible, onClose, performanceModalY, performanceOverlayOpacity }) => {
  return (
    <Modal
      // animationType="fade" // Supprimé pour un contrôle manuel de l'opacité
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Animated.View style={[
        styles.performanceModalContainer,
        { opacity: performanceOverlayOpacity } // Appliquer l'opacité animée
      ]}>
        <TouchableOpacity 
          style={styles.performanceModalOverlay}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View 
          style={[
            styles.performanceModalContent,
            { transform: [{ translateY: performanceModalY }] }
          ]}
        >
          <View style={styles.performanceModalHeader}>
            <TouchableOpacity 
              style={styles.performanceCloseButton}
              onPress={onClose}
            >
              <Ionicons name="chevron-down" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.performanceModalTitle}>PERFORMANCES</Text>
            <View style={styles.performanceHeaderRight} />
          </View>

          <ScrollView style={styles.performanceModalScroll} showsVerticalScrollIndicator={false}>
            {/* Moyenne générale (étoiles) */}
            <View style={styles.performanceItemContainer}>
              <Text style={styles.performanceItemLabel}>MOYENNE GÉNÉRALE</Text>
              <View style={styles.starsContainer}>
                <Ionicons name="star" size={24} color="#FFD700" style={styles.starIcon} />
                <Ionicons name="star" size={24} color="#FFD700" style={styles.starIcon} />
                <Ionicons name="star" size={24} color="#FFD700" style={styles.starIcon} />
                <Ionicons name="star" size={24} color="#FFD700" style={styles.starIcon} />
                <Ionicons name="star-outline" size={24} color="#FFD700" style={styles.starIcon} />
                <Text style={styles.ratingValueText}>4.0</Text>
              </View>
            </View>

            {/* Nombre de courses */}
            <View style={styles.performanceItemContainer}>
              <Text style={styles.performanceItemLabel}>NOMBRE DE COURSES</Text>
              <Text style={styles.performanceValueAccentText}>250</Text>
            </View>

            {/* Retards */}
            <View style={styles.performanceItemContainer}>
              <Text style={styles.performanceItemLabel}>RETARDS</Text>
              <Text style={styles.performanceValueAccentText}>5</Text>
            </View>

            {/* Annulations */}
            <View style={styles.performanceItemContainer}>
              <Text style={styles.performanceItemLabel}>ANNULATIONS</Text>
              <Text style={styles.performanceValueAccentText}>2</Text>
            </View>

          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default PerformanceModal; 