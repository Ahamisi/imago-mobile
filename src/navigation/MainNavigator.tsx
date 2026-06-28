import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import CameraScreen from '../screens/main/CameraScreen';
import ScanResultScreen from '../screens/main/ScanResultScreen';
import TipStoryViewer from '../screens/main/TipStoryViewer';
import { MainStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="ScanResult" component={ScanResultScreen} />
      <Stack.Screen 
        name="TipStoryViewer" 
        component={TipStoryViewer}
        options={{
          presentation: 'fullScreenModal',
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
