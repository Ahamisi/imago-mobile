import Voice from '@react-native-voice/voice';
import { Platform, PermissionsAndroid } from 'react-native';

export interface VoiceStreamCallbacks {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onInterimTranscript?: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  onStatus?: (message: string) => void;
  onError?: (error: string) => void;
  onLLMProcessing?: (message: string) => void;
  onLLMComplete?: (message: string) => void;
}

export interface VoiceStreamConfig {
  model: 'nova-3' | 'nova-2' | 'base';
  language: 'en-US' | 'en-UK' | 'es' | 'fr';
}

class VoiceStreamService {
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private isRecording: boolean = false;
  private callbacks: VoiceStreamCallbacks = {};
  private config: VoiceStreamConfig = {
    model: 'nova-3',
    language: 'en-US'
  };
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private audioChunks: string[] = [];

  constructor() {
    this.setupVoice();
  }

  private setupVoice() {
    // Set up Voice recognition callbacks
    Voice.onSpeechStart = () => {
      console.log('🎤 Voice: Speech started');
    };

    Voice.onSpeechRecognized = () => {
      console.log('🎤 Voice: Speech recognized');
    };

    Voice.onSpeechPartialResults = (event: any) => {
      if (event.value && event.value.length > 0) {
        const partialResult = event.value[0];
        console.log('📝 Voice: Partial result:', partialResult);
        this.callbacks.onInterimTranscript?.(partialResult);
      }
    };

    Voice.onSpeechResults = (event: any) => {
      if (event.value && event.value.length > 0) {
        const finalResult = event.value[0];
        console.log('✅ Voice: Final result:', finalResult);
        this.callbacks.onFinalTranscript?.(finalResult);
        
        // Send the transcribed text to the AI service
        this.sendTextToAI(finalResult);
      }
    };

    Voice.onSpeechError = (error: any) => {
      console.error('❌ Voice error:', error);
      this.callbacks.onError?.(error.error?.message || 'Voice recognition error');
    };

    Voice.onSpeechEnd = () => {
      console.log('⏹️ Voice: Speech ended');
      this.isRecording = false;
    };
  }

  /**
   * Set callbacks for voice events
   */
  setCallbacks(callbacks: VoiceStreamCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<VoiceStreamConfig>) {
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
            message: 'This app needs access to your microphone for voice conversations with the AI.',
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
      // iOS permissions are handled by the Voice library
      return true;
    }
  }

  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = this.constructWebSocketUrl();
        console.log('🔌 Connecting to voice stream service:', url);
        
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
          console.log('✅ Connected to voice stream service');
          this.isConnected = true;
          this.startHeartbeat();
          this.callbacks.onConnected?.();
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleWebSocketMessage(event);
        };

        this.socket.onclose = (event) => {
          console.log('🔌 Voice stream service disconnected. Code:', event.code);
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
   * Disconnect from the WebSocket
   */
  disconnect() {
    console.log('🔌 Disconnecting from voice stream service...');
    this.stopHeartbeat();
    this.stopRecording();
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }

  /**
   * Start voice recording
   */
  async startRecording(): Promise<void> {
    if (this.isRecording) {
      console.log('🎤 Already recording');
      return;
    }

    try {
      console.log('🎤 Starting voice recording...');
      
      // Check WebSocket connection
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        console.log('🔄 WebSocket not connected, attempting to reconnect...');
        await this.connect();
      }

      if (!this.isConnected || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
        throw new Error('Failed to establish connection to voice stream service');
      }
      
      // Check permissions
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      // Start voice recognition
      await Voice.start(this.config.language);
      this.isRecording = true;
      
      console.log('✅ Voice recording started');
      
    } catch (error) {
      console.error('❌ Failed to start voice recording:', error);
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
      
      // Stop voice recognition
      await Voice.stop();
      this.isRecording = false;
      
      console.log('✅ Voice recording stopped');
      
    } catch (error) {
      console.error('❌ Failed to stop voice recording:', error);
      this.isRecording = false;
      throw error;
    }
  }

  /**
   * Send transcribed text to AI service
   */
  private sendTextToAI(text: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.log('❌ WebSocket not connected - cannot send text to AI');
      return;
    }

    try {
      const message = {
        type: 'text_message',
        text: text,
        model: this.config.model,
        language: this.config.language,
        timestamp: Date.now()
      };
      
      console.log('📤 Sending text to AI:', message);
      this.socket.send(JSON.stringify(message));
      
      // Show processing status
      this.callbacks.onLLMProcessing?.('AI is processing your message...');
      
    } catch (error) {
      console.error('❌ Failed to send text to AI:', error);
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
  getConfig(): VoiceStreamConfig {
    return { ...this.config };
  }

  // Private methods

  private constructWebSocketUrl(): string {
    // Use Azure Container Apps WebSocket URL
    return 'wss://imagomum-app.agreeablebeach-10200fd5.eastus2.azurecontainerapps.io/ws/transcribe';
  }

  private handleWebSocketMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 Received WebSocket message:', data);
      this.handleAIMessage(data);
    } catch (error) {
      console.error('❌ Failed to parse WebSocket message:', error);
    }
  }

  private handleAIMessage(data: any) {
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
        
      case 'ai_response':
      case 'llm_complete':
        console.log('🤖 AI Response:', data.message || data.response);
        this.callbacks.onLLMComplete?.(data.message || data.response || 'AI response received');
        break;
        
      case 'ai_processing':
      case 'llm_processing':
        console.log('🤖 AI is processing:', data.message);
        this.callbacks.onLLMProcessing?.(data.message || 'AI is thinking...');
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
    Voice.destroy();
  }
}

// Export singleton instance
const voiceStreamService = new VoiceStreamService();
export default voiceStreamService;
