/**
 * Login Screen
 * User authentication with a clean, centered layout.
 */

import React, {useState} from 'react';
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
import authService from '../services/authService';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onCreateAccountPress: () => void;
  onForgotPassword: () => void;
}

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface ValidationErrors {
  email?: string;
  password?: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onCreateAccountPress,
  onForgotPassword,
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Form validation logic
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email';
        return undefined;
        
      case 'password':
        if (!value) return 'Password is required';
        return undefined;
        
      default:
        return undefined;
    }
  };

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    
    // Clear error for the field being edited
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: undefined}));
    }
  };

  const handleLogin = async () => {
    // Basic frontend validation
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    
    if (emailError || passwordError) {
      setErrors({email: emailError, password: passwordError});
      return;
    }

    setLoading(true);
    setErrors({}); // Clear previous errors
    setErrorMessage(''); // Clear previous error message
    
    try {
      await onLogin(formData.email.trim().toLowerCase(), formData.password);
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Check for specific error messages
      const errorMsg = error.response?.data?.message || error.message;
      
      if (errorMsg === "Please verify your account first") {
        // This will be handled by the navigator - user will be redirected to OTP
        return;
      } else if (errorMsg === "Invalid credentials" || 
                 error.response?.status === 401) {
        setErrors({password: 'Incorrect Password'});
      } else {
        setErrorMessage(errorMsg || 'Login failed. Please try again.');
      }
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
        <View>
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
            <Text style={styles.title}>Welcome back!</Text>
            <Text style={styles.subtitle}>
              Kindly fill this details to login to your account
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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
                  returnKeyType="done"
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
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={styles.rememberMeContainer}
                onPress={() => setFormData(prev => ({...prev, rememberMe: !prev.rememberMe}))}
              >
                <View style={[styles.checkbox, formData.rememberMe && styles.checkboxChecked]} />
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={onForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* General Error Message */}
          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          {/* Create Account Link */}
          <View style={styles.createAccountContainer}>
            <Text style={styles.createAccountText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onCreateAccountPress}>
              <Text style={styles.createAccountLink}>Create an Account</Text>
            </TouchableOpacity>
          </View>
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
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing[6],
    paddingBottom: Spacing[4],
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing[8],
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
  },
  form: {
    marginVertical: Spacing[8],
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
  errorText: {
    ...Typography.caption,
    color: Colors.error[500],
    marginTop: Spacing[2],
    fontWeight: '400',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing[4],
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.gray[300],
    marginRight: Spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    // Future: add checkmark icon
  },
  rememberMeText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  forgotPasswordText: {
    ...Typography.bodySmall,
    color: Colors.primary[500],
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    marginVertical: Spacing[8],
    height: 52,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.gray[300],
  },
  loginButtonText: {
    ...Typography.buttonLarge,
    color: Colors.white,
    fontWeight: '600',
  },
  createAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing[4],
  },
  createAccountText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  createAccountLink: {
    ...Typography.body,
    color: Colors.primary[600],
    fontWeight: '600',
  },
  errorContainer: {
    marginBottom: Spacing[4],
    padding: Spacing[3],
    backgroundColor: Colors.error[50],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error[200],
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error[600],
    textAlign: 'center',
  },
});

export default LoginScreen; 