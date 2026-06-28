import Voice from '@react-native-voice/voice';
import RNFS from 'react-native-fs';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { StorageService } from '../utils/storage';

export interface AudioChatMessage {
  type: 'connected' | 'status' | 'interim_transcript' | 'final_transcript' | 'llm_processing' | 'llm_complete' | 'error';
  message?: string;
  transcript?: string;
  sessionId?: string;
}

export interface AudioChatCallbacks {
  onConnected?: (message: AudioChatMessage) => void;
  onStatus?: (status: string) => void;
  onInterimTranscript?: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  onAIProcessing?: (message: string) => void;
  onAIComplete?: (message: string) => void;
  onAudioReceived?: (audioData: Blob) => void;
  onError?: (error: string) => void;
}

class AudioChatService {
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private isRecording: boolean = false;
  private isVoiceInitialized: boolean = false;
  private currentThreadId: string | null = null;
  private isStoppingRecording: boolean = false;
  
  // Callbacks
  public onConnected?: (message: AudioChatMessage) => void;
  public onStatus?: (status: string) => void;
  public onInterimTranscript?: (transcript: string) => void;
  public onFinalTranscript?: (transcript: string) => void;
  public onAIProcessing?: (message: string) => void;
  public onAIComplete?: (message: string) => void;
  public onAudioReceived?: (audioData: Blob) => void;
  public onError?: (error: string) => void;

  constructor() {
    // Don't initialize Voice in constructor - wait until it's actually needed
    console.log('🎤 AudioChatService created');
  }

  private async checkPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
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
      } else {
        // For iOS, permissions are handled by the system when Voice.start() is called
        // We don't need to test permissions beforehand - just let the system handle it
        console.log('🍎 iOS: Permissions will be requested by system when needed');
        return true;
      }
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  private async initializeVoice(): Promise<void> {
    if (this.isVoiceInitialized) return;

    try {
      console.log('🗣️ Initializing Voice recognition...');
      
      // Destroy any existing Voice instance first to prevent conflicts
      try {
        await Voice.destroy();
      } catch (destroyError) {
        // Ignore errors when destroying - it might not exist yet
        console.log('Voice destroy during init (expected):', destroyError);
      }

      // Set up Voice recognition callbacks
      Voice.onSpeechStart = () => {
        console.log('🎤 Speech started');
        this.onStatus?.('Listening...');
      };

      Voice.onSpeechPartialResults = (e: any) => {
        if (e.value && e.value[0]) {
          console.log('👂 Partial:', e.value[0]);
          this.onInterimTranscript?.(e.value[0]);
        }
      };

      Voice.onSpeechResults = (e: any) => {
        if (e.value && e.value[0]) {
          console.log('🗣️ Final:', e.value[0]);
          const transcript = e.value[0];
          
          // Send transcript to AI via WebSocket
          this.sendTranscriptToAI(transcript);
          
          // Also call the callback for UI updates
          this.onFinalTranscript?.(transcript);
        }
      };

      Voice.onSpeechError = (e: any) => {
        console.error('❌ Speech error:', e.error);
        this.onError?.(e.error?.message || 'Speech recognition error');
      };

      Voice.onSpeechEnd = () => {
        console.log('🛑 Speech ended');
        this.isRecording = false;
      };

      this.isVoiceInitialized = true;
      console.log('✅ Voice initialization complete');
    } catch (error) {
      console.error('❌ Voice initialization error:', error);
      this.isVoiceInitialized = false;
      throw error;
    }
  }

  async connect(jwtToken?: string): Promise<void> {
    try {
      console.log('🔌 [AUDIO_DEBUG] === CONNECT INITIATED ===');
      
      // Get token from storage if not provided
      const token = jwtToken || await StorageService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      console.log('🔌 [AUDIO_DEBUG] Auth token available:', !!token);

      // WebSocket URL - update this to match your backend
      const wsUrl = `ws://localhost:3000/api/v1/chat/audio?token=${token}`;
      console.log('🔌 [AUDIO_DEBUG] Connecting to WebSocket:', wsUrl);
      
      this.socket = new WebSocket(wsUrl);
      console.log('🔌 [AUDIO_DEBUG] WebSocket instance created');

      return new Promise((resolve, reject) => {
        if (!this.socket) {
          reject(new Error('Failed to create WebSocket'));
          return;
        }

        this.socket.onopen = () => {
          this.isConnected = true;
          console.log('✅ [AUDIO_DEBUG] === WEBSOCKET CONNECTED ===');
          console.log('✅ [AUDIO_DEBUG] Connection established successfully');
          resolve();
        };

        this.socket.onerror = (error) => {
          console.error('❌ [AUDIO_DEBUG] === WEBSOCKET ERROR ===');
          console.error('❌ [AUDIO_DEBUG] Connection failed:', error);
          this.onError?.('Failed to connect to audio service');
          reject(error);
        };

        this.socket.onclose = (event) => {
          this.isConnected = false;
          console.log('🔌 [AUDIO_DEBUG] === WEBSOCKET DISCONNECTED ===');
          console.log('🔌 [AUDIO_DEBUG] Close code:', event.code);
          console.log('🔌 [AUDIO_DEBUG] Close reason:', event.reason);
        };

        this.socket.onmessage = (event: any) => {
          console.log('📨 [AUDIO_DEBUG] WebSocket message received');
          this.handleMessage(event);
        };
      });
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  private sendTranscriptToAI(transcript: string): void {
    if (!this.socket || !this.isConnected) {
      console.error('🚫 [AUDIO_DEBUG] Cannot send transcript - WebSocket not connected');
      return;
    }

    const message = {
      type: 'user_message',
      content: transcript,
      threadId: this.currentThreadId,
      timestamp: new Date().toISOString()
    };

    console.log('📤 [AUDIO_DEBUG] Sending transcript to AI:', transcript);
    console.log('📤 [AUDIO_DEBUG] Message payload:', message);
    
    try {
      this.socket.send(JSON.stringify(message));
      console.log('✅ [AUDIO_DEBUG] Transcript sent successfully');
    } catch (error) {
      console.error('❌ [AUDIO_DEBUG] Failed to send transcript:', error);
      this.onError?.('Failed to send message to AI');
    }
  }

  async startVoiceChat(model: string = 'nova-3', language: string = 'en-US'): Promise<void> {
    console.log('🎤 [AUDIO_DEBUG] === START VOICE CHAT INITIATED ===');
    console.log('🎤 [AUDIO_DEBUG] Model:', model, 'Language:', language);
    console.log('🎤 [AUDIO_DEBUG] Current thread ID:', this.currentThreadId);
    console.log('🎤 [AUDIO_DEBUG] Is connected:', this.isConnected);
    console.log('🎤 [AUDIO_DEBUG] Socket exists:', !!this.socket);
    console.log('🎤 [AUDIO_DEBUG] Is recording:', this.isRecording);
    console.log('🎤 [AUDIO_DEBUG] Is voice initialized:', this.isVoiceInitialized);
    
    if (!this.isConnected || !this.socket) {
      console.error('❌ [AUDIO_DEBUG] Not connected to audio service');
      throw new Error('Not connected to audio service');
    }

    try {
      console.log('🎤 [AUDIO_DEBUG] Sending start audio session message...');
      // Start audio session
      const startMessage = {
        action: 'start',
        model: model,
        language: language
      };
      console.log('🎤 [AUDIO_DEBUG] Start message:', startMessage);
      this.socket.send(JSON.stringify(startMessage));
      console.log('🎤 [AUDIO_DEBUG] Start message sent successfully');

      // Set thread if continuing existing conversation
      if (this.currentThreadId) {
        console.log('🎤 [AUDIO_DEBUG] Setting thread ID for existing conversation...');
        const threadMessage = {
          action: 'set_thread',
          threadId: this.currentThreadId
        };
        console.log('🎤 [AUDIO_DEBUG] Thread message:', threadMessage);
        this.socket.send(JSON.stringify(threadMessage));
        console.log('🎤 [AUDIO_DEBUG] Thread message sent successfully');
      } else {
        console.log('🎤 [AUDIO_DEBUG] No existing thread ID, starting new conversation');
      }

      console.log('🎤 [AUDIO_DEBUG] Starting recording...');
      // Start recording
      await this.startRecording();
      console.log('🎤 [AUDIO_DEBUG] Recording started successfully');
      console.log('🎤 [AUDIO_DEBUG] === START VOICE CHAT COMPLETED ===');
      
    } catch (error) {
      console.error('❌ [AUDIO_DEBUG] === START VOICE CHAT FAILED ===');
      console.error('❌ [AUDIO_DEBUG] Failed to start voice chat:', error);
      console.error('❌ [AUDIO_DEBUG] Error message:', (error as Error).message);
      console.error('❌ [AUDIO_DEBUG] Error stack:', (error as Error).stack);
      throw error;
    }
  }

    async stopVoiceChat(): Promise<void> {
    console.log('🛑 [AUDIO_DEBUG] === STOP VOICE CHAT INITIATED ===');
    console.log('🛑 [AUDIO_DEBUG] Is connected:', this.isConnected);
    console.log('🛑 [AUDIO_DEBUG] Socket exists:', !!this.socket);
    console.log('🛑 [AUDIO_DEBUG] Socket ready state:', this.socket?.readyState);
    console.log('🛑 [AUDIO_DEBUG] Is recording:', this.isRecording);
    console.log('🛑 [AUDIO_DEBUG] Is stopping recording:', this.isStoppingRecording);
    
    try {
      // Stop transcription
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.log('🛑 [AUDIO_DEBUG] Sending stop message to socket...');
        this.socket.send(JSON.stringify({ action: 'stop' }));
        console.log('🛑 [AUDIO_DEBUG] Stop message sent successfully');
      } else {
        console.log('🛑 [AUDIO_DEBUG] Socket not available or not open, skipping stop message');
      }

      console.log('🛑 [AUDIO_DEBUG] Stopping recording...');
      // Stop recording
      await this.stopRecording();
      console.log('🛑 [AUDIO_DEBUG] Recording stopped successfully');
      console.log('🛑 [AUDIO_DEBUG] === STOP VOICE CHAT COMPLETED ===');
      
    } catch (error) {
      console.error('❌ [AUDIO_DEBUG] === STOP VOICE CHAT FAILED ===');
      console.error('❌ [AUDIO_DEBUG] Failed to stop voice chat:', error);
      console.error('❌ [AUDIO_DEBUG] Error message:', (error as Error).message);
      console.error('❌ [AUDIO_DEBUG] Error stack:', (error as Error).stack);
      throw error;
    }
  }

  private async startRecording(): Promise<void> {
    console.log('🎤 [AUDIO_DEBUG] === START RECORDING INITIATED ===');
    console.log('🎤 [AUDIO_DEBUG] Is recording:', this.isRecording);
    console.log('🎤 [AUDIO_DEBUG] Is voice initialized:', this.isVoiceInitialized);
    console.log('🎤 [AUDIO_DEBUG] Is stopping recording:', this.isStoppingRecording);
    
    try {
      console.log('🎤 [AUDIO_DEBUG] Starting voice recognition...');
      
      console.log('🎤 [AUDIO_DEBUG] Ensuring Voice is initialized first...');
      // Ensure Voice is initialized first
      await this.initializeVoice();
      console.log('🎤 [AUDIO_DEBUG] Voice initialization completed');
      
      // Start voice recognition - iOS will handle permission dialog automatically
      console.log('🎤 [AUDIO_DEBUG] Calling Voice.start() with en-US...');
      await Voice.start('en-US');
      console.log('🎤 [AUDIO_DEBUG] Voice.start() completed successfully');
      
      this.isRecording = true;
      console.log('🎤 [AUDIO_DEBUG] Recording state set to true');
      
      console.log('✅ [AUDIO_DEBUG] Voice recognition started successfully');
      console.log('🎤 [AUDIO_DEBUG] === START RECORDING COMPLETED ===');

    } catch (error) {
      console.error('❌ [AUDIO_DEBUG] === START RECORDING FAILED ===');
      console.error('❌ [AUDIO_DEBUG] Failed to start voice recognition:', error);
      console.error('❌ [AUDIO_DEBUG] Error type:', typeof error);
      console.error('❌ [AUDIO_DEBUG] Error instanceof Error:', error instanceof Error);
      
      this.isRecording = false; // Ensure state is reset on error
      console.log('❌ [AUDIO_DEBUG] Recording state reset to false due to error');
      
      // Handle specific permission errors
      if (error instanceof Error) {
        console.log('❌ [AUDIO_DEBUG] Error message:', error.message);
        console.log('❌ [AUDIO_DEBUG] Error stack:', error.stack);
        if (error.message.includes('not authorized') || error.message.includes('permission')) {
          console.log('❌ [AUDIO_DEBUG] Permission error detected, calling onError callback');
          this.onError?.('Microphone permission is required. Please enable it in Settings > Privacy & Security > Microphone > ImagoMUm');
        } else {
          console.log('❌ [AUDIO_DEBUG] General error, calling onError callback with message:', error.message);
          this.onError?.(error.message);
        }
      } else {
        console.log('❌ [AUDIO_DEBUG] Non-Error object, calling onError with generic message');
        this.onError?.('Failed to start voice recognition');
      }
      console.log('❌ [AUDIO_DEBUG] === START RECORDING ERROR HANDLING COMPLETED ===');
      throw error;
    }
  }

  private async stopRecording(): Promise<void> {
    console.log('🛑 [AUDIO_DEBUG] === STOP RECORDING INITIATED ===');
    console.log('🛑 [AUDIO_DEBUG] Is recording:', this.isRecording);
    console.log('🛑 [AUDIO_DEBUG] Is stopping recording:', this.isStoppingRecording);
    console.log('🛑 [AUDIO_DEBUG] Is voice initialized:', this.isVoiceInitialized);
    
    if (!this.isRecording || this.isStoppingRecording) {
      console.log('🛑 [AUDIO_DEBUG] Recording already stopped or stopping in progress - exiting');
      return;
    }

    try {
      console.log('🛑 [AUDIO_DEBUG] Stopping voice recognition...');
      
      // Set flags to prevent multiple calls
      console.log('🛑 [AUDIO_DEBUG] Setting recording state to false...');
      this.isRecording = false;
      console.log('🛑 [AUDIO_DEBUG] Setting stopping flag to true...');
      this.isStoppingRecording = true;
      
      console.log('🛑 [AUDIO_DEBUG] Calling Voice.stop() with 5s timeout...');
      // Stop voice recognition with timeout to prevent hanging
      await Promise.race([
        Voice.stop(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Voice.stop() timeout')), 5000)
        )
      ]);
      console.log('🛑 [AUDIO_DEBUG] Voice.stop() completed successfully');
      
      console.log('✅ [AUDIO_DEBUG] Voice recognition stopped successfully');
      console.log('🛑 [AUDIO_DEBUG] === STOP RECORDING COMPLETED ===');

    } catch (error) {
      console.error('❌ [AUDIO_DEBUG] === STOP RECORDING FAILED ===');
      console.error('❌ [AUDIO_DEBUG] Failed to stop voice recognition:', error);
      console.error('❌ [AUDIO_DEBUG] Error message:', (error as Error).message);
      console.error('❌ [AUDIO_DEBUG] Error stack:', (error as Error).stack);
      // Don't throw error on stop - just log it
      // The recording state is already set to false
      console.log('❌ [AUDIO_DEBUG] Not throwing error - stop errors are non-fatal');
    } finally {
      // Reset stopping flag
      console.log('🛑 [AUDIO_DEBUG] Resetting stopping flag to false...');
      this.isStoppingRecording = false;
      console.log('🛑 [AUDIO_DEBUG] === STOP RECORDING CLEANUP COMPLETED ===');
    }
  }

  private handleMessage(event: any): void {
    // Check if it's binary audio data
    if (event.data instanceof Blob) {
      // Handle TTS audio response
      this.handleAudioData(event.data);
      this.onAudioReceived?.(event.data);
    } else {
      // Handle JSON control messages
      try {
        const message: AudioChatMessage = JSON.parse(event.data);
        this.handleControlMessage(message);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    }
  }

  private handleControlMessage(message: AudioChatMessage): void {
    console.log('📥 Control message:', message);

    switch (message.type) {
      case 'connected':
        console.log(`🔗 Connected: Session ${message.sessionId}`);
        this.onConnected?.(message);
        break;

      case 'status':
        console.log(`ℹ️ Status: ${message.message}`);
        this.onStatus?.(message.message || '');
        break;

      case 'interim_transcript':
        console.log(`👂 Hearing: "${message.transcript}"`);
        this.onInterimTranscript?.(message.transcript || '');
        break;

      case 'final_transcript':
        console.log(`🗣️ You said: "${message.transcript}"`);
        this.onFinalTranscript?.(message.transcript || '');
        break;

      case 'llm_processing':
        console.log(`🤖 ${message.message}`);
        this.onAIProcessing?.(message.message || 'AI is processing...');
        break;

      case 'llm_complete':
        console.log(`✅ ${message.message}`);
        this.onAIComplete?.(message.message || 'AI response complete');
        break;

      case 'error':
        console.error(`❌ Error: ${message.message}`);
        this.onError?.(message.message || 'Unknown error occurred');
        break;

      default:
        console.log('Unknown message type:', message);
    }
  }

  private async handleAudioData(audioBlob: Blob): Promise<void> {
    try {
      // For React Native, we need to handle audio playback differently
      // This is a simplified version - in production you'd want to:
      // 1. Convert blob to file
      // 2. Save temporarily 
      // 3. Play using react-native-sound or similar
      
      console.log('🔊 Received audio data:', audioBlob.size, 'bytes');
      
      // Simulate audio playback for now
      this.onStatus?.('Playing AI response...');
      
      // In a real implementation:
      // await this.playAudioBlob(audioBlob);
      
    } catch (error) {
      console.error('Failed to handle audio data:', error);
      this.onError?.('Failed to play audio response');
    }
  }

  // Getters and setters
  get connected(): boolean {
    return this.isConnected;
  }

  get recording(): boolean {
    return this.isRecording;
  }

  setThreadId(threadId: string | null): void {
    this.currentThreadId = threadId;
  }

  getThreadId(): string | null {
    return this.currentThreadId;
  }

  // Cleanup
  async cleanup(): Promise<void> {
    try {
      console.log('🧹 [AUDIO_DEBUG] === CLEANUP INITIATED ===');
      
      // Force reset states immediately
      this.isRecording = false;
      this.isStoppingRecording = false;
      
      // Stop recording first
      if (this.isRecording) {
        console.log('🛑 [AUDIO_DEBUG] Stopping recording during cleanup...');
        await this.stopRecording();
      }
      
      // Disconnect WebSocket
      this.disconnect();
      
      // Clean up Voice recognition
      if (this.isVoiceInitialized) {
        console.log('🗣️ Destroying Voice instance...');
        try {
          await Voice.destroy();
          this.isVoiceInitialized = false;
          console.log('✅ Voice destroyed successfully');
        } catch (voiceError) {
          console.error('Voice destroy error (non-critical):', voiceError);
          // Don't throw - just log the error
          this.isVoiceInitialized = false;
        }
      }
      
      // Clear callbacks
      this.onConnected = undefined;
      this.onStatus = undefined;
      this.onInterimTranscript = undefined;
      this.onFinalTranscript = undefined;
      this.onAIProcessing = undefined;
      this.onAIComplete = undefined;
      this.onAudioReceived = undefined;
      this.onError = undefined;
      
      console.log('✅ [AUDIO_DEBUG] === CLEANUP COMPLETED ===');
      
    } catch (error) {
      console.error('Cleanup error:', error);
      // Don't throw - cleanup should always succeed
    }
  }
}

// Export singleton instance
export const audioChatService = new AudioChatService();
export default AudioChatService; 