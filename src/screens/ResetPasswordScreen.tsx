/**
 * Reset Password Screen
 * Step 2 of password reset: the user enters the 6-digit code emailed by the
 * backend plus a new password. On success we return to the Login screen.
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {Colors, Typography, Spacing, BorderRadius} from '../theme';
import {EyeIcon, EyeSlashIcon} from '../components/icons/EyeIcon';

interface ResetPasswordScreenProps {
  email: string;
  // Completes the reset. Resolves on success, throws on failure.
  onSubmit: (otp: string, newPassword: string) => Promise<void>;
  // Requests a fresh code for the same email.
  onResend: (email: string) => Promise<void>;
  onBackToLogin: () => void;
}

// Mirrors the backend password policy (min 8, upper, lower, digit, and one of
// the special characters @ $ ! % * ? &). Any other characters are allowed too,
// so we use `.{8,}` rather than restricting the whole string to a char set.
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  email,
  onSubmit,
  onResend,
  onBackToLogin,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [errors, setErrors] = useState<{
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const inputRefs = React.useRef<Array<TextInput | null>>([]);

  // Resend countdown.
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!canResend && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [canResend, countdown]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleOtpChange = (value: string, index: number) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (errors.otp) setErrors(prev => ({...prev, otp: undefined}));

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      } else if (value && index === 5) {
        Keyboard.dismiss();
      }
    }
  };

  const validate = (): boolean => {
    const otpString = otp.join('');
    const next: typeof errors = {};

    if (otpString.length !== 6) {
      next.otp = 'Enter the 6-digit code';
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      next.newPassword =
        'Min 8 chars with an uppercase, lowercase, number and a special character (@ $ ! % * ? &)';
    }
    if (confirmPassword !== newPassword) {
      next.confirmPassword = 'Passwords do not match';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(otp.join(''), newPassword);
      // Parent returns to Login on success.
    } catch (err: any) {
      // Wrong/expired code comes back here; surface it on the OTP field.
      setOtp(Array(6).fill(''));
      setErrors(prev => ({
        ...prev,
        otp: err?.message || 'Invalid or expired reset code',
      }));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    try {
      await onResend(email);
      setCanResend(false);
      setCountdown(60);
    } catch (err) {
      // The global notification handler already surfaces the error.
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = otp.join('').length === 6 && !!newPassword && !!confirmPassword;

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
        <Text style={styles.title}>Reset Password</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to {email} and choose a new password.
        </Text>

        {/* OTP dots */}
        <View style={styles.otpInputContainer}>
          {Array.from({length: 6}).map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.otpDot,
                otp[index] ? styles.otpDotFilled : styles.otpDotEmpty,
              ]}
              onPress={() => inputRefs.current[index]?.focus()}
            />
          ))}
        </View>

        {/* Hidden OTP inputs */}
        {Array.from({length: 6}).map((_, index) => (
          <TextInput
            key={index}
            ref={el => {
              inputRefs.current[index] = el;
            }}
            style={styles.hiddenInput}
            value={otp[index]}
            onChangeText={value => handleOtpChange(value, index)}
            onKeyPress={({nativeEvent}) => {
              if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
              }
            }}
            keyboardType="number-pad"
            maxLength={1}
            caretHidden
          />
        ))}

        {!!errors.otp && (
          <Text style={[styles.errorText, styles.otpError]}>{errors.otp}</Text>
        )}

        {/* Resend */}
        <View style={styles.resendContainer}>
          {!canResend ? (
            <Text style={styles.resendText}>
              Resend code in {formatTime(countdown)}
            </Text>
          ) : (
            <>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <TouchableOpacity onPress={handleResend} disabled={isResending}>
                <Text style={styles.resendLink}>
                  {isResending ? 'Sending...' : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* New password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New password</Text>
          <View style={[styles.passwordContainer, errors.newPassword && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="*************"
              value={newPassword}
              onChangeText={text => {
                setNewPassword(text);
                if (errors.newPassword) {
                  setErrors(prev => ({...prev, newPassword: undefined}));
                }
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              placeholderTextColor={Colors.gray[400]}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeIcon size={20} color={Colors.gray[500]} />
              ) : (
                <EyeSlashIcon size={20} color={Colors.gray[500]} />
              )}
            </TouchableOpacity>
          </View>
          {!!errors.newPassword && (
            <Text style={styles.errorText}>{errors.newPassword}</Text>
          )}
        </View>

        {/* Confirm password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm new password</Text>
          <View style={[styles.passwordContainer, errors.confirmPassword && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="*************"
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors(prev => ({...prev, confirmPassword: undefined}));
                }
              }}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              placeholderTextColor={Colors.gray[400]}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? (
                <EyeIcon size={20} color={Colors.gray[500]} />
              ) : (
                <EyeSlashIcon size={20} color={Colors.gray[500]} />
              )}
            </TouchableOpacity>
          </View>
          {!!errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, (loading || !isComplete) && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading || !isComplete}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Resetting...' : 'Reset Password'}
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
    alignItems: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing[8],
    textAlign: 'center',
    lineHeight: 22,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[8],
    paddingVertical: Spacing[4],
    marginBottom: Spacing[4],
  },
  otpDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  otpDotEmpty: {
    backgroundColor: Colors.gray[300],
  },
  otpDotFilled: {
    backgroundColor: Colors.primary[500],
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  otpError: {
    textAlign: 'center',
    marginTop: 0,
    marginBottom: Spacing[2],
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[8],
  },
  resendText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  resendLink: {
    ...Typography.bodySmall,
    color: Colors.secondary[500],
    fontWeight: '600',
  },
  inputGroup: {
    width: '100%',
    marginBottom: Spacing[5],
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: Spacing[2],
    fontWeight: '400',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    height: 52,
  },
  passwordInput: {
    fontSize: 16,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '400',
    lineHeight: 20,
    flex: 1,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    color: Colors.text.primary,
  },
  eyeButton: {
    padding: Spacing[3],
    justifyContent: 'center',
    alignItems: 'center',
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
    width: '100%',
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginTop: Spacing[2],
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
    marginBottom: Spacing[10],
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

export default ResetPasswordScreen;
