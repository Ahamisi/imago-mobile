import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing } from '../../../theme';
import { CameraIcon, UploadIcon, DeviceIcon } from '../../../components/icons';

interface ActionButtonProps {
  icon: React.ReactNode;
  text: string;
  onPress: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    {icon}
    <Text style={[Typography.bodySmall, styles.actionText]}>{text}</Text>
  </TouchableOpacity>
);

interface ActionsProps {
  navigation: any;
}

const Actions: React.FC<ActionsProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ActionButton
        icon={<CameraIcon size={24} />}
        text="Take a scan photo"
        onPress={() => navigation.navigate('Camera')}
      />
      <ActionButton
        icon={<UploadIcon size={24} />}
        text="Upload a scan file"
        onPress={() => navigation.navigate('Camera', {
          screen: 'Upload',
        })}
      />
      <ActionButton
        icon={<DeviceIcon size={24} />}
        text="Scan with ImagoX"
        onPress={() => {
          // TODO: Navigate to device scan screen
          console.log('Device scan');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[6],
    marginVertical: Spacing[6],
    gap: Spacing[3],
  },
  actionButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F2F2F2',
    padding: Spacing[4],
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  actionText: {
    color: Colors.text.primary,
    flexWrap: 'wrap',
  },
});

export default Actions;
