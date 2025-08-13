import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../theme';

interface CheckIconProps {
  size?: number;
  color?: string;
}

export const CheckIcon: React.FC<CheckIconProps> = ({ size = 28, color = Colors.success }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path
        d="M14 0.666748C6.63649 0.666748 0.666626 6.63635 0.666626 14.0001C0.666626 21.3638 6.63649 27.3334 14 27.3334C21.3642 27.3334 27.3333 21.3638 27.3333 14.0001C27.3333 6.63635 21.364 0.666748 14 0.666748ZM11.5541 20.8491L5.68316 14.9785L7.63996 13.0217L11.5541 16.9355L20.36 8.12941L22.3168 10.0862L11.5541 20.8491Z"
        fill={color}
      />
    </Svg>
  );
};

export default CheckIcon; 