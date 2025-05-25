import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import ScreenWithHeaderFooter from './ScreenWithHeaderFooter';
import { useTranslation } from 'react-i18next';
import { usePreferredName } from './PreferredNameContext';
import { useAuth } from './AuthContext';

const { height } = Dimensions.get('window');

const SUPABASE_URL = 'https://wejtykomvjttfebcrgxs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlanR5a29tdmp0dGZlYmNyZ3hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMjY0MjMsImV4cCI6MjA1OTgwMjQyM30.WgtmsHgUdLT6TY4rHDMtKPf9a4l2NPFTYeJjkcfU5vI';

export default function CreateNewAccount() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { setPreferredName } = usePreferredName();
  const { setSession } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredNameInput, setPreferredNameInput] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
    setLoading(true);
    const missingFields = [];

    if (!firstName.trim()) missingFields.push(t('createAccount.firstName'));
    if (!lastName.trim()) missingFields.push(t('createAccount.lastName'));
    if (!preferredNameInput.trim()) missingFields.push(t('createAccount.preferredName'));
    if (!zipcode.trim()) missingFields.push(t('createAccount.zipcode'));
    if (!email.trim()) missingFields.push(t('createAccount.email'));
    if (!password.trim()) missingFields.push(t('createAccount.password'));

    if (missingFields.length > 0) {
      Alert.alert(
        t('createAccount.signupError'),
        `${t('createAccount.missingFields')}:\n\n- ${missingFields.join('\n- ')}`
      );
      setLoading(false);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok || !signupData.user) {
        throw new Error(signupData?.msg || signupData?.error?.message || 'Signup failed');
      }

      const userId = signupData.user.id;

      const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok || !loginData.access_token) {
        throw new Error(loginData.error_description || 'Login failed');
      }

      const accessToken = loginData.access_token;

      const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          id: userId,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          preferred_name: preferredNameInput.trim(),
          zipcode: zipcode.trim(),
          is_first_login: true,
        }),
      });

      if (!profileRes.ok) {
        const errorText = await profileRes.text();
        throw new Error(errorText || 'Profile creation failed');
      }

      setPreferredName(preferredNameInput);
      setSession({ user: signupData.user });
      navigation.navigate('LandingPage');
    } catch (error) {
      console.error('Account creation error:', error);
      Alert.alert(t('createAccount.signupError'), error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenWithHeaderFooter>
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('../assets/airplane-takeoff.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text style={styles.loadingText}>{t('createAccount.loading')}</Text>
        </View>
      </ScreenWithHeaderFooter>
    );
  }

  return (
    <ScreenWithHeaderFooter>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.card}>
            <Text style={styles.title}>{t('createAccount.title')}</Text>

            <Text style={styles.label}>{t('createAccount.firstName')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('createAccount.firstName')}
              placeholderTextColor="#9ca3af"
              value={firstName}
              onChangeText={setFirstName}
            />

            <Text style={styles.label}>{t('createAccount.lastName')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('createAccount.lastName')}
              placeholderTextColor="#9ca3af"
              value={lastName}
              onChangeText={setLastName}
            />

            <Text style={styles.label}>{t('createAccount.preferredName')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('createAccount.preferredName')}
              placeholderTextColor="#9ca3af"
              value={preferredNameInput}
              onChangeText={setPreferredNameInput}
            />

            <Text style={styles.label}>{t('createAccount.zipcode')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('createAccount.zipcode')}
              placeholderTextColor="#9ca3af"
              value={zipcode}
              onChangeText={setZipcode}
              keyboardType="number-pad"
            />

            <Text style={styles.label}>{t('createAccount.email')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('createAccount.email')}
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>{t('createAccount.password')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('createAccount.password')}
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
              <Text style={styles.buttonText}>{t('createAccount.button')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('LoginPage')}>
              <Text style={styles.link}>{t('createAccount.backToLogin')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenWithHeaderFooter>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 28,
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    color: '#6b7280',
    fontSize: 14,
    fontFamily: 'Inter',
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    fontFamily: 'Inter',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  buttonText: {
    fontFamily: 'Inter-Bold',
    color: '#fff',
    fontSize: 18,
  },
  link: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: { width: 200, height: 200 },
  loadingText: {
    marginTop: 20,
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter',
  },
});
