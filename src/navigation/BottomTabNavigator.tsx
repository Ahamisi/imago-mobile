import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/main/HomeScreen';
import ChatScreen from '../screens/main/ChatScreen';
import { ScanIcon, ChatIcon, TipsIcon, ProfileIcon } from '../components/icons';
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
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Tips" component={HomeScreen} />
      <Tab.Screen name="Profile" component={HomeScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
