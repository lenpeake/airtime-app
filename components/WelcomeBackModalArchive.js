import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from 'react-i18next';

const screenWidth = Dimensions.get('window').width;

export default function WelcomeBackModal({ visible, preferredName, onClose }) {
  const { t } = useTranslation();
  const name = preferredName?.trim() || 'Traveler';

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Animatable.View
          animation="fadeInUp"
          duration={600}
          style={styles.card}
        >
          <Image
            source={require('../assets/Black_N_Transparent_Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.welcomeText}>
            {t('welcome.greeting', { name })}
          </Text>
        </Animatable.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: screenWidth * 0.8,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
  },
  logo: {
    width: 180,
    height: 60,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#111827',
    textAlign: 'center',
  },
});
