/**
 * Forgot Password Screen
 * Step 1 of password reset: the user enters their email and we ask the backend
 * to send a 6-digit reset code. On success we advance to the Reset screen.
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {Colors, Typography, Spacing, BorderRadius} from '../theme';

interface ForgotPasswordScreenProps {
  // Sends the reset code request. Resolves on success, throws on failure.
  onSubmit: (email: string) => Promise<void>;
  onBackToLogin: () => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onSubmit,
  onBackToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) return 'Please enter a valid email';
    return undefined;
  };

  const handleSubmit = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSubmit(email.trim().toLowerCase());
      // Parent advances to the Reset screen on success.
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackToLogin}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Forgot Password</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>
          Enter the email linked to your account and we'll send you a 6-digit code
          to reset your password.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="chioma@gmail.com"
            value={email}
            onChangeText={text => {
              setEmail(text);
              if (error) setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            placeholderTextColor={Colors.gray[400]}
          />
          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Sending...' : 'Send Reset Code'}
          </Text>
        </TouchableOpacity>

        <View style={styles.backToLoginContainer}>
          <Text style={styles.backToLoginText}>Remember your password? </Text>
          <TouchableOpacity onPress={onBackToLogin}>
            <Text style={styles.backToLoginLink}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Spacing[6],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing[10],
    marginBottom: Spacing[8],
  },
  backButton: {
    padding: Spacing[2],
  },
  backIcon: {
    fontSize: 24,
    color: Colors.text.primary,
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
    fontWeight: '700',
  },
  placeholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Spacing[4],
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing[8],
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: Spacing[6],
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: Spacing[2],
    fontWeight: '400',
  },
  input: {
    fontSize: 16,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '400',
    lineHeight: 20,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    color: Colors.text.primary,
    height: 52,
  },
  inputError: {
    borderColor: Colors.error[500],
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error[500],
    marginTop: Spacing[2],
    fontWeight: '400',
  },
  submitButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginBottom: Spacing[6],
  },
  disabledButton: {
    backgroundColor: Colors.gray[300],
  },
  submitButtonText: {
    ...Typography.buttonLarge,
    color: Colors.white,
    fontWeight: '600',
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  backToLoginLink: {
    ...Typography.bodySmall,
    color: Colors.primary[500],
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
