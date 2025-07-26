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
import { usePassengerAuth } from '../hooks/usePassengerAuth';

const PassengerAuthScreen = ({ navigation, route }) => {
  const {
    formData,
    updateField,
    isSignUp,
    toggleAuthMode,
    loading,
    errors,
    hasErrors,
    focusedField,
    handleFocus,
    handleBlur,
    showPassword,
    togglePasswordVisibility,
    handleAuth,
    isFormValid,
  } = usePassengerAuth();

  const [error, setError] = useState('');

  // Force sign up mode if route params indicate it
  React.useEffect(() => {
    if (route.params?.forceSignUp && !isSignUp) {
      toggleAuthMode();
    }
  }, [route.params?.forceSignUp]);

  const onAuthSuccess = async () => {
    const result = await handleAuth();
    if (result.success) {
      navigation.navigate('Search');
    } else if (result.error) {
      setError(result.error);
    }
    // If result.error is null, don't set any error since we have field-specific errors
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleTabPress = (newIsSignUp) => {
    if (newIsSignUp !== isSignUp) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toggleAuthMode();
    }
  };

  const handlePasswordToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    togglePasswordVisibility();
  };

  const handleInputFocus = (inputName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleFocus(inputName);
  };

  const handleInputBlur = () => {
    handleBlur();
  };

  // Get friendly error message for confirm password
  const getConfirmPasswordError = () => {
    if (errors.confirmPassword) {
      if (errors.confirmPassword === 'Les mots de passe ne correspondent pas') {
        return 'Oups ! Vos mots de passe ne sont pas identiques. Vérifiez-les s\'il vous plaît 😊';
      }
      return errors.confirmPassword;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.title}>
          {isSignUp ? 'Bienvenue à Zeurk' : 'Ravie de vous revoir'}
        </Text>
        <Text style={styles.subtitle}>
          {isSignUp
            ? 'Inscription'
            : 'Se connecter à Zeurk'}
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
                onPress={() => handleTabPress(false)}
              >
                <Text style={[styles.tabText, !isSignUp && styles.activeTabText]}>
                  Se connecter
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, isSignUp && styles.activeTab]}
                onPress={() => handleTabPress(true)}
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
                  <View style={[styles.inputWrapper, focusedField === 'fullName' && styles.inputWrapperFocused]}>
                    <Ionicons name="person-outline" size={20} color="rgba(255, 255, 255, 0.6)" />
                    <TextInput
                      style={styles.input}
                      placeholder="Mobutu Seseseko"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={formData.fullName}
                      onChangeText={(value) => updateField('fullName', value)}
                      autoCapitalize="words"
                      onFocus={() => handleInputFocus('fullName')}
                      onBlur={handleInputBlur}
                    />
                  </View>
                  {errors.fullName && (
                    <Text style={styles.errorText}>{errors.fullName}</Text>
                  )}
                </View>
              )}

              {isSignUp && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputWrapperFocused]}>
                    <Ionicons name="mail-outline" size={20} color="rgba(255, 255, 255, 0.6)" />
                    <TextInput
                      style={styles.input}
                      placeholder="mobutu@gmail.com"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={formData.email}
                      onChangeText={(value) => updateField('email', value)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onFocus={() => handleInputFocus('email')}
                      onBlur={handleInputBlur}
                    />
                  </View>
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>
              )}

              {isSignUp && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Numéro de téléphone</Text>
                  <View style={[styles.inputWrapper, focusedField === 'phoneNumber' && styles.inputWrapperFocused]}>
                    <Ionicons name="call-outline" size={20} color="rgba(255, 255, 255, 0.6)" />
                    <TextInput
                      style={styles.input}
                      placeholder="+243000000000"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={formData.phoneNumber}
                      onChangeText={(value) => updateField('phoneNumber', value)}
                      keyboardType="phone-pad"
                      onFocus={() => handleInputFocus('phoneNumber')}
                      onBlur={handleInputBlur}
                    />
                  </View>
                  {errors.phoneNumber && (
                    <Text style={styles.errorText}>{errors.phoneNumber}</Text>
                  )}
                </View>
              )}

              {!isSignUp && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputWrapperFocused]}>
                    <Ionicons name="mail-outline" size={20} color="rgba(255, 255, 255, 0.6)" />
                    <TextInput
                      style={styles.input}
                      placeholder="mobutu@gmail.com"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={formData.email}
                      onChangeText={(value) => updateField('email', value)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onFocus={() => handleInputFocus('email')}
                      onBlur={handleInputBlur}
                    />
                  </View>
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>
              )}

              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, styles.inputContainerLeft]}>
                  <Text style={styles.label}>Mot de passe</Text>
                  <View style={[styles.inputWrapper, focusedField === 'password' && styles.inputWrapperFocused]}>
                    <Ionicons name="lock-closed-outline" size={20} color="rgba(255, 255, 255, 0.6)" />
                    <TextInput
                      style={styles.input}
                      placeholder="*******"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={formData.password}
                      onChangeText={(value) => updateField('password', value)}
                      secureTextEntry={!showPassword}
                      onFocus={() => handleInputFocus('password')}
                      onBlur={handleInputBlur}
                    />
                    <TouchableOpacity
                      onPress={handlePasswordToggle}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="rgba(255, 255, 255, 0.6)"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                {isSignUp && (
                  <View style={[styles.inputContainer, styles.inputContainerRight]}>
                    <Text style={styles.label}>Repetez</Text>
                    <View style={[styles.inputWrapper, focusedField === 'confirmPassword' && styles.inputWrapperFocused]}>
                      <Ionicons name="lock-closed-outline" size={20} color="rgba(255, 255, 255, 0.6)" />
                      <TextInput
                        style={styles.input}
                        placeholder="*******"
                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                        value={formData.confirmPassword}
                        onChangeText={(value) => updateField('confirmPassword', value)}
                        secureTextEntry={!showPassword}
                        onFocus={() => handleInputFocus('confirmPassword')}
                        onBlur={handleInputBlur}
                      />
                    </View>
                    {getConfirmPasswordError() && (
                      <Text style={styles.errorText}>{getConfirmPasswordError()}</Text>
                    )}
                  </View>
                )}
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Auth Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={onAuthSuccess}
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
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: '#000',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 30,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 60,
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
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputContainerLeft: {
    flex: 1,
    marginRight: 10,
    minWidth: 0,
    maxWidth: '50%',
  },
  inputContainerRight: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
    maxWidth: '50%',
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
    textAlign: 'left',
  },
});

export default PassengerAuthScreen;