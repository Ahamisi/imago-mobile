import { Platform } from 'react-native';

export interface TranscriptionConfig {
  model: 'nova-3' | 'nova-2' | 'base';
  language: 'en-US' | 'en-UK' | 'es' | 'fr';
  sampleRate?: number;
}

export interface TranscriptionMessage {
  type: 'connected' | 'interim_transcript' | 'final_transcript' | 'status' | 'error' | 'tts_error' | 'llm_processing' | 'llm_complete';
  message?: string;
  transcript?: string;
  timestamp?: number;
}

export interface AudioTranscriptionCallbacks {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onInterimTranscript?: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  onStatus?: (message: string) => void;
  onError?: (error: string) => void;
  onAudioData?: (audioBuffer: ArrayBuffer) => void;
  onLLMProcessing?: (message: string) => void;
  onLLMComplete?: (message: string) => void;
}

class AudioTranscriptionService {
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private callbacks: AudioTranscriptionCallbacks = {};
  private config: TranscriptionConfig = {
    model: 'nova-3',
    language: 'en-US',
    sampleRate: 16000
  };

  // Audio recording state
  private isRecording: boolean = false;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: AudioWorkletNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  // Audio playback state
  private playbackContext: AudioContext | null = null;
  private nextPlayTime: number = 0;
  private readonly playbackSampleRate = 24000;

  constructor() {
    this.setupAudioContexts();
  }

  private setupAudioContexts() {
    // Setup will be done when needed to avoid iOS restrictions
  }

  /**
   * Set configuration for transcription
   */
  setConfig(config: Partial<TranscriptionConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set callbacks for various events
   */
  setCallbacks(callbacks: AudioTranscriptionCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Connect to the transcription WebSocket
   */
  async connect(wsUrl?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Use provided URL or construct default
        const url = wsUrl || this.constructWebSocketUrl();
        
        console.log('🔌 Connecting to transcription service:', url);
        
        this.socket = new WebSocket(url);
        this.socket.binaryType = 'arraybuffer';

        this.socket.onopen = () => {
          console.log('✅ Connected to transcription service');
          this.isConnected = true;
          this.setupPlaybackContext();
          this.callbacks.onConnected?.();
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleWebSocketMessage(event);
        };

        this.socket.onclose = () => {
          console.log('🔌 Transcription service disconnected');
          this.isConnected = false;
          this.callbacks.onDisconnected?.();
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
   * Disconnect from the transcription service
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.stopRecording();
    this.stopPlayback();
  }

  /**
   * Start transcription with current config
   */
  async startTranscription(): Promise<void> {
    if (!this.isConnected || !this.socket) {
      throw new Error('Not connected to transcription service');
    }

    console.log('🎤 Starting transcription with config:', this.config);

    // Send start command
    this.socket.send(JSON.stringify({
      action: 'start',
      model: this.config.model,
      language: this.config.language
    }));

    // Start audio recording
    await this.startAudioRecording();
  }

  /**
   * Stop transcription
   */
  async stopTranscription(): Promise<void> {
    console.log('⏹️ Stopping transcription');

    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({ action: 'stop' }));
    }

    await this.stopRecording();
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

  // Private methods

  private constructWebSocketUrl(): string {
    // Always use Azure Container Apps WebSocket URL (no local dev server available)
    return 'wss://imagomum-app.agreeablebeach-10200fd5.eastus2.azurecontainerapps.io/ws/transcribe';
  }

  /**
   * Enable demo mode for testing without WebSocket server
   */
  async connectDemo(): Promise<void> {
    console.log('🎭 Starting demo mode - no WebSocket server needed');
    
    // Simulate connection
    setTimeout(() => {
      console.log('✅ Demo mode connected');
      this.isConnected = true;
      this.callbacks.onConnected?.();
      this.callbacks.onStatus?.('Demo mode - WebSocket simulation active');
    }, 500);

    return Promise.resolve();
  }

  /**
   * Start demo transcription with mock responses
   */
  async startDemoTranscription(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Demo mode not connected');
    }

    console.log('🎤 Starting demo transcription...');
    this.isRecording = true;

    // Simulate interim transcripts
    const mockTranscripts = [
      'Hello',
      'Hello, I am',
      'Hello, I am having',
      'Hello, I am having some',
      'Hello, I am having some pregnancy',
      'Hello, I am having some pregnancy symptoms'
    ];

    let index = 0;
    const intervalId = setInterval(() => {
      if (index < mockTranscripts.length && this.isRecording) {
        this.callbacks.onInterimTranscript?.(mockTranscripts[index]);
        index++;
      } else {
        clearInterval(intervalId);
        if (this.isRecording) {
          this.callbacks.onFinalTranscript?.('Hello, I am having some pregnancy symptoms. Can you help me understand what this means?');
          
          // Simulate AI processing
          setTimeout(() => {
            this.callbacks.onLLMProcessing?.('AI is analyzing your symptoms...');
          }, 1000);
          
          setTimeout(() => {
            this.callbacks.onLLMComplete?.('Based on your symptoms, it\'s common to experience various changes during pregnancy. I recommend discussing these with your healthcare provider for personalized advice.');
          }, 3000);
        }
      }
    }, 800);

    return Promise.resolve();
  }

  /**
   * Stop demo transcription
   */
  async stopDemoTranscription(): Promise<void> {
    console.log('⏹️ Stopping demo transcription');
    this.isRecording = false;
    return Promise.resolve();
  }

  private handleWebSocketMessage(event: MessageEvent) {
    if (event.data instanceof ArrayBuffer) {
      // Handle audio data (TTS response)
      this.handleAudioPlayback(event.data);
    } else {
      // Handle JSON messages
      try {
        const data: TranscriptionMessage = JSON.parse(event.data);
        this.handleTranscriptionMessage(data);
      } catch (error) {
        console.error('❌ Failed to parse WebSocket message:', error);
      }
    }
  }

  private handleTranscriptionMessage(data: TranscriptionMessage) {
    const timestamp = Date.now();
    
    switch (data.type) {
      case 'connected':
        console.log('📡 Service connected:', data.message);
        this.callbacks.onStatus?.(data.message || 'Connected');
        break;
        
      case 'interim_transcript':
        console.log('📝 Interim:', data.transcript);
        this.callbacks.onInterimTranscript?.(data.transcript || '');
        break;
        
      case 'final_transcript':
        console.log('✅ Final:', data.transcript);
        this.callbacks.onFinalTranscript?.(data.transcript || '');
        break;
        
      case 'status':
        console.log('ℹ️ Status:', data.message);
        this.callbacks.onStatus?.(data.message || '');
        break;
        
      case 'error':
      case 'tts_error':
        console.error('❌ Error:', data.message);
        this.callbacks.onError?.(data.message || 'Unknown error');
        break;
        
      case 'llm_processing':
        console.log('🤖 LLM Processing:', data.message);
        this.callbacks.onLLMProcessing?.(data.message || 'Processing...');
        break;
        
      case 'llm_complete':
        console.log('✅ LLM Complete:', data.message);
        this.callbacks.onLLMComplete?.(data.message || 'Complete');
        break;
        
      default:
        console.log('📨 Unknown message type:', data);
    }
  }

  private async startAudioRecording(): Promise<void> {
    try {
      console.log('🎤 Starting React Native audio recording...');
      
      // For React Native, we'll use a different approach
      // This is a placeholder for React Native audio recording
      // In a real implementation, you'd use @react-native-voice/voice or similar
      
      if (Platform.OS === 'web') {
        // Web implementation (for testing in browser)
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: this.config.sampleRate,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });

        // Create audio context if needed
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: this.config.sampleRate
          });
        }

        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }

        // Load audio processor worklet
        await this.audioContext.audioWorklet.addModule('/static/audio-processor.js');
        
        // Create processor node
        this.processor = new AudioWorkletNode(this.audioContext, 'audio-processor');
        
        // Create source from microphone
        this.source = this.audioContext.createMediaStreamSource(stream);
        
        // Connect audio graph
        this.source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);

        // Handle processed audio data
        this.processor.port.onmessage = (event) => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(event.data);
          }
        };

        this.mediaStream = stream;
      } else {
        // React Native implementation
        console.log('📱 React Native audio recording not yet implemented - using demo mode');
        // For now, we'll just simulate recording
        // In a real implementation, you'd integrate with @react-native-voice/voice
      }

      this.isRecording = true;
      console.log('✅ Audio recording started');
      
    } catch (error) {
      console.error('❌ Failed to start audio recording:', error);
      throw error;
    }
  }

  private async stopRecording(): Promise<void> {
    console.log('⏹️ Stopping audio recording...');

    this.isRecording = false;

    // Disconnect audio nodes
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    // Stop media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    // Close audio context
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    console.log('✅ Audio recording stopped');
  }

  private setupPlaybackContext() {
    if (!this.playbackContext) {
      this.playbackContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.playbackSampleRate
      });
      this.nextPlayTime = this.playbackContext.currentTime;
    }
  }

  private handleAudioPlayback(audioBuffer: ArrayBuffer) {
    if (!this.playbackContext) {
      this.setupPlaybackContext();
    }

    if (!this.playbackContext) return;

    try {
      const pcmData = new Int16Array(audioBuffer);
      const frameCount = pcmData.length;
      const audioBufferNode = this.playbackContext.createBuffer(1, frameCount, this.playbackSampleRate);
      const bufferData = audioBufferNode.getChannelData(0);

      // Convert PCM to float
      for (let i = 0; i < frameCount; i++) {
        bufferData[i] = pcmData[i] / 32768.0;
      }

      // Create and schedule playback
      const source = this.playbackContext.createBufferSource();
      source.buffer = audioBufferNode;
      source.connect(this.playbackContext.destination);

      const currentTime = this.playbackContext.currentTime;
      if (this.nextPlayTime < currentTime) {
        this.nextPlayTime = currentTime;
      }

      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBufferNode.duration;

      this.callbacks.onAudioData?.(audioBuffer);

    } catch (error) {
      console.error('❌ Audio playback error:', error);
    }
  }

  private async stopPlayback(): Promise<void> {
    if (this.playbackContext) {
      await this.playbackContext.close();
      this.playbackContext = null;
      this.nextPlayTime = 0;
    }
  }
}

// Export singleton instance
export const audioTranscriptionService = new AudioTranscriptionService();
export default audioTranscriptionService;

