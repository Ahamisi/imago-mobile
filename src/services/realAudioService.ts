import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Voice, {
  SpeechRecognizedEvent,
  SpeechResultsEvent,
  SpeechErrorEvent,
  SpeechStartEvent,
  SpeechEndEvent,
} from '@react-native-voice/voice';

export interface RealAudioCallbacks {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onInterimTranscript?: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  onStatus?: (message: string) => void;
  onError?: (error: string) => void;
  onLLMProcessing?: (message: string) => void;
  onLLMComplete?: (message: string) => void;
}

export interface TranscriptionConfig {
  model: 'nova-3' | 'nova-2' | 'base';
  language: 'en-US' | 'en-UK' | 'es' | 'fr';
  sampleRate?: number;
}

class RealAudioService {
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private isRecording: boolean = false;
  private callbacks: RealAudioCallbacks = {};
  private config: TranscriptionConfig = {
    model: 'nova-3',
    language: 'en-US',
    sampleRate: 16000
  };
  private currentInterimTranscript: string = '';
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupVoiceEvents();
  }

  private setupVoiceEvents() {
    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechRecognized = this.onSpeechRecognized.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
  }

  private onSpeechStart = (e: SpeechStartEvent) => {
    console.log('🎤 Speech recognition started');
    this.callbacks.onStatus?.('Listening...');
  };

  private onSpeechRecognized = (e: SpeechRecognizedEvent) => {
    console.log('🎤 Speech recognized:', e);
  };

  private onSpeechEnd = (e: SpeechEndEvent) => {
    console.log('🎤 Speech recognition ended');
    this.isRecording = false;
    this.callbacks.onStatus?.('Processing...');
  };

  private onSpeechError = (e: SpeechErrorEvent) => {
    console.error('🎤 Speech error:', e.error);
    this.callbacks.onError?.(e.error?.message || 'Speech recognition error');
    this.isRecording = false;
  };

  private onSpeechResults = (e: SpeechResultsEvent) => {
    console.log('🎤 Final speech results:', e.value);
    if (e.value && e.value.length > 0) {
      const finalTranscript = e.value[0];
      this.callbacks.onFinalTranscript?.(finalTranscript);
      
      // Send to WebSocket if connected
      this.sendTranscriptToWebSocket(finalTranscript);
    }
  };

  private onSpeechPartialResults = (e: SpeechResultsEvent) => {
    console.log('🎤 Partial speech results:', e.value);
    if (e.value && e.value.length > 0) {
      const interimTranscript = e.value[0];
      this.currentInterimTranscript = interimTranscript;
      this.callbacks.onInterimTranscript?.(interimTranscript);
    }
  };

  /**
   * Set configuration for transcription
   */
  setConfig(config: Partial<TranscriptionConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set callbacks for various events
   */
  setCallbacks(callbacks: RealAudioCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Check and request microphone permissions
   */
  private async checkPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'ImagoMUm needs access to your microphone for voice conversations.',
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
      // iOS permissions are handled automatically by the system
      return true;
    }
  }

  /**
   * Connect to the transcription WebSocket
   */
  async connect(wsUrl?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Check permissions first
        this.checkPermissions().then(hasPermission => {
          if (!hasPermission) {
            reject(new Error('Microphone permission denied'));
            return;
          }

          // Use provided URL or construct default
          const url = wsUrl || this.constructWebSocketUrl();
          
          console.log('🔌 Connecting to transcription service:', url);
          
          this.socket = new WebSocket(url);
          this.socket.binaryType = 'arraybuffer';

          this.socket.onopen = () => {
            console.log('✅ Connected to transcription service');
            this.isConnected = true;
            
            // DON'T send config immediately - wait for user to start recording
            // The server expects action: 'start' when recording begins
            
            this.startHeartbeat();
            this.callbacks.onConnected?.();
            resolve();
          };

          this.socket.onmessage = (event) => {
            this.handleWebSocketMessage(event);
          };

          this.socket.onclose = (event) => {
            console.log('🔌 Transcription service disconnected. Code:', event.code, 'Reason:', event.reason);
            console.log('🔌 Was recording:', this.isRecording, 'Was connected:', this.isConnected);
            this.isConnected = false;
            this.stopHeartbeat();
            this.callbacks.onDisconnected?.();
            
            // Auto-reconnect after a short delay if not manually disconnected
            if (event.code !== 1000) { // 1000 = normal closure
              console.log('🔄 Connection lost unexpectedly, attempting to reconnect in 3 seconds...');
              setTimeout(() => {
                if (!this.isConnected) {
                  console.log('🔄 Attempting auto-reconnection...');
                  this.connect().catch(error => {
                    console.error('❌ Auto-reconnection failed:', error);
                    this.callbacks.onError?.('Connection lost - please tap to reconnect');
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
        });

      } catch (error) {
        console.error('❌ Failed to connect:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the transcription service
   */
  disconnect() {
    console.log('🔌 Disconnecting from transcription service...');
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.stopRecording();
  }

  /**
   * Start voice recording and transcription
   */
  async startRecording(): Promise<void> {
    if (this.isRecording) {
      console.log('🎤 Already recording');
      return;
    }

    try {
      console.log('🎤 Starting voice recording...');
      
      // Check WebSocket connection first
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        console.log('🔄 WebSocket not connected, attempting to reconnect...');
        await this.connect();
      }

      if (!this.isConnected || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
        throw new Error('Failed to establish connection to transcription service');
      }
      
      // Check permissions
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      // Send start command to server with AI team's exact format
      const startCommand = {
        action: 'start',
        model: this.config.model,
        language: this.config.language
      };
      
      console.log('📤 Sending start command:', startCommand);
      this.socket.send(JSON.stringify(startCommand));
      
      // Start voice recognition
      await Voice.start(this.config.language);
      this.isRecording = true;
      this.currentInterimTranscript = '';
      
      console.log('✅ Voice recording started');
      
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      this.isRecording = false;
      throw error;
    }
  }

  /**
   * Stop voice recording
   */
  async stopRecording(): Promise<void> {
    if (!this.isRecording) {
      console.log('🎤 Not currently recording');
      return;
    }

    try {
      console.log('⏹️ Stopping voice recording...');
      
      // Send stop command to server
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        const stopCommand = { action: 'stop' };
        console.log('📤 Sending stop command:', stopCommand);
        this.socket.send(JSON.stringify(stopCommand));
      }
      
      await Voice.stop();
      this.isRecording = false;
      console.log('✅ Voice recording stopped');
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      this.isRecording = false;
    }
  }

  /**
   * Check if currently recording
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Check if connected to service
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get current configuration
   */
  getConfig(): TranscriptionConfig {
    return { ...this.config };
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

  private constructWebSocketUrl(): string {
    // Always use Azure Container Apps WebSocket URL (no local dev server available)
    return 'wss://imagomum-app.agreeablebeach-10200fd5.eastus2.azurecontainerapps.io/ws/transcribe';
  }

  private sendTranscriptToWebSocket(transcript: string) {
    // NOTE: The AI team's server expects BINARY AUDIO DATA, not text transcripts!
    // Their HTML demo sends PCM audio via WebSocket, but React Native Voice only gives us text.
    // 
    // For now, we'll display the transcript in the UI but the server won't respond
    // because it's waiting for audio data that we can't provide with React Native Voice.
    //
    // To get AI responses, we would need to:
    // 1. Capture raw audio data (not just transcripts)
    // 2. Convert to PCM format
    // 3. Send binary audio to WebSocket
    // 4. Let the server do the transcription AND AI processing
    
    console.log('📝 Transcript received (server expects audio data, not text):', transcript);
    
    // The server is likely disconnecting because it's not receiving the expected audio stream
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.log('❌ WebSocket disconnected - server expects binary audio data, not text');
      this.callbacks.onError?.('Server expects audio stream - text-only mode not supported');
      return;
    }
    
    // For debugging: try sending the transcript anyway (will likely be ignored)
    try {
      console.log('📤 Attempting to send transcript (may be ignored by server)');
      this.socket.send(JSON.stringify({
        type: 'transcript',
        text: transcript,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('❌ Failed to send transcript:', error);
    }
  }



  private handleWebSocketMessage(event: MessageEvent) {
    if (event.data instanceof ArrayBuffer) {
      // Handle audio data (TTS response) - not implemented yet
      console.log('📢 Received audio data from WebSocket');
    } else {
      // Handle JSON messages
      try {
        const data = JSON.parse(event.data);
        this.handleTranscriptionMessage(data);
      } catch (error) {
        console.error('❌ Failed to parse WebSocket message:', error);
      }
    }
  }

  private handleTranscriptionMessage(data: any) {
    console.log('📨 Received WebSocket message:', data);
    
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
        
      case 'transcript_interim':
        console.log('📝 Interim transcript from server:', data.text);
        this.callbacks.onInterimTranscript?.(data.text || '');
        break;
        
      case 'transcript_final':
        console.log('✅ Final transcript from server:', data.text);
        this.callbacks.onFinalTranscript?.(data.text || '');
        break;
        
      case 'llm_processing':
      case 'ai_processing':
        console.log('🤖 AI is processing:', data.message);
        this.callbacks.onLLMProcessing?.(data.message || 'AI is thinking...');
        break;
        
      case 'llm_response':
      case 'ai_response':
      case 'llm_complete':
        console.log('🤖 AI Response:', data.message || data.text);
        this.callbacks.onLLMComplete?.(data.message || data.text || 'AI response received');
        break;
        
      case 'audio_data':
        console.log('🔊 Received TTS audio data');
        // Handle TTS audio playback here
        this.handleAudioPlayback(data);
        break;
        
      case 'pong':
        console.log('💓 Received heartbeat pong');
        break;
        
      default:
        console.log('📨 Unknown message type:', data.type, 'Data:', data);
        // Try to handle as generic AI response if it has text/message
        if (data.message || data.text) {
          console.log('🤖 Treating as AI response:', data.message || data.text);
          this.callbacks.onLLMComplete?.(data.message || data.text);
        }
    }
  }

  private handleAudioPlayback(data: any) {
    // Handle TTS audio data from the server
    if (data.audio_data) {
      console.log('🔊 Playing TTS audio response');
      // TODO: Implement audio playback for TTS responses
      // This would convert the audio data and play it back to the user
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
    
    // Clean up voice recognition
    try {
      await Voice.destroy();
    } catch (error) {
      console.error('Error destroying voice:', error);
    }
  }
}

// Export singleton instance
export const realAudioService = new RealAudioService();
export default realAudioService;
