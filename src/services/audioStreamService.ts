import AudioRecord from 'react-native-audio-record';
import { Platform, PermissionsAndroid } from 'react-native';

export interface AudioStreamCallbacks {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onInterimTranscript?: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  onStatus?: (message: string) => void;
  onError?: (error: string) => void;
  onLLMProcessing?: (message: string) => void;
  onLLMComplete?: (message: string) => void;
}

export interface AudioStreamConfig {
  model: 'nova-3' | 'nova-2' | 'base';
  language: 'en-US' | 'en-UK' | 'es' | 'fr';
  sampleRate?: number;
}

class AudioStreamService {
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private isRecording: boolean = false;
  private callbacks: AudioStreamCallbacks = {};
  private config: AudioStreamConfig = {
    model: 'nova-3',
    language: 'en-US',
    sampleRate: 16000
  };
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private audioRecordOptions = {
    sampleRate: 16000,
    channels: 1,
    bitsPerSample: 16,
    audioSource: 6, // VOICE_RECOGNITION
    wavFile: 'audio.wav',
    bufferSize: 4096, // Smaller buffer for real-time streaming
    streamData: true // Enable real-time data streaming
  };

  constructor() {
    this.setupAudioRecord();
  }

  private setupAudioRecord() {
    AudioRecord.init(this.audioRecordOptions);
    
    // Set up audio data callback for real-time streaming
    AudioRecord.on('data', (data: string) => {
      if (this.isRecording && data && data.length > 0) {
        console.log('🎵 Received audio data chunk:', data.length, 'characters');
        // Convert base64 audio data to binary and send to WebSocket
        this.sendAudioDataToWebSocket(data);
      }
    });
  }

  /**
   * Set callbacks for audio events
   */
  setCallbacks(callbacks: AudioStreamCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AudioStreamConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check microphone permissions
   */
  private async checkPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone to record audio for AI conversation.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    } else {
      // iOS permissions are handled by the audio recording library
      // The Info.plist already has NSMicrophoneUsageDescription
      return true; // Let the audio library handle the permission request
    }
  }

  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = this.constructWebSocketUrl();
        console.log('🔌 Connecting to audio stream service:', url);
        
        this.socket = new WebSocket(url);
        this.socket.binaryType = 'arraybuffer';

        this.socket.onopen = () => {
          console.log('✅ Connected to audio stream service');
          this.isConnected = true;
          this.startHeartbeat();
          this.callbacks.onConnected?.();
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleWebSocketMessage(event);
        };

        this.socket.onclose = (event) => {
          console.log('🔌 Audio stream service disconnected. Code:', event.code, 'Reason:', event.reason);
          this.isConnected = false;
          this.stopHeartbeat();
          this.callbacks.onDisconnected?.();
          
          // Auto-reconnect if not manually disconnected
          if (event.code !== 1000) {
            console.log('🔄 Connection lost unexpectedly, attempting to reconnect...');
            setTimeout(() => {
              if (!this.isConnected) {
                this.connect().catch(error => {
                  console.error('❌ Auto-reconnection failed:', error);
                  this.callbacks.onError?.('Connection lost - please reconnect');
                });
              }
            }, 3000);
          }
        };

        this.socket.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.callbacks.onError?.('Connection failed');
          reject(error);
        };

      } catch (error) {
        console.error('❌ Failed to connect:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket
   */
  disconnect() {
    console.log('🔌 Disconnecting from audio stream service...');
    this.stopHeartbeat();
    this.stopRecording();
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }

  /**
   * Start audio recording and streaming
   */
  async startRecording(): Promise<void> {
    if (this.isRecording) {
      console.log('🎤 Already recording');
      return;
    }

    try {
      console.log('🎤 Starting audio streaming...');
      
      // Check WebSocket connection
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        console.log('🔄 WebSocket not connected, attempting to reconnect...');
        await this.connect();
      }

      if (!this.isConnected || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
        throw new Error('Failed to establish connection to audio stream service');
      }
      
      // Check permissions
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      // Send start command to server (matching AI team's format)
      const startCommand = {
        action: 'start',
        model: this.config.model,
        language: this.config.language
      };
      
      console.log('📤 Sending start command:', startCommand);
      this.socket.send(JSON.stringify(startCommand));
      
      // Start audio recording
      AudioRecord.start();
      this.isRecording = true;
      
      console.log('✅ Audio streaming started');
      
    } catch (error) {
      console.error('❌ Failed to start audio streaming:', error);
      this.isRecording = false;
      throw error;
    }
  }

  /**
   * Stop audio recording
   */
  async stopRecording(): Promise<void> {
    if (!this.isRecording) {
      console.log('🎤 Not currently recording');
      return;
    }

    try {
      console.log('⏹️ Stopping audio streaming...');
      
      // Send stop command to server
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        const stopCommand = { action: 'stop' };
        console.log('📤 Sending stop command:', stopCommand);
        this.socket.send(JSON.stringify(stopCommand));
      }
      
      // Stop audio recording
      const audioFile = await AudioRecord.stop();
      console.log('📁 Audio file saved:', audioFile);
      
      this.isRecording = false;
      console.log('✅ Audio streaming stopped');
      
    } catch (error) {
      console.error('❌ Failed to stop audio streaming:', error);
      this.isRecording = false;
      throw error;
    }
  }

  /**
   * Get current recording status
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get current connection status
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Check if WebSocket is properly connected
   */
  isWebSocketConnected(): boolean {
    return this.isConnected && 
           this.socket !== null && 
           this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Get current configuration
   */
  getConfig(): AudioStreamConfig {
    return { ...this.config };
  }

  // Private methods

  private constructWebSocketUrl(): string {
    // Always use Azure Container Apps WebSocket URL
    return 'wss://imagomum-app.agreeablebeach-10200fd5.eastus2.azurecontainerapps.io/ws/transcribe';
  }

  private sendAudioDataToWebSocket(base64Data: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.log('❌ WebSocket not connected - cannot send audio data');
      return;
    }

    if (!base64Data || base64Data.length === 0) {
      console.log('⚠️ Empty audio data received, skipping');
      return;
    }

    try {
      // Convert base64 to binary ArrayBuffer (PCM format)
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Ensure we have valid audio data
      if (bytes.length === 0) {
        console.log('⚠️ No audio bytes to send');
        return;
      }
      
      // Send raw PCM bytes directly (16-bit, 16kHz, mono)
      const pcmBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
      
      // Send binary PCM data to WebSocket
      this.socket.send(pcmBuffer);
      console.log('📤 Sent PCM audio data:', pcmBuffer.byteLength, 'bytes');
      
    } catch (error) {
      console.error('❌ Failed to send audio data:', error);
      console.error('Base64 data length:', base64Data?.length || 0);
    }
  }

  private handleWebSocketMessage(event: MessageEvent) {
    if (event.data instanceof ArrayBuffer) {
      // Handle TTS audio response (binary data)
      console.log('🔊 Received TTS audio data:', event.data.byteLength, 'bytes');
      // TODO: Implement audio playback
    } else {
      // Handle JSON messages
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Received WebSocket message:', data);
        this.handleTranscriptionMessage(data);
      } catch (error) {
        console.error('❌ Failed to parse WebSocket message:', error);
      }
    }
  }

  private handleTranscriptionMessage(data: any) {
    switch (data.type) {
      case 'connected':
        console.log('📡 Service connected:', data.message);
        this.callbacks.onStatus?.(data.message || 'Connected to AI assistant');
        break;
        
      case 'status':
        console.log('ℹ️ Status update:', data.message);
        this.callbacks.onStatus?.(data.message || '');
        break;
        
      case 'error':
        console.error('❌ Server error:', data.message);
        this.callbacks.onError?.(data.message || 'Server error occurred');
        break;
        
      case 'interim_transcript':
        console.log('📝 Interim transcript from server:', data.transcript);
        this.callbacks.onInterimTranscript?.(data.transcript || '');
        break;
        
      case 'final_transcript':
        console.log('✅ Final transcript from server:', data.transcript);
        this.callbacks.onFinalTranscript?.(data.transcript || '');
        break;
        
      case 'llm_processing':
        console.log('🤖 AI is processing:', data.message);
        this.callbacks.onLLMProcessing?.(data.message || 'AI is thinking...');
        break;
        
      case 'llm_complete':
        console.log('🤖 AI Response:', data.message);
        this.callbacks.onLLMComplete?.(data.message || 'AI response received');
        break;
        
      case 'pong':
        console.log('💓 Received heartbeat pong');
        break;
        
      default:
        console.log('📨 Unknown message type:', data.type, 'Data:', data);
        // Try to handle as generic AI response if it has message
        if (data.message) {
          console.log('🤖 Treating as AI response:', data.message);
          this.callbacks.onLLMComplete?.(data.message);
        }
    }
  }

  private startHeartbeat() {
    // Send periodic ping to keep connection alive
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.log('💓 Sending heartbeat ping');
        this.socket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log('💓 Heartbeat stopped');
    }
  }

  /**
   * Cleanup resources
   */
  async destroy() {
    await this.stopRecording();
    this.disconnect();
    AudioRecord.stop();
  }
}

// Export singleton instance
const audioStreamService = new AudioStreamService();
export default audioStreamService;
