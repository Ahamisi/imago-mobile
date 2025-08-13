
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import CheckIcon from '../icons/CheckIcon';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
}

export interface NotificationRef {
  show: (message: string, type: 'success' | 'error') => void;
}

const Notification = forwardRef<NotificationRef, {}>((props, ref) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error'>('success');
  const [isVisible, setIsVisible] = useState(false);
  const translateY = new Animated.Value(-100);
  const insets = useSafeAreaInsets();

  const show = (msg: string, notificationType: 'success' | 'error') => {
    setMessage(msg);
    setType(notificationType);
    setIsVisible(true);
    Animated.spring(translateY, {
      toValue: insets.top,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      hide();
    }, 3000);
  };

  const hide = () => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
    });
  };

  useImperativeHandle(ref, () => ({
    show,
  }));

  if (!isVisible) {
    return null;
  }

  const isSuccess = type === 'success';

  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ translateY }] },
        isSuccess ? styles.successBg : styles.errorBg
      ]}
    >
      <View style={styles.iconContainer}>
        {isSuccess && <CheckIcon />}
        {!isSuccess && <Text style={[Typography.body, styles.iconText]}>✕</Text>}
      </View>
      <View style={styles.textContainer}>
        <Text style={[Typography.h3, styles.title]}>{isSuccess ? 'Successful' : 'Oops! Something went wrong'}</Text>
        <Text style={[Typography.body, styles.message]}>{message}</Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    borderRadius: 12,
    zIndex: 1000,
  },
  successBg: {
    backgroundColor: Colors.success,
  },
  errorBg: {
    backgroundColor: Colors.error,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing[4],
  },
  iconText: {
    color: Colors.error,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.white,
  },
  message: {
    color: Colors.white,
  },
});

export default Notification;

