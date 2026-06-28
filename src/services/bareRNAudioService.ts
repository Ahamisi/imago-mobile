import AudioRecord from 'react-native-audio-record';
import { Platform, Alert, PermissionsAndroid } from 'react-native';

export interface BareRNAudioCallbacks {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onStatus?: (message: string) => void;
  onError?: (error: string) => void;
  onTranscriptionReceived?: (transcript: string, isFinal: boolean) => void;
  onAIResponse?: (response: string) => void;
}

export interface BareRNAudioConfig {
  model: 'nova-3' | 'nova-2' | 'base';
  language: 'en-US' | 'en-UK' | 'es' | 'fr';
  sampleRate: number;
}



class BareRNAudioService {
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private isRecording: boolean = false;
  private callbacks: BareRNAudioCallbacks = {};
  private config: BareRNAudioConfig = {
    model: 'nova-3',
    language: 'en-US',
    sampleRate: 16000
  };
  
  // Audio recording options
  private audioRecordOptions = {
    sampleRate: 16000,
    channels: 1,
    bitsPerSample: 16,
    audioSource: 1, // MIC (try default microphone instead of VOICE_RECOGNITION)
    wavFile: 'audio.wav',
    bufferSize: 2048, // Slightly larger buffer
    streamData: true // Enable real-time data streaming
  };
  
  // Audio streaming state
  private audioQueue: Uint8Array[] = [];
  private isSending: boolean = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private fakePCMInterval: NodeJS.Timeout | null = null;

  constructor() {
    console.log('🎵 BareRNAudioService initialized');
    this.setupAudioRecord();
  }

  /**
   * Setup AudioRecord with real-time data streaming
   */
  private setupAudioRecord() {
    console.log('🔧 Initializing AudioRecord with options:', this.audioRecordOptions);
    AudioRecord.init(this.audioRecordOptions);
    
    // Set up audio data callback for real-time streaming
    AudioRecord.on('data', (data: string) => {
      console.log('🎵 AudioRecord data callback fired! Data length:', data?.length || 0, 'Recording:', this.isRecording);
      
      if (this.isRecording && data && data.length > 0) {
        console.log('🎵 Processing audio data chunk:', data.length, 'characters');
        // Convert base64 audio data to PCM and add to queue
        this.handleAudioData(data);
      } else if (!this.isRecording) {
        console.log('⚠️ Received audio data but not recording');
      } else if (!data || data.length === 0) {
        console.log('⚠️ Received empty audio data');
      }
    });
    
    console.log('✅ AudioRecord data callback registered');
  }

  /**
   * Set callbacks for audio events
   */
  setCallbacks(callbacks: BareRNAudioCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<BareRNAudioConfig>) {
    this.config = { ...this.config, ...config };
    console.log('🔧 Config updated:', this.config);
  }

  /**
   * Request microphone permissions
   */
  private async requestPermissions(): Promise<boolean> {
    try {
      console.log('🎤 Requesting microphone permission...');
      
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'ImagoMUm needs access to your microphone for voice conversations with the AI pregnancy assistant.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        console.log('🎤 Android microphone permission:', isGranted ? 'granted' : 'denied');
        return isGranted;
      } else {
        // iOS permissions are handled automatically by the audio library
        // The Info.plist already has NSMicrophoneUsageDescription
        console.log('🎤 iOS microphone permission will be requested by audio library');
        
        // For iOS, we'll assume permission is granted and let AudioRecord handle it
        // If we get empty data, it means permission was denied
        return true;
      }
    } catch (error) {
      console.error('❌ Permission request failed:', error);
      return false;
    }
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Check permissions first (only for Android, iOS will be handled by audio library)
        if (Platform.OS === 'android') {
          const hasPermission = await this.requestPermissions();
          if (!hasPermission) {
            throw new Error('Microphone permission denied. Please enable microphone access in Settings.');
          }
        }

        const url = this.getWebSocketURL();
        console.log('🔌 Connecting to bare RN audio service:', url);
        
        this.socket = new WebSocket(url);
        this.socket.binaryType = 'arraybuffer';

        this.socket.onopen = () => {
          console.log('✅ Connected to bare RN audio service');
          this.isConnected = true;
          this.startHeartbeat();
          
          // Send initial configuration
          this.sendControlMessage({
            type: 'start',
            format: { 
              encoding: 'wav', 
              sample_rate: this.config.sampleRate, 
              channels: 1,
              bits_per_sample: 16
            },
            model: this.config.model,
            language: this.config.language
          });
          
          this.callbacks.onConnected?.();
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleWebSocketMessage(event);
        };

        this.socket.onclose = (event) => {
          console.log('🔌 Bare RN audio service disconnected. Code:', event.code);
          this.isConnected = false;
          this.stopHeartbeat();
          this.callbacks.onDisconnected?.();
          
          // Auto-reconnect if not manually disconnected
          if (event.code !== 1000) {
            console.log('🔄 Connection lost, attempting to reconnect...');
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
   * Disconnect from WebSocket
   */
  disconnect() {
    console.log('🔌 Disconnecting from bare RN audio service...');
    this.stopHeartbeat();
    this.stopRecording();
    
    if (this.socket) {
      // Send stop message
      this.sendControlMessage({ type: 'stop' });
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }

  /**
   * Convert PCM data to WAV format with proper headers
   */
  private pcmToWav(pcmData: Uint8Array): Uint8Array {
    const sampleRate = this.config.sampleRate;
    const channels = 1; // mono
    const bitsPerSample = 16;
    
    const dataLength = pcmData.length;
    const fileLength = 44 + dataLength; // WAV header is 44 bytes
    
    const buffer = new ArrayBuffer(fileLength);
    const view = new DataView(buffer);
    
    // WAV Header
    // RIFF chunk descriptor
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, fileLength - 8, true); // file length - 8
    view.setUint32(8, 0x57415645, false); // "WAVE"
    
    // fmt sub-chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // sub-chunk size (16 for PCM)
    view.setUint16(20, 1, true); // audio format (1 for PCM)
    view.setUint16(22, channels, true); // number of channels
    view.setUint32(24, sampleRate, true); // sample rate
    view.setUint32(28, sampleRate * channels * bitsPerSample / 8, true); // byte rate
    view.setUint16(32, channels * bitsPerSample / 8, true); // block align
    view.setUint16(34, bitsPerSample, true); // bits per sample
    
    // data sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, dataLength, true); // data length
    
    // Copy PCM data
    const wavData = new Uint8Array(buffer);
    wavData.set(pcmData, 44);
    
    return wavData;
  }

  /**
   * Handle audio data from AudioRecord
   */
  private handleAudioData(base64Data: string) {
    try {
      // Convert base64 to binary ArrayBuffer (PCM format)
      const binaryString = atob(base64Data);
      const pcmBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        pcmBytes[i] = binaryString.charCodeAt(i);
      }
      
      // Ensure we have valid audio data
      if (pcmBytes.length === 0) {
        console.log('⚠️ No audio bytes to process');
        return;
      }
      
      // Convert PCM to WAV format
      const wavBytes = this.pcmToWav(pcmBytes);
      
      // Add to queue with size limit
      const MAX_QUEUE_BYTES = 1_000_000; // 1MB
      const queuedBytes = this.audioQueue.reduce((sum, chunk) => sum + chunk.byteLength, 0);
      
      if (queuedBytes > MAX_QUEUE_BYTES) {
        // Drop oldest to keep latency bounded
        this.audioQueue.shift();
        console.log('⚠️ Audio queue overflow, dropping oldest chunk');
      }
      
      this.audioQueue.push(wavBytes);
      
      // Trigger pump if not already running
      if (!this.isSending) {
        this.startAudioPump();
      }
      
    } catch (error) {
      console.error('❌ Failed to process audio data:', error);
    }
  }

  /**
   * Initialize audio engine and start recording
   */
  async startRecording(): Promise<void> {
    if (this.isRecording) {
      console.log('🎤 Already recording');
      return;
    }

    try {
      console.log('🎤 Starting bare RN audio recording...');
      
      // Check WebSocket connection
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket not connected');
      }

      // Re-initialize AudioRecord to ensure fresh state
      console.log('🔄 Re-initializing AudioRecord...');
      
      // Try different audio source configurations if the first one fails
      const audioSources = [
        { ...this.audioRecordOptions, audioSource: 1 }, // MIC
        { ...this.audioRecordOptions, audioSource: 0 }, // DEFAULT
        { ...this.audioRecordOptions, audioSource: 6 }, // VOICE_RECOGNITION
        { ...this.audioRecordOptions, audioSource: 7 }  // VOICE_COMMUNICATION
      ];
      
      console.log('🔧 Trying audio source:', audioSources[0].audioSource, '(MIC)');
      AudioRecord.init(audioSources[0]);
      
      // Set up the data callback again (in case it was lost)
      AudioRecord.on('data', (data: string) => {
        console.log('🎵 AudioRecord data callback fired! Data length:', data?.length || 0, 'Recording:', this.isRecording);
        
        if (this.isRecording && data && data.length > 0) {
          console.log('🎵 Processing audio data chunk:', data.length, 'characters');
          // Convert base64 audio data to PCM and add to queue
          this.handleAudioData(data);
        } else if (!this.isRecording) {
          console.log('⚠️ Received audio data but not recording');
        } else if (!data || data.length === 0) {
          console.log('⚠️ Received empty audio data');
        }
      });
      
      // Start AudioRecord
      console.log('▶️ Calling AudioRecord.start()...');
      AudioRecord.start();
      this.isRecording = true;
      
      console.log('✅ Bare RN audio recording started, isRecording:', this.isRecording);
      this.callbacks.onStatus?.('Recording started - speak now...');
      
      // Test if AudioRecord is actually working
      let emptyDataCount = 0;
      const checkInterval = setInterval(() => {
        if (!this.isRecording) {
          clearInterval(checkInterval);
          return;
        }
        
        emptyDataCount++;
        console.log('🔍 Checking AudioRecord status after', emptyDataCount * 2, 'seconds...');
        console.log('🔍 Still recording:', this.isRecording);
        console.log('🔍 Audio queue length:', this.audioQueue.length);
        
        if (emptyDataCount >= 3 && this.audioQueue.length === 0) {
          console.log('⚠️ No audio data received - likely iOS Simulator limitation!');
          console.log('🧪 Starting FAKE PCM generator for testing...');
          this.startFakePCMGenerator();
          clearInterval(checkInterval);
        }
      }, 2000);
      
    } catch (error) {
      console.error('❌ Failed to start bare RN recording:', error);
      this.isRecording = false;
      throw error;
    }
  }

  /**
   * Stop recording
   */
  async stopRecording(): Promise<void> {
    if (!this.isRecording) {
      console.log('🎤 Not currently recording');
      return;
    }

    try {
      console.log('⏹️ Stopping bare RN audio recording...');
      
      this.isRecording = false;
      
      // Stop fake PCM generator if running
      this.stopFakePCMGenerator();
      
      // Stop AudioRecord
      AudioRecord.stop();
      
      // Send end-of-stream message
      this.sendControlMessage({ type: 'stop_recording' });
      
      console.log('✅ Bare RN audio recording stopped');
      this.callbacks.onStatus?.('Processing your message...');
      
    } catch (error) {
      console.error('❌ Failed to stop bare RN recording:', error);
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

  // Private methods

  private getWebSocketURL(): string {
    return 'wss://imagomum-app.agreeablebeach-10200fd5.eastus2.azurecontainerapps.io/ws/transcribe';
  }

  private sendControlMessage(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      console.log('📤 Sent control message:', message.type);
    }
  }

  private startAudioPump() {
    if (this.isSending) return;
    this.isSending = true;

    const pump = () => {
      const ws = this.socket;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        this.isSending = false;
        return;
      }

      // Check backpressure
      const MAX_BUFFERED_BYTES = 512 * 1024; // 512KB
      if (ws.bufferedAmount > MAX_BUFFERED_BYTES) {
        // Wait a bit and try again
        setTimeout(pump, 8);
        return;
      }

      const nextChunk = this.audioQueue.shift();
      if (nextChunk) {
        try {
          // Send raw PCM bytes directly
          const buffer = nextChunk.buffer.byteLength === nextChunk.length 
            ? nextChunk.buffer 
            : nextChunk.slice().buffer;
          
          ws.send(buffer);
          console.log('📤 Sent WAV chunk:', buffer.byteLength, 'bytes');
          
          // Continue pumping
          setTimeout(pump, 0);
        } catch (error) {
          console.error('❌ Failed to send PCM data:', error);
          this.isSending = false;
        }
      } else {
        // No more data to send
        this.isSending = false;
      }
    };

    pump();
  }

  private handleWebSocketMessage(event: MessageEvent) {
    if (event.data instanceof ArrayBuffer) {
      // Handle binary response (TTS audio, etc.)
      console.log('🔊 Received binary data:', event.data.byteLength, 'bytes');
      // TODO: Handle TTS audio playback
    } else {
      // Handle JSON messages
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Received message:', data);
        this.handleServerMessage(data);
      } catch (error) {
        console.error('❌ Failed to parse WebSocket message:', error);
      }
    }
  }

  private handleServerMessage(data: any) {
    switch (data.type) {
      case 'connected':
        console.log('📡 Server connected:', data.message);
        this.callbacks.onStatus?.(data.message || 'Connected to AI assistant');
        break;
        
      case 'status':
        console.log('ℹ️ Status:', data.message);
        this.callbacks.onStatus?.(data.message || '');
        break;
        
      case 'error':
        console.error('❌ Server error:', data.message);
        this.callbacks.onError?.(data.message || 'Server error occurred');
        break;
        
      case 'interim_transcript':
        console.log('📝 Interim transcript:', data.transcript);
        this.callbacks.onTranscriptionReceived?.(data.transcript || '', false);
        break;
        
      case 'final_transcript':
        console.log('✅ Final transcript:', data.transcript);
        this.callbacks.onTranscriptionReceived?.(data.transcript || '', true);
        break;
        
      case 'ai_response':
      case 'llm_complete':
        console.log('🤖 AI Response:', data.message || data.response);
        this.callbacks.onAIResponse?.(data.message || data.response || 'AI response received');
        break;
        
      case 'pong':
        console.log('💓 Received heartbeat pong');
        break;
        
      default:
        console.log('📨 Unknown message type:', data.type, 'Data:', data);
        // Try to handle as generic AI response
        if (data.message) {
          this.callbacks.onAIResponse?.(data.message);
        }
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.log('💓 Sending heartbeat ping');
        this.sendControlMessage({ type: 'ping', timestamp: Date.now() });
      }
    }, 30000); // Every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log('💓 Heartbeat stopped');
    }
  }

  /**
   * Generate fake PCM data for testing on iOS Simulator
   */
  private startFakePCMGenerator() {
    console.log('🧪 Starting fake PCM generator for simulator testing...');
    this.callbacks.onStatus?.('Generating fake audio data for testing...');
    
    let sampleCount = 0;
    this.fakePCMInterval = setInterval(() => {
      if (!this.isRecording) {
        this.stopFakePCMGenerator();
        return;
      }
      
      // Generate fake 16-bit PCM audio data (speech-like pattern)
      const samplesPerChunk = 1024; // ~64ms at 16kHz
      const sampleRate = 16000;
      
      const pcmData = new Uint8Array(samplesPerChunk * 2); // 16-bit = 2 bytes per sample
      const dataView = new DataView(pcmData.buffer);
      
      for (let i = 0; i < samplesPerChunk; i++) {
        // Generate speech-like audio with multiple frequencies and noise
        const t = (sampleCount + i) / sampleRate;
        
        // Mix multiple frequencies to simulate speech formants
        const f1 = Math.sin(2 * Math.PI * 200 * t) * 0.3; // Low formant
        const f2 = Math.sin(2 * Math.PI * 800 * t) * 0.2; // Mid formant  
        const f3 = Math.sin(2 * Math.PI * 2400 * t) * 0.1; // High formant
        
        // Add some noise to make it more realistic
        const noise = (Math.random() - 0.5) * 0.05;
        
        // Combine and add envelope (fade in/out)
        const envelope = Math.sin(t * 2) * 0.5 + 0.5; // Slow modulation
        const sample = (f1 + f2 + f3 + noise) * envelope * 0.4;
        
        // Convert to 16-bit PCM
        const pcmSample = Math.round(Math.max(-1, Math.min(1, sample)) * 32767);
        dataView.setInt16(i * 2, pcmSample, true); // little-endian
      }
      
      sampleCount += samplesPerChunk;
      
      // Convert PCM to WAV format
      const wavData = this.pcmToWav(pcmData);
      
      // Add to queue
      this.audioQueue.push(wavData);
      console.log('🧪 Generated fake WAV chunk:', wavData.length, 'bytes (', pcmData.length, 'PCM +', wavData.length - pcmData.length, 'header)');
      
      // Trigger pump if not already running
      if (!this.isSending) {
        this.startAudioPump();
      }
      
    }, 64); // ~64ms intervals for realistic audio streaming
  }
  
  /**
   * Stop fake PCM generator
   */
  private stopFakePCMGenerator() {
    if (this.fakePCMInterval) {
      clearInterval(this.fakePCMInterval);
      this.fakePCMInterval = null;
      console.log('🧪 Fake PCM generator stopped');
    }
  }

  /**
   * Cleanup resources
   */
  async destroy() {
    this.stopFakePCMGenerator();
    await this.stopRecording();
    this.disconnect();
  }
}

// Export singleton instance
const bareRNAudioService = new BareRNAudioService();
export default bareRNAudioService;
