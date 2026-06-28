/**
 * Splash Screen
 * Initial loading screen with Imago MUm branding
 */

import React, {useEffect} from 'react';
import {View, StyleSheet, StatusBar, Image} from 'react-native';
import {Spacing} from '../theme';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({onFinish}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 500); // Show splash for 1.5 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FFEC" />
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FFEC', // Light green background
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 100,
  },
});

export default SplashScreen; 