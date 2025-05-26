// LoginPage.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { usePreferredName } from './PreferredNameContext';
import { useWelcomeOverlay } from './WelcomeOverlay';

import { requestNotificationPermissionOnce } from '../utils/Notifications';
import { auth } from './supabase';

const { height } = Dimensions.get('window');

export default function LoginPage() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { setSession } = useAuth();

  const handleLogin = async () => {
  console.log('🚀 Login button pressed');

  try {
    const { data, error } = await auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data.session || !data.user) {
      console.error('🟥 Login failed:', error);
      Alert.alert('Login Failed', error?.message || 'Invalid credentials');
      return;
    }

    const { session, user } = data;

    // ✅ Use the updated AuthContext session setter
    await setSession({
      access_token: session.access_token,
      user: {
        id: user.id,
        email: user.email,
      },
    });

    await requestNotificationPermissionOnce();
    navigation.reset({
      index: 0,
      routes: [{ name: 'LandingPage' }],
    });

  } catch (err) {
    console.error('Login error:', err);
    Alert.alert('Error', 'Unexpected error occurred.');
  }
};


  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <Image
          source={require('./assets/Textured_Transparent_Logo_1.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.overlay}>
            <Text style={styles.title}>{t('login.title')}</Text>

            <TextInput
              style={styles.input}
              placeholder={t('login.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={styles.input}
              placeholder={t('login.passwordPlaceholder')}
              secureTextEntry
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>
                {t('login.forgotPassword')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>{t('login.button')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => navigation.navigate('CreateNewAccount')}
            >
              <Text style={styles.signupText}>{t('signup.button')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1, alignItems: 'center' },
  logo: { width: '90%', height: '60%', marginTop: height * 0.01 },
  keyboardView: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: height * 0.04,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 28,
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    fontFamily: 'Inter_18pt',
    fontSize: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2563eb',
    textAlign: 'right',
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    fontSize: 18,
  },
  signupButton: { alignItems: 'center', padding: 10 },
  signupText: {
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    fontSize: 15,
  },
});
