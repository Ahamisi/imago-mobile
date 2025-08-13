/**
 * Sign Up Screen
 * User registration with real-time validation and feedback.
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import {Colors, Typography, Spacing, BorderRadius} from '../theme';
import {EyeIcon, EyeSlashIcon} from '../components/icons/EyeIcon';

interface SignUpScreenProps {
  onSignUpSuccess: (userData: SignUpPayload) => void;
  onLoginPress: () => void;
}

export interface SignUpPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

interface ValidationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({onSignUpSuccess, onLoginPress}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string;
    color: string;
  }>({
    score: 0,
    feedback: 'Password should have at least 8characters',
    color: Colors.text.secondary,
  });

  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);

  // Effect for live validation of password confirmation
  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordsMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordsMatch(null); // Reset when empty
    }
  }, [formData.password, formData.confirmPassword]);


  // Real-time password strength validation
  const validatePassword = (password: string) => {
    let score = 0;
    let feedback = '';
    let color = Colors.error[500];

    if (password.length === 0) {
      return {score: 0, feedback: 'Password should have at least 8characters', color: Colors.text.secondary};
    }

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 0:
      case 1:
      case 2:
        feedback = 'Weak password';
        color = Colors.error[500];
        break;
      case 3:
        feedback = 'Fair password';
        color = Colors.warning[500];
        break;
      case 4:
        feedback = 'Good password';
        color = Colors.success[500];
        break;
      case 5:
        feedback = 'Strong password';
        color = Colors.success[600];
        break;
    }

    return {score, feedback, color};
  };

  // On-submit form validation
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        return undefined;
        
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email';
        return undefined;
        
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        return undefined;
        
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return undefined;
        
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return undefined;
        
      default:
        return undefined;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    
    // Clear final validation error for this field as user types
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({...prev, [field]: undefined}));
    }
    
    // Live validation for password strength
    if (field === 'password') {
      setPasswordStrength(validatePassword(value));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    newErrors.fullName = validateField('fullName', formData.fullName);
    newErrors.email = validateField('email', formData.email);
    newErrors.phone = validateField('phone', formData.phone);
    newErrors.password = validateField('password', formData.password);
    newErrors.confirmPassword = validateField('confirmPassword', formData.confirmPassword);
    
    setErrors(newErrors);
    
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before continuing.');
      return;
    }

    setLoading(true);
    try {
      const payload: SignUpPayload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
      };

      await onSignUpSuccess(payload);
    } catch (error) {
      console.error('SignUp component error:', error);
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
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain" 
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Get Started</Text>
          <Text style={styles.subtitle}>
            Sign up to access smart scans, emergency help, local clinics, and a loving support system.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              placeholder="Warith Yellow"
              value={formData.fullName}
              onChangeText={(text) => handleInputChange('fullName', text)}
              autoCapitalize="words"
              returnKeyType="next"
              placeholderTextColor={Colors.gray[400]}
            />
            {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="yellow@gmail.com"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              placeholderTextColor={Colors.gray[400]}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone number</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="909038303993"
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              keyboardType="phone-pad"
              returnKeyType="next"
              placeholderTextColor={Colors.gray[400]}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="*************"
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry={!showPassword}
                returnKeyType="next"
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
            <Text style={[styles.passwordHint, {color: passwordStrength.color}]}>
              {passwordStrength.feedback}
            </Text>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={[styles.passwordContainer, errors.confirmPassword && styles.inputError]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="*************"
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                secureTextEntry={!showConfirmPassword}
                returnKeyType="done"
                placeholderTextColor={Colors.gray[400]}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeIcon size={20} color={Colors.gray[500]} />
                ) : (
                  <EyeSlashIcon size={20} color={Colors.gray[500]} />
                )}
              </TouchableOpacity>
            </View>
            {passwordsMatch === false && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
            {passwordsMatch === true && (
              <Text style={styles.successText}>Passwords match</Text>
            )}
            {errors.confirmPassword && passwordsMatch !== false && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, loading && styles.disabledButton]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.continueButtonText}>
            {loading ? 'Creating Account...' : 'Continue'}
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={onLoginPress}>
            <Text style={styles.loginLink}>Login</Text>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing[6],
    paddingBottom: Spacing[10],
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Spacing[10],
    marginBottom: Spacing[6],
    height: 60,
  },
  logo: {
    height: '100%',
    width: '50%',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing[8],
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing[2],
  },
  form: {
    marginBottom: Spacing[2],
  },
  inputGroup: {
    marginBottom: Spacing[5],
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: Spacing[2],
    fontWeight: '400',
  },
  input: {
    ...Typography.body,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    color: Colors.text.primary,
    height: 52,
  },
  inputError: {
    borderColor: Colors.error[500],
    backgroundColor: Colors.error[50],
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
    ...Typography.body,
    flex: 1,
    paddingHorizontal: Spacing[4],
    color: Colors.text.primary,
  },
  eyeButton: {
    padding: Spacing[3],
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordHint: {
    ...Typography.caption,
    marginTop: Spacing[2],
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error[500],
    marginTop: Spacing[1],
  },
  successText: {
    ...Typography.caption,
    color: Colors.success[500],
    marginTop: Spacing[1],
  },
  continueButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    marginBottom: Spacing[6],
    height: 52,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.gray[300],
  },
  continueButtonText: {
    ...Typography.buttonLarge,
    color: Colors.white,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing[4],
  },
  loginText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  loginLink: {
    ...Typography.body,
    color: Colors.primary[600],
    fontWeight: '600',
  },
});

export default SignUpScreen; 