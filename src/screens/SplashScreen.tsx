/**
 * Splash Screen
 * Initial loading screen with Imago MUm branding
 */

import React, {useEffect} from 'react';
import {View, Text, StyleSheet, StatusBar} from 'react-native';
import {Colors, Typography, Spacing, FontFamily} from '../theme';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({onFinish}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000); // Show splash for 3 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.primary} />
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoTextBlue}>imago</Text>
          <Text style={styles.logoTextGreen}>MUm</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA', // Light cream/white background like in your design
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoTextBlue: {
    fontSize: 36,
    fontFamily: FontFamily.GilroyBold,
    color: Colors.primary[500], // Blue color
  },
  logoTextGreen: {
    fontSize: 36,
    fontFamily: FontFamily.GilroyBold,
    color: '#8BC34A', // Green color for MUm like in your design
  },
});

export default SplashScreen; 