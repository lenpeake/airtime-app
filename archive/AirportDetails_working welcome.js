
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Animated,
  Easing,
  Dimensions,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LineChart } from 'react-native-chart-kit';
import * as Animatable from 'react-native-animatable';
import ScreenWithHeaderFooter from './ScreenWithHeaderFooter';
import { useWaitTimeReminder } from './WaitTimeReminderContext';
import { usePreferredName } from './PreferredNameContext';
import { getAirportLogo } from './airportLogos';

const screenWidth = Dimensions.get('window').width;

export default function AirportDetails({ route, navigation }) {
  const reminderContext = useWaitTimeReminder();
  const {
    setupReminderTracking,
    isWithinRange,
    lastWelcomedAirportCode,
    setLastWelcomedAirportCode,
  } = reminderContext || {};

  const { airportCode, airportName, waitTimes: initialWaitTimes } = route.params;
  const { t } = useTranslation();
  const { preferredName } = usePreferredName();

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const [waitTimes, setWaitTimes] = useState(initialWaitTimes);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showWelcome, setShowWelcome] = useState(false);

  const tableAnim = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fallbackMinutes = 2;
    const estimatedMinutes = Math.max(fallbackMinutes, initialWaitTimes?.estimatedMinutes || 0);

    if (typeof setupReminderTracking === 'function') {
      setupReminderTracking({
        airportCode,
        estimatedMinutes,
        deviceId: 'abc123-device-xyz',
        navigation,
      });
    }

    Animated.timing(tableAnim, {
      toValue: 1,
      duration: 800,
      delay: 400,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isWithinRange && airportCode && lastWelcomedAirportCode !== airportCode) {
      setShowWelcome(true);
      setLastWelcomedAirportCode(airportCode);

      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isWithinRange, airportCode, lastWelcomedAirportCode]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.03,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const hourlyLabels = waitTimes.estimated_hourly_times?.map((slot) => slot.timeslot.split(' ')[0]) || [];
  const hourlyData = waitTimes.estimated_hourly_times?.map((slot) =>
    typeof slot.waittime === 'number' ? slot.waittime : 0
  ) || [];

  return (
    <ScreenWithHeaderFooter navigation={navigation}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60, flexGrow: 1 }} nestedScrollEnabled>
        <View style={styles.headerAirportContainer}>
          <Text style={styles.headerAirport}>{airportName} ({airportCode})</Text>
        </View>

        <Animated.View style={[styles.cardHighlightLux, { transform: [{ scale: pulse }] }]}>
          <View style={styles.gradientFallbackBox}>
            <View style={styles.clockRow}>
              <Image
                source={require('../assets/clock_premium.png')}
                style={styles.clockIcon}
                resizeMode="contain"
              />
              <Text style={styles.labelHighlight}>{t('details.title')}</Text>
            </View>
            <Text style={styles.valueHighlight}>
              {waitTimes.rightnow_description || t('details.notAvailable')}
            </Text>
          </View>
        </Animated.View>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, waitTimes.precheck === 1 ? styles.badgeAvailable : styles.badgeUnavailable]}>
            <Text style={styles.badgeText}>
              TSA Pre✓  {waitTimes.precheck === 1 ? 'Available' : 'Not Available'}
            </Text>
          </View>
          <View style={[styles.badge, styles.badgeUnavailable]}>
            <Text style={styles.badgeText}>CLEAR: Coming Soon</Text>
          </View>
        </View>

        <View style={styles.scrollableCard}>
          <Text style={styles.labelHighlight}>{t('details.hourlyEstimates')}</Text>
          <Text style={styles.scrollHintTop}>{t('details.scrollHint')}</Text>
          <ScrollView
            style={styles.hourList}
            showsVerticalScrollIndicator
            persistentScrollbar
            nestedScrollEnabled
          >
            {waitTimes.estimated_hourly_times?.map((slot, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.time}>{slot.timeslot}</Text>
                <Text style={styles.wait}>
                  {typeof slot.waittime === 'number'
                    ? `${slot.waittime.toFixed(1)} ${t('units.minutes')}`
                    : t('details.notAvailable')}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {hourlyData.length > 0 && (
          <View style={styles.chartContainerTransparent}>
            <Text style={styles.labelHighlight}>{t('details.hourlyEstimates')}</Text>
            <LineChart
              data={{ labels: hourlyLabels, datasets: [{ data: hourlyData }] }}
              width={screenWidth - 40}
              height={220}
              yAxisSuffix={t('units.minutes')}
              chartConfig={{
                backgroundGradientFrom: '#f3f4f6',
                backgroundGradientTo: '#e5e7eb',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                propsForDots: {
                  r: '3',
                  strokeWidth: '2',
                  stroke: '#2563eb',
                },
              }}
              bezier
              style={{ marginVertical: 16, borderRadius: 16 }}
            />
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showWelcome}
        onRequestClose={() => setShowWelcome(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <Animatable.View
            animation="fadeInDown"
            duration={600}
            style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '85%', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 20, fontFamily: 'PlayfairDisplay-Bold', color: '#1f2937', marginBottom: 8, textAlign: 'center' }}>
              {getTimeOfDayGreeting()}, {preferredName} 👋
            </Text>
            <Text style={{ fontSize: 16, fontFamily: 'CormorantGaramond', color: '#374151', marginBottom: 14, textAlign: 'center' }}>
              Welcome to {airportName} ({airportCode})
            </Text>
            <Image
              source={getAirportLogo(airportCode)}
              resizeMode="contain"
              style={{ width: 100, height: 50, marginBottom: 20 }}
            />
            <TouchableOpacity
              onPress={() => setShowWelcome(false)}
              style={{ backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }}
            >
              <Text style={{ color: 'white', fontFamily: 'Inter', fontSize: 16 }}>
                Continue
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </ScreenWithHeaderFooter>
  );
}

const styles = StyleSheet.create({
  headerAirportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  headerAirport: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 22,
    color: '#111827',
  },
  cardHighlightLux: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 8,
    elevation: 10,
  },
  gradientFallbackBox: {
    padding: 28,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  clockRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  clockIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
    opacity: 0.95,
  },
  labelHighlight: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 30,
    color: '#1e40af',
  },
  valueHighlight: {
    fontFamily: 'Inter-Bold',
    fontSize: 30,
    color: '#111827',
    textAlign: 'center',
  },
  refreshArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshText: {
    fontFamily: 'Inter_18pt',
    fontSize: 16,
    color: '#2563eb',
  },
  timestampText: {
    fontFamily: 'Inter_18pt',
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#d1d5db',
  },
  badgeAvailable: {
    backgroundColor: '#10b981',
  },
  badgeUnavailable: {
    backgroundColor: '#f87171',
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_18pt',
  },
  scrollableCard: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 10,
    padding: 16,
    maxHeight: 220,
    marginBottom: 20,
  },
  hourList: {
    height: 160,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  time: {
    fontFamily: 'Inter_18pt',
    fontSize: 14,
    color: '#1f2937',
  },
  wait: {
    fontFamily: 'Inter_18pt',
    fontSize: 14,
    color: '#111827',
  },
  scrollHintTop: {
    fontFamily: 'Inter_18pt',
    textAlign: 'center',
    fontSize: 12,
    color: '#000000',
    marginBottom: 4,
  },
  chartContainerTransparent: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    padding: 12,
  },
});
