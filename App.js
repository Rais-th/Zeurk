import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VehiclesProvider } from './src/context/VehiclesContext';
import OfflineIndicator from './src/components/OfflineIndicator';
import networkManager from './src/utils/networkManager';
import { notificationService } from './src/services/notificationService';
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
import SMSRideRequestScreen from './src/screens/SMSRideRequestScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const navigationRef = useRef();

  // Initialize services when app starts
  useEffect(() => {
    const initializeServices = async () => {
      // Initialize network manager
      networkManager.initialize();
      
      // Initialize notification service
      const token = await notificationService.initialize();
      console.log('🔔 App initialisé avec token:', token);
      
      // Setup notification listeners after navigation is ready
      if (navigationRef.current) {
        notificationService.setupNotificationListeners(navigationRef.current);
      }
    };

    initializeServices();
    
    // Cleanup on app unmount
    return () => {
      networkManager.cleanup();
      notificationService.cleanup();
    };
  }, []);

  // Setup notification listeners when navigation is ready
  const onNavigationReady = () => {
    if (navigationRef.current) {
      notificationService.setupNotificationListeners(navigationRef.current);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <VehiclesProvider>
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
          </Stack.Navigator>
        </NavigationContainer>
      </VehiclesProvider>
    </GestureHandlerRootView>
  );
}
