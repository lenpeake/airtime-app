import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Alert,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { usePreferredName } from './PreferredNameContext';

const backgroundImg = require('../assets/security-background.jpg');

export default function LandingPage() {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const { preferredName } = usePreferredName();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  const nextLanguageLabel = i18n.language === 'en' ? 'Español' : 'English';

  const handleLogout = () => {
    Alert.alert(
      t('logout.confirmTitle'),
      t('logout.confirmMessage'),
      [
        { text: t('logout.cancel'), style: 'cancel' },
        {
          text: t('logout.confirm'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
            navigation.navigate('LandingPage');
          },
        },
      ]
    );
  };

  return (
    <ImageBackground source={backgroundImg} style={styles.background} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('appTitle', 'AirTime')}</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={toggleLanguage} style={styles.langToggle}>
                <Text style={styles.langText}>{nextLanguageLabel}</Text>
              </TouchableOpacity>

              {user ? (
                <TouchableOpacity style={styles.loginButton} onPress={handleLogout}>
                  <Text style={styles.loginText}>{t('logout.button')}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => navigation.navigate('LoginPage')}
                >
                  <Text style={styles.loginText}>{t('navigation.login', 'Login')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Main Callout */}
          <View style={styles.main}>
            <Text style={styles.title}>
              {user
                ? `${t('login.welcomeBack', 'Welcome Back')}${preferredName ? `, ${preferredName}` : ''}!`
                : t('landing.title', 'Know Your Wait. Skip the Stress.')}
            </Text>
            <Text style={styles.subtitle}>
              {t(
                'landing.subtitle',
                'Real-time security wait times at airports worldwide. Crowd-sourced, accurate, and fast.'
              )}
            </Text>

            {!user && (
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

          {/* Feature Cards */}
          <View style={styles.features}>
            <Animatable.View animation="fadeInUp" delay={100} style={styles.card}>
              <Text style={styles.cardTitle}>
                {t('landing.card1Title', 'Live Wait Times')}
              </Text>
              <Text style={styles.cardText}>
                {t('landing.card1Text', 'Up-to-the-minute TSA wait estimates before you even leave for the airport.')}
              </Text>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={300} style={styles.card}>
              <Text style={styles.cardTitle}>
                {t('landing.card2Title', 'User Reports')}
              </Text>
              <Text style={styles.cardText}>
                {t('landing.card2Text', 'Join a global network of travelers helping each other by sharing real-time updates.')}
              </Text>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={500} style={styles.card}>
              <Text style={styles.cardTitle}>
                {t('landing.card3Title', 'Smart Notifications')}
              </Text>
              <Text style={styles.cardText}>
                {t('landing.card3Text', 'We’ll alert you if your airport line is surging—so you’re never caught off guard.')}
              </Text>
            </Animatable.View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#cfd8dc',
  },
  container: {
    flexGrow: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(243, 244, 246, 0.55)',
    paddingVertical: 24,
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#1f2937',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  loginButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  loginText: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Inter',
  },
  langToggle: {
    backgroundColor: '#d1d5db',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  langText: {
    color: '#1f2937',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'Inter',
  },
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
    color: '#374151',
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
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
    fontFamily: 'CormorantGaramond',
  },
  cardText: {
    fontSize: 15,
    color: '#4b5563',
    fontFamily: 'Inter',
    lineHeight: 22,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Inter',
  },
});
