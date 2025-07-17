import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Image,
  Dimensions,
  Animated,
  FlatList,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  formatPrice,
  formatPriceUSD,
  getConditionColor,
  getConditionName,
  getFuelTypeName,
  getTransmissionName,
  calculateDaysAgo,
} from '../config/vehicleMarketplace';

const { width, height } = Dimensions.get('window');

export default function VehicleDetailsScreen({ route, navigation }) {
  const { vehicle } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const scrollX = useRef(new Animated.Value(0)).current;
  const imageScrollRef = useRef(null);

  const handleCallSeller = () => {
    const phoneNumber = vehicle.seller.phone.replace(/\s/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
    setShowContactModal(false);
  };

  const handleMessageSeller = () => {
    // Navigation vers un écran de chat ou ouverture de WhatsApp
    const phoneNumber = vehicle.seller.phone.replace(/\s/g, '').replace('+', '');
    const message = `Bonjour, je suis intéressé par votre ${vehicle.title} sur Zeurk Marketplace.`;
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`);
    setShowContactModal(false);
  };

  const handleBuyNow = () => {
    setShowPaymentModal(true);
  };

  const handlePayment = () => {
    // Navigation vers l'écran de paiement adapté pour les véhicules
    navigation.navigate('VehiclePayment', { 
      vehicle,
      amount: vehicle.priceUSD,
      seller: vehicle.seller 
    });
    setShowPaymentModal(false);
  };

  const renderImageItem = ({ item, index }) => (
    <View style={styles.imageSlide}>
      <Image source={item} style={styles.vehicleImage} resizeMode="cover" />
    </View>
  );

  const renderFeatureItem = ({ item }) => (
    <View style={styles.featureItem}>
      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
      <Text style={styles.featureText}>{item}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Image Gallery */}
      <View style={styles.imageContainer}>
        <FlatList
          ref={imageScrollRef}
          data={vehicle.images}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { 
              useNativeDriver: false,
              listener: (event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / width);
                setCurrentImageIndex(index);
              }
            }
          )}
        />
        
        {/* Header Overlay */}
        <View style={styles.headerOverlay}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#FF6B6B' : '#fff'}
            />
          </TouchableOpacity>
        </View>

        {/* Image Indicators */}
        <View style={styles.imageIndicators}>
          {vehicle.images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentImageIndex && styles.activeIndicator
              ]}
            />
          ))}
        </View>

        {/* Condition Badge */}
        <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(vehicle.condition) }]}>
          <Text style={styles.conditionText}>{getConditionName(vehicle.condition)}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title and Price */}
        <View style={styles.titleSection}>
          <Text style={styles.vehicleTitle}>{vehicle.title}</Text>
          <View style={styles.priceSection}>
            <Text style={styles.priceFC}>{formatPrice(vehicle.price)}</Text>
            <Text style={styles.priceUSD}>{formatPriceUSD(vehicle.priceUSD)}</Text>
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
              <Text style={styles.infoLabel}>Année</Text>
              <Text style={styles.infoValue}>{vehicle.year}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="speedometer-outline" size={20} color="#8E8E93" />
              <Text style={styles.infoLabel}>Kilométrage</Text>
              <Text style={styles.infoValue}>{vehicle.mileage.toLocaleString()} km</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="flash-outline" size={20} color="#8E8E93" />
              <Text style={styles.infoLabel}>Carburant</Text>
              <Text style={styles.infoValue}>{getFuelTypeName(vehicle.fuelType)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="settings-outline" size={20} color="#8E8E93" />
              <Text style={styles.infoLabel}>Transmission</Text>
              <Text style={styles.infoValue}>{getTransmissionName(vehicle.transmission)}</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationSection}>
          <Ionicons name="location-outline" size={20} color="#8E8E93" />
          <Text style={styles.locationText}>{vehicle.location}</Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{vehicle.description}</Text>
        </View>

        {/* Features */}
        {vehicle.features && vehicle.features.length > 0 && (
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Équipements</Text>
            <FlatList
              data={vehicle.features}
              renderItem={renderFeatureItem}
              keyExtractor={(item, index) => index.toString()}
              numColumns={2}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Seller Info */}
        <View style={styles.sellerSection}>
          <Text style={styles.sectionTitle}>Vendeur</Text>
          <View style={styles.sellerInfo}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerInitials}>
                {vehicle.seller.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.sellerDetails}>
              <View style={styles.sellerNameRow}>
                <Text style={styles.sellerName}>{vehicle.seller.name}</Text>
                {vehicle.seller.verified && (
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                )}
              </View>
              <View style={styles.sellerRating}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{vehicle.seller.rating}</Text>
                <Text style={styles.ratingCount}>• Vendeur vérifié</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => setShowContactModal(true)}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{vehicle.views}</Text>
            <Text style={styles.statLabel}>Vues</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{vehicle.favorites}</Text>
            <Text style={styles.statLabel}>Favoris</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{calculateDaysAgo(vehicle.posted)}</Text>
            <Text style={styles.statLabel}>Publié</Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => setShowContactModal(true)}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
          <Text style={styles.messageButtonText}>Contacter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyButtonText}>Acheter maintenant</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showContactModal}
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowContactModal(false)}
          />
          <View style={styles.contactModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contacter le vendeur</Text>
              <TouchableOpacity onPress={() => setShowContactModal(false)}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            <View style={styles.contactOptions}>
              <TouchableOpacity style={styles.contactOption} onPress={handleCallSeller}>
                <View style={styles.contactOptionIcon}>
                  <Ionicons name="call" size={24} color="#007AFF" />
                </View>
                <View style={styles.contactOptionText}>
                  <Text style={styles.contactOptionTitle}>Appeler</Text>
                  <Text style={styles.contactOptionSubtitle}>{vehicle.seller.phone}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactOption} onPress={handleMessageSeller}>
                <View style={styles.contactOptionIcon}>
                  <FontAwesome5 name="whatsapp" size={24} color="#25D366" />
                </View>
                <View style={styles.contactOptionText}>
                  <Text style={styles.contactOptionTitle}>WhatsApp</Text>
                  <Text style={styles.contactOptionSubtitle}>Envoyer un message</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPaymentModal}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowPaymentModal(false)}
          />
          <View style={styles.paymentModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmer l'achat</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            <View style={styles.paymentSummary}>
              <Text style={styles.paymentVehicle}>{vehicle.title}</Text>
              <Text style={styles.paymentPrice}>{formatPriceUSD(vehicle.priceUSD)}</Text>
            </View>
            <Text style={styles.paymentNote}>
              Vous allez être redirigé vers la page de paiement sécurisée.
            </Text>
            <TouchableOpacity style={styles.confirmPaymentButton} onPress={handlePayment}>
              <Text style={styles.confirmPaymentText}>Procéder au paiement</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  imageSlide: {
    width: width,
    height: '100%',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  favoriteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeIndicator: {
    backgroundColor: '#fff',
  },
  conditionBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    left: 20,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  conditionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: '#000',
  },
  titleSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  vehicleTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  priceFC: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  priceUSD: {
    color: '#8E8E93',
    fontSize: 16,
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    color: '#8E8E93',
    fontSize: 12,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  locationText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  descriptionSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  descriptionText: {
    color: '#8E8E93',
    fontSize: 16,
    lineHeight: 24,
  },
  featuresSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  sellerSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerInitials: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sellerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  ratingCount: {
    color: '#8E8E93',
    fontSize: 12,
  },
  contactButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 20,
    padding: 8,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 12,
  },
  bottomSpacing: {
    height: 100,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  messageButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buyButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
  },
  contactModalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  paymentModalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  contactOptions: {
    padding: 20,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 16,
  },
  contactOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactOptionText: {
    flex: 1,
  },
  contactOptionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactOptionSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
  },
  paymentSummary: {
    padding: 20,
    alignItems: 'center',
  },
  paymentVehicle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  paymentPrice: {
    color: '#007AFF',
    fontSize: 24,
    fontWeight: '700',
  },
  paymentNote: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  confirmPaymentButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  confirmPaymentText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
}); 