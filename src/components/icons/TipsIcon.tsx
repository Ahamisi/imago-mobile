import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../theme';


interface TipsIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

export const TipsIcon: React.FC<TipsIconProps> = ({ size = 24, color = Colors.text.secondary, focused }) => {
  const iconColor = focused ? Colors.primary[500] : '#828282';
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill={iconColor}>
      <Path d="M7.413 15H12.086M9.75 1V2M16.114 3.636L15.407 4.343M18.75 10H17.75M1.75 10H0.75M4.093 4.343L3.386 3.636M6.214 13.536C5.51487 12.8367 5.0388 11.9458 4.84598 10.9759C4.65316 10.006 4.75225 9.00076 5.13073 8.08721C5.50921 7.17366 6.15007 6.39284 6.97229 5.84349C7.7945 5.29414 8.76115 5.00093 9.75 5.00093C10.7389 5.00093 11.7055 5.29414 12.5277 5.84349C13.3499 6.39284 13.9908 7.17366 14.3693 8.08721C14.7477 9.00076 14.8468 10.006 14.654 10.9759C14.4612 11.9458 13.9851 12.8367 13.286 13.536L12.738 14.083C12.4247 14.3964 12.1762 14.7683 12.0067 15.1777C11.8372 15.5871 11.7499 16.0259 11.75 16.469V17C11.75 17.5304 11.5393 18.0391 11.1642 18.4142C10.7891 18.7893 10.2804 19 9.75 19C9.21957 19 8.71086 18.7893 8.33579 18.4142C7.96071 18.0391 7.75 17.5304 7.75 17V16.469C7.75 15.574 7.394 14.715 6.762 14.083L6.214 13.536Z" stroke={iconColor} stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    </Svg>
  );
};





export default TipsIcon;
