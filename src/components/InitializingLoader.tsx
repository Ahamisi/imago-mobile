import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

const InitializingLoader: React.FC = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create continuous rotation animation
    const startRotation = () => {
      rotateAnim.setValue(0);
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000, // 2 seconds per rotation
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        // Loop the animation
        startRotation();
      });
    };

    startRotation();
  }, [rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F9FFEC" barStyle="dark-content" />
      
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, { transform: [{ rotate }] }]}>
          <Image
            source={require('../assets/imago-circle.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        
        <Text style={styles.loadingText}>Loading...</Text>
        <Text style={styles.subText}>Setting up your experience</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FFEC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 60,
    height: 60,
  },
  loadingText: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 8,
    fontWeight: '600',
  },
  subText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default InitializingLoader;
