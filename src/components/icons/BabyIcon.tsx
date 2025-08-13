import React from 'react';
import Svg, { Path } from 'react-native-svg';

const BabyIcon = ({ size = 24, color = '#6B7280' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.686 2 6 4.686 6 8C6 11.314 8.686 14 12 14C15.314 14 18 11.314 18 8C18 4.686 15.314 2 12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 14C9.791 14 8 15.791 8 18V22H16V18C16 15.791 14.209 14 12 14Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default BabyIcon; 