require('dotenv/config');

module.exports = {
  expo: {
    name: 'AirTimeApp',
    slug: 'AirTimeApp',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/Black_N_Transparent_Logo.png',
      resizeMode: 'contain',
      backgroundColor: '#000000',
    },
    extra: {
      eas: {
        projectId: '40e28484-6751-49cc-b9a7-7c219d218414',
      },
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      tsaApiKey: process.env.TSA_API_KEY,
    },
    plugins: [
      'expo-localization',
      'expo-splash-screen',
      'expo-secure-store' // ✅ Added for SecureStore compatibility
    ],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: 'com.lenpeake.AirTimeApp_V2',
      googleServicesFile: './google-services.json',
    },
    web: {
      favicon: './assets/favicon.png',
    },
  },
};
