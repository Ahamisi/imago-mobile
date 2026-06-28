import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface MicrophoneIconProps {
  size?: number;
  color?: string;
}

export const MicrophoneIcon: React.FC<MicrophoneIconProps> = ({ 
  size = 24, 
  color = '#000000' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z"
        fill={color}
      />
      <Path
        d="M19 10V12C19 16.42 15.42 20 11 20H13C17.42 20 21 16.42 21 12V10H19Z"
        fill={color}
      />
      <Path
        d="M5 10V12C5 16.42 8.58 20 13 20H11C6.58 20 3 16.42 3 12V10H5Z"
        fill={color}
      />
      <Path
        d="M11 22H13V24H11V22Z"
        fill={color}
      />
    </Svg>
  );
};

export const MicrophoneOffIcon: React.FC<MicrophoneIconProps> = ({ 
  size = 24, 
  color = '#000000' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 11H17.3C17.3 11.74 17.14 12.43 16.87 13.05L18.1 14.28C18.66 13.3 19 12.19 19 11Z"
        fill={color}
      />
      <Path
        d="M14.98 11.17C14.98 11.11 15 11.06 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V5.18L14.98 11.17Z"
        fill={color}
      />
      <Path
        d="M4.27 3L21 19.73L19.73 21L15.54 16.81C14.77 17.27 13.91 17.58 13 17.72V21H11V17.72C7.72 17.23 5 14.41 5 11H7C7 13.76 9.24 16 12 16C12.81 16 13.55 15.79 14.21 15.41L4.27 3Z"
        fill={color}
      />
    </Svg>
  );
};