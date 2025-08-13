/**
 * Imago MUm - Main App Component
 * AI Ultrasound Interpretation & Care Coordination
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import Notification, { NotificationRef } from './src/components/common/Notification';

const notificationRef = React.createRef<NotificationRef>();

export const showNotification = (message: string, type: 'success' | 'error') => {
  notificationRef.current?.show(message, type);
}

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
        <Notification ref={notificationRef} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
