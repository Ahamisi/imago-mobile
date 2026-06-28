import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';

interface ProfileSuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

const ProfileSuccessModal: React.FC<ProfileSuccessModalProps> = ({
  visible,
  title,
  message,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            <View style={styles.icon}>
              <Text style={styles.iconText}>✓</Text>
            </View>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing[6],
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  iconContainer: {
    marginBottom: Spacing[4],
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '600' as const,
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing[6],
  },
  button: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[8],
    minWidth: 100,
  },
  buttonText: {
    ...Typography.button,
    color: Colors.white,
    textAlign: 'center',
  },
});

export default ProfileSuccessModal;
