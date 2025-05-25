import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import ScreenWithHeaderFooter from '../components/ScreenWithHeaderFooter';
import { useTranslation } from 'react-i18next';

const API_KEY = 'ngEO7KsYQqb0lGtd4As1H0OnJdYeSWjR';
const BASE_URL = 'https://www.tsawaittimes.com/api';

export default function AirportWaitTimeScreen({ route, navigation }) {
  const { airportCode } = route.params;
  const { t } = useTranslation();

  const [waitTimes, setWaitTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWaitTimes = async () => {
      try {
        const response = await fetch(`${BASE_URL}/airport/${API_KEY}/${airportCode}/json`);
        const text = await response.text();

        if (!response.ok || !text.trim().startsWith('{')) {
          throw new Error('Invalid response from TSA API');
        }

        const data = JSON.parse(text);
        setWaitTimes(data);
      } catch (err) {
        console.error("❌ TSA API Fetch Error:", err.message);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWaitTimes();
  }, [airportCode]);

  if (loading) {
    return (
      <ScreenWithHeaderFooter>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>{t('details.loading', 'Loading wait times...')}</Text>
        </View>
      </ScreenWithHeaderFooter>
    );
  }

  if (error) {
    return (
      <ScreenWithHeaderFooter>
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            {t('details.error', 'Error fetching wait times. Please try again.')}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>{t('details.goBack', 'Go Back')}</Text>
          </TouchableOpacity>
        </View>
      </ScreenWithHeaderFooter>
    );
  }

  return (
    <ScreenWithHeaderFooter>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>{waitTimes?.airport || airportCode}</Text>

        {waitTimes?.checkpoints?.length > 0 ? (
          waitTimes.checkpoints.map((checkpoint, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.checkpointName}>{checkpoint.checkpoint_name}</Text>
              <Text style={styles.waitTime}>{checkpoint.wait_time} {t('units.minutes')}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>{t('details.noCheckpointData', 'No checkpoint data available.')}</Text>
        )}
      </ScrollView>
    </ScreenWithHeaderFooter>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Inter_18pt',
  },
  header: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  checkpointName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
  },
  waitTime: {
    fontSize: 16,
    fontFamily: 'Inter_18pt',
    color: '#4b5563',
    marginTop: 6,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter_18pt',
    color: '#dc2626',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  noDataText: {
    fontSize: 16,
    fontFamily: 'Inter_18pt',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 20,
  },
});
