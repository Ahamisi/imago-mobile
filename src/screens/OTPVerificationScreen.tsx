/**
 * OTP Verification Screen
 * Matches Figma design with a custom OTP input field.
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import {Colors, Typography, Spacing, BorderRadius} from '../theme';
import CountdownTimer from '../components/CountdownTimer';

interface OTPVerificationScreenProps {
  email: string;
  fromLogin?: boolean;
  onVerifySuccess: (otp: string) => void;
  onResendOTP: (email: string) => void;
  onBackToLogin?: () => void;
}

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
  email,
  fromLogin = false,
  onVerifySuccess,
  onResendOTP,
  onBackToLogin,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(fromLogin); // Allow immediate resend if from login
  const [countdown, setCountdown] = useState(60); // 60 seconds countdown
  const inputRefs = React.useRef<Array<TextInput | null>>([]);

  // Countdown timer logic
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

  // Format timer for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (value: string, index: number) => {
    // Allow only numeric input and limit to OTP_LENGTH
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input if value is entered
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      } else if (value && index === 5) {
        // If this is the last digit, check if OTP is complete
        const isComplete = newOtp.every(digit => digit !== '');
        if (isComplete) {
          // Auto-dismiss keyboard when OTP is complete
          Keyboard.dismiss();
        }
      }
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter all 6 digits.');
      return;
    }

    setIsResending(true);
    try {
      await onVerifySuccess(otpString);
      // Success - let parent handle navigation
    } catch (error: any) {
      // Don't redirect on failure - stay on OTP screen
      console.error('OTP Verification failed:', error);
      
      // Clear the OTP input for retry
      setOtp(Array(6).fill(''));
      
      // Show error message but stay on screen
      Alert.alert(
        'Verification Failed', 
        error.message || 'The verification code is incorrect. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: () => {
              // Focus first input for retry
              inputRefs.current[0]?.focus();
            }
          }
        ]
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    setIsResending(true);
    try {
      await onResendOTP(email);
      setCanResend(false); // Reset timer
      setCountdown(60); // Reset countdown
      Alert.alert('Success', 'Verification code sent successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Focus the hidden text input when the OTP container is pressed
  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  // Dismiss keyboard when tapping outside
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background.primary} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => {}}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {fromLogin ? 'Verify Your Account' : 'Verify Your Email'}
          </Text>
          <View style={styles.placeholder} />
        </View>
        
        {/* Content */}
        <View style={styles.content}>
        <Text style={styles.subtitle}>
          {fromLogin 
            ? `Please verify your account to continue. We've sent a verification code to ${email}`
            : `Enter the 6-digit code sent to ${email}`
          }
        </Text>

        {/* Custom OTP Input */}
        <View style={styles.otpInputContainer}>
          {Array.from({length: 6}).map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.otpDot,
                otp[index] ? styles.otpDotFilled : styles.otpDotEmpty,
              ]}
              onPress={() => focusInput(index)}
            />
          ))}
        </View>

        {/* Hidden TextInput */}
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

        {/* Timer and Resend */}
        {!canResend && (
          <Text style={styles.timer}>{formatTime(countdown)} remaining</Text>
        )}
        
        <View style={styles.resendContainer}>
          {!canResend ? (
            <Text style={styles.resendText}>Resend code in {formatTime(countdown)}</Text>
          ) : (
            <>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <TouchableOpacity onPress={handleResendOTP} disabled={isResending}>
                <Text style={styles.resendLink}>
                  {isResending ? 'Sending...' : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Back to Login Link */}
        {onBackToLogin && (
          <View style={styles.backToLoginContainer}>
            <Text style={styles.backToLoginText}>Having trouble? </Text>
            <TouchableOpacity onPress={onBackToLogin}>
              <Text style={styles.backToLoginLink}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.continueButton, (isResending || otp.join('').length < 6) && styles.disabledButton]}
          onPress={handleVerifyOTP}
          disabled={isResending || otp.join('').length < 6}
        >
          <Text style={styles.continueText}>
            {isResending ? 'Verifying...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
      </View>
    </TouchableWithoutFeedback>
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing[8],
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing[8],
    textAlign: 'center',
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
    marginBottom: Spacing[8],
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
  timer: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '500',
    marginBottom: Spacing[4],
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  disabledLink: {
    color: Colors.gray[400],
  },
  buttonContainer: {
    paddingBottom: Spacing[10],
  },
  continueButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  disabledButton: {
    backgroundColor: Colors.gray[300],
  },
  continueText: {
    ...Typography.buttonLarge,
    color: Colors.white,
    fontWeight: '600',
  },
  countdownText: {
    ...Typography.bodySmall,
    color: Colors.secondary[500],
    fontWeight: '600',
  },
  backToLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing[6],
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

export default OTPVerificationScreen; 