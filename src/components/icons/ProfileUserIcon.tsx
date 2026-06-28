/**
 * Profile User Icon - User/Person Icon
 */

import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface ProfileUserIconProps {
  size?: number;
  color?: string;
}

export const ProfileUserIcon: React.FC<ProfileUserIconProps> = ({
  size = 16,
  color = '#8E8E8E',
}) => (
  <Svg width={size} height={size} viewBox="0 0 16 17" fill="none">
    <Path
      d="M7.99998 1.83398C6.25331 1.83398 4.83331 3.25398 4.83331 5.00065C4.83331 6.71398 6.17331 8.10065 7.91998 8.16065C7.97331 8.15398 8.02665 8.15398 8.06665 8.16065C8.07998 8.16065 8.08665 8.16065 8.09998 8.16065C8.10665 8.16065 8.10665 8.16065 8.11331 8.16065C9.81998 8.10065 11.16 6.71398 11.1666 5.00065C11.1666 3.25398 9.74665 1.83398 7.99998 1.83398Z"
      fill={color}
    />
    <Path
      d="M11.3867 9.93293C9.52667 8.69293 6.49334 8.69293 4.62 9.93293C3.77334 10.4996 3.30667 11.2663 3.30667 12.0863C3.30667 12.9063 3.77334 13.6663 4.61334 14.2263C5.54667 14.8529 6.77334 15.1663 8.00001 15.1663C9.22667 15.1663 10.4533 14.8529 11.3867 14.2263C12.2267 13.6596 12.6933 12.8996 12.6933 12.0729C12.6867 11.2529 12.2267 10.4929 11.3867 9.93293Z"
      fill={color}
    />
  </Svg>
);

export default ProfileUserIcon;
