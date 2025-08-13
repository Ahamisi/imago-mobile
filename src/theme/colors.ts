/**
 * Imago MUm Color System
 * Based on maternal healthcare blue theme
 */

export const Colors = {
  // Primary Colors - ImagoMUm Blue
  primary: {
    50: '#E8F5FC',
    100: '#C2E5F8',
    200: '#95D4F3',
    300: '#69C3EE',
    400: '#47B8EA',
    500: '#1997D4', // Main brand blue
    600: '#1788BF',
    700: '#1475A5',
    800: '#11628C',
    900: '#0E5073',
  },

  // Secondary Colors - ImagoMUm Green
  secondary: {
    50: '#F7F8E5',
    100: '#ECEFBF',
    200: '#E0E694',
    300: '#D4DD6A',
    400: '#C7D44D',
    500: '#8A9800', // Main brand green
    600: '#7C8900',
    700: '#6B7600',
    800: '#5A6300',
    900: '#495000',
  },

  // Neutral Grays - For text, backgrounds, and borders
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Text Colors
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    dark: 'rgba(0, 0, 0, 0.6)', // For overlay on images
  },

  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Common Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorType = typeof Colors; 