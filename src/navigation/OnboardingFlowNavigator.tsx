/**
 * Onboarding Flow Navigator
 * Manages the multi-step personalized onboarding process.
 */
import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';

import PersonalizationScreen from '../screens/onboarding/PersonalizationScreen';
import OnboardingCompleteScreen from '../screens/onboarding/OnboardingCompleteScreen';
import { onboardingService } from '../services/onboardingService';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

const Stack = createNativeStackNavigator();

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

interface OnboardingFlowNavigatorProps {
  user: UserData;
  onOnboardingComplete: (user: UserData) => void;
  onTimeout: () => void;
}

const OnboardingFlowNavigator: React.FC<OnboardingFlowNavigatorProps> = ({ 
  user, 
  onOnboardingComplete, 
  onTimeout 
}) => {
  const [onboardingState, setOnboardingState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [pregnancyInfo, setPregnancyInfo] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        console.log('🔄 Starting onboarding status fetch...');
        const status = await onboardingService.getStatus();
        console.log('📦 Onboarding status response:', status);
        
        if (status.status === 'success') {
          setOnboardingState(status.data.onboarding);
          setError(''); // Clear any previous errors only on success
          console.log('✅ Onboarding status loaded successfully');
        } else {
          console.error('❌ Onboarding status failed:', status.message);
          setError(status.message || 'Failed to load onboarding data.');
        }
      } catch (err: any) {
        console.error("❌ Failed to fetch onboarding status", err);
        console.error("❌ Error details:", err.response?.data || err.message);
        
        // Check if it's a network error or API doesn't exist
        if (err.response?.status === 404) {
          setError('Onboarding service not available. Skipping to main app...');
          // Skip onboarding if endpoint doesn't exist
          setTimeout(() => {
            onOnboardingComplete(user);
          }, 2000);
        } else {
          setError('Failed to load onboarding. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const handleCompleteStep = async (payload: { answerType: 'exact_date' | 'approximate_month'; answer: string | { month: number; year: number } }) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('📝 Submitting onboarding answer...');
      const response = await onboardingService.submitAnswer({ 
        questionId: onboardingState?.nextQuestion?.id || 'lmp_date', 
        ...payload 
      });
      
      console.log('📦 Onboarding submission response:', response);
      
      if (response.status === 'success' && response.data.onboarding.isCompleted) {
        console.log('✅ Onboarding submission successful - completed!');
        setPregnancyInfo(response.data.pregnancyInfo);
        setShowCompleteModal(true);
      } else if (response.status === 'success') {
        console.log('✅ Onboarding submission successful - more steps needed');
        // Handle case where there are more onboarding steps
        setError('More onboarding steps required.');
      } else {
        console.log('❌ Onboarding submission failed:', response.message);
        setError(response.message || 'Failed to submit. Please try again.');
      }
    } catch (err: any) {
      console.error("❌ Failed to submit answer", err);
      console.error("❌ Error details:", err.response?.data || err.message);
      setError('Failed to save your answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryOrGoBack = () => {
    if (error) {
      onTimeout();
    } else {
      setLoading(true);
      setError('');
    }
  };

  const handleCloseCompleteModal = () => {
    setShowCompleteModal(false);
    onOnboardingComplete({ ...user, pregnancyInfo });
  };

  if (loading || isSubmitting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>
          {isSubmitting ? 'Submitting...' : 'Loading your onboarding...'}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorMessage}>
          {error || 'Something went wrong. Please try again.'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetryOrGoBack}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!onboardingState) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Unable to load onboarding</Text>
        <Text style={styles.errorMessage}>Please try logging in again.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onTimeout}>
          <Text style={styles.retryButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (onboardingState.isCompleted) {
    // This case should ideally not be hit if API is correct, but as a fallback:
    onOnboardingComplete(user);
    return null;
  }

  return (
    <View style={{flex: 1}}>
      <PersonalizationScreen 
        user={user} 
        onCompleteSetup={handleCompleteStep}
      />
      <Modal 
        isVisible={showCompleteModal}
        onBackdropPress={handleCloseCompleteModal}
        backdropOpacity={0.4}
        animationIn="zoomIn"
        animationOut="zoomOut"
        style={styles.modal}
      >
        <OnboardingCompleteScreen 
          pregnancyInfo={pregnancyInfo}
          onGoToHome={handleCloseCompleteModal}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginTop: Spacing[4],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Spacing[8],
  },
  errorTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing[4],
  },
  errorMessage: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing[8],
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[8],
    borderRadius: 8,
    minWidth: 120,
  },
  retryButtonText: {
    ...Typography.button,
    color: Colors.white,
    textAlign: 'center',
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
});

export default OnboardingFlowNavigator; 