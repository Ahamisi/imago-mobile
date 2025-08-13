import apiClient from './apiClient';

export interface ChatConversation {
  id: string;
  threadId: string;
  title: string;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatThread {
  threadId: string;
  title: string;
  preview: string; // API returns 'preview' not 'lastMessage'
  firstMessageAt: string;
  lastActivityAt: string; // API returns 'lastActivityAt' not 'lastMessageAt'
  totalMessages: number; // API returns 'totalMessages' not 'messageCount'
}

export interface ChatMessage {
  id: string;
  messageType: 'user' | 'assistant';
  contentType: 'text' | 'image' | 'voice' | 'file';
  content: string;
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentSize?: number;
  isStreaming?: boolean;
  streamingComplete?: boolean;
  createdAt: string;
}

export interface ChatFile {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  cloudUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface SendMessageRequest {
  conversationId?: string;
  threadId?: string;
  message: string;
  imagePath?: string; // For both images and voice files
}

export interface SendMessageResponse {
  conversation: {
    id: string;
    threadId: string;
    title: string;
    messageCount: number;
  };
  userMessage: ChatMessage;
  aiMessage: ChatMessage;
  aiResponse: {
    user_id: string;
    thread_id: string;
    response: string;
    timestamp: string;
  };
}

export interface StreamChunk {
  type: 'conversation' | 'chunk' | 'complete' | 'error';
  delta?: string;
  conversation?: any;
  userMessage?: ChatMessage;
  aiMessage?: ChatMessage;
  message?: string;
  user_id?: string;
  thread_id?: string;
  timestamp?: string;
}

class ChatService {
  private baseURL = '/chat';

  /**
   * Get user's threads (ChatGPT-style sidebar)
   */
  async getThreads(page: number = 1, limit: number = 20): Promise<{
    threads: ChatThread[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
    };
  }> {
    try {
      console.log('📱 Fetching threads...');
      const response = await apiClient.get(`${this.baseURL}/threads`, {
        params: { page, limit }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching threads:', error);
      throw error;
    }
  }

  /**
   * Get user's conversations with pagination (legacy)
   */
  async getConversations(page: number = 1, limit: number = 20): Promise<{
    conversations: ChatConversation[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
    };
  }> {
    try {
      console.log('📱 Fetching conversations...');
      const response = await apiClient.get(`${this.baseURL}/conversations`, {
        params: { page, limit }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      throw error;
    }
  }

  /**
   * Get messages for a specific thread (ChatGPT-style)
   */
  async getThreadMessages(
    threadId: string, 
    page: number = 1, 
    limit: number = 50
  ): Promise<{
    thread: {
      threadId: string;
      title: string;
      messageCount: number;
    };
    messages: ChatMessage[];
    pagination: any;
  }> {
    try {
      console.log('💬 Fetching messages for thread:', threadId);
      const response = await apiClient.get(
        `${this.baseURL}/threads/${threadId}/messages`,
        { params: { page, limit } }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching thread messages:', error);
      throw error;
    }
  }

  /**
   * Get messages for a specific conversation (legacy)
   */
  async getConversationMessages(
    conversationId: string, 
    page: number = 1, 
    limit: number = 50
  ): Promise<{
    conversation: {
      id: string;
      threadId: string;
      title: string;
      messageCount: number;
    };
    messages: ChatMessage[];
    pagination: any;
  }> {
    try {
      console.log('💬 Fetching messages for conversation:', conversationId);
      const response = await apiClient.get(
        `${this.baseURL}/conversations/${conversationId}/messages`,
        { params: { page, limit } }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Send a regular message and get AI response
   */
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      console.log('📤 Sending message:', request.message);
      const response = await apiClient.post(`${this.baseURL}/message`, request, {
        // Don't show success notification for chat messages
        headers: { 'X-Skip-Success-Notification': 'true' }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  /**
   * Upload file for chat (images or voice)
   */
  async uploadFile(file: {
    uri: string;
    type: string;
    name: string;
  }): Promise<ChatFile> {
    try {
      console.log('📁 Uploading file:', file.name);
      
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as any);

      const response = await apiClient.post(`${this.baseURL}/upload`, formData);
      
      return response.data.data.file;
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Send streaming message with Server-Sent Events
   */
  async sendStreamingMessage(
    request: SendMessageRequest,
    onChunk: (chunk: string) => void,
    onComplete: (data: any) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      console.log('🌊 Starting streaming message:', request.message);
      
      // Get auth token for streaming request
      const token = await import('../utils/storage').then(m => m.default.getAuthToken());
      
      const response = await fetch(`${apiClient.defaults.baseURL}${this.baseURL}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamChunk = JSON.parse(line.substring(6));
              
              if (data.type === 'chunk' && data.delta) {
                onChunk(data.delta);
              } else if (data.type === 'complete') {
                onComplete(data);
                return;
              } else if (data.type === 'error') {
                onError(data.message || 'Streaming error occurred');
                return;
              }
            } catch (parseError) {
              console.error('❌ Error parsing SSE data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in streaming message:', error);
      onError(error instanceof Error ? error.message : 'Streaming failed');
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting conversation:', conversationId);
      await apiClient.delete(`${this.baseURL}/conversations/${conversationId}`);
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      throw error;
    }
  }

  /**
   * Send voice message (upload voice file then send message)
   */
  async sendVoiceMessage(
    voiceFile: { uri: string; type: string; name: string },
    message: string = '',
    conversationId?: string
  ): Promise<SendMessageResponse> {
    try {
      console.log('🎤 Sending voice message...');
      
      // First upload the voice file
      const uploadedFile = await this.uploadFile(voiceFile);
      
      // Then send message with voice attachment
      return await this.sendMessage({
        conversationId,
        message: message || 'Voice message',
        imagePath: uploadedFile.cloudUrl, // API uses imagePath for all attachments
      });
    } catch (error) {
      console.error('❌ Error sending voice message:', error);
      throw error;
    }
  }

  /**
   * Send image message (upload image then send message)
   */
  async sendImageMessage(
    imageFile: { uri: string; type: string; name: string },
    message: string,
    conversationId?: string
  ): Promise<SendMessageResponse> {
    try {
      console.log('🖼️ Sending image message...');
      
      // First upload the image file
      const uploadedFile = await this.uploadFile(imageFile);
      
      // Then send message with image attachment
      return await this.sendMessage({
        conversationId,
        message,
        imagePath: uploadedFile.cloudUrl,
      });
    } catch (error) {
      console.error('❌ Error sending image message:', error);
      throw error;
    }
  }
}

export default new ChatService(); 