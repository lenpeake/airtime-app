
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ScrollView
} from 'react-native';

import { getDb } from './supabase';
import ScreenWithHeaderFooter from './ScreenWithHeaderFooter';

export default function AdminView({ navigation }) {
  const [reports, setReports] = useState([]);
  const [surges, setSurges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await getDb()
        .from('actual_wait_times')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (!error) setReports(data);
      else console.error('❌ Error fetching reports:', error.message);
    };

    const fetchSurges = async () => {
      const { data, error } = await getDb()
        .from('recent_surge_status')
        .select('*')
        .not('surge_triggered_at', 'is', null)
        .order('surge_triggered_at', { ascending: false });

      if (!error) setSurges(data);
      else console.error('❌ Error fetching surges:', error.message);
    };

    Promise.all([fetchReports(), fetchSurges()]).finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.airport_code}</Text>
      {item.entry_flag && (
        <View style={styles.flagBox}>
          <Text style={styles.flagText}>⚠️ Flag: {item.entry_flag}</Text>
        </View>
      )}
      <Text>Est: {item.estimated_minutes} | Act: {item.actual_minutes}</Text>
      <Text>Line: {item.line_type || 'N/A'}</Text>
      <Text>Delays: {item.remind_later_count ?? 0}</Text>
      <Text>Lang: {item.language}</Text>
      <Text>
        Arrived: {item.arrival_time?.split('T')[1]?.slice(0, 5)} |
        Submitted: {item.submitted_at?.split('T')[1]?.slice(0, 5)}
      </Text>
      {item.temp_celsius !== null && (
        <View style={styles.weatherBox}>
          <Text style={styles.weatherText}>🌡️ {item.temp_celsius}°C | ☁️ {item.weather_desc}</Text>
          <Text style={styles.weatherText}>💨 {item.wind_speed_kph} kph | 💧 {item.humidity_percent}%</Text>
        </View>
      )}
    </View>
  );

  const SurgeCard = ({ code, delta, time }) => (
    <View style={styles.surgeCard}>
      <Text style={styles.surgeCode}>🛫 {code}</Text>
      <Text style={styles.surgeDelta}>Δ +{delta}m</Text>
      <Text style={styles.surgeTime}>🕒 {time}</Text>
    </View>
  );

  return (
    <ScreenWithHeaderFooter navigation={navigation} noScroll>
      <View style={styles.headerSticky}>
        <Text style={styles.headerIcon}>📄</Text>
        <Text style={styles.headerTitle}>Admin Data</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
      ) : (
        <>
          <View style={styles.surgePanel}>
            {surges.length > 0 ? (
              <>
                <Text style={styles.surgePanelTitle}>🔥 Surges Detected</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {surges.map((s) => (
                    <SurgeCard
                      key={s.airport_code}
                      code={s.airport_code}
                      delta={s.delta}
                      time={s.surge_triggered_at?.split('T')[1]?.slice(0, 5)}
                    />
                  ))}
                </ScrollView>
              </>
            ) : (
              <View style={styles.noSurgeBox}>
                <Text style={styles.noSurgeIcon}>🧘‍♂️</Text>
                <Text style={styles.noSurgeText}>All Clear — No Surges Detected</Text>
              </View>
            )}
          </View>

          <FlatList
            data={reports}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 60, paddingHorizontal: 16 }}
          />
        </>
      )}
    </ScreenWithHeaderFooter>
  );
}

const styles = StyleSheet.create({
  headerSticky: {
    backgroundColor: 'rgba(243, 244, 246, 0.40)',
    paddingVertical: 16,
    paddingHorizontal: 80,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    gap: 10,
  },
  headerIcon: {
    fontSize: 30,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1e40af',
    fontFamily: 'PlayfairDisplay-Bold',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 6,
  },
  flagBox: {
    marginBottom: 6,
    backgroundColor: '#fef3c7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  flagText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '600',
  },
  weatherBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    borderColor: '#34d399',
    borderWidth: 1,
  },
  weatherText: {
    fontSize: 14,
    color: '#065f46',
    marginBottom: 2,
  },
  surgePanel: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  surgePanelTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#dc2626',
  },
  surgeCard: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 10,
    marginRight: 12,
    alignItems: 'center',
    width: 100,
  },
  surgeCode: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#b91c1c',
  },
  surgeDelta: {
    fontSize: 14,
    color: '#7f1d1d',
  },
  surgeTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  noSurgeBox: {
    backgroundColor: '#ecfdf5',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#34d399',
    borderWidth: 1.5,
  },
  noSurgeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  noSurgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
    textAlign: 'center',
  },
});
