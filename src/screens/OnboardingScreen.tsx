/**
 * Onboarding Screen - AI-Powered Ultrasound Demo
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import {Colors, Typography, Spacing, BorderRadius, FontFamily} from '../theme';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

interface OnboardingScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onGetStarted,
  onSignIn,
}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Logo */}
      <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
      </View>

      {/* Ultrasound Demo */}
      <View style={styles.demoContainer}>
        <Image 
          source={require('../assets/Imagoscan.gif')} 
          style={styles.demoGif}
          resizeMode="contain"
        />
        
        {/* Feature Tags */}
        {/* <View style={styles.featureTag1}>
          <View style={styles.checkIcon}>
            <Text style={styles.checkText}>✓</Text>
          </View>
          <Text style={styles.featureText}>Scan in 3 Seconds</Text>
        </View> */}
        
        {/* <View style={styles.featureTag2}>
          <View style={styles.checkIcon}>
            <Text style={styles.checkText}>✓</Text>
          </View>
          <Text style={styles.featureText}>Printable result</Text>
        </View> */}


      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>
          <Text style={styles.titleWhite}>AI-Powered <Text style={styles.titleYellow}>Ultrasound</Text> </Text>
          <Text style={styles.titleWhite}>&nbsp;in Your Hands</Text>

        </Text>
        
        <Text style={styles.description}>
          No hospital nearby? No problem. Just scan with your phone and get instant results, guidance, and peace of mind
        </Text>

        <TouchableOpacity style={styles.getStartedButton} onPress={onGetStarted}>
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.signInButton} onPress={onSignIn}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 20,
  },
  logoTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logo: {
    width: 100,
    height: 50,
  },
  logoTextBlue: {
    fontSize: 28,
    fontFamily: FontFamily.GilroyBold,
    color: '#4A90E2',
    letterSpacing: -1,
  },
  logoTextYellow: {
    fontSize: 28,
    fontFamily: FontFamily.GilroyBold,
    color: '#CFDE3A',
    letterSpacing: -1,
  },
  demoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  demoGif: {
    width: screenWidth - 20,
    height: 300,
  },
  featureTag1: {
    position: 'absolute',
    top: 60,
    right: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  featureTag2: {
    position: 'absolute',
    top: 120,
    right: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#CFDE3A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featureText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FontFamily.GilroyMedium,
  },
  content: {
    paddingHorizontal: Spacing[6],
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 60,
  },
  title: {
    fontSize: 32,
    fontFamily: FontFamily.GilroyBold,
    textAlign: 'center',
    marginBottom: Spacing[4],
  },
  titleWhite: {
    color: Colors.white,
  },
  titleYellow: {
    color: '#CFDE3A',
  },
  description: {
    ...Typography.h3,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing[8],
    opacity: 0.9,
    lineHeight: 24,
  },
  getStartedButton: {
    backgroundColor: '#1997D4',
    paddingVertical: Spacing[4],
    borderRadius: 40,
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  getStartedText: {
    ...Typography.buttonLarge,
    color: '#ffffff',
  },
  signInButton: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing[4],
    borderRadius: 40,
    width: '100%',
    alignItems: 'center',
  },
  signInText: {
    ...Typography.buttonLarge,
    color: '#4A90E2',
  },
});

export default OnboardingScreen; 