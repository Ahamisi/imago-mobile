import React from 'react';
import Svg, { Path } from 'react-native-svg';

const HeartbeatIcon = ({ size = 24, color = '#EC4899' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 12H6L9 3L15 21L18 12H21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default HeartbeatIcon; 