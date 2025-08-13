/**
 * Typography System
 * Using system fonts as fallback until Gilroy fonts are properly installed
 */

import {TextStyle, Platform} from 'react-native';

// Font Family - Using system fonts as fallback until Gilroy is properly installed
export const FontFamily = {
  GilroyBold: 'Gilroy-Bold',
  GilroyRegular: 'Gilroy-Regular',
  GilroyMedium: 'Gilroy-Medium',
  GilroySemiBold: 'Gilroy-SemiBold',
  GilroyLight: 'Gilroy-Light',
  GilroyHeavy: 'Gilroy-Heavy',
  GilroyBlack: 'Gilroy-Black',
  GilroyThin: 'Gilroy-Thin',
  GilroyRegularItalic: 'Gilroy-RegularItalic',
  GilroyMediumItalic: 'Gilroy-MediumItalic',
} as const;

export const Typography = {
  // Display styles
  display: {
    fontSize: 48,
    fontFamily: FontFamily.GilroyHeavy,
    fontWeight: '800' as const,
    lineHeight: 56,
  } as TextStyle,

  // Heading styles
  h1: {
    fontSize: 32,
    fontFamily: FontFamily.GilroyBold,
    fontWeight: '700' as const,
    lineHeight: 40,
  } as TextStyle,

  h2: {
    fontSize: 28,
    fontFamily: FontFamily.GilroyBold,
    fontWeight: '700' as const,
    lineHeight: 36,
  } as TextStyle,

  h3: {
    fontSize: 14,
    fontFamily: FontFamily.GilroyMedium,
    fontWeight: '500' as const,
    lineHeight: 32,
  } as TextStyle,

  // Body styles
  bodyLarge: {
    fontSize: 18,
    fontFamily: FontFamily.GilroyRegular,
    fontWeight: '400' as const,
    lineHeight: 28,
  } as TextStyle,

  body: {
    fontSize: 12,
    fontFamily: FontFamily.GilroyRegular,
    fontWeight: '400' as const,
    lineHeight: 24,
  } as TextStyle,

  bodySmall: {
    fontSize: 14,
    fontFamily: FontFamily.GilroyRegular,
    fontWeight: '400' as const,
    lineHeight: 20,
  } as TextStyle,

  // Button styles
  buttonLarge: {
    fontSize: 18,
    fontFamily: FontFamily.GilroySemiBold,
    fontWeight: '600' as const,
    lineHeight: 24,
  } as TextStyle,

  button: {
    fontSize: 16,
    fontFamily: FontFamily.GilroySemiBold,
    fontWeight: '600' as const,
    lineHeight: 20,
  } as TextStyle,

  // Caption
  caption: {
    fontSize: 12,
    fontFamily: FontFamily.GilroyRegular,
    fontWeight: '400' as const,
    lineHeight: 16,
  } as TextStyle,
} as const;

export type TypographyVariant = keyof typeof Typography; 