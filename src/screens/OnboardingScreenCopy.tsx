/**
 * Onboarding Screens - Simple and Clean
 */

import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import {Colors, Typography, Spacing, BorderRadius} from '../theme';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

interface OnboardingScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const onboardingData = [
  {
    id: 1,
    title: 'Your Pregnancy, Our Priority',
    description: 'ImagoMum+ gives you instant access to ultrasound scans, emergency help, and life-saving tools — wherever you are.',
    backgroundColor: '#2C5F7C',
  },
  {
    id: 2,
    title: 'AI-Powered Ultrasound in Your Hands',
    description: 'No hospital nearby? No problem. Just scan with your phone and get instant results, guidance, and peace of mind.',
    backgroundColor: '#1F2937',
  },
  {
    id: 3,
    title: 'Multilingual & Community-Powered',
    description: 'Speak your language, chat with fellow mums, and connect with doctors who care. Together, we protect your journey.',
    backgroundColor: '#4A5568',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onGetStarted,
  onSignIn,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentIndex(roundIndex);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {onboardingData.map((item) => (
          <View key={item.id} style={[styles.slide, {backgroundColor: item.backgroundColor}]}>
            <View style={styles.content}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <View style={styles.indicators}>
                {onboardingData.map((_, dotIndex) => (
                  <View
                    key={dotIndex}
                    style={[
                      styles.dot,
                      dotIndex === currentIndex && styles.activeDot,
                    ]}
                  />
                ))}
              </View>
              <TouchableOpacity style={styles.getStartedButton} onPress={onGetStarted}>
                <Text style={styles.getStartedText}>Get Started</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.signInButton} onPress={onSignIn}>
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'flex-end',
    paddingBottom: Spacing[10],
  },
  content: {
    paddingHorizontal: Spacing[6],
    alignItems: 'center',
  },
  title: {
    ...Typography.h1,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing[4],
  },
  description: {
    ...Typography.bodyLarge,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing[8],
    opacity: 0.9,
    lineHeight: 24,
  },
  indicators: {
    flexDirection: 'row',
    marginBottom: Spacing[8],
    gap: Spacing[2],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  activeDot: {
    backgroundColor: '#F1C40F',
    width: 24,
  },
  getStartedButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.xl,
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  getStartedText: {
    ...Typography.buttonLarge,
    color: Colors.white,
  },
  signInButton: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.xl,
    width: '100%',
    alignItems: 'center',
  },
  signInText: {
    ...Typography.buttonLarge,
    color: Colors.text.primary,
  },
});

export default OnboardingScreen; 