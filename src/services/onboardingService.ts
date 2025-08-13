import apiClient from './apiClient';

class OnboardingService {
  async getStatus() {
    try {
      console.log('Fetching onboarding status...');
      const response = await apiClient.get('/onboarding/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      throw error;
    }
  }

  async submitAnswer(payload: { questionId: string; answerType: 'exact_date' | 'approximate_month'; answer: string | { month: number; year: number } }) {
    try {
      console.log('Submitting onboarding answer:', payload);
      const response = await apiClient.post('/onboarding/submit', payload);
      return response.data;
    } catch (error) {
      console.error('Error submitting onboarding answer:', error);
      throw error;
    }
  }
}

export const onboardingService = new OnboardingService();
export default onboardingService; 