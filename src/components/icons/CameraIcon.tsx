import React from 'react';
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Colors } from '../../theme';

interface CameraIconProps {
  size?: number;
  color?: string;
}

export const CameraIcon: React.FC<CameraIconProps> = ({ size = 20, color = Colors.primary[500] }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path 
        d="M16 4C15.39 4 14.83 3.65 14.55 3.11L13.83 1.66C13.37 0.75 12.17 0 11.15 0H8.86001C7.83002 0 6.63001 0.75 6.17001 1.66L5.45001 3.11C5.17001 3.65 4.61001 4 4.00002 4C1.83001 4 0.110015 5.83 0.250015 7.99L0.770015 16.25C0.890015 18.31 2.00002 20 4.76002 20H15.24C18 20 19.1 18.31 19.23 16.25L19.75 7.99C19.89 5.83 18.17 4 16 4ZM8.50002 5.25H11.5C11.91 5.25 12.25 5.59 12.25 6C12.25 6.41 11.91 6.75 11.5 6.75H8.50002C8.09002 6.75 7.75001 6.41 7.75001 6C7.75001 5.59 8.09002 5.25 8.50002 5.25ZM10 16.12C8.14002 16.12 6.62001 14.61 6.62001 12.74C6.62001 10.87 8.13002 9.36 10 9.36C11.87 9.36 13.38 10.87 13.38 12.74C13.38 14.61 11.86 16.12 10 16.12Z" 
        fill="url(#paint0_radial_558_2250)"
      />
      <Defs>
        <RadialGradient 
          id="paint0_radial_558_2250" 
          cx="0" 
          cy="0" 
          r="1" 
          gradientUnits="userSpaceOnUse" 
          gradientTransform="translate(10 10) rotate(90) scale(10 9.75798)"
        >
          <Stop stopColor="#1997D4" />
          <Stop offset="1" stopColor="#1277A8" />
        </RadialGradient>
      </Defs>
    </Svg>
  );
};

export default CameraIcon;


