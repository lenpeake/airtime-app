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
import { useTranslation } from 'react-i18next';

const { height } = Dimensions.get('window');

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendReset = async () => {
    if (!email.trim()) {
      Alert.alert(
        t('login.alerts.missingEmailTitle'),
        t('login.alerts.missingEmailBody')
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const responseText = await res.text();
      console.log('📡 Reset response:', res.status, responseText);

      if (!res.ok) {
        throw new Error(responseText || 'Unable to send reset email.');
      }

      Alert.alert(
        t('login.alerts.resetSentTitle'),
        t('login.alerts.resetSentBody'),
        [{ text: t('common.ok'), onPress: () => navigation.navigate('LoginPage') }]
      );
    } catch (err) {
      console.error('🟥 Password reset error:', err.message);
      Alert.alert(
        t('login.alerts.resetErrorTitle'),
        err.message || t('login.alerts.resetErrorBody')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.card}>
            <Text style={styles.title}>{t('login.forgotPassword')}</Text>
            <Text style={styles.subtext}>{t('login.resetInstruction')}</Text>

            <TextInput
              style={styles.input}
              placeholder={t('login.emailPlaceholder')}
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleSendReset}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? t('input.button', 'Sending...') : t('login.resetPasswordButton')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('LoginPage')}>
              <Text style={styles.backText}>{t('createAccount.backToLogin')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 26,
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtext: {
    fontFamily: 'Inter',
    fontSize: 15,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 8,
    fontFamily: 'Inter',
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    fontSize: 18,
  },
  backText: {
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
  },
});
