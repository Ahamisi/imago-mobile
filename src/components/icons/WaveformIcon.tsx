import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface WaveformIconProps {
  size?: number;
  color?: string;
  animated?: boolean;
}

export const WaveformIcon: React.FC<WaveformIconProps> = ({ 
  size = 24, 
  color = '#000000',
  animated = false 
}) => {
  const bars = [
    { height: 4, delay: 0 },
    { height: 8, delay: 0.1 },
    { height: 12, delay: 0.2 },
    { height: 16, delay: 0.3 },
    { height: 8, delay: 0.4 },
    { height: 12, delay: 0.5 },
    { height: 6, delay: 0.6 },
    { height: 14, delay: 0.7 },
    { height: 10, delay: 0.8 },
  ];

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {bars.map((bar, index) => (
        <Rect
          key={index}
          x={index * 2.5 + 1}
          y={12 - bar.height / 2}
          width={1.5}
          height={bar.height}
          fill={color}
          opacity={animated ? 0.7 : 1}
        />
      ))}
    </Svg>
  );
};

export const SoundWaveIcon: React.FC<WaveformIconProps> = ({ 
  size = 24, 
  color = '#000000' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="10" width="2" height="4" fill={color} />
      <Rect x="6" y="8" width="2" height="8" fill={color} />
      <Rect x="10" y="6" width="2" height="12" fill={color} />
      <Rect x="14" y="8" width="2" height="8" fill={color} />
      <Rect x="18" y="10" width="2" height="4" fill={color} />
    </Svg>
  );
};