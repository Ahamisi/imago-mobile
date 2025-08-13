import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';
import { MoreIcon } from '../../../components/icons/MoreIcon'; // Assuming you have a MoreIcon

interface Scan {
  id: string;
  type: 'pdf' | 'image';
  name: string;
  date: string;
}

interface ScanHistoryProps {
  scans: Scan[];
}

const ScanHistoryItem = ({ item }: { item: Scan }) => (
  <View style={styles.itemContainer}>
    <Image 
      source={item.type === 'pdf' ? require('../../../assets/pdf-icon.png') : require('../../../assets/scan-icon.png')}
      style={styles.itemIcon}
    />
    <View style={styles.itemInfo}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemDate}>{item.date}</Text>
    </View>
    <TouchableOpacity>
      <MoreIcon />
    </TouchableOpacity>
  </View>
);

const ScanHistory: React.FC<ScanHistoryProps> = ({ scans }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan History</Text>
      {scans.length > 0 ? (
        <FlatList
          data={scans}
          renderItem={({ item }) => <ScanHistoryItem item={item} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Image 
            source={require('../../../assets/no-scans-icon.png')}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>You have not taken any scan</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[6],
    flex: 1,
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing[4],
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing[4],
    marginBottom: Spacing[2],
  },
  itemIcon: {
    width: 40,
    height: 40,
    marginRight: Spacing[4],
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  itemDate: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: Spacing[4],
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
});

export default ScanHistory;
