import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { Colors } from '../../theme';

interface CalendarIconProps {
  size?: number;
  color?: string;
}

const CalendarIcon: React.FC<CalendarIconProps> = ({ size = 24, color = Colors.text.secondary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
        d="M8 2V5" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeMiterlimit="10" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    />
    <Path 
        d="M16 2V5" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeMiterlimit="10" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    />
    <Path 
        d="M3.5 9.09H20.5" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeMiterlimit="10" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    />
    <Path 
        d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeMiterlimit="10" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    />
    <Path 
        d="M15.6947 13.7H15.7037" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    />
    <Path 
        d="M15.6947 16.7H15.7037" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    />
    <Path 
        d="M12.0002 13.7H12.0092" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    />
    <Path 
        d="M12.0002 16.7H12.0092" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    />
    <Path 
        d="M8.29431 13.7H8.30331" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    />
    <Path 
        d="M8.29431 16.7H8.30331" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    />
  </Svg>
);

export default CalendarIcon; 