import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.button,
    variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
    disabled && styles.disabledButton,
    style,
  ];

  const buttonTextStyle = [
    Typography.button,
    variant === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText,
    disabled && styles.disabledButtonText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon && icon}
      <Text style={[buttonTextStyle, {fontSize: 14}]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    height: 52,
    borderRadius: 26, // More rounded as requested (50% of height)
    borderWidth: 1,
    paddingHorizontal: Spacing[6],
  },
  primaryButton: {
    backgroundColor: '#1997D4', // Imago blue color
    borderColor: '#1997D4',
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderColor: '#1997D4', // Blue border
  },
  primaryButtonText: {
    color: Colors.white,
  },
  secondaryButtonText: {
    color: '#1997D4', // Blue text
  },
  disabledButton: {
    backgroundColor: Colors.gray[200],
    borderColor: Colors.gray[300],
  },
  disabledButtonText: {
    color: Colors.gray[400],
  },
});

export default Button; 