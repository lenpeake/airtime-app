// splash-init.js
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync()
  .then(() => console.log('✅ Splash held'))
  .catch(() => {});
