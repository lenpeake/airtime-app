// components/ToastCard.js
import React, { useEffect, useRef, useCallback } from 'react';
import { Animated, Text, StyleSheet, Dimensions, View } from 'react-native';
import { CheckCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ToastCard({ message, onFinish }) {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleFinish = useCallback(() => {
    if (onFinish) onFinish();
  }, [onFinish]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        handleFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [slideAnim, fadeAnim, handleFinish]);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.row}>
        <CheckCircle color="#ffffff" size={22} style={styles.icon} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 40,
    left: width * 0.1,
    width: width * 0.8,
    backgroundColor: '#1e40af',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 999,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 10,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    flexShrink: 1,
  },
});
