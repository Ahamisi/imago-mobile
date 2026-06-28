import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface PlaybackIconProps {
  size?: number;
  color?: string;
}

export const PlayIcon: React.FC<PlaybackIconProps> = ({ 
  size = 24, 
  color = '#000000' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 5V19L19 12L8 5Z"
        fill={color}
      />
    </Svg>
  );
};

export const PauseIcon: React.FC<PlaybackIconProps> = ({ 
  size = 24, 
  color = '#000000' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 4H10V20H6V4Z"
        fill={color}
      />
      <Path
        d="M14 4H18V20H14V4Z"
        fill={color}
      />
    </Svg>
  );
};

export const StopIcon: React.FC<PlaybackIconProps> = ({ 
  size = 24, 
  color = '#000000' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 6H18V18H6V6Z"
        fill={color}
      />
    </Svg>
  );
};

export const VolumeIcon: React.FC<PlaybackIconProps> = ({ 
  size = 24, 
  color = '#000000' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9V15H7L12 20V4L7 9H3Z"
        fill={color}
      />
      <Path
        d="M16.5 12C16.5 10.23 15.48 8.71 14 7.97V16.02C15.48 15.29 16.5 13.77 16.5 12Z"
        fill={color}
      />
      <Path
        d="M14 3.23V5.29C16.89 6.15 19 8.83 19 12C19 15.17 16.89 17.85 14 18.71V20.77C18.01 19.86 21 16.28 21 12C21 7.72 18.01 4.14 14 3.23Z"
        fill={color}
      />
    </Svg>
  );
};

