// components/SmartNotifications.js
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import ScreenWithHeaderFooter from './ScreenWithHeaderFooter';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from 'react-i18next';

export default function SmartNotifications() {
  const { t } = useTranslation();

  return (
    <ScreenWithHeaderFooter>
      <View style={styles.container}>
        <View style={styles.card}>
          <Animatable.Image
            source={require('../assets/Black_N_Transparent_Logo.png')}
            animation="zoomIn"
            duration={1000}
            delay={100}
            style={styles.logo}
            resizeMode="contain"
          />

          <Animatable.Text
            animation="fadeInDown"
            delay={300}
            duration={800}
            style={styles.title}
          >
            {t('smartNotifications.title', '📲 Smart Notifications')}
          </Animatable.Text>

          <Animatable.Text
            animation="fadeInUp"
            delay={600}
            duration={900}
            style={styles.description}
          >
            {t(
              'smartNotifications.description',
              'This feature is currently under construction and will notify you when airport wait times surge unexpectedly.'
            )}
          </Animatable.Text>

          <Animatable.Text
            animation={{
              0: { opacity: 0, translateY: 0 },
              0.5: { opacity: 1, translateY: -4 },
              1: { opacity: 0, translateY: 0 },
            }}
            iterationCount="infinite"
            duration={3000}
            style={styles.soon}
          >
            {t('smartNotifications.comingSoon', '✨ Coming Soon ✨')}
          </Animatable.Text>
        </View>
      </View>
    </ScreenWithHeaderFooter>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 244, 246, 0.4)',
  },
  card: {
    width: '90%',
    padding: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e40af',
    fontFamily: 'PlayfairDisplay-Bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(30, 64, 175, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 15,
    color: '#374151',
    fontFamily: 'Inter_18pt',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  soon: {
    fontSize: 20,
    color: '#1e40af',
    fontFamily: 'CormorantGaramond-Regular',
    textAlign: 'center',
    marginTop: 4,
  },
});
