/**
 * Navigation Type Definitions
 * TypeScript interfaces for React Navigation
 */

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  SignUp: undefined;
  Login: undefined;
  OTPVerification: undefined;
  OnboardingFlow: undefined;
  Auth: undefined;
  Main: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  Features: undefined;
  Permissions: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  OTPVerification: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Scan: undefined;
  Tips: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  ScanHistory: undefined;
  Emergency: undefined;
  FindClinics: undefined;
};

export type ScanStackParamList = {
  ScanScreen: undefined;
  ScanResults: undefined;
  UploadFile: undefined;
  AIAnalysis: undefined;
};

export type TipsStackParamList = {
  TipsScreen: undefined;
  TipDetail: undefined;
  TipCategories: undefined;
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: undefined;
  AIAssistant: undefined;
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  Settings: undefined;
  HealthRecords: undefined;
  PregnancyInfo: undefined;
}; 