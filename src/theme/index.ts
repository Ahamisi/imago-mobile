/**
 * Theme System Entry Point
 */

export {Colors, type ColorType} from './colors';
export {Spacing, type SpacingKey} from './spacing';
export {Typography, FontFamily, type TypographyVariant} from './typography';

// Common border radius values
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
} as const; 