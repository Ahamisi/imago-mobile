/**
 * Secure Storage Utilities
 * Handle token storage and retrieval
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  AUTH_TOKEN: '@imagomum_auth_token',
  REFRESH_TOKEN: '@imagomum_refresh_token',
  USER_DATA: '@imagomum_user_data',
  TOKENS_DATA: '@imagomum_tokens_data',
} as const;

export interface TokensData {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface UserData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isVerified: boolean;
}

export class StorageService {
  // Store auth tokens
  static async storeTokens(tokensData: TokensData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, tokensData.accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokensData.refreshToken);
      await AsyncStorage.setItem(STORAGE_KEYS.TOKENS_DATA, JSON.stringify(tokensData));
      console.log('Tokens stored successfully');
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }

  // Get auth token
  static async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Get refresh token
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  // Get all tokens data
  static async getTokensData(): Promise<TokensData | null> {
    try {
      const tokensData = await AsyncStorage.getItem(STORAGE_KEYS.TOKENS_DATA);
      return tokensData ? JSON.parse(tokensData) : null;
    } catch (error) {
      console.error('Error getting tokens data:', error);
      return null;
    }
  }

  // Store user data
  static async storeUserData(userData: UserData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      console.log('User data stored successfully:', userData);
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  }

  // Get user data
  static async getUserData(): Promise<UserData | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Clear all stored data (logout)
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.TOKENS_DATA,
      ]);
      console.log('All stored data cleared');
    } catch (error) {
      console.error('Error clearing stored data:', error);
      throw error;
    }
  }

  // Check if user is logged in
  static async isLoggedIn(): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const userData = await this.getUserData();
      return !!(token && userData);
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  // Initialize auth service with stored tokens on app start
  static async initializeAuth(): Promise<{
    isAuthenticated: boolean;
    userData: UserData | null;
    tokensData: TokensData | null;
  }> {
    try {
      const userData = await this.getUserData();
      const tokensData = await this.getTokensData();
      
      return {
        isAuthenticated: !!(userData && tokensData),
        userData,
        tokensData,
      };
    } catch (error) {
      console.error('Error initializing auth:', error);
      return {
        isAuthenticated: false,
        userData: null,
        tokensData: null,
      };
    }
  }
}

export default StorageService; 