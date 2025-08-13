import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface PDFIconProps {
  size?: number;
}

export const PDFIcon: React.FC<PDFIconProps> = ({
  size = 20
}) => {
  const height = (size * 24) / 20; // Maintain aspect ratio
  
  return (
    <Svg width={size} height={height} viewBox="0 0 20 24" fill="none">
      <Path d="M16 0L20 4V23C20 23.5523 19.5523 24 19 24H1C0.447715 24 1.61065e-08 23.5523 0 23V1C2.57704e-07 0.447715 0.447715 8.0532e-09 1 0H16Z" fill="#E4E7EC"/>
      <Path d="M20 4H16V0L20 4Z" fill="#98A2B3"/>
    </Svg>
  );
}; 