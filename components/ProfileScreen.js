import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, SafeAreaView,
  Dimensions, Alert
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { usePreferredName } from './PreferredNameContext';
import ToastCard from './ToastCard';
import ScreenWithHeaderFooter from './ScreenWithHeaderFooter';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { auth } from './supabase';

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.email === 'admin@getairtime.app';
  const { preferredName, setPreferredName } = usePreferredName();

  const [inputValue, setInputValue] = useState('');
  const [userProfile, setUserProfile] = useState({
    first_name: '',
    last_name: '',
    zipcode: '',
    email: '',
  });
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: sessionData, error } = await auth.getSession();

        if (!sessionData?.session?.user) {
          console.warn('[DEBUG] No valid session from auth.getSession()');
          setLoading(false);
          return;
        }

        const sessionUser = sessionData.session.user;
        const accessToken = sessionData.session.access_token;

        const refreshed = await auth.refreshSession();
        const freshUser = refreshed?.data?.session?.user || sessionUser;

        console.log('[DEBUG] email_confirmed_at:', freshUser?.email_confirmed_at);

        setEmailVerified(!!freshUser.email_confirmed_at);

        const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${freshUser.id}`, {
          method: 'GET',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        });

        if (!res.ok) {
          const errText = await res.text();
          console.warn('[DEBUG] Profile fetch failed:', errText);
          setLoading(false);
          return;
        }

        const data = await res.json();
        const profile = data?.[0];
        console.log('[DEBUG] Fetched profile data:', profile);

        if (profile) {
          setInputValue(profile.preferred_name || '');
          setPreferredName(profile.preferred_name || '');
          setUserProfile({
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            zipcode: profile.zipcode || '',
            email: freshUser.email || '',
          });
        } else {
          console.warn('[DEBUG] No profile data found');
        }
      } catch (err) {
        console.warn('[DEBUG] Profile fetch error:', err.message);
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    const { data: sessionData } = await auth.getSession();
    const userId = sessionData?.session?.user?.id;
    const accessToken = sessionData?.session?.access_token;

    if (!userId || !accessToken) return;

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ preferred_name: inputValue }),
      });

      if (!res.ok) throw new Error(await res.text());

      setPreferredName(inputValue);
      setShowToast(true);
    } catch (err) {
      console.warn('[DEBUG] Save failed:', err.message);
      Alert.alert(t('error.title'), t('profile.saveError') || 'Unable to update name.');
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;

    try {
      const { error } = await auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) {
        console.warn('[DEBUG] Verification resend failed:', error.message);
        throw error;
      }

      Alert.alert(t('success.title'), t('profile.verificationSent'));
    } catch (err) {
      console.warn('[DEBUG] Verification resend failed:', err.message);
      Alert.alert(t('error.title'), t('profile.verificationError'));
    }
  };

  return (
    <ScreenWithHeaderFooter>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <SafeAreaView style={styles.container}>
            <Text style={styles.title}>{t('profile.title')}</Text>

            <View style={styles.card}>
              <Text style={styles.label}>{t('profile.email')}</Text>
              <Text style={styles.readOnlyText}>{userProfile.email}</Text>

              <View style={styles.badgeRow}>
                <Text style={emailVerified ? styles.verifiedBadge : styles.notVerifiedBadge}>
                  {emailVerified ? t('profile.emailVerified') : t('profile.emailNotVerified')}
                </Text>
                {!emailVerified && (
                  <TouchableOpacity onPress={handleResendVerification}>
                    <Text style={styles.resendLink}>{t('profile.resendVerification')}</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.label}>{t('profile.firstName')}</Text>
              <Text style={styles.readOnlyText}>{userProfile.first_name}</Text>

              <Text style={styles.label}>{t('profile.lastName')}</Text>
              <Text style={styles.readOnlyText}>{userProfile.last_name}</Text>

              <Text style={styles.label}>{t('profile.zipcode')}</Text>
              <Text style={styles.readOnlyText}>{userProfile.zipcode}</Text>

              <Text style={styles.label}>{t('profile.preferredName')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('profile.placeholder')}
                placeholderTextColor="#9ca3af"
                value={inputValue}
                onChangeText={setInputValue}
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.saveText}>{t('profile.saveButton')}</Text>
              </TouchableOpacity>
              {isAdmin && (
                <TouchableOpacity
                  style={[styles.saveButton]}
                  onPress={() => navigation.navigate('AdminView')}
                >
                  <Text style={styles.saveText}>🔧 Admin Dashboard</Text>
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        </ScrollView>

        {showToast && (
          <ToastCard
            message={t('profile.savedMessage', 'Thank you for updating Preferred Name')}
            onFinish={() => {
              setShowToast(false);
              navigation.navigate('LandingPage');
            }}
          />
        )}
      </KeyboardAvoidingView>
    </ScreenWithHeaderFooter>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: 30 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(243, 244, 246, 0.85)',
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 28,
    color: '#1e40af',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 20,
    color: '#1e40af',
    marginTop: 16,
    marginBottom: 4,
  },
  readOnlyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
  },
  input: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 20,
    color: '#111827',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#93c5fd',
  },
  saveText: {
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    fontSize: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  verifiedBadge: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    fontSize: 14,
    marginRight: 12,
  },
  notVerifiedBadge: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    fontSize: 14,
    marginRight: 12,
  },
  resendLink: {
    fontSize: 14,
    color: '#1e40af',
    textDecorationLine: 'underline',
  },
});
