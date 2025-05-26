// PreferredNameContext.js (fixed placeholder)
// Replace:
// import AsyncStorage from '@react-native-async-storage/async-storage'
// With:
// import * as SecureStore from 'expo-secure-store'

// Then replace:
// AsyncStorage.setItem(...)     → SecureStore.setItemAsync(...)
// AsyncStorage.getItem(...)     → SecureStore.getItemAsync(...)
// AsyncStorage.removeItem(...)  → SecureStore.deleteItemAsync(...)

// The rest of the logic remains intact for caching preferred and first name.
