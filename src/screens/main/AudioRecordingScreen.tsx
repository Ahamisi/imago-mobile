import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import {
  MicrophoneIcon,
  MicrophoneOffIcon,
  WaveformIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  SettingsIcon,
  ModelIcon,
  LanguageIcon,
} from '../../components/icons';
import bareRNAudioService, { 
  BareRNAudioConfig, 
  BareRNAudioCallbacks 
} from '../../services/bareRNAudioService';

const { width: screenWidth } = Dimensions.get('window');

interface TranscriptItem {
  id: string;
  text: string;
  type: 'interim' | 'final' | 'status' | 'error';
  timestamp: number;
}

const AudioRecordingScreen: React.FC = () => {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Transcript state
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [currentInterim, setCurrentInterim] = useState('');
  
  // Configuration state
  const [config, setConfig] = useState<BareRNAudioConfig>({
    model: 'nova-3',
    language: 'en-US',
    sampleRate: 16000
  });
  const [showSettings, setShowSettings] = useState(false);
  
  // Animation state
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveformAnim = useRef(new Animated.Value(0)).current;
  
  // Refs
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setupAudioService();
    
    return () => {
      bareRNAudioService.disconnect();
    };
  }, []); // Only run once on mount
  
  useEffect(() => {
    // Periodic connection check
    const connectionCheckInterval = setInterval(() => {
      if (isConnected && !bareRNAudioService.isWebSocketConnected()) {
        console.log('🔍 Connection check: WebSocket disconnected');
        setIsConnected(false);
        addTranscript('Connection lost - please reconnect', 'error');
      }
    }, 5000); // Check every 5 seconds
    
    return () => {
      clearInterval(connectionCheckInterval);
    };
  }, [isConnected]);

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
      startWaveformAnimation();
    } else {
      stopAnimations();
    }
  }, [isRecording]);

  const setupAudioService = () => {
    const callbacks: BareRNAudioCallbacks = {
      onConnected: () => {
        console.log('🎵 Connected to bare RN audio service');
        setIsConnected(true);
        setIsConnecting(false);
        addTranscript('Connected to AI voice assistant', 'status');
      },
      
      onDisconnected: () => {
        console.log('🔌 Disconnected from bare RN audio service');
        setIsConnected(false);
        setIsRecording(false);
        addTranscript('Disconnected from voice assistant', 'status');
      },
      
      onTranscriptionReceived: (transcript: string, isFinal: boolean) => {
        if (isFinal) {
          console.log('✅ Final transcript:', transcript);
          setCurrentInterim('');
          addTranscript(`You: ${transcript}`, 'final');
          scrollToBottom();
        } else {
          console.log('📝 Interim transcript:', transcript);
          setCurrentInterim(transcript);
        }
      },
      
      onStatus: (message: string) => {
        console.log('ℹ️ Status:', message);
        addTranscript(message, 'status');
      },
      
      onError: (error: string) => {
        console.error('❌ Error:', error);
        addTranscript(`Error: ${error}`, 'error');
        setIsRecording(false);
      },
      
      onAIResponse: (response: string) => {
        console.log('🤖 AI Response:', response);
        addTranscript(`AI: ${response}`, 'final');
        scrollToBottom();
      }
    };

    bareRNAudioService.setCallbacks(callbacks);
    bareRNAudioService.updateConfig(config);
  };

  const addTranscript = (text: string, type: TranscriptItem['type']) => {
    const timestamp = Date.now();
    const newTranscript: TranscriptItem = {
      id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      type,
      timestamp
    };
    
    setTranscripts(prev => [...prev, newTranscript]);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startWaveformAnimation = () => {
    Animated.loop(
      Animated.timing(waveformAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopAnimations = () => {
    pulseAnim.stopAnimation();
    waveformAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleConnect = async () => {
    if (isConnected) return;
    
    setIsConnecting(true);
    try {
      // Connect to bare RN audio service
      await bareRNAudioService.connect();
      addTranscript('Connected to AI voice assistant', 'status');
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setIsConnecting(false);
      Alert.alert(
        'Connection Error', 
        'Unable to connect to the voice assistant service. Please check your internet connection and try again.',
        [
          { text: 'Retry', onPress: () => handleConnect() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const handleStartRecording = async () => {
    // Check connection status before recording
    if (!isConnected || !bareRNAudioService.isWebSocketConnected()) {
      console.log('🔄 Connection lost, reconnecting...');
      addTranscript('Reconnecting to voice service...', 'status');
      await handleConnect();
      if (!isConnected) {
        return; // Connection failed, handleConnect will show error
      }
    }

    try {
      console.log('🎤 Starting bare RN audio recording...');
      await bareRNAudioService.startRecording();
      setIsRecording(true);
      addTranscript('Recording started - speak now...', 'status');
    } catch (error) {
      console.error('Failed to start recording:', error);
      
      // Check if it's a connection error
      if (error.message?.includes('connection') || error.message?.includes('WebSocket')) {
        addTranscript('Connection lost - reconnecting...', 'error');
        await handleConnect();
      } else {
        Alert.alert(
          'Recording Error', 
          'Unable to start voice recording. Please ensure microphone permissions are granted.',
          [
            { text: 'Try Again', onPress: () => handleStartRecording() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    }
  };

  const handleStopRecording = async () => {
    try {
      console.log('⏹️ Stopping bare RN audio recording...');
      await bareRNAudioService.stopRecording();
      setIsRecording(false);
      setCurrentInterim('');
      addTranscript('Processing your message...', 'status');
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
      setCurrentInterim('');
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const handleConfigChange = (newConfig: Partial<BareRNAudioConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    bareRNAudioService.updateConfig(updatedConfig);
  };

  const clearTranscripts = () => {
    setTranscripts([]);
    setCurrentInterim('');
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getTranscriptStyle = (type: TranscriptItem['type']) => {
    switch (type) {
      case 'final':
        return [styles.transcriptText, styles.finalText];
      case 'interim':
        return [styles.transcriptText, styles.interimText];
      case 'status':
        return [styles.transcriptText, styles.statusText];
      case 'error':
        return [styles.transcriptText, styles.errorText];
      default:
        return styles.transcriptText;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Voice Assistant</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowSettings(!showSettings)}
        >
          <SettingsIcon size={24} color={Colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Settings Panel */}
      {showSettings && (
        <View style={styles.settingsPanel}>
          <View style={styles.settingRow}>
            <ModelIcon size={20} color={Colors.primary[500]} />
            <Text style={styles.settingLabel}>Model:</Text>
            <View style={styles.settingOptions}>
              {['nova-3', 'nova-2', 'base'].map((model) => (
                <TouchableOpacity
                  key={model}
                  style={[
                    styles.optionButton,
                    config.model === model && styles.optionButtonActive
                  ]}
                  onPress={() => handleConfigChange({ model: model as any })}
                >
                  <Text style={[
                    styles.optionText,
                    config.model === model && styles.optionTextActive
                  ]}>
                    {model}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingRow}>
            <LanguageIcon size={20} color={Colors.primary[500]} />
            <Text style={styles.settingLabel}>Language:</Text>
            <View style={styles.settingOptions}>
              {[
                { code: 'en-US', label: 'English (US)' },
                { code: 'en-UK', label: 'English (UK)' },
                { code: 'es', label: 'Spanish' },
                { code: 'fr', label: 'French' }
              ].map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.optionButton,
                    config.language === lang.code && styles.optionButtonActive
                  ]}
                  onPress={() => handleConfigChange({ language: lang.code as any })}
                >
                  <Text style={[
                    styles.optionText,
                    config.language === lang.code && styles.optionTextActive
                  ]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={[
          styles.statusIndicator,
          isConnected ? styles.statusConnected : styles.statusDisconnected
        ]}>
          <Text style={styles.statusText}>
            {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
        
        {transcripts.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearTranscripts}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Transcript Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.transcriptContainer}
        showsVerticalScrollIndicator={false}
      >
        {transcripts.map((transcript) => (
          <View key={transcript.id} style={styles.transcriptItem}>
            <Text style={styles.timestamp}>
              {formatTimestamp(transcript.timestamp)}
            </Text>
            <Text style={getTranscriptStyle(transcript.type)}>
              {transcript.text}
            </Text>
          </View>
        ))}
        
        {/* Current Interim Transcript */}
        {currentInterim && (
          <View style={[styles.transcriptItem, styles.interimItem]}>
            <Text style={styles.timestamp}>Now</Text>
            <Text style={[styles.transcriptText, styles.interimText]}>
              {currentInterim}
            </Text>
          </View>
        )}
        
        {/* Empty State */}
        {transcripts.length === 0 && !currentInterim && (
          <View style={styles.emptyState}>
            <WaveformIcon size={48} color={Colors.gray[300]} />
            <Text style={styles.emptyStateText}>
              Tap the microphone to start recording
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Your conversation will appear here in real-time
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Recording Controls */}
      <View style={styles.controlsContainer}>
        {/* Waveform Visualization */}
        {isRecording && (
          <Animated.View style={[styles.waveformContainer, {
            opacity: waveformAnim
          }]}>
            <WaveformIcon size={screenWidth * 0.8} color={Colors.primary[200]} animated />
          </Animated.View>
        )}

        {/* Main Record Button */}
        <Animated.View style={[
          styles.recordButtonContainer,
          { transform: [{ scale: pulseAnim }] }
        ]}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording ? styles.recordButtonActive : styles.recordButtonInactive
            ]}
            onPress={handleToggleRecording}
            disabled={isConnecting}
          >
            {isRecording ? (
              <StopIcon size={32} color={Colors.white} />
            ) : (
              <MicrophoneIcon size={32} color={Colors.white} />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Recording Status */}
        <Text style={styles.recordingStatus}>
          {isConnecting ? 'Connecting...' : 
           isRecording ? 'Recording... Tap to stop' : 
           isConnected ? 'Tap to start recording' : 'Tap to connect'}
        </Text>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  settingsButton: {
    padding: Spacing[2],
  },
  settingsPanel: {
    backgroundColor: Colors.gray[50],
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    gap: Spacing[4],
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  settingLabel: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    fontWeight: '600',
    minWidth: 80,
  },
  settingOptions: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  optionButton: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  optionButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  optionText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  optionTextActive: {
    color: Colors.white,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.gray[50],
  },
  statusIndicator: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
  },
  statusConnected: {
    backgroundColor: Colors.success,
  },
  statusDisconnected: {
    backgroundColor: Colors.error,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
  },
  clearButtonText: {
    ...Typography.caption,
    color: Colors.primary[500],
    fontWeight: '600',
  },
  transcriptContainer: {
    flex: 1,
    paddingHorizontal: Spacing[6],
  },
  transcriptItem: {
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  interimItem: {
    backgroundColor: Colors.primary[50],
    marginHorizontal: -Spacing[6],
    paddingHorizontal: Spacing[6],
  },
  timestamp: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing[1],
  },
  transcriptText: {
    ...Typography.body,
    lineHeight: 24,
  },
  finalText: {
    color: Colors.text.primary,
    fontWeight: '500',
  },
  interimText: {
    color: Colors.primary[600],
    fontStyle: 'italic',
  },
  statusText: {
    color: Colors.primary[500],
    fontSize: 14,
  },
  errorText: {
    color: Colors.error,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing[12],
    gap: Spacing[4],
  },
  emptyStateText: {
    ...Typography.h4,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  controlsContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[8],
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  waveformContainer: {
    position: 'absolute',
    top: -20,
    alignItems: 'center',
  },
  recordButtonContainer: {
    marginBottom: Spacing[4],
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  recordButtonActive: {
    backgroundColor: Colors.error,
  },
  recordButtonInactive: {
    backgroundColor: Colors.primary[500],
  },
  recordingStatus: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default AudioRecordingScreen;

