import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function ThankYouScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(3);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeOutAnim = useRef(new Animated.Value(1)).current;

  const { lineType = 'regular' } = route.params || {};

  const getLineTypeLabel = () => {
    switch (lineType) {
      case 'precheck':
        return 'TSA PreCheck';
      case 'clear':
        return 'CLEAR';
      case 'regular':
      default:
        return 'TSA Security';
    }
  };

  const returnHome = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'LandingPage' }],
    });
  }, [navigation]);

  const pulse = useCallback(() => {
    scaleAnim.setValue(1);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim]);

  const triggerFadeOut = () => {
    Animated.timing(fadeOutAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      returnHome();
    });
  };

  useEffect(() => {
    pulse();

    const interval = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1;
        if (next > 0) {
          pulse();
          return next;
        } else {
          clearInterval(interval);
          triggerFadeOut();
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [returnHome, pulse]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/White_N_Transparent_Logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Animated.View style={[styles.fadeContent, { opacity: fadeOutAnim }]}>
        <SafeAreaView style={styles.safeArea}>
          <LottieView
            source={require('../assets/airplane-takeoff.json')}
            autoPlay
            loop
            style={styles.lottie}
          />

          <Text style={styles.title}>
            {t('thankyou.lineTypeMessage', { lineType: getLineTypeLabel() })}
          </Text>

          <Text style={styles.subtitle}>{t('thankyou.sub')}</Text>

          <Animated.Text style={[styles.redirect, { transform: [{ scale: scaleAnim }] }]}>
            {t('thankyou.redirecting', 'Redirecting in')} {countdown}...
          </Animated.Text>

          <TouchableOpacity style={styles.button} onPress={triggerFadeOut}>
            <Text style={styles.buttonText}>{t('thankyou.button')}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flex: 1,
    justifyContent: 'flex-start',
  },
  logo: {
    position: 'absolute',
    top: 32,
    left: (width - 160) / 2,
    width: 160,
    height: 120,
    zIndex: 10,
    opacity: 0.9,
  },
  fadeContent: {
    flex: 1,
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  lottie: {
    width: 220,
    height: 220,
    marginBottom: 20,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 26,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_18pt',
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 20,
  },
  redirect: {
    fontFamily: 'Inter_18pt',
    fontSize: 18,
    color: '#93c5fd',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
  },
});
