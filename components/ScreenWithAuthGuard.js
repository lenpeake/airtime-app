// components/ScreenWithAuthGuard.js
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';
import ScreenWithHeaderFooter from './ScreenWithHeaderFooter';

export default function ScreenWithAuthGuard({ children }) {
  const { user, loading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!loading && !user) {
      navigation.navigate('LoginPage');
    }
  }, [loading, user, navigation]); // ✅ ESLint-compliant dependency array

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!user) {
    return null; // Redirection is handled
  }

  return <ScreenWithHeaderFooter navigation={navigation}>{children}</ScreenWithHeaderFooter>;
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
