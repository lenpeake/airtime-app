// AirportSelectionPage.js — EAS-Compatible with SecureStore

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { scheduleWaitNotification } from '../utils/Notifications';
import { useWaitTimeReminder } from '../components/WaitTimeReminderContext';
import ScreenWithHeaderFooter from '../components/ScreenWithHeaderFooter';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import Constants from 'expo-constants';
import { addToMonitoredAirportsIfNeeded } from '../utils/Backend';

const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || '';
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || '';
const API_KEY = Constants.expoConfig?.extra?.tsaApiKey || '';
const BASE_URL = 'https://www.tsawaittimes.com/api';

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function useDebouncedCallback(callback, delay) {
  const timeoutRef = useRef(null);
  return (...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

export default function AirportSelectionPage({ navigation }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const reminderContext = useWaitTimeReminder();
  const startReminder = reminderContext?.startReminder;

  const [airports, setAirports] = useState([]);
  const [query, setQuery] = useState('');
  const [filteredAirports, setFilteredAirports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState(null);

  useEffect(() => {
    if (!user) {
      navigation.replace('LoginPage');
    }
  }, [user]);

  useEffect(() => {
    fetch(`${BASE_URL}/airports/${API_KEY}/json`)
      .then((response) => response.json())
      .then((data) => setAirports(data))
      .catch((error) => console.error('✈️ Airport List Fetch Error:', error));
  }, []);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const savedAirport = await SecureStore.getItemAsync('lastAirport');
        const savedLang = await SecureStore.getItemAsync('preferredLanguage');
        if (savedLang) i18n.changeLanguage(savedLang);
        if (savedAirport) {
          const airport = JSON.parse(savedAirport);
          setQuery(`${airport.name} (${airport.code})`);
          setSelectedAirport(airport);
        }
      } catch (err) {
        console.warn('⚠️ SecureStore read failed:', err);
      }
    };
    loadStoredData();
  }, []);

  const debouncedFindAirport = useDebouncedCallback((text) => {
    if (text) {
      try {
        const safePattern = escapeRegExp(text.trim());
        const regex = new RegExp(safePattern, 'i');
        const filtered = airports.filter(
          (airport) =>
            airport.name.search(regex) >= 0 || airport.code.search(regex) >= 0
        );
        setFilteredAirports(filtered);
      } catch (err) {
        console.warn('Regex creation failed:', err.message);
        setFilteredAirports([]);
      }
    } else {
      setFilteredAirports([]);
    }
  }, 300);

  const handleInputChange = (text) => {
    setQuery(text);
    setSelectedAirport(null);
    debouncedFindAirport(text);
  };

  const selectAirport = async (airport) => {
    setQuery(`${airport.name} (${airport.code})`);
    setSelectedAirport(airport);
    setFilteredAirports([]);
    await SecureStore.setItemAsync('lastAirport', JSON.stringify(airport));
  };

  const handleConfirm = async () => {
    if (!selectedAirport) {
      Alert.alert(t('airportSelection.alertMessage'));
      return;
    }

    setLoading(true);
    try {
      await addToMonitoredAirportsIfNeeded(selectedAirport.code);

      const url = `${BASE_URL}/airport/${API_KEY}/${selectedAirport.code}/json`;
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'max-age=30',
        },
      });

      const text = await response.text();

      if (!response.ok || !text.trim().startsWith('{')) {
        throw new Error('Invalid response from TSA API');
      }

      const waitTimeData = JSON.parse(text);
      waitTimeData.hourly = waitTimeData.estimated_hourly_times.map((item) => ({
        hour: item.timeslot,
        wait: Math.round(parseFloat(item.waittime)),
      }));

      const estimatedWaitTime = waitTimeData.rightnow || 15;
      scheduleWaitNotification(estimatedWaitTime);

      if (typeof startReminder === 'function') {
        startReminder({
          airportCode: selectedAirport.code,
          estimatedMinutes: estimatedWaitTime,
          deviceId: null,
          navigation,
        });
      } else {
        console.warn('⚠️ Reminder function unavailable. Skipping reminder.');
      }

      await SecureStore.setItemAsync('preferredLanguage', i18n.language);
      await SecureStore.setItemAsync(
        'lastSelectedAirport',
        JSON.stringify({
          airportCode: selectedAirport.code,
          airportName: selectedAirport.name,
          waitTimes: waitTimeData,
        })
      );

      navigation.navigate('AirportDetails', {
        airportCode: selectedAirport.code,
        airportName: selectedAirport.name,
        waitTimes: waitTimeData,
        language: i18n.language,
      });
    } catch (error) {
      console.error('❌ Error fetching wait time data:', error.message);
      Alert.alert('Error', t('airportSelection.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://imagizer.imageshack.com/img924/7739/OxEREx.jpg' }}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScreenWithHeaderFooter noScroll>
        <Text style={styles.title}>{t('airportSelection.title')}</Text>

        <TextInput
          value={query}
          onChangeText={handleInputChange}
          placeholder={t('airportSelection.placeholder')}
          style={styles.inputBox}
        />

        {filteredAirports.length > 0 && (
          <FlatList
            nestedScrollEnabled
            data={filteredAirports}
            keyExtractor={(item, idx) => idx.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => selectAirport(item)}
                style={styles.listItem}
              >
                <Text style={styles.itemText}>
                  {item.name} ({item.code})
                </Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        )}

        {filteredAirports.length === 0 && query.length > 2 && !selectedAirport && (
          <Text style={styles.noResultsText}>
            {t('airportSelection.noResults')}
          </Text>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleConfirm}>
            <Text style={styles.buttonText}>{t('airportSelection.confirmButton')}</Text>
          </TouchableOpacity>
        )}
      </ScreenWithHeaderFooter>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 20,
    color: '#111827',
  },
  inputBox: {
    fontSize: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    color: '#111827',
    fontFamily: 'Inter_18pt',
    marginBottom: 10,
  },
  listItem: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemText: {
    fontSize: 18,
    fontFamily: 'Inter_18pt',
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 8,
    fontFamily: 'Inter_18pt',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
});
