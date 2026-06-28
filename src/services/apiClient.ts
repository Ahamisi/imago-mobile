import axios, { AxiosError } from 'axios';
import { showNotification } from '../../App';
import StorageService from '../utils/storage';
import { handleGlobalLogout } from './navigationService';

const apiClient = axios.create({
  baseURL: 'https://imagomum-backend.agreeablebeach-10200fd5.eastus2.azurecontainerapps.io/api/v1',
  // baseURL: 'http://172.20.10.3:3000/api/v1',
  // baseURL: 'https://dev-api.myigarage.com/api/v1',
  
  // Don't set default Content-Type - let each request set its own
});

apiClient.interceptors.request.use(async (config) => {
  const token = await StorageService.getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Set Content-Type for JSON requests only (not FormData)
  if (config.data && !(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
    console.log('🔧 Setting Content-Type: application/json for regular request');
  } else if (config.data instanceof FormData) {
    console.log('📁 FormData detected - letting axios set Content-Type with boundary');
  }
  
  console.log('📡 Request headers:', config.headers);
  
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // Check if we should skip showing success notifications
    const skipNotification = response.config.headers?.['X-Skip-Success-Notification'];
    
    if (response.data && response.data.status === 'success' && !skipNotification) {
      showNotification(response.data.message, 'success');
    }
    return response;
  },
  (error: AxiosError) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      const responseData = error.response.data as { message?: string, status?: string };
      
      // Handle 401 Unauthorized - token expired or invalid
      if (error.response.status === 401) {
        // Don't auto-logout for login/signup requests - let them handle their own 401s
        const isAuthRequest = error.config?.url?.includes('/auth/login') || 
                             error.config?.url?.includes('/auth/signup') ||
                             error.config?.url?.includes('/auth/verify-otp');
        
        if (!isAuthRequest) {
          console.log('🔐 401 Unauthorized - Token expired, logging out...');
          handleGlobalLogout();
          return Promise.reject(error); // Don't show notification for 401, just logout
        } else {
          console.log('🔐 401 Unauthorized on auth request - letting auth service handle it');
          // Let the auth service handle login/signup 401 errors - don't show notification
          return Promise.reject(error);
        }
      }
      
      if (responseData.message) {
        errorMessage = responseData.message;
      }
    } else if (error.request) {
      errorMessage = 'No response from the server. Please check your connection.';
    } else {
      errorMessage = error.message;
    }

    showNotification(errorMessage, 'error');
    return Promise.reject(error);
  }
);

export default apiClient; 