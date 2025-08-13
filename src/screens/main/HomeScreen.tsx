import React, { useState } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme';
import Header from './components/Header';
import Actions from './components/Actions';
import ScanHistory from './components/ScanHistory';

const mockScans: { id: string; type: 'pdf' | 'image'; name: string; date: string; }[] = [
  { id: '1', type: 'pdf', name: 'Scan Report', date: 'June 24, 2025' },
  { id: '2', type: 'image', name: 'Scan Report', date: 'June 24, 2025' },
  { id: '3', type: 'pdf', name: 'Scan Report', date: 'June 24, 2025' },
  { id: '4', type: 'pdf', name: 'Scan Report', date: 'June 24, 2025' },
  { id: '5', type: 'image', name: 'Scan Report', date: 'June 24, 2025' },
];

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [hasScans, setHasScans] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Header userName="Halimah" />
      <Actions navigation={navigation} />
      <ScanHistory scans={hasScans ? mockScans : []} />
      <View style={styles.toggleContainer}>
        <Switch value={hasScans} onValueChange={setHasScans} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  toggleContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});

export default HomeScreen;
