import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface NewChatIconProps {
  size?: number;
  color?: string;
}

export const NewChatIcon: React.FC<NewChatIconProps> = ({
  size = 24,
  color = '#1997D4'
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 12C8 13.1046 7.10457 14 6 14C4.89543 14 4 13.1046 4 12C4 10.8954 4.89543 10 6 10C7.10457 10 8 10.8954 8 12Z"
        fill={color}
      />
      <Path
        d="M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z"
        fill={color}
      />
      <Path
        d="M20 12C20 13.1046 19.1046 14 18 14C16.8954 14 16 13.1046 16 12C16 10.8954 16.8954 10 18 10C19.1046 10 20 10.8954 20 12Z"
        fill={color}
      />
      <Path
        d="M21 6C21 3.79086 19.2091 2 17 2H7C4.79086 2 3 3.79086 3 6V14C3 16.2091 4.79086 18 7 18H8L12 22L16 18H17C19.2091 18 21 16.2091 21 14V6Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
    </Svg>
  );
}; 