
import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

export default function SplashScreenAnimated({ onFinish }) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onFinish?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/Textured_Transparent_Logo_1.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 220,
    height: 220,
  },
});
