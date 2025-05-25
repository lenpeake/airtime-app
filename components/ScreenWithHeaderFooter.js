import React, { useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from './Header';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ScreenWithHeaderFooter({ children, noScroll = false }) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const homeRef = useRef(null);
  const airportRef = useRef(null);
  const profileRef = useRef(null);

  const handleProtectedNavigation = (screen, ref) => {
    ref?.current?.pulse(400);
    if (!user) {
      Alert.alert(t('login.errorTitle'), t('login.pleaseLoginToContinue'));
    } else {
      navigation.navigate(screen);
    }
  };

  const getButtonStyle = (enabled) => ({
    color: enabled ? '#1f2937' : '#9ca3af',
  });

  return (
    <ImageBackground
      source={{ uri: 'https://imagizer.imageshack.com/img924/5425/VvhhzS.jpg' }}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <Header />

        {noScroll
          ? (() => {
              console.log('📦 Rendering with noScroll =', noScroll);
              return (
                <View style={styles.viewContent}>
                  <Animatable.View
                    animation="fadeIn"
                    duration={700}
                    delay={150}
                    useNativeDriver
                    style={styles.animatedContainer}
                  >
                    {children}
                  </Animatable.View>
                </View>
              );
            })()
          : (
            <ScrollView contentContainerStyle={styles.scrollContent} nestedScrollEnabled>
              <Animatable.View
                animation="fadeIn"
                duration={700}
                delay={150}
                useNativeDriver
                style={styles.animatedContainer}
              >
                {children}
              </Animatable.View>
            </ScrollView>
          )
        }

        <View style={[styles.footer, { paddingBottom: Math.min(insets.bottom, 12) }]}>
  <View style={styles.footerNav}>
    <Animatable.View ref={homeRef}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => {
          homeRef.current?.pulse(400);
          navigation.navigate('LandingPage');
        }}
      >
        <FontAwesome name="home" size={16} style={[styles.icon, getButtonStyle(true)]} />
        <Text style={[styles.footerButton, getButtonStyle(true)]}>
          {t('footer.home')}
        </Text>
      </TouchableOpacity>
    </Animatable.View>

    <Animatable.View ref={airportRef}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={async () => {
          airportRef.current?.pulse(400);
          if (!user) {
            Alert.alert(t('login.errorTitle'), t('login.pleaseLoginToContinue'));
            return;
          }

          try {
            const json = await AsyncStorage.getItem('lastSelectedAirport');
            if (json) {
              const { airportCode, airportName, waitTimes } = JSON.parse(json);
              navigation.navigate('AirportDetails', { airportCode, airportName, waitTimes });
            } else {
              Alert.alert('Select Airport', 'Please select a valid airport first.');
            }
          } catch (err) {
            console.warn('❌ Error reading airport from storage:', err);
            Alert.alert('Error', 'Unable to retrieve selected airport.');
          }
        }}

      >
        <FontAwesome name="plane" size={16} style={[styles.icon, getButtonStyle(!!user)]} />
        <Text style={[styles.footerButton, getButtonStyle(!!user)]}>
          {t('footer.airport')}
        </Text>
      </TouchableOpacity>
    </Animatable.View>

    <Animatable.View>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => handleProtectedNavigation('UserReports', null)}
      >
        <FontAwesome name="file-text" size={16} style={[styles.icon, getButtonStyle(!!user)]} />
        <Text style={[styles.footerButton, getButtonStyle(!!user)]}>
          {t('footer.reports')}
        </Text>
      </TouchableOpacity>
    </Animatable.View>

    <Animatable.View ref={profileRef}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => handleProtectedNavigation('ProfileScreen', profileRef)}
      >
        <FontAwesome name="user-circle" size={16} style={[styles.icon, getButtonStyle(!!user)]} />
        <Text style={[styles.footerButton, getButtonStyle(!!user)]}>
          {t('footer.profile')}
        </Text>
      </TouchableOpacity>
    </Animatable.View>
  </View>

  <Text style={styles.footerText}>
    {t('footer.copyright', { year: new Date().getFullYear() })}
  </Text>
</View>

      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(243,244,246,0.50)',
  },
  viewContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(243,244,246,0.50)',
  },
  animatedContainer: {
    flex: 1,
  },
  footer: {
    paddingTop: 4,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  footerNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 2,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  footerButton: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 10,
    color: '#374151',
    fontStyle: 'italic',
  },
});
