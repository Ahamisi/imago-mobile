/**
 * Authentication Service
 * Refactored to use a centralized apiClient.
 */
import {SignUpPayload} from '../screens/SignUpScreen';
import StorageService from '../utils/storage';
import apiClient from './apiClient';

export interface SignUpResponse {
  status: 'success' | 'fail';
  message: string;
  data?: {
    userId: string;
    email: string;
    phoneNumber: string;
    otpSent: boolean;
    otpExpiresAt: string;
  };
}

export interface VerifyOTPResponse {
  status: 'success' | 'fail';
  message: string;
  data?: {
    user: {
      id: string;
      fullName: string;
      email: string;
      phoneNumber: string;
      isVerified: boolean;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
    };
  };
}

export interface ResendOTPResponse {
  status: 'success' | 'fail';
  message: string;
  data?: {
    otpSent: boolean;
    otpExpiresAt: string;
  };
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Initialize with stored tokens
    this.initialize();
  }

  // Format axios errors into user-friendly messages
  private formatError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;
      
      // Always prioritize the backend message if available
      if (data?.message) {
        return new Error(data.message);
      }
      
      // Fallback to status-specific messages
      switch (status) {
        case 400:
          return new Error('Invalid request. Please check your input.');
        case 401:
          return new Error('Authentication failed. Please login again.');
        case 404:
          return new Error('Service not found. Please check if the server is running.');
        case 409:
          return new Error('A conflict occurred. Please check your input and try again.');
        case 500:
          return new Error('Server error. Please try again later.');
        default:
          return new Error(`Request failed with status ${status}`);
      }
    } else if (error.request) {
      // Network error
      if (error.code === 'ECONNABORTED') {
        return new Error('Request timeout. Please check your internet connection.');
      }
      return new Error('Cannot connect to server. Please check your internet connection.');
    } else {
      // Request setup error
      return new Error(error.message || 'An unexpected error occurred.');
    }
  }

  // Initialize auth service with stored tokens
  async initialize() {
    try {
      const authData = await StorageService.initializeAuth();
      if (authData.isAuthenticated && authData.tokensData) {
        this.accessToken = authData.tokensData.accessToken;
        this.refreshToken = authData.tokensData.refreshToken;
        console.log('✅ Auth service initialized with stored tokens');
      } else {
        console.log('ℹ️ No stored auth tokens found');
      }
      return authData;
    } catch (error) {
      console.error('❌ Error initializing auth service:', error);
      return { isAuthenticated: false, userData: null, tokensData: null };
    }
  }

  // Store auth tokens and user data
  async setTokensAndUser(tokensData: any, userData: any) {
    try {
      this.accessToken = tokensData.accessToken;
      this.refreshToken = tokensData.refreshToken;
      
      // Store in AsyncStorage
      await StorageService.storeTokens(tokensData);
      await StorageService.storeUserData(userData);
      
      console.log('✅ Tokens and user data stored successfully');
    } catch (error) {
      console.error('❌ Error storing tokens and user data:', error);
    }
  }

  // Get stored access token
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Get stored refresh token
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  // Test connection to backend
  async testConnection(): Promise<boolean> {
    try {
      await apiClient.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Sign up user
  async signUp(payload: SignUpPayload): Promise<SignUpResponse> {
    try {
      const signUpPayload = {
        fullName: payload.fullName,
        email: payload.email,
        phoneNumber: payload.phone,
        password: payload.password,
        confirmPassword: payload.password,
      };

      console.log('📝 Attempting signup...');
      
      const response = await apiClient.post<SignUpResponse>('/auth/signup', signUpPayload);
      return response.data;
    } catch (error) {
      console.error('❌ SignUp Error:', error);
      // Format the error to extract the backend message
      throw this.formatError(error);
    }
  }

  // Verify OTP
  async verifyOTP(email: string, otp: string): Promise<VerifyOTPResponse> {
    try {
      const payload = { otp, email };
      
      console.log('🔐 Verifying OTP...');
      
      const response = await apiClient.post<VerifyOTPResponse>('/auth/verify-otp', payload);
      
      // Store tokens and user data if verification successful
      if (response.data.status === 'success' && response.data.data?.tokens && response.data.data?.user) {
        await this.setTokensAndUser(response.data.data.tokens, response.data.data.user);
      }

      return response.data;
    } catch (error) {
      console.error('❌ OTP Verification Error:', error);
      throw error;
    }
  }

  // Resend OTP
  async resendOTP(email: string): Promise<ResendOTPResponse> {
    try {
      const payload = { email };
      
      console.log('📧 Resending OTP...');
      
      const response = await apiClient.post<ResendOTPResponse>('/auth/resend-otp', payload);
      return response.data;
    } catch (error) {
      console.error('❌ Resend OTP Error:', error);
      throw error;
    }
  }

  // Login user
  async login(email: string, password: string): Promise<VerifyOTPResponse> {
    try {
      const payload = { email, password };
      
      console.log('🔑 Logging in...');
      
      const response = await apiClient.post<VerifyOTPResponse>('/auth/login', payload);
      
      // Store tokens and user data if login successful
      if (response.data.status === 'success' && response.data.data?.tokens && response.data.data.user) {
        await this.setTokensAndUser(response.data.data.tokens, response.data.data.user);
      }

      return response.data;
    } catch (error) {
      console.error('❌ Login Error:', error);
      // Format the error to extract the backend message
      throw this.formatError(error);
    }
  }

  // Refresh access token
  async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('🔄 Refreshing access token...');

      const response = await apiClient.post('/auth/refresh', {}, {
        headers: {
          'Authorization': `Bearer ${this.refreshToken}`,
        },
      });
      
      if (response.data.status === 'success' && response.data.data?.tokens) {
        this.accessToken = response.data.data.tokens.accessToken;
        this.refreshToken = response.data.data.tokens.refreshToken;
        
        // Update stored tokens
        await StorageService.storeTokens(response.data.data.tokens);
        
        console.log('✅ Token refresh successful');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Token Refresh Error:', error);
      return false;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      console.log('👋 Logging out...');
      
      // Call logout endpoint to invalidate token on server
      try {
        await apiClient.post('/auth/logout');
        console.log('✅ Server logout successful');
      } catch (error) {
        console.warn('⚠️ Server logout failed, continuing with local logout:', error);
        // Continue with local logout even if server call fails
      }
      
      // Clear local tokens
      this.accessToken = null;
      this.refreshToken = null;
      
      // Clear stored data
      await StorageService.clearAll();
      
      console.log('✅ User logged out, all data cleared');
    } catch (error) {
      console.error('❌ Logout Error:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Get user profile (protected endpoint example)
  async getUserProfile() {
    try {
      console.log('👤 Fetching user profile...');
      const response = await apiClient.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('❌ Get User Profile Error:', error);
      throw error;
    }
  }

  // Generic authenticated request method
  async authenticatedRequest(endpoint: string, options: any = {}) {
    try {
      const response = await apiClient({
        url: endpoint,
        ...options,
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Authenticated Request Error (${endpoint}):`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService; 