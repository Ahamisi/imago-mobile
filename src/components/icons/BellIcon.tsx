import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../theme';

interface BellIconProps {
  size?: number;
  color?: string;
}

export const BellIcon: React.FC<BellIconProps> = ({ size = 24, color = Colors.text.primary }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <Path d="M8.01338 1.93994C5.80671 1.93994 4.01338 3.73327 4.01338 5.93994V7.86661C4.01338 8.27327 3.84005 8.89327 3.63338 9.23994L2.86671 10.5133C2.39338 11.2999 2.72005 12.1733 3.58671 12.4666C6.46005 13.4266 9.56005 13.4266 12.4334 12.4666C13.24 12.1999 13.5934 11.2466 13.1534 10.5133L12.3867 9.23994C12.1867 8.89327 12.0134 8.27327 12.0134 7.86661V5.93994C12.0134 3.73994 10.2134 1.93994 8.01338 1.93994Z" stroke="black" stroke-width="0.666667" stroke-miterlimit="10" stroke-linecap="round"/>
        <Path d="M9.24666 2.13346C9.03999 2.07346 8.82666 2.02679 8.60666 2.00012C7.96666 1.92012 7.35332 1.96679 6.77999 2.13346C6.97332 1.64012 7.45332 1.29346 8.01332 1.29346C8.57332 1.29346 9.05332 1.64012 9.24666 2.13346Z" stroke="black" stroke-width="0.666667" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
        <Path d="M10.0133 12.7065C10.0133 13.8065 9.11334 14.7065 8.01334 14.7065C7.46668 14.7065 6.96001 14.4799 6.60001 14.1199C6.24001 13.7599 6.01334 13.2532 6.01334 12.7065" stroke="black" stroke-width="0.666667" stroke-miterlimit="10"/>
    </Svg>
  );
};




export default BellIcon;
