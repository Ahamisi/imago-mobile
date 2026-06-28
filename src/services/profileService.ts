import apiClient from './apiClient';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt: string;
  onboarding: {
    isCompleted: boolean;
    currentStep: number;
    completedAt: string;
    isSkipped: boolean;
    answers: any;
  };
  pregnancyInfo: {
    pregnancyStage: string;
    currentTrimester: string;
    expectedDueDate: string;
    lastPeriodDate: string;
    lmpDate: string;
   edd: string;
   gestationalAge: string;
   trimester: string;
   eddFormatted: string;
  } | null;
  avatar?: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber: string;
  lastPeriodDate?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

class ProfileService {
  // Get user profile
  async getUserProfile(): Promise<UserProfile> {
    console.log('Fetching user profile...');
    
    try {
      const response = await apiClient.get('/users/profile');
      console.log('Profile response:', response.data);
      return response.data.data.user;
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      
      // Mock data for demo if backend unavailable
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        console.log('Backend unavailable, returning mock profile');
        return {
          id: '819a2f7a-b61b-41a9-bb39-df1eb4ec5ff4',
          fullName: 'Test User',
          email: 'test@imagomum.com',
          phoneNumber: '1234567890',
          isVerified: true,
          isActive: true,
          lastLoginAt: '2025-08-15T08:38:43.772Z',
          onboarding: {
            isCompleted: true,
            currentStep: 1,
            completedAt: '2025-07-29T13:52:03.761Z',
            isSkipped: false,
            answers: {}
          },
          pregnancyInfo: null
        };
      }
      
      throw error;
    }
  }

  // Update user profile
  async updateProfile(data: UpdateProfileRequest): Promise<void> {
    console.log('Updating profile:', data);
    
    try {
      const response = await apiClient.put('/users/profile', data, {
        headers: {
          'X-Skip-Success-Notification': 'true'
        }
      });
      console.log('Profile updated successfully:', response.data);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      
      // Mock success for demo if backend unavailable
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        console.log('Backend unavailable, simulating profile update');
        return;
      }
      
      throw error;
    }
  }

  // Change password
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    console.log('Changing password...');
    
    try {
      const response = await apiClient.put('/users/change-password', data, {
        headers: {
          'X-Skip-Success-Notification': 'true'
        }
      });
      console.log('Password changed successfully:', response.data);
    } catch (error: any) {
      console.error('Failed to change password:', error);
      
      // Mock success for demo if backend unavailable
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        console.log('Backend unavailable, simulating password change');
        return;
      }
      
      throw error;
    }
  }

  // Validate password strength
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const profileService = new ProfileService();
export default profileService;
