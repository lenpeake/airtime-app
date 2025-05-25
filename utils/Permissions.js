// utils/Permissions.js
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function requestNotificationPermission() {
  try {
    const alreadyRequested = await AsyncStorage.getItem('notificationsRequested');
    if (alreadyRequested === 'yes') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      await AsyncStorage.setItem('notificationsRequested', 'yes');
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Notification permission error:', err);
    return false;
  }
}

export async function requestLocationPermission() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (err) {
    console.warn('Location permission error:', err);
    return false;
  }
}
