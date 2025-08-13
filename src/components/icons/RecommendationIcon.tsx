import React from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const RecommendationIcon = ({ size = 24, color = '#34C759' }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
  <Path d="M2.92495 7.22515C2.58657 6.21001 1.78999 5.41343 0.774852 5.07505C-0.258284 4.73067 -0.258284 3.26933 0.774852 2.92495C1.78999 2.58657 2.58657 1.78999 2.92495 0.774852C3.26933 -0.258284 4.73067 -0.258284 5.07505 0.774852C5.41343 1.78999 6.21001 2.58657 7.22515 2.92495C8.25828 3.26933 8.25828 4.73067 7.22515 5.07505C6.21001 5.41343 5.41343 6.21001 5.07505 7.22515C4.73067 8.25828 3.26933 8.25828 2.92495 7.22515Z" fill="url(#paint0_linear_754_4709)"/>
  <Path d="M11.1187 18.644C10.5265 16.8675 9.13248 15.4735 7.35599 14.8813C5.548 14.2787 5.548 11.7213 7.35599 11.1187C9.13248 10.5265 10.5265 9.13248 11.1187 7.35599C11.7213 5.548 14.2787 5.548 14.8813 7.35599C15.4735 9.13248 16.8675 10.5265 18.644 11.1187C20.452 11.7213 20.452 14.2787 18.644 14.8813C16.8675 15.4735 15.4735 16.8675 14.8813 18.644C14.2787 20.452 11.7213 20.452 11.1187 18.644Z" fill="url(#paint1_linear_754_4709)"/>
  <Defs>
  <LinearGradient id="paint0_linear_754_4709" x1="10" y1="0" x2="10" y2="20" gradientUnits="userSpaceOnUse">
  <Stop stopColor="#4FC6FF"/>
  <Stop offset="0.524038" stopColor="#41A3D3"/>
  <Stop offset="1" stopColor="#1B88BD"/>
  </LinearGradient>
  <LinearGradient id="paint1_linear_754_4709" x1="10" y1="0" x2="10" y2="20" gradientUnits="userSpaceOnUse">
  <Stop stopColor="#4FC6FF"/>
  <Stop offset="0.524038" stopColor="#41A3D3"/>
  <Stop offset="1" stopColor="#1B88BD"/>
  </LinearGradient>
  </Defs>
  </Svg>
  
);

export default RecommendationIcon; 