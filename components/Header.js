import React, { useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { usePreferredName } from './PreferredNameContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Header() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const { preferredName, firstName, loading } = usePreferredName();
  const insets = useSafeAreaInsets();

  const logoRef = useRef(null);
  const langRef = useRef(null);
  const loginRef = useRef(null);

  const displayName = preferredName || firstName;

  const toggleLanguage = () => {
    langRef.current?.pulse(400);
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleLogin = () => {
    loginRef.current?.pulse(400);
    navigation.navigate('LoginPage');
  };

  const handleLogout = () => {
    loginRef.current?.pulse(400);
    Alert.alert(t('logout.confirmTitle'), t('logout.confirmMessage'), [
      { text: t('logout.cancel'), style: 'cancel' },
      {
        text: t('logout.confirm'),
        style: 'destructive',
        onPress: async () => {
          await signOut();

          // 🔥 Clear the stored selected airport
          try {
            await AsyncStorage.removeItem('lastSelectedAirport');
          } catch (err) {
            console.warn('❌ Failed to clear stored airport:', err);
          }

          navigation.reset({
            index: 0,
            routes: [{ name: 'LandingPage' }],
          });
        }
      },
    ]);
  };

  const handleLogoPress = () => {
    logoRef.current?.pulse(500);
    navigation.navigate('LandingPage');
  };

  const getLocalizedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('header.greeting.morning');
    if (hour < 18) return t('header.greeting.afternoon');
    return t('header.greeting.evening');
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
      <View style={styles.left}>
        <TouchableOpacity onPress={handleLogoPress} style={styles.logoWrapper}>
          <Animatable.Image
            ref={logoRef}
            source={require('../assets/Black_N_Transparent_Logo_2.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.center}>
        {user && !loading && displayName && (
          <>
            <Animatable.View animation="fadeInDown" duration={500} delay={100}>
              <Text style={styles.greetingText}>{getLocalizedGreeting()}</Text>
            </Animatable.View>
            <Animatable.View animation="fadeInUp" duration={600} delay={300}>
              <Text style={styles.userNameText}>{displayName}</Text>
            </Animatable.View>
          </>
        )}
      </View>

      <View style={styles.rightContainer}>
        <Animatable.View ref={loginRef}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={user ? handleLogout : handleLogin}
          >
            <Text style={styles.headerButtonText}>
              {user ? t('logout.button') : t('login.button')}
            </Text>
          </TouchableOpacity>
        </Animatable.View>

        <Animatable.View ref={langRef}>
          <TouchableOpacity style={styles.headerButton} onPress={toggleLanguage}>
            <Text style={styles.headerButtonText}>
              {i18n.language === 'en' ? 'Español' : 'English'}
            </Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 10,
    width: '100%',
    height: 80,
  },
  left: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 0, // ✅ remove offset — true flush left
  },
  logoWrapper: {
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginLeft: -25,
  },
  logo: {
    width: 190,
    height: 68,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 15,
  },
  greetingText: {
    fontSize: 14,
    color: '#1f2937',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '600',
  },
  userNameText: {
    fontSize: 18,
    color: '#111827',
    fontFamily: Platform.OS === 'ios' ? 'Georgia-Bold' : 'serif',
    fontWeight: '700',
    marginTop: 2,
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: '#2563eb',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerButtonText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'Roboto',
  },
});
