import React from 'react';
import Svg, { Rect, Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';

interface StopRecordingIconProps {
  size?: number;
}

export const StopRecordingIcon: React.FC<StopRecordingIconProps> = ({
  size = 64
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Defs>
        <LinearGradient id="paint0_linear_86_18722" x1="69" y1="40" x2="38" y2="46" gradientUnits="userSpaceOnUse">
          <Stop stopColor="white" stopOpacity="0"/>
          <Stop offset="1" stopColor="#1071A0"/>
        </LinearGradient>
        <RadialGradient id="paint1_radial_86_18722" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(32 32) rotate(90) scale(24)">
          <Stop stopColor="#1997D4"/>
          <Stop offset="0.413462" stopColor="#4FA9D4"/>
          <Stop offset="1" stopColor="#1277A8"/>
        </RadialGradient>
      </Defs>
      <Rect x="0.5" y="0.5" width="63" height="63" rx="31.5" fill="#C4DFEC" fillOpacity="0.2"/>
      <Rect x="0.5" y="0.5" width="63" height="63" rx="31.5" stroke="url(#paint0_linear_86_18722)"/>
      <Rect x="8" y="8" width="48" height="48" rx="24" fill="url(#paint1_radial_86_18722)"/>
      <Rect x="23" y="23" width="18" height="18" rx="4" fill="white" fillOpacity="0.8"/>
    </Svg>
  );
}; 