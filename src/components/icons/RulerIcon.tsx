import React from 'react';
import Svg, { Path } from 'react-native-svg';

const RulerIcon = ({ size = 24, color = '#6B7280' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3L21 21M3 8V3H8M16 21H21V16"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default RulerIcon; 