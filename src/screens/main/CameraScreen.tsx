import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import { Colors, Typography, Spacing } from '../../theme';
import {
  CloseIcon,
  FlashOnIcon,
  FlashOffIcon,
  UploadIcon as UploadImageIcon,
  AddFileIcon,
} from '../../components/icons';
import ProgressStageIcon from '../../components/icons/ProgressStageIcon';
import { launchImageLibrary } from 'react-native-image-picker';
import {pick, types} from '@react-native-documents/picker';
import { ultrasoundService, UploadProgress } from '../../services/ultrasoundService';
import UploadProgressModal from './components/UploadProgressModal';
import AIScanningIndicator from './components/AIScanningIndicator';

const CameraScreen = ({ navigation }: any) => {
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const isFocused = useIsFocused();

  const [hasPermission, setHasPermission] = useState(false);
  const [flash, setFlash] = useState<'on' | 'off'>('off');
  const [photo, setPhoto] = useState<any>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [showAIIndicator, setShowAIIndicator] = useState(false);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      console.log('Camera permission status:', status);
      console.log('Camera device:', device);
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        setHasPermission(true);
      }
    })();
  }, [navigation, device]);

  const onTakePicture = async () => {
    if (camera.current && device) {
      try {
        const file = await camera.current.takePhoto({ flash });
        setPhoto(file);
        setShowAIIndicator(true);
        setTimeout(() => {
          uploadFile({
            uri: `file://${file.path}`,
            type: 'image/jpeg',
            name: 'scan.jpg',
          });
        }, 2000);
      } catch (error) {
        console.error('Camera error:', error);
        Alert.alert('Camera Error', 'Failed to take photo. This feature requires a physical device.');
      }
    } else {
      Alert.alert('Camera Not Available', 'Camera is not available on this device/simulator.');
    }
  };
  
  const handleImagePicker = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        maxWidth: 1024,
        maxHeight: 1024,
      });
      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        uploadFile({
          uri: file.uri || '',
          type: file.type || 'image/jpeg',
          name: file.fileName || 'image.jpg',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await pick({
        type: [types.allFiles],
      });
      if (result && result.length > 0) {
        const file = result[0];
        uploadFile({
          uri: file.uri,
          type: file.type || 'application/octet-stream',
          name: file.name || 'document',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document.');
    }
  };

  const uploadFile = async (file: { uri: string; type: string; name: string }) => {
    console.log('Starting upload process for file:', file);
    setShowAIIndicator(false);
    setIsUploading(true);
    setUploadProgress({ stage: 'uploading', progress: 10, message: 'Preparing upload...' });
    
    // Small delay to ensure UI updates
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const scan = await ultrasoundService.uploadScan(file, (progress) => {
        console.log('Upload progress:', progress);
        setUploadProgress(progress);
      });
      console.log('Upload completed, scan:', scan);

      // Navigate to result screen immediately - let ScanResultScreen handle its own loading
      navigation.replace('ScanResult', { scanId: scan.id });
    } catch (error: any) {
      console.error('Upload failed:', error);
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed. Please try again.';
      Alert.alert('Upload Failed', errorMessage);
      
      // On failure, reset the state so the user can try again.
      setIsUploading(false);
      setUploadProgress(null);
      setPhoto(null);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.white} />
        <Text style={styles.guidanceText}>Requesting Camera Permission...</Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.guidanceText}>
          {/* Camera not available on this simulator.{'\n'}
          Please test on a physical device or use{'\n'} */}
          {/* "Upload Image" and "Add a file" options. */}
        </Text>
        <View style={styles.simulatorButtons}>
          <TouchableOpacity style={styles.simulatorButton} onPress={handleImagePicker}>
            <UploadImageIcon />
            <Text style={styles.simulatorButtonText}>Upload image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.simulatorButton} onPress={handleDocumentPicker}>
            <AddFileIcon />
            <Text style={styles.simulatorButtonText}>Add a file</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>

        {/* PROGRESS OVERLAY FOR SIMULATOR */}
        {isUploading && uploadProgress && (
          <View style={styles.progressOverlay}>
            <View style={styles.progressModal}>
              <View style={styles.progressContent}>
                <ProgressStageIcon stage={uploadProgress.stage} size={40} />
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressTitle}>Please wait...</Text>
                  <Text style={styles.progressMessage}>{uploadProgress.message}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {photo ? (
        <Image source={{ uri: `file://${photo.path}` }} style={StyleSheet.absoluteFill} />
      ) : (
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isFocused}
          photo={true}
        />
      )}
      
      {/* Camera Controls Overlay */}
      {!isUploading && (
        <View style={styles.overlay}>
          <SafeAreaView style={styles.topControls}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <CloseIcon />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFlash(flash === 'on' ? 'off' : 'on')}>
              {flash === 'on' ? <FlashOnIcon /> : <FlashOffIcon />}
            </TouchableOpacity>
          </SafeAreaView>

          {!photo && (
            <View style={styles.guidanceContainer}>
              <Text style={styles.guidanceText}>Please, ensure to capture image well</Text>
            </View>
          )}

          {showAIIndicator && <AIScanningIndicator />}

          {!photo && (
            <SafeAreaView style={styles.bottomControls}>
              <TouchableOpacity style={styles.sideButton} onPress={handleImagePicker}>
                <UploadImageIcon />
                <Text style={styles.sideButtonText}>Upload image</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shutterButton} onPress={onTakePicture} />
              <TouchableOpacity style={styles.sideButton} onPress={handleDocumentPicker}>
                <AddFileIcon />
                <Text style={styles.sideButtonText}>Add a file</Text>
              </TouchableOpacity>
            </SafeAreaView>
          )}
        </View>
      )}

      {/* Upload Progress Overlay - HIGHEST PRIORITY */}
      {isUploading && uploadProgress && (() => {
        console.log('🔥 RENDERING PROGRESS OVERLAY:', { isUploading, uploadProgress });
        return (
          <View style={styles.progressOverlay}>
            <View style={styles.progressModal}>
              <View style={styles.progressContent}>
                <ProgressStageIcon stage={uploadProgress.stage} size={40} />
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressTitle}>Please wait...</Text>
                  <Text style={styles.progressMessage}>{uploadProgress.message}</Text>
                </View>
              </View>
            </View>
          </View>
        );
      })()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing[4],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[6],
  },
  guidanceContainer: {
    position: 'absolute',
    top: '15%',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: 8,
  },
  guidanceText: {
    color: 'white',
    ...Typography.body,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Spacing[4],
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FAF3E3',
    borderWidth: 4,
    borderColor: '#007AFF',
  },
  sideButton: {
    alignItems: 'center',
    gap: Spacing[1],
  },
  sideButtonText: {
    color: 'white',
    ...Typography.bodySmall,
  },
  simulatorButtons: {
    flexDirection: 'row',
    gap: Spacing[8],
    marginTop: Spacing[6],
  },
  simulatorButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: 8,
    gap: Spacing[2],
  },
  simulatorButtonText: {
    color: 'white',
    ...Typography.bodySmall,
  },
  backButton: {
    marginTop: Spacing[6],
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    ...Typography.button,
  },
  progressOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.75)', // Semi-transparent white for blur effect
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999, // For Android
  },
  progressModal: {
    backgroundColor: Colors.white,
    padding: Spacing[6],
    borderRadius: 16,
    width: '90%', // 90% width with automatic margins
    marginHorizontal: '5%', // 5% on each side for spacing
  },
  progressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  progressTextContainer: {
    flex: 1,
  },
  progressTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing[1],
  },
  progressMessage: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.gray[200],
    borderRadius: 2,
    marginTop: Spacing[3],
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary[500],
    borderRadius: 2,
  },
  progressPercentage: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginTop: Spacing[2],
  },
});

export default CameraScreen; 