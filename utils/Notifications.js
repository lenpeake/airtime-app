// utils/Notifications.js
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

/**
 * Prompt the user for notification permissions only once.
 * Call this function after login.
 */
export async function requestNotificationPermissionOnce() {
  try {
    const alreadyAsked = await AsyncStorage.getItem('notificationPermissionAsked');
    if (alreadyAsked === 'true') return;

    // ✅ Skip if Firebase is not initialized or if running in Expo Go
    if (
      !Constants?.expoConfig?.android?.googleServicesFile &&
      Constants.appOwnership === 'expo'
    ) {
      console.warn('📵 Firebase not initialized. Skipping push setup.');
      await AsyncStorage.setItem('notificationPermissionAsked', 'true');
      return;
    }

    const { status } = await Notifications.requestPermissionsAsync();

    if (status === 'granted') {
      await Notifications.getExpoPushTokenAsync(); // Optional
    }

    await AsyncStorage.setItem('notificationPermissionAsked', 'true');
  } catch (error) {
    console.warn('⚠️ Push notification error suppressed:', error.message);
  }
}

/**
 * Schedule a notification after estimatedMinutes.
 * Allows override of title/body for i18n.
 */
export async function scheduleWaitNotification(estimatedMinutes, params = {}) {
  const {
    title = 'How long did it actually take?',
    body = 'Tap to submit your real wait time.'
  } = params;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      data: params,
    },
    trigger: {
      seconds: estimatedMinutes * 60,
      repeats: false,
    },
  });
}

/**
 * Developer test: schedules a test notification in 5 seconds.
 */
export async function scheduleFiveSecondDevNotification(params = {}) {
  const {
    title = '🧪 Dev Test Notification',
    body = 'Tap to submit your real wait time.'
  } = params;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      data: params,
    },
    trigger: {
      seconds: 5,
      repeats: false,
    },
  });
}

/**
 * Send a surge alert notification immediately.
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 */
export async function sendSurgeNotification(title, body) {
  if (!Device.isDevice) {
    console.warn('⚠️ Notifications only work on a physical device.');
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // Send immediately
    });
  } catch (err) {
    console.error('🚨 Failed to send surge notification:', err);
  }
}