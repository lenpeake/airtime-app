import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Dimensions, StyleSheet } from 'react-native';

const logoAsset = require('../assets/Textured_Transparent_Logo_1.png');

export default function SplashScreenAnimated({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { width } = Dimensions.get('window');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1200,
      useNativeDriver: true,
      delay: 500,
    }).start(() => {
      setTimeout(onFinish, 50); // Ensures updates happen safely after rendering finishes
    });
  }, [fadeAnim, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image source={logoAsset} style={[styles.logo, { width: width * 0.7 }]} resizeMode="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 9999,
  },
  logo: {
    height: 200,
  },
});
