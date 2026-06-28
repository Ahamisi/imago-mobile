import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';
import { EyeIcon, EyeSlashIcon } from '../../../components/icons';
import { profileService } from '../../../services/profileService';

interface SecurityModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { currentPassword: string; newPassword: string }) => void;
}

const SecurityModal: React.FC<SecurityModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handlePasswordChange = (password: string) => {
    setNewPassword(password);
    const validation = profileService.validatePassword(password);
    setValidationErrors(validation.errors);
  };

  const handleSave = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirmation do not match');
      return;
    }

    const validation = profileService.validatePassword(newPassword);
    if (!validation.isValid) {
      Alert.alert('Invalid Password', validation.errors.join('\n'));
      return;
    }

    setLoading(true);
    try {
      await onSave({
        currentPassword,
        newPassword,
      });
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setValidationErrors([]);
    } catch (error) {
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setValidationErrors([]);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Security</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon size={20} color={Colors.text.secondary} />
                  ) : (
                    <EyeIcon size={20} color={Colors.text.secondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={newPassword}
                  onChangeText={handlePasswordChange}
                  placeholder="Enter new password"
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeSlashIcon size={20} color={Colors.text.secondary} />
                  ) : (
                    <EyeIcon size={20} color={Colors.text.secondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon size={20} color={Colors.text.secondary} />
                  ) : (
                    <EyeIcon size={20} color={Colors.text.secondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            {newPassword.length > 0 && (
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                <View style={styles.requirements}>
                  <Text style={[styles.requirement, newPassword.length >= 8 && styles.requirementMet]}>
                    • At least 8 characters
                  </Text>
                  <Text style={[styles.requirement, /[A-Z]/.test(newPassword) && styles.requirementMet]}>
                    • One uppercase letter
                  </Text>
                  <Text style={[styles.requirement, /[a-z]/.test(newPassword) && styles.requirementMet]}>
                    • One lowercase letter
                  </Text>
                  <Text style={[styles.requirement, /\d/.test(newPassword) && styles.requirementMet]}>
                    • One number
                  </Text>
                  <Text style={[styles.requirement, /[@$!%*?&]/.test(newPassword) && styles.requirementMet]}>
                    • One special character (@$!%*?&)
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Updating...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  cancelButton: {
    ...Typography.body,
    color: Colors.primary[500],
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[6],
  },
  form: {
    paddingTop: Spacing[6],
    gap: Spacing[6],
  },
  field: {
    gap: Spacing[2],
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    fontWeight: '600' as const,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
  },
  passwordInput: {
    ...Typography.body,
    color: Colors.text.primary,
    flex: 1,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  eyeButton: {
    padding: Spacing[3],
  },
  requirementsContainer: {
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
    padding: Spacing[4],
  },
  requirementsTitle: {
    ...Typography.bodySmall,
    color: Colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: Spacing[2],
  },
  requirements: {
    gap: Spacing[1],
  },
  requirement: {
    ...Typography.caption,
    color: Colors.error,
  },
  requirementMet: {
    color: Colors.success,
  },
  footer: {
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[4],
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  saveButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing[4],
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: '600' as const,
  },
});

export default SecurityModal;
