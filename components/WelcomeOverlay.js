import React, {
  createContext,
  useContext,
  useState,
} from 'react';
import { Modal, View, StyleSheet, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';

const WelcomeOverlayContext = createContext();

export function WelcomeOverlayProvider({ children }) {
  const [overlayName, setOverlayName] = useState(null);

  const showOverlay = (name) => {
    if (!name || name === 'Traveler') {
      console.log('⏳ Not showing overlay — name invalid:', name);
      return;
    }

    setOverlayName(name);

    setTimeout(() => {
      setOverlayName(null);
    }, 3000);
  };

  return (
    <WelcomeOverlayContext.Provider value={{ showOverlay }}>
      {children}
      {overlayName && <WelcomeOverlayModal name={overlayName} />}
    </WelcomeOverlayContext.Provider>
  );
}

function WelcomeOverlayModal({ name }) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <Animatable.View
          animation="fadeInUpBig"
          delay={100}
          duration={800}
          style={styles.card}
        >
          <Animatable.Image
            animation="pulse"
            easing="ease-out"
            iterationCount="infinite"
            source={require('../assets/Textured_Transparent_Logo_1.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.message}>
            Welcome Back, {name}
          </Text>
        </Animatable.View>
      </View>
    </Modal>
  );
}

export function useWelcomeOverlay() {
  return useContext(WelcomeOverlayContext);
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 16,
  },
  message: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'serif',
    textAlign: 'center',
  },
});
