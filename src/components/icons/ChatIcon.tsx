import React from 'react';
import { Colors } from '../../theme';
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';


interface ChatIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

export const ChatIcon: React.FC<ChatIconProps> = ({ size = 24, color = Colors.text.secondary, focused }) => {
  const iconColor = focused ? Colors.primary[500] : color;
  return (
    <Svg width={size} height={size} viewBox="0 0 25 24" fill={iconColor}>
      <Path d="M12.25 22.81C11.56 22.81 10.91 22.46 10.45 21.85L8.95 19.85C8.92 19.81 8.8 19.76 8.75 19.75H8.25C4.08 19.75 1.5 18.62 1.5 13V8C1.5 3.58 3.83 1.25 8.25 1.25H16.25C20.67 1.25 23 3.58 23 8V13C23 17.42 20.67 19.75 16.25 19.75H15.75C15.67 19.75 15.6 19.79 15.55 19.85L14.05 21.85C13.59 22.46 12.94 22.81 12.25 22.81ZM8.25 2.75C4.67 2.75 3 4.42 3 8V13C3 17.52 4.55 18.25 8.25 18.25H8.75C9.26 18.25 9.84 18.54 10.15 18.95L11.65 20.95C12 21.41 12.5 21.41 12.85 20.95L14.35 18.95C14.68 18.51 15.2 18.25 15.75 18.25H16.25C19.83 18.25 21.5 16.58 21.5 13V8C21.5 4.42 19.83 2.75 16.25 2.75H8.25Z" fill={iconColor}/>
      <Path d="M12.25 12C11.69 12 11.25 11.55 11.25 11C11.25 10.45 11.7 10 12.25 10C12.8 10 13.25 10.45 13.25 11C13.25 11.55 12.81 12 12.25 12Z" fill={iconColor}/>
      <Path d="M16.25 12C15.69 12 15.25 11.55 15.25 11C15.25 10.45 15.7 10 16.25 10C16.8 10 17.25 10.45 17.25 11C17.25 11.55 16.81 12 16.25 12Z" fill={iconColor}/>
      <Path d="M8.25 12C7.69 12 7.25 11.55 7.25 11C7.25 10.45 7.7 10 8.25 10C8.8 10 9.25 10.45 9.25 11C9.25 11.55 8.81 12 8.25 12Z" fill={iconColor}/>
    </Svg> 

  );
};



export default ChatIcon;
