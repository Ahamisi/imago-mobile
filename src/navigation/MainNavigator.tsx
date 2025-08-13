import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import CameraScreen from '../screens/main/CameraScreen';
import ScanResultScreen from '../screens/main/ScanResultScreen';

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="ScanResult" component={ScanResultScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
