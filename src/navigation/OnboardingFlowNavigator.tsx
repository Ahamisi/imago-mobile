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
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [pregnancyInfo, setPregnancyInfo] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await onboardingService.getStatus();
        if (status.status === 'success') {
          setOnboardingState(status.data.onboarding);
        } else {
          setError(status.message || 'Failed to load onboarding data.');
        }
        setError('');
      } catch (err) {
        console.error("Failed to fetch onboarding status", err);
        setError('Failed to load onboarding. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (loading) {
        setTimeoutReached(true);
        setLoading(false);
        setError('Something went wrong. Please try again.');
      }
    }, 60000);

    fetchStatus();

    return () => clearTimeout(timeoutId);
  }, []);

  const handleCompleteStep = async (payload: { answerType: 'exact_date' | 'approximate_month'; answer: string | { month: number; year: number } }) => {
    setIsSubmitting(true);
    setError('');
    try {
      const response = await onboardingService.submitAnswer({ 
        questionId: onboardingState?.nextQuestion?.id || 'lmp_date', 
        ...payload 
      });
      
      if (response.status === 'success' && response.data.isCompleted) {
        setPregnancyInfo(response.data.pregnancyInfo);
        setShowCompleteModal(true);
      } else {
        setError(response.message || 'Failed to submit. Please try again.');
      }
    } catch (err) {
      console.error("Failed to submit answer", err);
      setError('Failed to save your answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryOrGoBack = () => {
    if (timeoutReached || error) {
      onTimeout();
    } else {
      setLoading(true);
      setError('');
      setTimeoutReached(false);
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

  if (error || timeoutReached) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorMessage}>
          {error || 'The request is taking longer than expected. Please try logging in again.'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetryOrGoBack}>
          <Text style={styles.retryButtonText}>
            {timeoutReached ? 'Back to Login' : 'Try Again'}
          </Text>
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