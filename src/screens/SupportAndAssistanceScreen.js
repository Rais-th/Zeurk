import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SupportAndAssistanceScreen = ({ navigation }) => {
  const handleOptionPress = (option) => {
    if (option === 'Affaires Perdues') {
      navigation.navigate('RideHistory', { purpose: 'lost_item' });
    } else if (option === "Probleme avec l'application") {
      navigation.navigate('ReportProblem');
    } else if (option === "Discuter avec nous") {
      navigation.navigate('SupportChatScreen');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support et Assistance</Text>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleOptionPress('Affaires Perdues')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="archive-outline" size={28} color="#fff" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>Affaires Perdues</Text>
              <Text style={styles.optionDescription}>Avez-vous oublié quelque chose dans une voiture ?</Text>
        </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleOptionPress("Probleme avec l'application")}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="bug-outline" size={28} color="#fff" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>Problème avec l'application</Text>
              <Text style={styles.optionDescription}>Signalez un bug ou un dysfonctionnement.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => handleOptionPress("Discuter avec nous")}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="chatbubbles-outline" size={28} color="#fff" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>Discuter avec Zeurk AI</Text>
              <Text style={styles.optionDescription}>Posez vos questions à Zeurk AI. Si besoin, Zeurk AI expliquera votre conversation à notre équipe.</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginRight: 29, // Pour compenser le bouton retour et centrer le titre
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
}); 

export default SupportAndAssistanceScreen; 