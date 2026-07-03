/**
 * Root Navigator
 * Main navigation structure for the app
 */

import React, {useState, useEffect, Fragment} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Alert} from 'react-native';
import {RootStackParamList} from '../types/navigation';
import {setNavigationHandlers} from '../services/navigationService';

// Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SignUpScreen, {SignUpPayload} from '../screens/SignUpScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import OnboardingFlowNavigator from './OnboardingFlowNavigator';
import MainNavigator from './MainNavigator';

// Components
import SuccessModal from '../components/SuccessModal';
import InitializingLoader from '../components/InitializingLoader';

// Services
import authService from '../services/authService';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface UserData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isVerified: boolean;
  onboarding?: {
    isCompleted: boolean;
    currentStep: number;
  };
  pregnancyInfo?: {
    edd: string;
    eddFormatted: string;
    gestationalAge: string;
    gestationalWeeks: number;
    trimester: string;
    lmpDate: string;
  };
}

const RootNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'onboarding' | 'signup' | 'login' | 'otp' | 'forgot_password' | 'reset_password' | 'main' | 'onboarding_flow'>('splash');
  const [signUpData, setSignUpData] = useState<SignUpPayload | null>(null);
  const [resetEmail, setResetEmail] = useState<string>('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [authToken, setAuthToken] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Register navigation handlers for global logout
  useEffect(() => {
    setNavigationHandlers(setCurrentScreen, setUserData, setAuthToken);
  }, []);

  // Initialize app - check for existing authentication
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing app...');
        
        // Initialize auth service and check for stored tokens
        const authData = await authService.initialize();
        
        if (authData.isAuthenticated && authData.userData && authData.tokensData) {
          console.log('✅ User is already authenticated');
          setUserData(authData.userData);
          setAuthToken(authData.tokensData.accessToken);
          
          // Check if onboarding is completed (assume completed for existing users)
          const userOnboarding = (authData.userData as any).onboarding;
          console.log('🔍 User onboarding data:', userOnboarding);
          console.log('🔍 Onboarding completed?', userOnboarding?.isCompleted);
          
          if (userOnboarding?.isCompleted === false) {
            // User needs to complete onboarding
            console.log('➡️ Redirecting to onboarding flow');
            setCurrentScreen('onboarding_flow');
          } else {
            // Default to main screen for existing authenticated users or if onboarding is completed/undefined
            console.log('➡️ Redirecting to main app');
            setCurrentScreen('main');
          }
        } else {
          console.log('ℹ️ No authentication found, showing onboarding');
          setCurrentScreen('onboarding');
        }
        
        // Test backend connection
        const isConnected = await authService.testConnection();
        console.log('Backend connection test:', isConnected ? 'SUCCESS' : 'FAILED');
        
      } catch (error) {
        console.error('❌ App initialization error:', error);
        setCurrentScreen('onboarding');
      } finally {
        console.log('🏁 App initialization complete');
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  const handleSplashFinish = () => {
    setCurrentScreen('onboarding');
  };

  const handleGetStarted = () => {
    setCurrentScreen('signup');
  };

  const handleSignIn = () => {
    setCurrentScreen('login');
  };

  const handleSignUpSuccess = async (payload: SignUpPayload) => {
    try {
      setSignUpData(payload);
      const response = await authService.signUp(payload);
      
      if (response.status === 'success') {
        Alert.alert('Success', response.message || 'OTP sent to your email and phone.');
        setCurrentScreen('otp');
      } else {
        Alert.alert('Error', response.message || 'Signup failed. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred during signup.');
    }
  };

  const handleLoginSuccess = (user: UserData, tokens: any) => {
    setUserData(user);
    setAuthToken(tokens.accessToken);
    
    setShowSuccessModal(true); // Show success modal instead of alert
    
    // The navigation logic will be handled by the modal's onContinue press
  };

  const handleOTPVerifySuccess = async (otp: string) => {
    try {
      if (!signUpData) {
        Alert.alert('Error', 'No signup data found. Please start over.');
        return;
      }
      
      const response = await authService.verifyOTP(signUpData.email, otp);
      
      if (response.status === 'success' && response.data) {
        const user = response.data.user;
        const tokens = response.data.tokens;
        
        setUserData(user);
        setAuthToken(tokens.accessToken);
        
        setShowSuccessModal(true); // Show success modal instead of navigating
      } else {
        throw new Error(response.message || 'OTP verification failed');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      throw error; // Re-throw to let OTP screen handle it
    }
  };

  const handleResendOTP = async () => {
    try {
      if (!signUpData) {
        Alert.alert('Error', 'No signup data found. Please start over.');
        return;
      }
      
      const response = await authService.resendOTP(signUpData.email);
      
      if (response.status !== 'success') {
        Alert.alert('Error', response.message || 'Failed to resend OTP.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Network error resending OTP.');
    }
  };

  const handleBackToSignUp = () => {
    setCurrentScreen('signup');
  };

  const handleContinueToApp = () => {
    setShowSuccessModal(false); // Hide modal
    if (userData?.onboarding?.isCompleted === false) {
      setCurrentScreen('onboarding_flow');
    } else {
      setCurrentScreen('main');
    }
  };

  const handleCreateAccountPress = () => {
    setCurrentScreen('signup');
  };

  const handleForgotPassword = () => {
    setCurrentScreen('forgot_password');
  };

  // Step 1: request a reset code, then advance to the reset screen.
  const handleForgotPasswordSubmit = async (email: string) => {
    const response = await authService.forgotPassword(email);
    if (response.status !== 'success') {
      throw new Error(response.message || 'Failed to send reset code.');
    }
    setResetEmail(email);
    setCurrentScreen('reset_password');
  };

  // Step 2: complete the reset, then return to login.
  const handleResetPasswordSubmit = async (otp: string, newPassword: string) => {
    const response = await authService.resetPassword(resetEmail, otp, newPassword);
    if (response.status !== 'success') {
      throw new Error(response.message || 'Failed to reset password.');
    }
    setResetEmail('');
    setCurrentScreen('login');
  };

  const handleResendResetCode = async (email: string) => {
    await authService.forgotPassword(email);
  };

  const handleBackToLoginFromReset = () => {
    setResetEmail('');
    setCurrentScreen('login');
  };

  const handleOnboardingTimeout = () => {
    // Clear user data and go back to login
    setUserData(null);
    setAuthToken('');
    setCurrentScreen('login');
  };

  const handleOnboardingComplete = (updatedUser: UserData) => {
    setUserData(updatedUser);
    setCurrentScreen('main');
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      
      if (response.status === 'success' && response.data) {
        const user = response.data.user;
        const tokens = response.data.tokens;
        
        handleLoginSuccess(user, tokens);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if this is the "Please verify your account first" error (401)
      const errorMessage = error.response?.data?.message || error.message;
      
      if (errorMessage === "Please verify your account first") {
        // Redirect to OTP screen for verification
        setSignUpData({ 
          email, 
          password, 
          fullName: '', 
          phone: '',
        });
        setCurrentScreen('otp');
        return;
      }
      
      throw error; // Re-throw other errors to be handled by the LoginScreen
    }
  };



  return (
    <Fragment>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          animation: 'fade',
        }}>
        
        {isInitializing && (
          <Stack.Screen name="InitializingLoader">
            {() => <InitializingLoader />}
          </Stack.Screen>
        )}
        
        {currentScreen === 'splash' && !isInitializing && (
          <Stack.Screen name="Splash">
            {() => <SplashScreen onFinish={handleSplashFinish} />}
          </Stack.Screen>
        )}
        
        {currentScreen === 'onboarding' && (
          <Stack.Screen name="Onboarding">
            {() => (
              <OnboardingScreen
                onGetStarted={handleGetStarted}
                onSignIn={handleSignIn}
              />
            )}
          </Stack.Screen>
        )}

        {currentScreen === 'signup' && (
          <Stack.Screen name="SignUp">
            {() => (
              <SignUpScreen
                onSignUpSuccess={handleSignUpSuccess}
                onLoginPress={handleSignIn}
              />
            )}
          </Stack.Screen>
        )}

        {currentScreen === 'login' && (
          <Stack.Screen name="Login">
            {() => (
              <LoginScreen
                onLogin={handleLogin}
                onCreateAccountPress={handleGetStarted}
                onForgotPassword={handleForgotPassword}
              />
            )}
          </Stack.Screen>
        )}

        {currentScreen === 'forgot_password' && (
          <Stack.Screen name="ForgotPassword">
            {() => (
              <ForgotPasswordScreen
                onSubmit={handleForgotPasswordSubmit}
                onBackToLogin={handleSignIn}
              />
            )}
          </Stack.Screen>
        )}

        {currentScreen === 'reset_password' && (
          <Stack.Screen name="ResetPassword">
            {() => (
              <ResetPasswordScreen
                email={resetEmail}
                onSubmit={handleResetPasswordSubmit}
                onResend={handleResendResetCode}
                onBackToLogin={handleBackToLoginFromReset}
              />
            )}
          </Stack.Screen>
        )}

        {currentScreen === 'otp' && signUpData && (
          <Stack.Screen name="OTPVerification">
            {() => (
              <OTPVerificationScreen
                email={signUpData.email}
                fromLogin={signUpData.password !== '' && signUpData.fullName === ''} // Indicates coming from login
                onVerifySuccess={handleOTPVerifySuccess}
                onResendOTP={handleResendOTP}
              />
            )}
          </Stack.Screen>
        )}

        {currentScreen === 'onboarding_flow' && userData && (
          <Stack.Screen name="OnboardingFlow">
            {() => (
              <OnboardingFlowNavigator 
                user={userData}
                onOnboardingComplete={handleOnboardingComplete}
                onTimeout={handleOnboardingTimeout}
              />
            )}
          </Stack.Screen>
        )}

        {currentScreen === 'main' && (
          <Stack.Screen name="Main">
            {() => (
              <MainNavigator />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
      <SuccessModal 
        isVisible={showSuccessModal} 
        onContinue={handleContinueToApp}
        pregnancyInfo={userData?.pregnancyInfo}
      />
    </Fragment>
  );
};

export default RootNavigator; 