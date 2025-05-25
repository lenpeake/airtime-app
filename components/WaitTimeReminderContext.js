// components/WaitTimeReminderContext.js
import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { auth } from '../components/supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

const WaitTimeReminderContext = createContext(undefined);

const logArrivalToSupabase = async ({ airportCode, estimatedMinutes, deviceId, method = 'gps' }) => {
  const session = await auth.getSession();
  const accessToken = session?.data?.session?.access_token;
  if (!accessToken) return;

  try {
    const location = await Location.getCurrentPositionAsync({});
    const arrivalTime = new Date().toISOString();
    const { latitude, longitude } = location.coords;

    const body = {
      airport_code: airportCode,
      estimated_minutes: estimatedMinutes,
      device_id: deviceId,
      arrival_time: arrivalTime,
      arrival_method: method,
      latitude,
      longitude,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/actual_wait_times`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Arrival logging failed');

    console.log('✅ Logged arrival in Supabase:', data[0]);
    return data[0];
  } catch (err) {
    console.warn('❌ Failed to log arrival:', err.message);
    return null;
  }
};

export const WaitTimeReminderProvider = ({ children }) => {
  const reminderTimeoutRef = useRef(null);
  const locationWatcherRef = useRef(null);
  const [timerStarted, setTimerStarted] = useState(false);
  const [selectedAirportCode, setSelectedAirportCode] = useState(null);
  const [estimatedMinutes, setEstimatedMinutes] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [navigationRef, setNavigationRef] = useState(null);

  const [isWithinRange, setIsWithinRange] = useState(false);
  const [lastWelcomedAirportCode, setLastWelcomedAirportCode] = useState(null);
  const arrivalRowIdRef = useRef(null);

  const clearExistingReminder = () => {
    if (reminderTimeoutRef.current) {
      clearTimeout(reminderTimeoutRef.current);
      reminderTimeoutRef.current = null;
    }
  };

  const startReminder = ({ airportCode, estimatedMinutes, deviceId, navigation }) => {
    const TEST_MODE = false;
    const bufferMinutes = 10;
    const delayMs = TEST_MODE
      ? 5000
      : Math.max(estimatedMinutes + bufferMinutes, 1) * 60 * 1000;

    clearExistingReminder();

    reminderTimeoutRef.current = setTimeout(() => {
      Alert.alert(
        'Security Check',
        'Are you through security?',
        [
          {
            text: 'Not Yet, Remind Me in 5',
            onPress: async () => {
              const rowId = arrivalRowIdRef.current;
              const session = await auth.getSession();
              const accessToken = session?.data?.session?.access_token;

              if (rowId && accessToken) {
                try {
                  await fetch(`${SUPABASE_URL}/rest/v1/actual_wait_times?id=eq.${rowId}`, {
                    method: 'PATCH',
                    headers: {
                      apikey: SUPABASE_ANON_KEY,
                      Authorization: `Bearer ${accessToken}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      remind_later_count: { increment: 1 },
                    }),
                  });
                  console.log('🔁 Remind later count incremented.');
                } catch (err) {
                  console.warn('⚠️ Failed to increment remind_later_count:', err.message);
                }
              }

              startReminder({
                airportCode,
                estimatedMinutes: 5,
                deviceId,
                navigation,
              });
            },
          },
          {
            text: 'Yes, Submit Wait Time',
            onPress: () => {
              navigation.navigate('ActualWaitTimeInput', {
                airportCode,
                estimatedMinutes,
                deviceId,
                rowId: arrivalRowIdRef.current || null,
              });
            },
          },
        ],
        { cancelable: false }
      );
    }, delayMs);
  };

  const cancelReminder = () => {
    clearExistingReminder();
    setTimerStarted(false);
  };

  const initializeReminderOnArrival = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission not granted');
      return;
    }

    if (!selectedAirportCode || !estimatedMinutes || !deviceId || !navigationRef) {
      console.warn('Reminder context not fully initialized');
      return;
    }

    const session = await auth.getSession();
    const accessToken = session?.data?.session?.access_token;
    if (!accessToken) {
      console.warn('❌ No access token available for monitored_airports lookup');
      return;
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/monitored_airports?airport_code=eq.${selectedAirportCode}&select=latitude,longitude`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    if (!response.ok || !data || data.length === 0) {
      console.warn('Could not fetch airport location from Supabase:', data);
      return;
    }

    const airportLat = data[0].latitude;
    const airportLon = data[0].longitude;

    locationWatcherRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 50 },
      (location) => {
        const userLat = location.coords.latitude;
        const userLon = location.coords.longitude;

        const distance = getDistanceFromLatLonInKm(userLat, userLon, airportLat, airportLon);
        const withinRange = distance <= 0.5;

        setIsWithinRange(withinRange);

        if (withinRange && !timerStarted) {
          console.log(`🟢 Arrived at airport ${selectedAirportCode} — starting reminder`);
          startReminder({
            airportCode: selectedAirportCode,
            estimatedMinutes,
            deviceId,
            navigation: navigationRef,
          });
          setTimerStarted(true);
        }
      }
    );
  };

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      0.5 -
      Math.cos(dLat) / 2 +
      (Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        (1 - Math.cos(dLon))) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
  }

  const setupReminderTracking = async ({ airportCode, estimatedMinutes, deviceId, navigation }) => {
    setSelectedAirportCode(airportCode);
    setEstimatedMinutes(estimatedMinutes);
    setDeviceId(deviceId);
    setNavigationRef(navigation);

    const arrivalRow = await logArrivalToSupabase({
      airportCode,
      estimatedMinutes,
      deviceId,
      method: 'gps',
    });

    if (arrivalRow?.id) {
      arrivalRowIdRef.current = arrivalRow.id;
    }

    initializeReminderOnArrival();
  };

  console.log('✅ WaitTimeReminderProvider is mounted');

  return (
    <WaitTimeReminderContext.Provider
      value={{
        startReminder,
        cancelReminder,
        setupReminderTracking,
        isWithinRange,
        lastWelcomedAirportCode,
        setLastWelcomedAirportCode,
      }}
    >
      {children}
    </WaitTimeReminderContext.Provider>
  );
};

export const useWaitTimeReminder = () => {
  const ctx = useContext(WaitTimeReminderContext);
  if (!ctx) {
    console.warn('⚠️ useWaitTimeReminder called outside of provider!');
    return {
      startReminder: () => {},
      cancelReminder: () => {},
      setupReminderTracking: () => {},
    };
  }
  return ctx;
};
