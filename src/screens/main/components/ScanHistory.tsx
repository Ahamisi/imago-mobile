import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';
import { MoreIcon } from '../../../components/icons/MoreIcon';
import BabyScanIcon from '../../../components/icons/BabyScanIcon';
import DeleteIcon from '../../../components/icons/DeleteIcon';
import RenameIcon from '../../../components/icons/RenameIcon';
import { ultrasoundService, ScanHistoryItem, PaginatedScans } from '../../../services/ultrasoundService';

interface ScanHistoryProps {
  onScanPress?: (scanId: string) => void;
}

const ScanHistoryItemComponent = ({ 
  item, 
  onPress, 
  onOptionsPress 
}: { 
  item: ScanHistoryItem; 
  onPress: () => void;
  onOptionsPress: () => void;
}) => (
  <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
    <BabyScanIcon size={40} />
    <View style={styles.itemInfo}>
      <Text style={styles.itemName}>Scan Report</Text>
      <Text style={styles.itemDate}>
        {new Date(item.scanDate).toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })}
      </Text>
    </View>
    <TouchableOpacity onPress={onOptionsPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <MoreIcon />
    </TouchableOpacity>
  </TouchableOpacity>
);

const OptionsModal = ({ 
  visible, 
  onClose, 
  onDelete, 
  scanId 
}: { 
  visible: boolean; 
  onClose: () => void; 
  onDelete: (scanId: string) => void;
  scanId: string;
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Options</Text>
        
        <TouchableOpacity style={[styles.optionItem, styles.disabledOption]} disabled>
          <RenameIcon size={20} color={Colors.gray[400]} />
          <Text style={[styles.optionText, styles.disabledText]}>Rename Scan</Text>
        </TouchableOpacity>
        
        <View style={styles.modalSeparator} />
        
        <TouchableOpacity 
          style={[styles.optionItem, styles.deleteOption]} 
          onPress={() => {
            onClose();
            onDelete(scanId);
          }}
        >
          <DeleteIcon size={20} />
          <Text style={styles.deleteText}>Delete Scan</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </Modal>
);

const ScanHistory: React.FC<ScanHistoryProps> = ({ onScanPress }) => {
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  const loadScans = async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const result = await ultrasoundService.getScanHistory(page, 10);
      
      if (append) {
        setScans(prev => [...prev, ...result.scans]);
      } else {
        setScans(result.scans);
      }
      
      setPagination(result.pagination);
    } catch (err: any) {
      console.error('Failed to load scan history:', err);
      setError('Failed to load scan history. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination.hasNextPage && !loadingMore) {
      loadScans(pagination.currentPage + 1, true);
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ultrasoundService.archiveScan(scanId);
              // Remove the scan from the list
              setScans(prev => prev.filter(scan => scan.id !== scanId));
              Alert.alert('Success', 'Scan deleted successfully');
            } catch (err: any) {
              console.error('Failed to delete scan:', err);
              Alert.alert('Error', 'Failed to delete scan. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleScanPress = (scanId: string) => {
    if (onScanPress) {
      onScanPress(scanId);
    }
  };

  const handleOptionsPress = (scanId: string) => {
    setSelectedScanId(scanId);
    setShowOptionsModal(true);
  };

  useEffect(() => {
    loadScans();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Scan History</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.loadingText}>Loading scan history...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Scan History</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadScans()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan History</Text>
      {scans.length > 0 ? (
        <FlatList
          data={scans}
          renderItem={({ item }) => (
            <ScanHistoryItemComponent
              item={item}
              onPress={() => handleScanPress(item.id)}
              onOptionsPress={() => handleOptionsPress(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={Colors.primary[500]} />
                <Text style={styles.loadMoreText}>Loading more...</Text>
              </View>
            ) : null
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <BabyScanIcon size={64} color={Colors.gray[400]} />
          <Text style={styles.emptyText}>You have not taken any scan</Text>
        </View>
      )}
      
      <OptionsModal
        visible={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        onDelete={handleDeleteScan}
        scanId={selectedScanId || ''}
      />
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
    gap: Spacing[2],
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing[2],
  },
  loadingText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing[4],
    paddingHorizontal: Spacing[4],
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing[4],
    gap: Spacing[2],
  },
  loadMoreText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing[6],
    width: '100%',
    paddingBottom: Spacing[8],
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing[6],
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[4],
    gap: Spacing[3],
  },
  disabledOption: {
    opacity: 0.5,
  },
  deleteOption: {
    marginTop: Spacing[2],
  },
  modalSeparator: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: Spacing[4],
  },
  optionText: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  disabledText: {
    color: Colors.gray[400],
  },
  deleteText: {
    ...Typography.body,
    color: '#EF4444',
    fontWeight: '600' as const,
  },
});

export default ScanHistory;
