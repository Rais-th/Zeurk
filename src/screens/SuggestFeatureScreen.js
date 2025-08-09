import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SuggestFeatureScreen = ({ navigation }) => {
  const [featureText, setFeatureText] = React.useState('');

  const handleSubmit = () => {
    if (featureText.trim().length === 0) {
      Alert.alert('Erreur', 'Veuillez décrire la fonctionnalité que vous souhaitez proposer.');
      return;
    }

    // Ici, vous implémenteriez la logique pour envoyer la suggestion de fonctionnalité
    // Par exemple, l'envoyer à une API, une base de données, ou un service de feedback.
    console.log('Nouvelle fonctionnalité proposée:', featureText);
    Alert.alert('Merci !', 'Votre suggestion a été envoyée avec succès. Nous apprécions votre contribution !');
    setFeatureText(''); // Réinitialiser le champ après l'envoi
    navigation.goBack(); // Revenir à l'écran précédent après l'envoi
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quelle fonctionnalité Zeurk AI manque?</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.descriptionText}>
            Surement dans notre prochaine mise à jour...
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Décrivez votre idée ici..."
            placeholderTextColor="#888"
            multiline
            numberOfLines={8}
            value={featureText}
            onChangeText={setFeatureText}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Envoyer la suggestion</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginRight: 29, // Pour compenser le bouton retour et centrer le titre
  },
  content: {
    flex: 1,
    padding: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    height: 150,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SuggestFeatureScreen; 