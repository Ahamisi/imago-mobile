import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme';
import Header from './components/Header';
import Actions from './components/Actions';
import ScanHistory from './components/ScanHistory';
import StorageService from '../../utils/storage';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [userName, setUserName] = useState<string>('User');

  useEffect(() => {
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const userData = await StorageService.getUserData();
      if (userData?.fullName) {
        // Extract first name from full name
        const firstName = userData.fullName.split(' ')[0];
        setUserName(firstName);
      }
    } catch (error) {
      console.error('Failed to load user name:', error);
      // Keep default "User" if failed
    }
  };

  const handleScanPress = (scanId: string) => {
    navigation.navigate('ScanResult', { scanId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header userName={userName} />
      <Actions navigation={navigation} />
      <ScanHistory onScanPress={handleScanPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
});

export default HomeScreen;
