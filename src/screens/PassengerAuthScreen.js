import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../contexts/AuthContext';

const PassengerAuthScreen = ({ navigation, route }) => {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (isSignUp && !fullName) {
      setError('Veuillez entrer votre nom complet');
      return;
    }

    if (isSignUp && !phoneNumber) {
      setError('Veuillez entrer votre numéro de téléphone');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (isSignUp) {
        console.log('🔐 Tentative d\'inscription passager...');
        const { data, error } = await signUpWithEmail(email, password, { 
          fullName, 
          phoneNumber,
          userType: 'passenger' 
        });
        if (error) {
          console.log('❌ Erreur inscription:', error.message);
          setError(`Erreur d'inscription: ${error.message}`);
        } else {
          console.log('✅ Inscription passager réussie');
          // Navigate to Search screen after successful signup
          navigation.navigate('Search');
        }
      } else {
        console.log('🔐 Tentative de connexion passager...');
        const { data, error } = await signInWithEmail(email, password);
        if (error) {
          console.log('❌ Erreur connexion:', error.message);
          setError(`Erreur de connexion: ${error.message}`);
        } else {
          console.log('✅ Connexion passager réussie');
          // Navigate to Search screen after successful signin
          navigation.navigate('Search');
        }
      }
    } catch (error) {
      console.log('❌ Erreur générale:', error);
      setError(`Une erreur est survenue: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.title}>
          {isSignUp ? 'Inscription' : 'Connexion'}
        </Text>
        <Text style={styles.subtitle}>
          {isSignUp
            ? 'Créez votre compte pour voyager'
            : 'Connectez-vous pour réserver vos courses'}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Content */}
          <View style={styles.content}>
            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, !isSignUp && styles.activeTab]}
                onPress={() => setIsSignUp(false)}
              >
                <Text style={[styles.tabText, !isSignUp && styles.activeTabText]}>
                  Se connecter
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, isSignUp && styles.activeTab]}
                onPress={() => setIsSignUp(true)}
              >
                <Text style={[styles.tabText, isSignUp && styles.activeTabText]}>
                  S'inscrire
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {isSignUp && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nom complet</Text>
                  <View style={[styles.inputWrapper, focusedInput === 'fullName' && styles.inputWrapperFocused]}>
                    <Ionicons name="person-outline" size={20} color="rgba(255, 255, 255, 0.6)" />
                    <TextInput
                      style={styles.input}
                      placeholder="Entrez votre nom complet"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                      onFocus={() => setFocusedInput('fullName')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                </View>
              )}

              {isSignUp && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Numéro de téléphone</Text>
                  <View style={[styles.inputWrapper, focusedInput === 'phoneNumber' && styles.inputWrapperFocused]}>
                    <Ionicons name="call-outline" size={20} color="rgba(255, 255, 255, 0.6)" />
                    <TextInput
                      style={styles.input}
                      placeholder="+243 XXX XXX XXX"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                      onFocus={() => setFocusedInput('phoneNumber')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputWrapper, focusedInput === 'email' && styles.inputWrapperFocused]}>
                  <Ionicons name="mail-outline" size={20} color="rgba(255, 255, 255, 0.6)" />
                  <TextInput
                    style={styles.input}
                    placeholder="Entrez votre email"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mot de passe</Text>
                <View style={[styles.inputWrapper, focusedInput === 'password' && styles.inputWrapperFocused]}>
                  <Ionicons name="lock-closed-outline" size={20} color="rgba(255, 255, 255, 0.6)" />
                  <TextInput
                    style={styles.input}
                    placeholder="Entrez votre mot de passe"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="rgba(255, 255, 255, 0.6)"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {isSignUp && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirmer le mot de passe</Text>
                  <View style={[styles.inputWrapper, focusedInput === 'confirmPassword' && styles.inputWrapperFocused]}>
                    <Ionicons name="lock-closed-outline" size={20} color="rgba(255, 255, 255, 0.6)" />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirmez votre mot de passe"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                      onFocus={() => setFocusedInput('confirmPassword')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                </View>
              )}

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Auth Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleAuth}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.submitButtonText, loading && styles.submitButtonTextDisabled]}>
                    {isSignUp ? "S'inscrire" : 'Se connecter'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    alignItems: 'center',
    paddingTop: 90,
    paddingBottom: 40,
    backgroundColor: '#000',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 30,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    borderRadius: 20,
    padding: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 4,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputWrapperFocused: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: '#000000',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 15,
    marginLeft: 10,
  },
  eyeIcon: {
    padding: 5,
  },
  submitButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  submitButtonDisabled: {
    backgroundColor: '#000000',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default PassengerAuthScreen;