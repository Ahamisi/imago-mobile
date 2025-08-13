import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../theme';

interface CountdownTimerProps {
  onFinish: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ onFinish }) => {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown === 0) {
      onFinish();
      return;
    }

    const intervalId = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [countdown, onFinish]);

  return <Text style={styles.countdownText}>{countdown}s</Text>;
};

const styles = StyleSheet.create({
  countdownText: {
    ...Typography.body,
    color: Colors.primary[500],
    fontWeight: '600',
  },
});

export default CountdownTimer; 