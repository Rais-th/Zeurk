import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius, animations } from '../config/designTokens';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation, route }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const slideAnim = new Animated.Value(50);
  const progressAnim = new Animated.Value(0);

  const userName = route.params?.userName || 'Conducteur';

  const handleLetsGo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.replace('Home');
  };

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animations.duration.slow,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: animations.duration.slow,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: animations.duration.slow,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary, colors.background.primary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          {/* Icône de bienvenue */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#00C851', '#007E33', '#0099CC']}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="checkmark-circle" size={80} color="#fff" />
            </LinearGradient>
          </View>

          {/* Texte de bienvenue */}
          <View style={styles.textContainer}>
            <Text style={styles.welcomeTitle}>Bienvenue !</Text>
            <Text style={styles.welcomeSubtitle}>
              Bonjour {userName}
            </Text>
            <Text style={styles.welcomeDescription}>
              Votre inscription a été réalisée avec succès.{'\n'}
              Prêt à commencer votre aventure ?
            </Text>
          </View>

          {/* Bouton Let's go */}
          <TouchableOpacity 
            style={styles.letsGoButton}
            onPress={handleLetsGo}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#00C851', '#007E33', '#0099CC']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Let's go !</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
    width: '100%',
  },
  iconContainer: {
    marginBottom: spacing.xxxl,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.brand.success,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing.huge,
  },
  welcomeTitle: {
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.base,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: typography.size.lg,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  letsGoButton: {
    width: '80%',
    maxWidth: 280,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl + spacing.base,
    borderRadius: borderRadius.xl + 10,
    shadowColor: colors.brand.success,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonText: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: spacing.sm,
  },
});

export default WelcomeScreen;