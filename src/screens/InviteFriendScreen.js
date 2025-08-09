import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
  Animated,
  Vibration,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const InviteFriendScreen = ({ navigation }) => {
  const [showConditions, setShowConditions] = useState(false);
  const [copied, setCopied] = useState(false);
  const promoCode = 'JOHN123456'; // À remplacer par le vrai username + code
  const cardScale = new Animated.Value(1);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(promoCode);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
  };

  const handleShare = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Share.share({ 
        message: `Rejoignez-moi sur Zeurk ! Utilisez mon code ${promoCode} pour obtenir 5$ de crédit sur votre première course.`
      });
    } catch (error) {
      console.error(error);
    }
  };

  const toggleConditions = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowConditions(!showConditions);
  };

  const handleCardPress = async () => {
    // Animation de scale
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Retour haptique
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <TouchableOpacity activeOpacity={0.9} onPress={handleCardPress}>
            <Animated.View style={{ transform: [{ scale: cardScale }] }}>
              <LinearGradient
                colors={['#2E7D32', '#1B5E20']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.rewardCard}
              >
                <View style={styles.cardChip}>
                  <Ionicons name="card" size={24} color="rgba(255, 255, 255, 0.6)" />
                </View>
                <Text style={styles.rewardAmount}>5$</Text>
                <Text style={styles.rewardText}>DE CRÉDIT</Text>
                <Text style={styles.rewardSubtext}>par ami invité</Text>
                <View style={styles.cardPattern}>
                  <Text style={styles.cardPatternText}>• • • •</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Promo Code Section */}
        <View style={styles.promoSection}>
          <Text style={styles.promoLabel}>VOTRE CODE UNIQUE</Text>
          <TouchableOpacity 
            style={styles.promoCodeBox}
            onPress={handleCopyCode}
          >
            <Text style={styles.promoCode}>{promoCode}</Text>
            <View style={styles.copyButton}>
              {copied ? (
                <Text style={styles.copiedText}>Copié</Text>
              ) : (
                <Ionicons name="copy-outline" size={24} color="#4CAF50" />
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sendLinkButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color="#fff" />
            <Text style={styles.sendLinkText}>Envoyer mon lien</Text>
          </TouchableOpacity>
        </View>

        {/* Steps Section */}
        <View style={styles.stepsSection}>
          <Text style={styles.stepsTitle}>Comment ça marche</Text>
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Partagez votre code</Text>
            </View>
            <Text style={styles.stepArrow}>→</Text>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Première course</Text>
            </View>
            <Text style={styles.stepArrow}>→</Text>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Gagnez 5$</Text>
            </View>
          </View>
        </View>

        {/* Conditions Toggle */}
        <TouchableOpacity style={styles.conditionsToggle} onPress={toggleConditions}>
          <Text style={styles.conditionsTitle}>Conditions de participation</Text>
          <Ionicons 
            name={showConditions ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="rgba(255, 255, 255, 0.6)" 
          />
        </TouchableOpacity>

        {showConditions && (
          <View style={styles.conditionsContent}>
            <Text style={styles.conditionText}>
              • Le crédit sera disponible après la première course de votre invité{'\n'}
              • Le crédit est valable pendant 14 jours{'\n'}
              • Après 14 jours, les crédits non utilisés expirent{'\n'}
              • Applicable sur toutes les courses Zeurk
            </Text>
          </View>
        )}
      </ScrollView>
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.goBack();
        }}
      >
        <Ionicons name="close" size={28} color="rgba(255, 255, 255, 0.6)" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 90,
    paddingBottom: 20,
  },
  rewardCard: {
    paddingHorizontal: 40,
    paddingVertical: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: width * 0.85,
    aspectRatio: 1.6,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  rewardAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 2,
  },
  rewardSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  promoSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  promoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1,
    marginBottom: 12,
  },
  promoCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: width * 0.8,
    justifyContent: 'space-between',
  },
  promoCode: {
    fontSize: 28,
    fontWeight: '600',
    color: '#4CAF50',
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
  },
  stepsSection: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  stepsTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  stepArrow: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 16,
    paddingHorizontal: 4,
  },
  conditionsToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  conditionsTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  conditionsContent: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  conditionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 22,
  },
  cardChip: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  cardPattern: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  cardPatternText: {
    fontSize: 32,
    letterSpacing: 4,
    color: 'rgba(255, 255, 255, 0.15)',
  },
  copiedText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  sendLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    width: width * 0.8,
  },
  sendLinkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeButton: {
    alignSelf: 'center',
    padding: 16,
    marginBottom: 20,
  },
});

export default InviteFriendScreen; 