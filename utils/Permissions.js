// utils/Permissions.js
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';

export async function requestNotificationPermission() {
  try {
    const alreadyRequested = await SecureStore.getItemAsync('notificationsRequested');
    if (alreadyRequested === 'yes') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      await SecureStore.setItemAsync('notificationsRequested', 'yes');
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
