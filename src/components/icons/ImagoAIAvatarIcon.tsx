import React from 'react';
import Svg, { Rect, Path, G, Defs, RadialGradient, Stop } from 'react-native-svg';

interface ImagoAIAvatarIconProps {
  size?: number;
}

export const ImagoAIAvatarIcon: React.FC<ImagoAIAvatarIconProps> = ({
  size = 80
}) => {
  return (
    <Svg width={size} height={size + 1} viewBox="0 0 80 81" fill="none">
      <Defs>
        <RadialGradient id="paint0_radial_86_18377" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(40 35) rotate(90) scale(33)">
          <Stop stopColor="#CFDE3A"/>
          <Stop offset="0.557692" stopColor="#66A578"/>
          <Stop offset="1" stopColor="#1277A8"/>
        </RadialGradient>
      </Defs>
      <G>
        <Rect x="7" y="2" width="66" height="66" rx="33" fill="url(#paint0_radial_86_18377)"/>
        <Path d="M38.6803 23.0127C39.0659 21.6939 40.9341 21.6939 41.3197 23.0127L43.5222 30.544C43.6539 30.9941 44.0059 31.3461 44.456 31.4778L51.9873 33.6803C53.3061 34.0659 53.3061 35.9341 51.9873 36.3197L44.456 38.5222C44.0059 38.6539 43.6539 39.0059 43.5222 39.456L41.3197 46.9873C40.9341 48.3061 39.0659 48.3061 38.6803 46.9873L36.4778 39.456C36.3461 39.0059 35.9941 38.6539 35.544 38.5222L28.0127 36.3197C26.6939 35.9341 26.6939 34.0659 28.0127 33.6803L35.544 31.4778C35.9941 31.3461 36.3461 30.9941 36.4778 30.544L38.6803 23.0127Z" fill="#D9D9D9" opacity="0.5"/>
      </G>
    </Svg>
  );
}; 