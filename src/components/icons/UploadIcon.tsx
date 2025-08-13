import React from 'react';
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Colors } from '../../theme';

interface UploadIconProps {
  size?: number;
  color?: string;
}

export const UploadIcon: React.FC<UploadIconProps> = ({ size = 24, color = Colors.primary[500] }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 25 24" fill="none">
      <Path 
        d="M21.3503 7.99175C21.7481 8.55833 21.2739 9.25 20.5816 9.25H3.33334C2.78106 9.25 2.33334 8.80228 2.33334 8.25V6.42C2.33334 3.98 4.31334 2 6.75334 2H9.07334C10.7033 2 11.2133 2.53 11.8633 3.4L13.2633 5.26C13.5733 5.67 13.6133 5.72 14.1933 5.72H16.9833C18.7879 5.72 20.385 6.61709 21.3503 7.99175Z" 
        fill="url(#paint0_radial_558_5117)"
      />
      <Path 
        d="M22.3167 11.7466C22.3149 11.1957 21.8677 10.75 21.3167 10.75L3.33334 10.75C2.78106 10.75 2.33334 11.1977 2.33334 11.75V16.65C2.33334 19.6 4.73334 22 7.68334 22H16.9833C19.9333 22 22.3333 19.6 22.3333 16.65L22.3167 11.7466ZM14.8733 16.97L12.7233 18.85C12.6133 18.95 12.4733 19 12.3333 19C12.1933 19 12.0533 18.95 11.9433 18.85L9.79334 16.97C9.11334 16.37 9.02334 15.35 9.59334 14.64C10.1633 13.92 11.1933 13.79 11.9333 14.34L12.3333 14.64L12.7333 14.34C13.4733 13.79 14.5033 13.92 15.0733 14.64C15.6433 15.35 15.5533 16.37 14.8733 16.97Z" 
        fill="url(#paint1_radial_558_5117)"
      />
      <Defs>
        <RadialGradient 
          id="paint0_radial_558_5117" 
          cx="0" 
          cy="0" 
          r="1" 
          gradientUnits="userSpaceOnUse" 
          gradientTransform="translate(12.1683 5.625) rotate(90) scale(3.625 9.835)"
        >
          <Stop stopColor="#FFA272" />
          <Stop offset="1" stopColor="#C44E0E" />
        </RadialGradient>
        <RadialGradient 
          id="paint1_radial_558_5117" 
          cx="0" 
          cy="0" 
          r="1" 
          gradientUnits="userSpaceOnUse" 
          gradientTransform="translate(12.3333 16.375) rotate(90) scale(5.625 10)"
        >
          <Stop stopColor="#FFA272" />
          <Stop offset="1" stopColor="#C44E0E" />
        </RadialGradient>
      </Defs>
    </Svg>
  );
};

export default UploadIcon;
