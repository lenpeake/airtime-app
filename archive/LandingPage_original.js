// components/LandingPage.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import ScreenWithHeaderFooter from './ScreenWithHeaderFooter';
import { useAuth } from './AuthContext';
import { usePreferredName } from './PreferredNameContext';
import { FontAwesome } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const screenWidth = Dimensions.get('window').width;

export default function LandingPage() {
  const navigation = useNavigation();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const { t } = useTranslation();

  const auth = useAuth();
  const user = auth?.user;
  const { preferredName } = usePreferredName();

  const handleCardPress = (card) => {
    if (!user) return;
    if (card === 'Live Wait Times') {
      navigation.navigate('AirportSelectionPage');
    } else {
      setShowComingSoon(true);
    }
  };

  const renderCard = (titleKey, textKey, cardKey, delay) => (
    <Animatable.View animation="fadeInUp" duration={800} delay={delay}>
      <TouchableOpacity
        style={[styles.card, !user && styles.disabledCard]}
        onPress={() => handleCardPress(cardKey)}
        disabled={!user}
      >
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>{t(titleKey)}</Text>
          {!user && <FontAwesome name="lock" size={16} color="#9ca3af" style={styles.lockIcon} />}
        </View>
        <Text style={styles.cardText}>{t(textKey)}</Text>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <ScreenWithHeaderFooter>
      <ImageBackground
        source={require('./assets/security-background.jpg')}
        style={styles.background}
        resizeMode="cover"
        defaultSource={require('./assets/fallback-color.png')}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.transparentOverlay}>
            <View style={styles.statusMessage}>
              <Text style={styles.statusText}>
                {user
                  ? `${t('login.welcomeBack')}, ${preferredName || t('createAccount.preferredName')}.`
                  : t('landing.statusGuest')}
              </Text>
            </View>

            <View style={styles.main}>
              <Text style={styles.title}>{t('landing.title')}</Text>
              <Text style={styles.subtitle}>{t('landing.subtitle')}</Text>

              {!user && (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => navigation.navigate('CreateNewAccount')}
                >
                  <Text style={styles.buttonText}>{t('signup.title')}</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.features}>
              {renderCard('landing.card1Title', 'landing.card1Text', 'Live Wait Times', 200)}
              {renderCard('landing.card2Title', 'landing.card2Text', 'User Reports', 400)}
              {renderCard('landing.card3Title', 'landing.card3Text', 'Smart Notifications', 600)}
            </View>
          </View>
        </ScrollView>

        <Modal
          visible={showComingSoon}
          transparent
          animationType="fade"
          onRequestClose={() => setShowComingSoon(false)}
        >
          <View style={styles.modalBackdrop}>
            <Animatable.View
              animation="bounceIn"
              duration={600}
              useNativeDriver
              style={styles.modalContent}
            >
              <Image
                source={require('../assets/Black_N_Transparent_Logo.png')}
                style={styles.modalLogo}
                resizeMode="contain"
              />
              <Text style={styles.modalTitle}>{t('comingSoon.title', 'Coming Soon')}</Text>
              <Text style={styles.modalSubtitle}>
                {t('comingSoon.subtitle', "We're putting on the final touches. Stay tuned!")}
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowComingSoon(false)}
              >
                <Text style={styles.modalButtonText}>{t('common.ok', 'OK')}</Text>
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </Modal>
      </ImageBackground>
    </ScreenWithHeaderFooter>
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
  transparentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(243, 244, 246, 0.55)',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  statusMessage: {
    marginBottom: 10,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#374151',
  },
  main: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#374151',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  features: {
    marginTop: 5,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledCard: {
    opacity: 0.5,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  cardText: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 8,
  },
  lockIcon: {
    marginLeft: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  modalLogo: {
    width: 160,
    height: 60,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4b5563',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
