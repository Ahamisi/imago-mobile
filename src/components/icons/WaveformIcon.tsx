import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface WaveformIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const WaveformIcon: React.FC<WaveformIconProps> = ({
  width = 343,
  height = 40,
  color = '#0A3C55'
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 343 40" fill="none">
      <Rect y="16" width="2" height="8" rx="1" fill={color} />
      <Rect x="11" y="16" width="2" height="8" rx="1" fill={color} />
      <Rect x="22" y="16" width="2" height="8" rx="1" fill={color} />
      <Rect x="33" y="13" width="2" height="14" rx="1" fill={color} />
      <Rect x="44" y="13" width="2" height="14" rx="1" fill={color} />
      <Rect x="55" y="8" width="2" height="24" rx="1" fill={color} />
      <Rect x="66" y="8" width="2" height="24" rx="1" fill={color} />
      <Rect x="77" width="2" height="40" rx="1" fill={color} />
      <Rect x="88" y="8" width="2" height="24" rx="1" fill={color} />
      <Rect x="99" y="8" width="2" height="24" rx="1" fill={color} />
      <Rect x="110" y="13" width="2" height="14" rx="1" fill={color} />
      <Rect x="121" y="13" width="2" height="14" rx="1" fill={color} />
      <Rect x="132" y="13" width="2" height="14" rx="1" fill={color} />
      <Rect x="143" y="13" width="2" height="14" rx="1" fill={color} />
      <Rect x="154" y="13" width="2" height="14" rx="1" fill={color} />
      <Rect x="165" y="13" width="2" height="14" rx="1" fill={color} />
      <Rect x="176" y="16" width="2" height="8" rx="1" fill={color} />
      <Rect x="187" y="16" width="2" height="8" rx="1" fill={color} />
      <Rect x="198" y="16" width="2" height="8" rx="1" fill={color} />
      <Rect x="209" y="13" width="2" height="14" rx="1" fill={color} />
      <Rect x="220" y="13" width="2" height="14" rx="1" fill={color} />
      <Rect x="231" y="8" width="2" height="24" rx="1" fill={color} />
      <Rect x="242" y="8" width="2" height="24" rx="1" fill={color} />
      <Rect x="253" width="2" height="40" rx="1" fill={color} />
      <Rect x="264" y="8" width="2" height="24" rx="1" fill={color} />
      <Rect x="275" y="8" width="2" height="24" rx="1" fill={color} />
      <Rect x="286" y="13" width="2" height="14" rx="1" fill={color} />
      <Rect x="297" y="13" width="2" height="14" rx="1" fill={color} />
      <Rect x="308" y="13" width="2" height="14" rx="1" fill={color} />
      <Rect x="319" y="13" width="2" height="14" rx="1" fill={color} />
      <Rect x="330" y="13" width="2" height="14" rx="1" fill={color} />
      <Rect x="341" y="13" width="2" height="14" rx="1" fill={color} />
    </Svg>
  );
}; 