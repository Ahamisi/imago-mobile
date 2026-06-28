/**
 * Navigation Service
 * Provides global navigation functionality for services like apiClient
 */

import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

// Global state setter for the RootNavigator
let globalSetCurrentScreen: ((screen: any) => void) | null = null;
let globalSetUserData: ((userData: any) => void) | null = null;
let globalSetAuthToken: ((token: string) => void) | null = null;

export function setNavigationHandlers(
  setCurrentScreen: (screen: any) => void,
  setUserData: (userData: any) => void,
  setAuthToken: (token: string) => void
) {
  globalSetCurrentScreen = setCurrentScreen;
  globalSetUserData = setUserData;
  globalSetAuthToken = setAuthToken;
}

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  }
}

export function reset(routeName: string) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: routeName as never }],
    });
  }
}

// Global logout function that can be called from anywhere
export function handleGlobalLogout() {
  console.log('🚪 Global logout triggered - redirecting to login');
  
  // Clear any stored tokens
  import('../utils/storage').then(({ default: StorageService }) => {
    StorageService.clearAuthToken();
    StorageService.clearUserData();
  });
  
  // Clear app state
  if (globalSetUserData) {
    globalSetUserData(null);
  }
  if (globalSetAuthToken) {
    globalSetAuthToken('');
  }
  
  // Navigate to login screen using the state-based navigation
  if (globalSetCurrentScreen) {
    globalSetCurrentScreen('login');
  }
}
