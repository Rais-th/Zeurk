import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as Haptics from 'expo-haptics';

// Validation schema
const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Veuillez entrer un email valide'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Le mot de passe doit contenir au moins 6 caractères'
  },
  fullName: {
    required: true,
    minLength: 2,
    message: 'Le nom doit contenir au moins 2 caractères'
  },
  phoneNumber: {
    required: true,
    pattern: /^\+?[1-9]\d{1,14}$/,
    message: 'Veuillez entrer un numéro de téléphone valide'
  }
};

export const usePassengerAuth = () => {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: ''
  });
  
  // UI state
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Validation function
  const validateField = useCallback((field, value) => {
    const rule = validationRules[field];
    if (!rule) return null;

    if (rule.required && !value.trim()) {
      return `${field === 'fullName' ? 'Le nom' : field === 'phoneNumber' ? 'Le numéro de téléphone' : field === 'email' ? 'L\'email' : 'Le mot de passe'} est requis`;
    }

    if (rule.minLength && value.length < rule.minLength) {
      return rule.message;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message;
    }

    return null;
  }, []);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Common validations
    newErrors.email = validateField('email', formData.email);
    newErrors.password = validateField('password', formData.password);
    
    // Sign up specific validations
    if (isSignUp) {
      newErrors.fullName = validateField('fullName', formData.fullName);
      newErrors.phoneNumber = validateField('phoneNumber', formData.phoneNumber);
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    // Filter out null errors
    Object.keys(newErrors).forEach(key => {
      if (newErrors[key] === null) {
        delete newErrors[key];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isSignUp, validateField]);

  // Update form field
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle authentication
  const handleAuth = useCallback(async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, error: null }; // Return null instead of generic message
    }

    setLoading(true);
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      let result;
      if (isSignUp) {
        console.log('🔐 Tentative d\'inscription passager...');
        result = await signUpWithEmail(formData.email, formData.password, {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          userType: 'passenger'
        });
      } else {
        console.log('🔐 Tentative de connexion passager...');
        result = await signInWithEmail(formData.email, formData.password);
      }

      if (result.error) {
        console.log('❌ Erreur auth:', result.error.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return { success: false, error: result.error.message };
      } else {
        console.log('✅ Authentification réussie');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return { success: true, data: result.data };
      }
    } catch (error) {
      console.log('❌ Erreur générale:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, error: error.message || 'Une erreur est survenue' };
    } finally {
      setLoading(false);
    }
  }, [formData, isSignUp, validateForm, signInWithEmail, signUpWithEmail]);

  // Toggle auth mode
  const toggleAuthMode = useCallback(() => {
    setIsSignUp(prev => !prev);
    setErrors({});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Focus handlers
  const handleFocus = useCallback((field) => {
    setFocusedField(field);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  // Computed values
  const isFormValid = useMemo(() => {
    const requiredFields = isSignUp 
      ? ['email', 'password', 'confirmPassword', 'fullName', 'phoneNumber']
      : ['email', 'password'];
    
    return requiredFields.every(field => formData[field].trim()) && 
           Object.keys(errors).length === 0;
  }, [formData, errors, isSignUp]);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  return {
    // Form data
    formData,
    updateField,
    
    // UI state
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
    
    // Actions
    handleAuth,
    isFormValid,
    
    // Validation
    validateField
  };
};