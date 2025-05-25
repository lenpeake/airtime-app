// UserReports.js with i18n labels and LandingPage-style cards
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { getDb } from './supabase';
import { useAuth } from './AuthContext';
import ScreenWithHeaderFooter from './ScreenWithHeaderFooter';
import { format, subDays, parseISO } from 'date-fns';

export default function UserReports({ navigation }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [airportFilter, setAirportFilter] = useState('ALL');
  const [daysFilter, setDaysFilter] = useState(7);
  const [airports, setAirports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) {
        setReports([]);
        setLoading(false);
        return;
      }
      try {
        const cutoff = subDays(new Date(), daysFilter).toISOString();
        const { data, error } = await getDb()
          .from('actual_wait_times')
          .select('*')
          .eq('user_id', user.id)
          .gte('submitted_at', cutoff)
          .order('submitted_at', { ascending: false });

        if (error) {
          console.error('❌ Error fetching reports:', error.message);
          setReports([]);
        } else {
          setReports(data);
          const uniqueAirports = Array.from(new Set(data.map(r => r.airport_code))).sort();
          setAirports(uniqueAirports);
        }
      } catch (err) {
        console.error('❌ Unexpected error:', err);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [daysFilter, user]);

  const filteredReports = reports.filter(
    r => airportFilter === 'ALL' || r.airport_code === airportFilter
  );

  const averageDelta =
    filteredReports.length > 0
      ? Math.round(
          filteredReports.reduce(
            (sum, r) => sum + (r.actual_minutes - r.estimated_minutes),
            0
          ) / filteredReports.length
        )
      : 0;

  const renderDelta = (actual, estimated) => {
    const delta = actual - estimated;
    if (delta > 0) return `+${delta} min 👎`;
    if (delta < 0) return `${delta} min 👍`;
    return `0 min ✅`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.airport}>{item.airport_code}</Text>
        <Text style={styles.timestampTop}>
          {format(parseISO(item.submitted_at), 'PPpp')}
        </Text>
      </View>
      <Text style={styles.detail}>
        {t('userReports.line')}: {item.line_type === 'precheck'
          ? 'TSA Pre✓'
          : item.line_type === 'clear'
          ? 'CLEAR'
          : item.line_type === 'regular'
          ? 'Regular'
          : 'N/A'}
      </Text>
      <View style={styles.row}>
        <Text style={styles.label}>{t('userReports.estimated')}:</Text>
        <Text style={styles.value}>{item.estimated_minutes ?? 0} min</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('userReports.actual')}:</Text>
        <Text style={styles.value}>{item.actual_minutes ?? 0} min</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('userReports.difference')}:</Text>
        <Text style={styles.delta}>
          {renderDelta(item.actual_minutes, item.estimated_minutes)}
        </Text>
      </View>
    </View>
  );

  const ReportHeader = () => (
    <View>
      <Text style={styles.title}>{t('userReports.title', 'Your Wait Time Reports')}</Text>
      <View style={styles.filters}>
        <SegmentedToggle
          options={[{ label: '7 Days', value: 7 }, { label: '30 Days', value: 30 }]}
          selected={daysFilter}
          onChange={setDaysFilter}
        />
        <SegmentedToggle
          options={[{ label: 'All', value: 'ALL' }, ...airports.map(a => ({ label: a, value: a }))]}
          selected={airportFilter}
          onChange={setAirportFilter}
        />
      </View>
      <Text style={styles.summary}>
        Avg. Accuracy: {averageDelta} min {averageDelta > 0 ? '👎' : averageDelta < 0 ? '👍' : '✅'}
      </Text>
    </View>
  );

  return (
    <ScreenWithHeaderFooter navigation={navigation} noScroll>
      {loading ? (
        <ActivityIndicator size="large" color="#1e40af" style={{ marginTop: 24 }} />
      ) : filteredReports.length === 0 ? (
        <View>
          <ReportHeader />
          <Text style={styles.empty}>{t('userReports.empty') || 'No reports yet.'}</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ReportHeader />
          <FlatList
            data={filteredReports}
            keyExtractor={(item, index) => `${item.airport_code}-${index}`}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 60 }}
          />
        </View>
      )}
    </ScreenWithHeaderFooter>
  );
}

function SegmentedToggle({ options, selected, onChange }) {
  return (
    <View style={styles.toggleContainer}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.toggleButton, selected === opt.value && styles.toggleButtonActive]}
          onPress={() => onChange(opt.value)}
        >
          <Text style={[styles.toggleText, selected === opt.value && styles.toggleTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 26,
    textAlign: 'center',
    marginTop: 20,
    color: '#111827',
  },
  filters: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  summary: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 12,
    color: '#1e40af',
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  toggleButtonActive: {
    backgroundColor: '#ffffff',
  },
  toggleText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  toggleTextActive: {
    color: '#2563eb',
  },
  card: {
    backgroundColor: 'rgba(243, 246, 255, 0.6)',
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#2563eb',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    position: 'relative',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  airport: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#111827',
  },
  timestampTop: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#111827',
    paddingTop: 7,
    textAlign: 'right',
  },
  detail: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  label: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 16,
    color: '#374151',
  },
  value: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#1e40af',
  },
  delta: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#1e40af',
  },
  timestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 10,
    textAlign: 'right',
  },
  empty: {
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});
