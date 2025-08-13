import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { Colors, Typography, Spacing } from '../../theme';
import { ultrasoundService, UploadProgress } from '../../services/ultrasoundService';
import { UploadIcon, CameraIcon, DeviceIcon } from '../../components/icons';
import UploadProgressModal from './components/UploadProgressModal';

interface UploadScanScreenProps {
  navigation: any;
}

const UploadScanScreen: React.FC<UploadScanScreenProps> = ({ navigation }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const handleImagePicker = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.9,
        includeBase64: false,
      },
      (response: ImagePickerResponse) => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          uploadFile({
            uri: asset.uri!,
            type: asset.type!,
            name: asset.fileName || 'scan.jpg',
          });
        }
      }
    );
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
        copyTo: 'documentDirectory',
      });

      const file = result[0];
      uploadFile({
        uri: file.fileCopyUri || file.uri,
        type: file.type,
        name: file.name,
      });
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Error', 'Failed to select file');
      }
    }
  };

  const uploadFile = async (file: { uri: string; type: string; name: string }) => {
    setIsUploading(true);
    setUploadProgress({ stage: 'uploading', progress: 0, message: 'Preparing upload...' });

    try {
      const scan = await ultrasoundService.uploadScan(file, (progress) => {
        setUploadProgress(progress);
      });

      // Navigate to scan result screen
      navigation.navigate('ScanResult', { scanId: scan.id });
    } catch (error) {
      Alert.alert('Upload Failed', 'Please try again or contact support');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[Typography.h3, styles.backButton]}>←</Text>
        </TouchableOpacity>
        <Text style={[Typography.h3, styles.title]}>Upload Scan</Text>
      </View>

      <View style={styles.content}>
        <Text style={[Typography.h2, styles.mainTitle]}>Upload your scan</Text>
        <Text style={[Typography.body, styles.subtitle]}>
          Choose a scan image or PDF file from your device
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.option} onPress={handleImagePicker}>
            <View style={styles.optionIcon}>
              <CameraIcon size={32} />
            </View>
            <Text style={[Typography.h3, styles.optionTitle]}>Photo Gallery</Text>
            <Text style={[Typography.body, styles.optionSubtitle]}>
              Select from your photos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleDocumentPicker}>
            <View style={styles.optionIcon}>
              <UploadIcon size={32} />
            </View>
            <Text style={[Typography.h3, styles.optionTitle]}>Browse Files</Text>
            <Text style={[Typography.body, styles.optionSubtitle]}>
              Choose PDF or image files
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={[Typography.bodySmall, styles.infoText]}>
            Supported formats: JPG, PNG, PDF
          </Text>
          <Text style={[Typography.bodySmall, styles.infoText]}>
            Maximum file size: 50MB
          </Text>
        </View>
      </View>

      <UploadProgressModal
        visible={isUploading}
        progress={uploadProgress}
        onClose={() => {
          setIsUploading(false);
          setUploadProgress(null);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
    color: Colors.text.primary,
    marginRight: Spacing[4],
  },
  title: {
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[8],
  },
  mainTitle: {
    color: Colors.text.primary,
    marginBottom: Spacing[2],
  },
  subtitle: {
    color: Colors.text.secondary,
    marginBottom: Spacing[8],
  },
  optionsContainer: {
    gap: Spacing[4],
    marginBottom: Spacing[8],
  },
  option: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    padding: Spacing[6],
    alignItems: 'center',
  },
  optionIcon: {
    marginBottom: Spacing[4],
  },
  optionTitle: {
    color: Colors.text.primary,
    marginBottom: Spacing[2],
  },
  optionSubtitle: {
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  infoText: {
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default UploadScanScreen; 