import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
  FlatList,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

const ReportProblemScreen = ({ navigation }) => {
  const [description, setDescription] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (showConfirmation) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Ferme automatiquement après 2 secondes
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowConfirmation(false);
          navigation.goBack();
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showConfirmation]);

  const pickImages = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: false,
<<<<<<< HEAD
      quality: 1.0,
=======
      quality: 1,
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      setScreenshots(prevScreenshots => {
        const newScreenshots = [...prevScreenshots];
        result.assets.forEach(asset => {
          if (!newScreenshots.some(s => s.uri === asset.uri)) {
            newScreenshots.push(asset);
          }
        });
        return newScreenshots.slice(0, 5); // Limite à 5 images maximum
      });
    }
  };

  const removeScreenshot = (index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScreenshots(prevScreenshots => 
      prevScreenshots.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = () => {
    if (description.trim().length === 0) {
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Ici, on ajoutera la logique d'envoi
    console.log('Problème signalé:', { 
      description, 
      screenshots: screenshots.map(s => s.uri)
    });
    setShowConfirmation(true);
  };

  const renderScreenshot = ({ item, index }) => (
    <View style={styles.screenshotContainer}>
      <Image 
        source={{ uri: item.uri }} 
        style={styles.screenshot}
        resizeMode="cover"
      />
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeScreenshot(index)}
      >
        <Ionicons name="close-circle" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Signaler un problème</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Description du problème</Text>
          <TextInput
            style={styles.input}
            placeholder="Décrivez le problème rencontré..."
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />

          <View style={styles.screenshotsSection}>
            <Text style={styles.label}>Captures d'écran (optionnel)</Text>
            <Text style={styles.sublabel}>Maximum 5 images</Text>
            
            {screenshots.length > 0 && (
              <FlatList
                data={screenshots}
                renderItem={renderScreenshot}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.screenshotsList}
              />
            )}

            {screenshots.length < 5 && (
              <TouchableOpacity 
                style={styles.uploadButton} 
                onPress={pickImages}
              >
                <View style={styles.uploadContent}>
                  <Ionicons name="image-outline" size={24} color="#fff" />
                  <Text style={styles.uploadText}>
                    {screenshots.length === 0 
                      ? "Ajouter des captures d'écran"
                      : 'Ajouter plus de captures'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
            style={[
              styles.submitButton,
              description.trim().length === 0 && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={description.trim().length === 0}
          >
            <Text style={styles.submitButtonText}>Envoyer</Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal
          transparent={true}
          visible={showConfirmation}
          animationType="none"
        >
          <View style={styles.confirmationContainer}>
            <Animated.View 
              style={[
                styles.confirmationContent,
                { opacity: fadeAnim }
              ]}
            >
              <View style={styles.confirmationIcon}>
                <Ionicons name="checkmark-circle" size={48} color="#fff" />
              </View>
              <Text style={styles.confirmationText}>Rapport envoyé</Text>
              <Text style={styles.confirmationSubtext}>Merci de nous aider à améliorer l'application</Text>
            </Animated.View>
          </View>
        </Modal>
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
    marginRight: 29,
  },
  headerRight: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    marginTop: 20,
  },
  sublabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  screenshotsSection: {
    marginTop: 20,
  },
  screenshotsList: {
    paddingVertical: 10,
  },
  uploadButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginTop: 8,
  },
  uploadContent: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 8,
  },
  screenshotContainer: {
    width: 140,
    height: 200,
    marginRight: 10,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  screenshot: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 30,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '600',
  },
  confirmationContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: '80%',
  },
  confirmationIcon: {
    marginBottom: 16,
  },
  confirmationText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmationSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
    textAlign: 'center',
  },
});

<<<<<<< HEAD
export default ReportProblemScreen;
=======
export default ReportProblemScreen; 
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
