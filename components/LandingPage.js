import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import ScreenWithHeaderFooter from './ScreenWithHeaderFooter';
import { Feather } from '@expo/vector-icons';
import ElegantLockIcon from './ElegantLockIcon';

export default function LandingPage() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { t } = useTranslation();

  const isLoggedIn = !!user;
  const [showTapHint, setShowTapHint] = useState(false);
  const [comingSoonVisible, setComingSoonVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('seenLiveHint').then(value => {
      if (!value) {
        setShowTapHint(true);
        AsyncStorage.setItem('seenLiveHint', 'yes');
        setTimeout(() => setShowTapHint(false), 6000);
      }
    });
  }, []);

  const handleRestrictedPress = () => {
    Alert.alert(
      t('authRequired.title', 'Login Required'),
      t('authRequired.message', 'Please log in to access this feature.'),
      [{ text: 'OK' }]
    );
  };

  const showComingSoonModal = () => {
    setComingSoonVisible(true);
    setTimeout(() => setComingSoonVisible(false), 4000);
  };

  const Card = ({ title, text, delay, onPress, showLock, highlight }) => {
    const disabled = !isLoggedIn && showLock;

    const cardStyle = [
      styles.card,
      highlight && styles.highlightedCard,
      !highlight && disabled && { opacity: 0.7 },
    ];
    return (
      <TouchableOpacity
        onPress={disabled ? handleRestrictedPress : onPress}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Animatable.View
          animation={highlight ? 'pulse' : 'fadeInUp'}
          delay={delay}
          duration={highlight ? 2000 : 500}
          iterationCount={highlight ? 'infinite' : 1}
          easing="ease-in-out"
          style={cardStyle}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{title}</Text>
            <View style={styles.iconWrapper}>
              {disabled ? (
                <ElegantLockIcon size={22} />
              ) : (
                <Feather name="chevron-right" size={20} color="#2563eb" />
              )}
            </View>
          </View>
          <Text style={styles.cardText}>{text}</Text>
          {highlight && showTapHint && (
            <Text style={styles.tapHint}>{t('landing.tapHint', '→ Tap to begin')}</Text>
          )}
        </Animatable.View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWithHeaderFooter>
      <View style={[styles.main, isLoggedIn && { marginBottom: 20 }]}>
        <Text style={styles.title}>
          {t('landing.titleLine1', 'Know Your Wait')}{'\n'}
          {t('landing.titleLine2', 'Skip the Stress')}
        </Text>

        <Text style={styles.subtitle}>
          {t(
            'landing.subtitle',
            'Real-time security wait times at airports worldwide. Crowd-sourced, accurate, and fast.'
          )}
        </Text>

        {!isLoggedIn && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('CreateNewAccount')}
          >
            <Text style={styles.buttonText}>
              {t('landing.button', 'Create New Account')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.features}>
        <Card
          title={t('landing.card1Title', 'Live Wait Times')}
          text={t('landing.card1Text', 'Up-to-the-minute TSA wait estimates before you even leave for the airport.')}
          delay={100}
          onPress={() => navigation.navigate('AirportSelectionPage')}
          showLock={true}
          highlight
        />
        <Card
          title={t('landing.card2Title', 'User Reports')}
          text={t('landing.card2Text', 'Join a global network of travelers helping each other by sharing real-time updates.')}
          delay={300}
          onPress={() => navigation.navigate('UserReports')}
          showLock={true}
        />
        <Card
          title={t('landing.card3Title', 'Smart Notifications')}
          text={t('landing.card3Text', 'We’ll alert you if your airport line is surging—so you’re never caught off guard.')}
          delay={500}
          onPress={showComingSoonModal}
          showLock={true}
        />
      </View>

      {comingSoonVisible && (
        <Animatable.View
          animation="zoomIn"
          duration={400}
          style={styles.modal}
        >
          <Text style={styles.modalTitle}>
            🚧 {t('common.comingSoon', 'Coming Soon!')}
          </Text>
          <Text style={styles.modalText}>
            {t('landing.featureInProgress', 'This feature is under active development.')}
          </Text>
        </Animatable.View>
      )}
    </ScreenWithHeaderFooter>
  );
}

const styles = StyleSheet.create({
  main: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontFamily: 'CormorantGaramond',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#111827',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond',
    textAlign: 'center',
    marginBottom: 28,
    color: '#111827',
    lineHeight: 26,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  features: {
    marginTop: 20,
    marginBottom: 30,
  },
  card: {
    backgroundColor: 'rgba(243, 246, 255, 0.6)',
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  highlightedCard: {
    transform: [{ scale: 1.02 }],
    shadowColor: '#2563eb',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 22,
    color: '#111827',
    fontFamily: 'PlayfairDisplay-Bold',
  },
  cardText: {
    fontSize: 15,
    color: '#4b5563',
    fontFamily: 'Inter',
    lineHeight: 22,
  },
  tapHint: {
    marginTop: 6,
    fontSize: 13,
    color: '#2563eb',
    fontFamily: 'Inter',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    position: 'absolute',
    top: '40%',
    left: '10%',
    right: '10%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 1000,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#111827',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    fontFamily: 'Inter',
    textAlign: 'center',
    marginTop: 8,
    color: '#4b5563',
  },
});
