import React from 'react';
import Svg, { Path } from 'react-native-svg';

const SparkleIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"
      fill={color}
    />
    <Path
      d="M19 19L19.5 21.5L22 22L19.5 22.5L19 25L18.5 22.5L16 22L18.5 21.5L19 19Z"
      fill={color}
    />
    <Path
      d="M5 19L5.5 21.5L8 22L5.5 22.5L5 25L4.5 22.5L2 22L4.5 21.5L5 19Z"
      fill={color}
    />
  </Svg>
);

export default SparkleIcon;

