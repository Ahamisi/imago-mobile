import apiClient from './apiClient';

class OnboardingService {
  async getStatus() {
    try {
      console.log('📡 Fetching onboarding status...');
      const response = await apiClient.get('/onboarding/status');
      console.log('✅ Onboarding status response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching onboarding status:', error);
      console.error('❌ Status code:', error.response?.status);
      console.error('❌ Error message:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  async submitAnswer(payload: { questionId: string; answerType: 'exact_date' | 'approximate_month'; answer: string | { month: number; year: number } }) {
    try {
      console.log('📤 Submitting onboarding answer:', payload);
      const response = await apiClient.post('/onboarding/submit', payload);
      console.log('✅ Onboarding submit response received:', response.data);
      console.log('📊 Response status:', response.status);
      console.log('📋 Response headers:', response.headers);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error submitting onboarding answer:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  }
}

export const onboardingService = new OnboardingService();
export default onboardingService; 