import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/main/HomeScreen';
import ChatScreen from '../screens/main/ChatScreen';
import TipsScreen from '../screens/main/TipsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import AudioRecordingScreen from '../screens/main/AudioRecordingScreen';
import { ScanIcon, ChatIcon, TipsIcon, ProfileIcon, MicrophoneIcon } from '../components/icons';
import { Colors } from '../theme';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Scan') {
            return <ScanIcon focused={focused} />;
          } else if (route.name === 'Audio') {
            return <MicrophoneIcon size={size} color={color} />;
          } else if (route.name === 'Chat') {
            return <ChatIcon focused={focused} />;
          } else if (route.name === 'Tips') {
            return <TipsIcon focused={focused} />;
          } else if (route.name === 'Profile') {
            return <ProfileIcon focused={focused} />;
          }
        },
        tabBarActiveTintColor: Colors.primary[500],
        tabBarInactiveTintColor: Colors.text.secondary,
      })}
    >
      <Tab.Screen name="Scan" component={HomeScreen} />
      {/* <Tab.Screen name="Audio" component={AudioRecordingScreen} /> */}
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Tips" component={TipsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
