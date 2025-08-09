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
<<<<<<< HEAD
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
=======
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
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

<<<<<<< HEAD
// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
const { width, height } = Dimensions.get('window');

export default function VehicleDetailsScreen({ route, navigation }) {
  const { vehicle } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
<<<<<<< HEAD
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    specifications: true,
    equipment: true,
    logistics: false,
    description: false,
  });
=======
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  
  const scrollX = useRef(new Animated.Value(0)).current;
  const imageScrollRef = useRef(null);

<<<<<<< HEAD
  const toggleSection = (section) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const Section = ({ title, name, children }) => (
    <View style={styles.section}>
      <TouchableOpacity 
        style={styles.sectionHeader} 
        onPress={() => toggleSection(name)}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Ionicons 
          name={expandedSections[name] ? "chevron-up" : "chevron-down"} 
          size={24} 
          color="#fff" 
        />
      </TouchableOpacity>
      {expandedSections[name] && (
        <View style={styles.sectionContent}>
          {children}
        </View>
      )}
    </View>
  );
=======
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
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b

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
      
<<<<<<< HEAD
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
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
        </View>

        {/* Content */}
        <View style={styles.content}>
        {/* Modern Title and Price Header */}
        <View style={styles.modernHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.modernTitle}>{vehicle.title}</Text>
            <View style={styles.metaInfo}>
              <View style={styles.yearBadge}>
                <Text style={styles.yearText}>{vehicle.year}</Text>
              </View>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.modernPrice}>{formatPriceUSD(vehicle.price)}</Text>
            <Text style={styles.priceLabel}>TTC</Text>
            <Text style={styles.installmentPrice}>
              {formatPriceUSD(vehicle.priceFirstInstallment)} / mois
            </Text>
          </View>
        </View>


        {/* Spécifications techniques modernes */}
        {vehicle.specifications && (
          <Section title="Spécifications" name="specifications">
            <View style={styles.specsGrid}>
              <View style={styles.specCard}>
                <View style={styles.specIconContainer}>
                  <Ionicons name="speedometer-outline" size={24} color="#007AFF" />
                </View>
                <View style={styles.specContent}>
                  <Text style={styles.specValue}>{vehicle.mileage ? vehicle.mileage.toLocaleString() : '0'} km</Text>
                  <Text style={styles.specLabel}>Kilométrage</Text>
                </View>
              </View>
              <View style={styles.specCard}>
                <View style={styles.specIconContainer}>
                  <MaterialIcons name="local-gas-station" size={24} color="#FF9500" />
                </View>
                <View style={styles.specContent}>
                  <Text style={styles.specValue}>{vehicle.specifications?.fuelType || 'N/A'}</Text>
                  <Text style={styles.specLabel}>Carburant</Text>
                </View>
              </View>
              <View style={styles.specCard}>
                <View style={styles.specIconContainer}>
                  <Ionicons name="cog-outline" size={24} color="#5856D6" />
                </View>
                <View style={styles.specContent}>
                  <Text style={styles.specValue}>{vehicle.specifications.transmission}</Text>
                  <Text style={styles.specLabel}>Transmission</Text>
                </View>
              </View>
              <View style={styles.specCard}>
                <View style={styles.specIconContainer}>
                  <Ionicons name="people-outline" size={24} color="#34C759" />
                </View>
                <View style={styles.specContent}>
                  <Text style={styles.specValue}>{vehicle.specifications.seats}</Text>
                  <Text style={styles.specLabel}>Sièges</Text>
                </View>
              </View>
              <View style={styles.specCard}>
                <View style={styles.specIconContainer}>
                  <MaterialIcons name="settings" size={24} color="#FF3B30" />
                </View>
                <View style={styles.specContent}>
                  <Text style={styles.specValue}>{vehicle.specifications.cylinders}</Text>
                  <Text style={styles.specLabel}>Cylindres</Text>
                </View>
              </View>
            </View>
          </Section>
        )}

        {/* Équipements en ligne */}
        {vehicle.equipment && vehicle.equipment.length > 0 && (
          <Section title="Équipements" name="equipment">
            <View style={styles.equipmentRow}>
              {vehicle.equipment.map((item, index) => (
                <View key={index} style={styles.equipmentChip}>
                  <Text style={styles.equipmentChipText}>{item}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* Logistique compacte */}
        {vehicle.logistics && (
          <Section title="Livraison" name="logistics">
            <View style={styles.logisticsCompact}>
              <View style={styles.logisticsItem}>
                <Ionicons name="time-outline" size={16} color="#8E8E93" />
                <Text style={styles.logisticsText}>{vehicle.logistics.deliveryTime}</Text>
              </View>
              <View style={styles.logisticsItem}>
                <Ionicons name="location-outline" size={16} color="#8E8E93" />
                <Text style={styles.logisticsText}>{vehicle.logistics.citiesServed.join(', ')}</Text>
              </View>
            </View>
          </Section>
        )}

        {/* Description condensée */}
        <Section title="Description" name="description">
          <Text style={styles.descriptionCompact}>
            {vehicle.description}
          </Text>
        </Section>

        <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      {/* Bottom Actions - Fixed at bottom */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
=======
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
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
          style={styles.buyButton}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyButtonText}>Acheter maintenant</Text>
        </TouchableOpacity>
      </View>

<<<<<<< HEAD
=======
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

>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
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
<<<<<<< HEAD
  // New image gallery styles
  mainImage: {
    width: Dimensions.get('window').width,
    height: 360,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
<<<<<<< HEAD
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for fixed bottom button
  },
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
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
<<<<<<< HEAD
=======
  conditionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  content: {
    flex: 1,
    backgroundColor: '#000',
  },
<<<<<<< HEAD
  // Modern Header Styles
  modernHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  modernTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  yearBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  yearText: {
    color: '#007AFF',
    fontSize: 11,
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  modernPrice: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  priceLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  installmentPrice: {
    color: '#007AFF',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  
  // Nouvelle section principale compacte

  
  // Sections compactes
  compactSection: {
=======
  titleSection: {
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
<<<<<<< HEAD
  compactSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  
  // Spécifications en ligne
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  specCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  specIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  specContent: {
    flex: 1,
  },
  specLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  specValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  
  // Équipements en chips
  equipmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  equipmentChip: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  equipmentChipText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  
  // Logistique compacte
  logisticsCompact: {
    gap: 8,
  },
  
  // Description compacte
  descriptionCompact: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  logisticsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logisticsText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
=======
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
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
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
<<<<<<< HEAD
=======
  descriptionSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
<<<<<<< HEAD
  
  // Collapsible Section Styles
  section: {
    marginBottom: 12,
    backgroundColor: '#000',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  sectionContent: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
=======
  descriptionText: {
    color: '#8E8E93',
    fontSize: 16,
    lineHeight: 24,
  },
  featuresSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
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
<<<<<<< HEAD


=======
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
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  bottomSpacing: {
    height: 100,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
<<<<<<< HEAD
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Safe area for iOS
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  buyButton: {
    width: '100%',
=======
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
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
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
<<<<<<< HEAD
=======
  contactModalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
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
<<<<<<< HEAD
=======
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
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
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
<<<<<<< HEAD
});
=======
}); 
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
