import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import es from './locales/es.json';

console.log('🟡 i18n-setup.js is running...');

// ✅ Define FORCE_LANGUAGE at the top
const FORCE_LANGUAGE = true;

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: (callback) => {
    AsyncStorage.getItem('preferredLanguage')
      .then((language) => {
        console.log('🌐 Detected preferredLanguage from AsyncStorage:', language);
        if (language) {
          callback(language);
        } else {
          const fallback = Localization.locale.startsWith('es') ? 'es' : 'en';
          console.log('🌍 No saved language, falling back to device locale:', fallback);
          callback(fallback);
        }
      })
      .catch((error) => {
        console.warn('❌ Language detection failed:', error);
        callback('en');
      });
  },
  init: () => {},
  cacheUserLanguage: (lng) => {
    AsyncStorage.setItem('preferredLanguage', lng).catch((e) =>
      console.warn('⚠️ Failed to cache language:', e)
    );
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    lng: FORCE_LANGUAGE ? 'en' : undefined, // ✅ Declared constant
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
    nsSeparator: false,
    resources: {
      en: { translation: { ...en } },
      es: { translation: { ...es } },
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })
  .then(() => {
    console.log('✅ i18n setup completed');
  })
  .catch((err) => {
    console.error('❌ i18n init failed:', err);
  });

export default i18n;
