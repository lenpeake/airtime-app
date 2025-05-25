// ActualWaitTimeInput.js (Metro-safe version without Picker)
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ImageBackground,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { updateWaitTime } from '../utils/Backend';
import ScreenWithHeaderFooter from '../components/ScreenWithHeaderFooter';

export default function ActualWaitTimeInput() {
  const [actualMinutes, setActualMinutes] = useState('');
  const [lineType, setLineType] = useState('regular');
  const [submitting, setSubmitting] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const route = useRoute();
  const navigation = useNavigation();
  const {
    airportCode = 'UNKNOWN',
    estimatedMinutes = null,
    deviceId = null,
    rowId = null,
  } = route.params || {};
  const { t, i18n } = useTranslation();

  const handleSubmit = async () => {
  if (!actualMinutes || isNaN(actualMinutes)) {
    Alert.alert(t('input.invalidTitle'), t('input.invalidMessage'));
    return;
  }

  setSubmitting(true);
  Animated.sequence([
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }),
  ]).start();

  try {
    await updateWaitTime(rowId, actualMinutes, lineType, i18n.language, airportCode);
    navigation.navigate('ThankYouScreen');
  } catch (error) {
    console.error(error);
    Alert.alert(t('error.title'), t('error.message'));
  } finally {
    setSubmitting(false);
  }
};

  return (
    <ImageBackground
      source={require('../assets/security-background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScreenWithHeaderFooter navigation={navigation}>
        <KeyboardAvoidingView
          style={styles.keyboardWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.centerWrapper}>
            <View style={styles.overlay}>
              <Text style={styles.title}>{t('input.title')}</Text>
              <Text style={styles.label}>{t('input.label')}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={actualMinutes}
                onChangeText={setActualMinutes}
                placeholder="e.g. 25"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.label}>{t('input.lineTypeLabel') || 'Line Type'}</Text>
              <View style={styles.buttonGroup}>
                {[
                  { label: 'Regular TSA Line', value: 'regular' },
                  { label: 'TSA Pre✓', value: 'precheck' },
                  { label: 'CLEAR', value: 'clear' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.toggleButton,
                      lineType === option.value && styles.toggleButtonActive,
                    ]}
                    onPress={() => setLineType(option.value)}
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        lineType === option.value && styles.toggleButtonTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting}>
                  <Text style={styles.buttonText}>{t('input.button')}</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScreenWithHeaderFooter>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  keyboardWrapper: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(243, 244, 246, 0.65)',
    padding: 24,
    borderRadius: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 26,
    color: '#1e40af',
    textAlign: 'center',
    marginBottom: 16,
  },
  label: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 20,
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    fontFamily: 'Inter_18pt',
    fontSize: 18,
    backgroundColor: 'white',
    borderColor: '#1e40af',
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#111827',
  },
  buttonGroup: {
    marginBottom: 24,
    flexDirection: 'column',
    gap: 8,
  },
  toggleButton: {
    borderWidth: 1.5,
    borderColor: '#1e40af',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  toggleButtonActive: {
    backgroundColor: '#1e40af',
  },
  toggleButtonText: {
    fontFamily: 'Inter_18pt',
    fontSize: 16,
    textAlign: 'center',
    color: '#1e40af',
  },
  toggleButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#1e40af',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: 'white',
  },
});
