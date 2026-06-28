import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
} from 'react-native';
import {Colors, Typography, Spacing, BorderRadius} from '../theme';
import CheckIcon from './icons/CheckIcon';

interface PregnancyInfo {
  edd: string;
  eddFormatted: string;
  gestationalAge: string;
  gestationalWeeks: number;
  trimester: string;
  lmpDate: string;
}

interface SuccessModalProps {
  isVisible: boolean;
  onContinue: () => void;
  pregnancyInfo?: PregnancyInfo;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isVisible, onContinue, pregnancyInfo }) => {
  if (!isVisible) {
    return null;
  }

  const handleContinue = () => {
    onContinue();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onContinue}
    >
      <StatusBar barStyle="dark-content" backgroundColor="rgba(0,0,0,0.5)" />
      <View style={styles.overlay}>
        <View style={styles.successCard}>
          <View style={styles.iconContainer}>
            <CheckIcon size={48} />
          </View>
          <Text style={styles.title}>
            {pregnancyInfo ? "You're all set, Mama!" : 'Successful'}
          </Text>
          {pregnancyInfo ? (
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>About your pregnancy</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Pregnancy Stage:</Text>
                <Text style={styles.infoValue}>{pregnancyInfo.gestationalAge}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Current Trimester:</Text>
                <Text style={styles.infoValue}>{pregnancyInfo.trimester}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Expected Due Date:</Text>
                <Text style={styles.infoValue}>{pregnancyInfo.eddFormatted}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.message}>Your account has been successfully created!</Text>
          )}
          <TouchableOpacity style={styles.button} onPress={onContinue}>
            <Text style={styles.buttonText}>
              {pregnancyInfo ? 'Go to Home' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    successCard: {
        width: '85%',
        maxWidth: 320,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing[6],
        paddingTop: Spacing[8],
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        marginHorizontal: Spacing[6],
    },
    iconContainer: {
        marginBottom: Spacing[6],
    },
    title: {
        ...Typography.h2,
        color: Colors.text.primary,
        marginBottom: Spacing[2],
    },
    message: {
        ...Typography.body,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginBottom: Spacing[6],
    },
    infoContainer: {
        width: '100%',
        backgroundColor: Colors.gray[50],
        borderRadius: BorderRadius.md,
        padding: Spacing[4],
        marginBottom: Spacing[6],
    },
    infoTitle: {
        ...Typography.bodySmall,
        color: Colors.text.secondary,
        marginBottom: Spacing[4],
        textAlign: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing[2],
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
        paddingVertical: Spacing[4],
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        width: '100%',
    },
    buttonText: {
        ...Typography.buttonLarge,
        color: Colors.white,
    },
});

export default SuccessModal; 