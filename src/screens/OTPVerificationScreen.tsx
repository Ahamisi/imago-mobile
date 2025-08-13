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
} from 'react-native';
import {Colors, Typography, Spacing, BorderRadius} from '../theme';
import CountdownTimer from '../components/CountdownTimer';

interface OTPVerificationScreenProps {
  email: string;
  fromLogin?: boolean;
  onVerifySuccess: (otp: string) => void;
  onResendOTP: (email: string) => void;
}

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
  email,
  fromLogin = false,
  onVerifySuccess,
  onResendOTP,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(fromLogin); // Allow immediate resend if from login
  const inputRefs = React.useRef<Array<TextInput | null>>([]);

  // Countdown timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (canResend) {
      interval = setInterval(() => {
        setCanResend(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [canResend]);

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
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter all 6 digits.');
      return;
    }

    setIsResending(true);
    try {
      await onVerifySuccess(otp.join(''));
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'An incorrect OTP was entered.');
    } finally {
      setIsResending(false);
    }
  };

  const handleResendFinish = () => {
    setCanResend(true);
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    setIsResending(true);
    try {
      await onResendOTP(email);
      setCanResend(false); // Reset timer
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

  return (
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
            ref={el => inputRefs.current[index] = el}
            style={styles.hiddenInput}
            value={otp[index]}
            onChangeText={value => handleOtpChange(value, index)}
            keyboardType="number-pad"
            maxLength={1}
            caretHidden
          />
        ))}

        {/* Timer and Resend */}
        <Text style={styles.timer}>{formatTime(canResend)} secs remaining</Text>
        <View style={styles.resendContainer}>
          {!canResend && !fromLogin ? (
            <>
              <Text style={styles.resendText}>Resend code in </Text>
              <CountdownTimer onFinish={handleResendFinish} />
            </>
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
      </View>
      
      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.continueButton, (isResending || otp.length < 6) && styles.disabledButton]}
          onPress={handleVerifyOTP}
          disabled={isResending || otp.length < 6}
        >
          <Text style={styles.continueText}>
            {isResending ? 'Verifying...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
});

export default OTPVerificationScreen; 