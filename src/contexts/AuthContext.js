import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, createUserDocument, getUserDocument } from '../config/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, sendPasswordResetEmail } from 'firebase/auth';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getUserDocument(firebaseUser.uid);
          const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            user_metadata: userDoc || {},
            firebase_user: true
          };
          
          setUser(userData);
          await AsyncStorage.setItem('zeurk_user', JSON.stringify(userData));
        } catch (error) {
          console.log('Error fetching user document:', error);
          // Fallback to basic Firebase user data
          const basicUserData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            user_metadata: {},
            firebase_user: true
          };
          setUser(basicUserData);
          await AsyncStorage.setItem('zeurk_user', JSON.stringify(basicUserData));
        }
      } else {
        setUser(null);
        await AsyncStorage.removeItem('zeurk_user');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithEmail = async (email, password) => {
    try {
      console.log('🔐 Attempting Firebase signin...');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get additional user data from Firestore
      const userDoc = await getUserDocument(firebaseUser.uid);
      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        user_metadata: userDoc || {},
        firebase_user: true
      };
      
      console.log('✅ Firebase signin successful');
      return { data: { user: userData }, error: null };
      
    } catch (err) {
      console.log('❌ Signin error:', err);
      let errorMessage = 'Erreur de connexion';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Aucun compte trouvé avec cet email';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Mot de passe incorrect';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Email invalide';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Réessayez plus tard';
      }
      
      return { 
        data: null, 
        error: { message: errorMessage } 
      };
    }
  };

  const signUpWithEmail = async (email, password, metadata = {}) => {
    try {
      console.log('🔐 Starting Firebase signup process...');
      console.log('📧 Email:', email);
      console.log('📝 Metadata:', metadata);
      
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Déterminer le type d'utilisateur
      const userType = metadata.userType || 'passenger';
      
      // Create user document in Firestore
      await createUserDocument(firebaseUser.uid, {
        email: firebaseUser.email,
        fullName: metadata.fullName || '',
        phoneNumber: metadata.phoneNumber || null,
        userType: userType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        user_metadata: {
          fullName: metadata.fullName || '',
          phoneNumber: metadata.phoneNumber || null,
          userType: userType
        },
        firebase_user: true
      };
      
      console.log('✅ Firebase signup successful');
      return { data: { user: userData }, error: null };
      
    } catch (err) {
      console.log('❌ Signup error:', err);
      let errorMessage = 'Erreur d\'inscription';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Un compte avec cet email existe déjà';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Email invalide';
      }
      
      return { 
        data: null, 
        error: { message: errorMessage } 
      };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      console.log('✅ Firebase signout successful');
      return { error: null };
    } catch (error) {
      console.log('❌ Firebase signout error:', error);
      return { error: { message: 'Erreur de déconnexion' } };
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent');
      return { data: { message: 'Email de réinitialisation envoyé' }, error: null };
    } catch (error) {
      console.log('❌ Password reset error:', error);
      let errorMessage = 'Erreur lors de l\'envoi de l\'email';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Aucun compte trouvé avec cet email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email invalide';
      }
      
      return { data: null, error: { message: errorMessage } };
    }
  };

  const value = {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};