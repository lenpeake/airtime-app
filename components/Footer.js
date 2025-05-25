// components/Footer.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        {t('footer.copyright', { year })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  footerText: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
  },
});
