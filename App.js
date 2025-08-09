import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
<<<<<<< HEAD

// Polyfill for structuredClone (not available in React Native)
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };
}

import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VehiclesProvider } from './src/context/VehiclesContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import OfflineIndicator from './src/components/OfflineIndicator';
import networkManager from './src/utils/networkManager';
import { notificationService } from './src/services/notificationService';
import productionCleanupService from './src/services/productionCleanupService';
import { getConfig, devLog } from './src/config/productionConfig';
import AuthScreen from './src/screens/AuthScreen';
import PassengerAuthScreen from './src/screens/PassengerAuthScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import PreferencesScreen from './src/screens/PreferencesScreen';
import RideHistoryScreen from './src/screens/RideHistoryScreen';
import SupportAndAssistanceScreen from './src/screens/SupportAndAssistanceScreen';
import ReportProblemScreen from './src/screens/ReportProblemScreen';
import SuggestFeatureScreen from './src/screens/SuggestFeatureScreen';
import InviteFriendScreen from './src/screens/InviteFriendScreen';
import VehicleMarketplaceScreen from './src/screens/VehicleMarketplaceScreen';
import VehicleDetailsScreen from './src/screens/VehicleDetailsScreen';
import CreateVehicleListingScreen from './src/screens/CreateVehicleListingScreen';
import RideOptionsScreen from './src/screens/RideOptionsScreen';
import FindDriverScreen from './src/screens/FindDriverScreen';
import ConfirmPickupScreen from './src/screens/ConfirmPickupScreen';
import NavigationScreen from './src/screens/NavigationScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import ChatScreen from './src/screens/ChatScreen';
import SupportChatScreen from './src/screens/SupportChatScreen';
import InfoChatScreen from './src/screens/InfoChatScreen';
import SearchScreen from './src/screens/SearchScreen';
import ScheduleRideScreen from './src/screens/ScheduleRideScreen';
import SMSRideRequestScreen from './src/screens/SMSRideRequestScreen';
import DriverDashboard from './src/screens/DriverDashboard/DriverDashboard';
import HomeScreen from './src/screens/HomeScreen';
import WelcomeDriver from './src/screens/WelcomeDriver';
import WelcomePassenger from './src/screens/WelcomePassenger';

const Stack = createNativeStackNavigator();

// Component to handle navigation based on auth state
function NavigationWrapper() {
  const { user, loading } = useAuth();
  const navigationRef = useRef();

  // Initialize services when app starts
  useEffect(() => {
    let networkUnsubscribe;
    
    const initializeServices = async () => {
      const config = getConfig();
      devLog('🚀 Initialisation de l\'app Zeurk...', {
        production: config.IS_PRODUCTION,
        autoCleanup: config.DATA_MANAGEMENT.AUTO_CLEANUP_TEST_DATA
      });
      
      // Initialize network manager and store unsubscribe function
      networkUnsubscribe = networkManager.initialize();
      
      // Initialize notification service
      const token = await notificationService.initialize();
      devLog('🔔 App initialisé avec token:', token);
      
      // Production cleanup service - nettoyer les données de test
      if (config.IS_PRODUCTION) {
        devLog('🧹 Mode production détecté - démarrage du nettoyage automatique...');
        await productionCleanupService.autoCleanupOnStartup();
        
        // Vérifier le statut de production
        const status = await productionCleanupService.getProductionStatus();
        devLog('📊 Statut production:', status);
      }
      
      // Setup notification listeners after navigation is ready
      if (navigationRef.current) {
        notificationService.setupNotificationListeners(navigationRef.current);
      }
    };

    initializeServices();
    
    // Cleanup on app unmount
    return () => {
      if (networkUnsubscribe) {
        networkUnsubscribe();
      }
      notificationService.cleanup();
    };
  }, []);

  // Setup notification listeners when navigation is ready
  const onNavigationReady = () => {
    if (navigationRef.current) {
      notificationService.setupNotificationListeners(navigationRef.current);
    }
  };

  // Show loading screen while checking auth state
  if (loading) {
    return null; // You could add a loading screen here
  }

  return (
    <NavigationContainer 
      ref={navigationRef}
      onReady={onNavigationReady}
    >
      <OfflineIndicator />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
        initialRouteName="Home"
      >
        {/* All screens accessible without authentication */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="RideOptions" component={RideOptionsScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="ConfirmPickup" component={ConfirmPickupScreen} />
        <Stack.Screen name="FindDriver" component={FindDriverScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
        <Stack.Screen name="NavigationScreen" component={NavigationScreen} />
        <Stack.Screen name="Navigation" component={NavigationScreen} />
        <Stack.Screen name="SMSRideRequest" component={SMSRideRequestScreen} />
        <Stack.Screen name="SupportAndAssistanceScreen" component={SupportAndAssistanceScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
        <Stack.Screen name="Preferences" component={PreferencesScreen} />
        <Stack.Screen name="ReportProblem" component={ReportProblemScreen} />
        <Stack.Screen name="SupportChatScreen" component={SupportChatScreen} />
        <Stack.Screen name="SuggestFeatureScreen" component={SuggestFeatureScreen} />
        <Stack.Screen name="InfoChatScreen" component={InfoChatScreen} />
        <Stack.Screen name="InviteFriendScreen" component={InviteFriendScreen} options={{
          title: 'Inviter un ami',
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
        }} />
        <Stack.Screen name="VehicleMarketplace" component={VehicleMarketplaceScreen} />
        <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
        <Stack.Screen name="CreateVehicleListing" component={CreateVehicleListingScreen} />
        <Stack.Screen name="ScheduleRide" component={ScheduleRideScreen} />
        {/* Authentication screens */}
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="PassengerAuth" component={PassengerAuthScreen} />
        <Stack.Screen name="WelcomeDriver" component={WelcomeDriver} />
        <Stack.Screen name="WelcomePassenger" component={WelcomePassenger} />
        <Stack.Screen name="Welcome" component={WelcomeDriver} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <VehiclesProvider>
          <NavigationWrapper />
        </VehiclesProvider>
      </AuthProvider>
=======
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VehiclesProvider } from './src/context/VehiclesContext';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import RideOptionsScreen from './src/screens/RideOptionsScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import ConfirmPickupScreen from './src/screens/ConfirmPickupScreen';
import FindDriverScreen from './src/screens/FindDriverScreen';
import ChatScreen from './src/screens/ChatScreen';
import DriverDashboardScreen from './src/screens/DriverDashboard';
import NavigationScreen from './src/screens/NavigationScreen';
import SupportAndAssistanceScreen from './src/screens/SupportAndAssistanceScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import RideHistoryScreen from './src/screens/RideHistoryScreen';
import PreferencesScreen from './src/screens/PreferencesScreen';
import InviteFriendScreen from './src/screens/InviteFriendScreen';
import ReportProblemScreen from './src/screens/ReportProblemScreen';
import SupportChatScreen from './src/screens/SupportChatScreen';
import SuggestFeatureScreen from './src/screens/SuggestFeatureScreen';
import InfoChatScreen from './src/screens/InfoChatScreen';
import VehicleMarketplaceScreen from './src/screens/VehicleMarketplaceScreen';
import VehicleDetailsScreen from './src/screens/VehicleDetailsScreen';
import CreateVehicleListingScreen from './src/screens/CreateVehicleListingScreen';
import ScheduleRideScreen from './src/screens/ScheduleRideScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <VehiclesProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="RideOptions" component={RideOptionsScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="ConfirmPickup" component={ConfirmPickupScreen} />
            <Stack.Screen name="FindDriver" component={FindDriverScreen} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen name="DriverDashboard" component={DriverDashboardScreen} />
            <Stack.Screen name="NavigationScreen" component={NavigationScreen} />
            <Stack.Screen name="SupportAndAssistanceScreen" component={SupportAndAssistanceScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
            <Stack.Screen name="Preferences" component={PreferencesScreen} />
            <Stack.Screen name="ReportProblem" component={ReportProblemScreen} />
            <Stack.Screen name="SupportChatScreen" component={SupportChatScreen} />
            <Stack.Screen name="SuggestFeatureScreen" component={SuggestFeatureScreen} />
            <Stack.Screen name="InfoChatScreen" component={InfoChatScreen} />
            <Stack.Screen name="InviteFriendScreen" component={InviteFriendScreen} options={{
              title: 'Inviter un ami',
              headerStyle: {
                backgroundColor: '#000',
              },
              headerTintColor: '#fff',
            }} />
            <Stack.Screen name="VehicleMarketplace" component={VehicleMarketplaceScreen} />
            <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
            <Stack.Screen name="CreateVehicleListing" component={CreateVehicleListingScreen} />
            <Stack.Screen name="ScheduleRide" component={ScheduleRideScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </VehiclesProvider>
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    </GestureHandlerRootView>
  );
}
