/**
 * Onboarding Completion Screen
 * Shows a summary of the user's pregnancy details after completing onboarding.
 */
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Colors, Typography, Spacing, BorderRadius} from '../../theme';
import CheckIcon from '../../components/icons/CheckIcon';

interface PregnancyInfo {
  pregnancyStage: string;
  currentTrimester: string;
  expectedDueDate: string;
}

interface OnboardingCompleteScreenProps {
  pregnancyInfo: PregnancyInfo | null;
  onGoToHome: () => void;
}

const OnboardingCompleteScreen: React.FC<OnboardingCompleteScreenProps> = ({
  pregnancyInfo,
  onGoToHome,
}) => {
  if (!pregnancyInfo) {
    return null; // Or a loading/error state
  }

  return (
    <View style={styles.card}>
      <CheckIcon size={72} color={Colors.success[500]} />
      <View style={styles.titleContainer}>
        <Text style={styles.sparkle}>✨</Text>
        <Text style={styles.title}>You're all set, Mama!</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>About your pregnancy</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Pregnancy Stage</Text>
          <Text style={styles.infoValue}>{pregnancyInfo.gestationalAge}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Days Pregnant</Text>
          <Text style={styles.infoValue}>{pregnancyInfo.daysPregnant} Days</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Current trimester</Text>
          <Text style={styles.infoValue}>{pregnancyInfo.trimester}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Expected Due date:</Text>
          <Text style={styles.infoValue}>{pregnancyInfo.eddFormatted}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.button} onPress={onGoToHome}>
        <Text style={styles.buttonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing[6],
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    width: '90%',
    maxWidth: 340,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing[6],
  },
  sparkle: {
    fontSize: 24,
    marginRight: Spacing[2],
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
    fontWeight: '700',
  },
  infoTitle: {
    ...Typography.bodySmall,
    color: Colors.text.primary,
    fontWeight: '700',
    marginBottom: Spacing[4],
  },
  infoContainer: {
    width: '100%',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[6],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing[3],
  },
  infoLabel: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  button: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.lg,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    ...Typography.buttonLarge,
    color: Colors.white,
  },
});

export default OnboardingCompleteScreen; 