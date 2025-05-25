import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function SafeScreen({ children, style }) {
  return (
    <SafeAreaView style={[styles.container, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // or your app's common background color
  },
});
