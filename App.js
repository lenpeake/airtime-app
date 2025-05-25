// App.js
import './i18n-setup';
import React, { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import CreateNewAccount from './components/CreateNewAccount';
import ForgotPassword from './components/ForgotPassword';
import AirportSelectionPage from './components/AirportSelectionPage';
import AirportDetails from './components/AirportDetails';
import UserReports from './components/UserReports';
import SmartNotifications from './components/SmartNotifications';
import ActualWaitTimeInput from './components/ActualWaitTimeInput';
import ProfileScreen from './components/ProfileScreen';
import ThankYouScreen from './components/ThankYouScreen';
import AdminView from './components/AdminView';

import { AuthProvider } from './components/AuthContext';
import { PreferredNameProvider } from './components/PreferredNameContext';
import { WelcomeOverlayProvider } from './components/WelcomeOverlay';
import { WaitTimeReminderProvider } from './components/WaitTimeReminderContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  requestNotificationPermission,
  requestLocationPermission,
} from './utils/Permissions';

const Stack = createStackNavigator();

function AppInner() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          Inter: require('./assets/fonts/Inter_18pt-Regular.ttf'),
          'Inter-Bold': require('./assets/fonts/Inter_18pt-Bold.ttf'),
          CormorantGaramond: require('./assets/fonts/CormorantGaramond-Regular.ttf'),
          'PlayfairDisplay-Bold': require('./assets/fonts/PlayfairDisplay-Bold.ttf'),
        });
      } catch (e) {
        console.warn('Font loading failed:', e);
      } finally {
        setAppReady(true);
      }
    };

    loadFonts();
  }, []);

  useEffect(() => {
    if (appReady) {
      requestNotificationPermission();
      requestLocationPermission();
    }
  }, [appReady]);

  if (!appReady) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LandingPage" component={LandingPage} />
        <Stack.Screen name="LoginPage" component={LoginPage} />
        <Stack.Screen name="CreateNewAccount" component={CreateNewAccount} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="AirportSelectionPage" component={AirportSelectionPage} />
        <Stack.Screen name="AirportDetails" component={AirportDetails} />
        <Stack.Screen name="UserReports" component={UserReports} />
        <Stack.Screen name="SmartNotifications" component={SmartNotifications} />
        <Stack.Screen name="ActualWaitTimeInput" component={ActualWaitTimeInput} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="ThankYouScreen" component={ThankYouScreen} />
        <Stack.Screen name="AdminView" component={AdminView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  console.log('✅ App.js mounted with full context tree');
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PreferredNameProvider>
          <WaitTimeReminderProvider>
            <WelcomeOverlayProvider>
              <AppInner />
            </WelcomeOverlayProvider>
          </WaitTimeReminderProvider>
        </PreferredNameProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
