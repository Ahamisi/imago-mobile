import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../../theme';

const AIScanningIndicator = () => (
  <View style={styles.container}>
    <View style={styles.progressCircle}>
      <Text style={styles.progressText}>90%</Text>
      <Text style={styles.subText}>AI Scanning</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing[10],
    alignSelf: 'center',
    alignItems: 'center',
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FAF3E3',
    borderWidth: 4,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  subText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
});

export default AIScanningIndicator; 