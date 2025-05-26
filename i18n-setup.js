import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';

import en from './locales/en.json';
import es from './locales/es.json';

console.log('🟡 i18n-setup.js is running...');

const FORCE_LANGUAGE = false;

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      const storedLang = await SecureStore.getItemAsync('preferredLanguage');
      console.log('🌐 Stored preferredLanguage:', storedLang);
      if (storedLang) {
        callback(storedLang);
        return;
      }
    } catch (err) {
      console.warn('⚠️ SecureStore read failed:', err);
    }

    // Fallback to device locale
    const fallback = Localization.locale?.startsWith('es') ? 'es' : 'en';
    console.log('🌍 Using fallback locale:', fallback);
    callback(fallback);
  },
  init: () => {},
  cacheUserLanguage: async (lng) => {
    try {
      await SecureStore.setItemAsync('preferredLanguage', lng);
      console.log('💾 Cached language:', lng);
    } catch (e) {
      console.warn('⚠️ Failed to cache language:', e);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    lng: FORCE_LANGUAGE ? 'en' : undefined,
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
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
