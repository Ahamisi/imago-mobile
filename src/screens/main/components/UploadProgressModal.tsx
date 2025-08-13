import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { Colors, Typography, Spacing } from '../../../theme';
import { UploadProgress } from '../../../services/ultrasoundService';
import FetusIcon from '../../../components/icons/FetusIcon';
import HeartbeatIcon from '../../../components/icons/HeartbeatIcon';
import GestationalAgeIcon from '../../../components/icons/GestationalAgeIcon';
import ScanReadyIcon from '../../../components/icons/ScanReadyIcon';

interface UploadProgressModalProps {
  visible: boolean;
  progress: UploadProgress | null;
  onClose: () => void;
}

const UploadProgressModal: React.FC<UploadProgressModalProps> = ({
  visible,
  progress,
  onClose,
}) => {
  if (!visible || !progress) {
    return null;
  }

  const getIconForStage = (stage: UploadProgress['stage']) => {
    switch (stage) {
      case 'uploading':
        return <FetusIcon />;
      case 'processing':
        return <HeartbeatIcon />;
      case 'analyzing':
        return <GestationalAgeIcon />;
      case 'completed':
        return <ScanReadyIcon />;
      default:
        return <FetusIcon />;
    }
  };

  const displayIcon = getIconForStage(progress.stage);
  const displayMessage = progress.message;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            {displayIcon}
          </View>
          <View style={styles.textContainer}>
            <Text style={[Typography.h3, styles.title]}>Please wait..</Text>
            <Text style={[Typography.body, styles.message]}>{displayMessage}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
  },
  modal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing[4],
    width: '100%',
    maxWidth: 340,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing[4],
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.text.primary,
    marginBottom: Spacing[1],
  },
  message: {
    color: Colors.text.secondary,
  },
});

export default UploadProgressModal; 