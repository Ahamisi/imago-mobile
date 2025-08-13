import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { NoChatHistoryIcon } from '../../components/icons/NoChatHistoryIcon';
import { ImagoAIAvatarIcon } from '../../components/icons/ImagoAIAvatarIcon';
import { MicrophoneIcon } from '../../components/icons/MicrophoneIcon';
import { AttachmentIcon } from '../../components/icons/AttachmentIcon';
import { WaveformIcon } from '../../components/icons/WaveformIcon';
import { StopRecordingIcon } from '../../components/icons/StopRecordingIcon';
import { PDFIcon } from '../../components/icons/PDFIcon';
import { NewChatIcon } from '../../components/icons/NewChatIcon';
import { SendIcon } from '../../components/icons/SendIcon';
import chatService, { ChatConversation, ChatThread, ChatMessage as APIChatMessage } from '../../services/chatService';
import LinearGradient from 'react-native-linear-gradient';

interface ChatHistoryItem {
  id: string;
  title: string;
  date: string;
  iconColor: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'recommendation' | 'file';
  content: string;
  timestamp: Date;
  fileType?: 'pdf';
  fileName?: string;
}

type ChatScreenMode = 'history' | 'chat' | 'newChat';

// Helper function to format dates in a friendly way
const formatFriendlyDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown date';
  }
};

const ChatScreen: React.FC = () => {
  const [mode, setMode] = useState<ChatScreenMode>('history');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [messageText, setMessageText] = useState('');
  const [hasHistory, setHasHistory] = useState(false);
  const [recordingPath, setRecordingPath] = useState('');
  const [waveformAnimation] = useState(new Animated.Value(1));
  const [waveformOpacity] = useState(new Animated.Value(1));
  const [thinkingAnimation] = useState(new Animated.Value(0));
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null); // Persist threadId for same chat session
  const [messages, setMessages] = useState<APIChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Ref for auto-scrolling chat messages
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start waveform animation
      const animateWaveform = () => {
        Animated.parallel([
          Animated.sequence([
            Animated.timing(waveformAnimation, {
              toValue: 1.3,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(waveformAnimation, {
              toValue: 0.7,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(waveformOpacity, {
              toValue: 0.6,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(waveformOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          if (isRecording) {
            animateWaveform();
          }
        });
      };
      animateWaveform();
    } else {
      // Reset animation when not recording
      Animated.parallel([
        Animated.timing(waveformAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(waveformOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, waveformAnimation, waveformOpacity]);

  // Thinking animation effect
  useEffect(() => {
    if (isTyping) {
      const spinAnimation = () => {
        Animated.timing(thinkingAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }).start(() => {
          thinkingAnimation.setValue(0);
          if (isTyping) {
            spinAnimation();
          }
        });
      };
      spinAnimation();
    } else {
      thinkingAnimation.setValue(0);
    }
  }, [isTyping, thinkingAnimation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && mode === 'chat') {
      // Small delay to ensure the message is rendered before scrolling
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, mode]);

  // Load threads on component mount
  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Attempting to load threads...');
      const data = await chatService.getThreads();
      console.log('✅ Threads loaded:', data.threads.length);
      setThreads(data.threads);
      setHasHistory(data.threads.length > 0);
    } catch (error) {
      console.error('❌ Failed to load threads, falling back to conversations:', error);
      // Fallback to conversations if threads endpoint fails
      try {
        const fallbackData = await chatService.getConversations();
        console.log('📋 Fallback conversations loaded:', fallbackData.conversations.length);
        
        // Group conversations by threadId to simulate threads
        const threadMap = new Map<string, ChatThread>();
        fallbackData.conversations.forEach(conv => {
          const existing = threadMap.get(conv.threadId);
          if (!existing || new Date(conv.lastMessageAt) > new Date(existing.lastActivityAt)) {
            threadMap.set(conv.threadId, {
              threadId: conv.threadId,
              title: conv.title,
              preview: conv.lastMessage,
              firstMessageAt: conv.createdAt,
              lastActivityAt: conv.lastMessageAt,
              totalMessages: conv.messageCount,
            });
          }
        });
        
        const groupedThreads = Array.from(threadMap.values());
        console.log('🔗 Grouped into threads:', groupedThreads.length);
        setThreads(groupedThreads);
        setConversations(fallbackData.conversations);
        setHasHistory(groupedThreads.length > 0);
      } catch (fallbackError) {
        console.error('❌ Failed to load conversations as fallback:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadThreadMessages = async (threadId: string) => {
    try {
      setIsLoading(true);
      console.log('💬 Loading messages for thread:', threadId);
      
      try {
        // Try the new thread endpoint first
        const data = await chatService.getThreadMessages(threadId);
        console.log('✅ Thread messages loaded:', data.messages.length);
        setMessages(data.messages);
        
              // Find the full thread from our list and set it as current
      const fullThread = threads.find(t => t.threadId === threadId);
      if (fullThread) {
        setCurrentThread(fullThread);
        setCurrentThreadId(fullThread.threadId); // Set threadId for follow-up messages
        console.log('💾 Set threadId for existing thread:', fullThread.threadId);
      }
      } catch (threadError) {
        console.log('❌ Thread endpoint failed, trying conversation fallback...');
        // Fallback: find the most recent conversation with this threadId
        const threadConversations = conversations.filter(c => c.threadId === threadId);
        if (threadConversations.length > 0) {
          // Sort by updatedAt and get the most recent one
          const latestConversation = threadConversations.sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0];
          
          console.log('🔄 Loading conversation messages for:', latestConversation.id);
          const data = await chatService.getConversationMessages(latestConversation.id);
          setMessages(data.messages);
          setCurrentConversation(latestConversation);
        } else {
          throw new Error('No conversations found for this thread');
        }
      }
    } catch (error) {
      console.error('❌ Failed to load thread messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    try {
      setIsLoading(true);
      const data = await chatService.getConversationMessages(conversationId);
      setMessages(data.messages);
      
      // Find the full conversation from our list
      const fullConversation = conversations.find(c => c.id === conversationId);
      if (fullConversation) {
        setCurrentConversation(fullConversation);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // File picker functionality
  const handleFilePicker = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.audio],
        allowMultiSelection: false,
      });
      
      if (result && result.length > 0) {
        const file = result[0];
        
        // Check if it's an image or audio file
        const isImage = file.type?.startsWith('image/');
        const isAudio = file.type?.startsWith('audio/');
        
        if (isImage) {
          // Send as image message
          await sendImageMessage(file);
        } else if (isAudio) {
          // Send as voice message
          await sendVoiceMessage(file);
        } else {
          Alert.alert('Unsupported File', 'Please select an image or audio file.');
        }
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled file picker');
      } else {
        console.error('File picker error:', err);
        Alert.alert('Error', 'Failed to pick file');
      }
    }
  };

  // Voice recording functionality
  const startRecording = async () => {
    try {
      setIsRecording(true);
      setRecordingTime(0);
      // Here you would start actual recording
      console.log('Started recording...');
    } catch (error) {
      console.error('Recording start error:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      // Here you would stop actual recording and process the audio
      console.log('Stopped recording...');
      Alert.alert('Recording Complete', `Recorded for ${recordingTime} seconds`);
    } catch (error) {
      console.error('Recording stop error:', error);
    }
  };

  // Send quick message from suggestions
  const sendQuickMessage = async (message: string) => {
    if (isSending) return; // Prevent multiple sends
    
    try {
      setIsSending(true);
      setIsTyping(true);
      
      // Use persisted threadId if available (for follow-up quick messages)
      const threadId = currentThreadId || undefined;
      console.log('📤 Sending quick message to thread:', threadId);
      
      const response = await chatService.sendMessage({
        message: message,
        threadId: threadId,
      });
      
      // Store threadId from response for future messages in this chat session
      if (response.conversation?.threadId && !currentThreadId) {
        console.log('💾 Storing threadId for session:', response.conversation.threadId);
        setCurrentThreadId(response.conversation.threadId);
      }
      
      // Add messages to the list
      setMessages([response.userMessage, response.aiMessage]);
      
      // Set current conversation
      const fullConversation = conversations.find(c => c.id === response.conversation.id);
      if (fullConversation) {
        setCurrentConversation(fullConversation);
      }
      
      // Switch to chat mode
      setMode('chat');
      
      // Refresh threads list
      await loadThreads();
    } catch (error) {
      console.error('Failed to send quick message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  // Send message functionality
  const sendMessage = async () => {
    if (!messageText.trim() || isSending) return; // Prevent multiple sends
    
    const messageToSend = messageText.trim();
    
    try {
      setIsSending(true);
      setIsTyping(true);
      
      // Clear input immediately for better UX
      setMessageText('');
      
      // Add user message immediately to UI
      const tempUserMessage: APIChatMessage = {
        id: `temp-${Date.now()}`,
        messageType: 'user',
        contentType: 'text',
        content: messageToSend,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempUserMessage]);
      
      // Use persisted threadId for follow-up messages, or existing thread/conversation threadId
      const threadId = currentThreadId || currentThread?.threadId || currentConversation?.threadId;
      console.log('📤 Sending message to thread:', threadId, 'conversation:', currentConversation?.id);

      const response = await chatService.sendMessage({
        conversationId: currentConversation?.id,
        threadId: threadId,
        message: messageToSend,
      });
      
      // Store threadId from response for future messages in this chat session
      if (response.conversation?.threadId && !currentThreadId) {
        console.log('💾 Storing threadId for session:', response.conversation.threadId);
        setCurrentThreadId(response.conversation.threadId);
      }
      
      console.log('✅ Message sent successfully');
      
      // Replace temp message with real messages
      setMessages(prev => {
        const withoutTemp = prev.filter(m => !m.id.startsWith('temp-'));
        return [...withoutTemp, response.userMessage, response.aiMessage];
      });
      
      // Set current conversation and switch to chat mode
      const fullConversation = conversations.find(c => c.id === response.conversation.id);
      if (fullConversation) {
        setCurrentConversation(fullConversation);
      }
      
      // Switch to chat mode
      setMode('chat');
      
      // Refresh threads list to get updated conversation
      await loadThreads();
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      
      // Restore message text on error
      setMessageText(messageToSend);
      
      // Remove temp message on error
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')));
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  // Send image message
  const sendImageMessage = async (file: any) => {
    try {
      setIsLoading(true);
      const response = await chatService.sendImageMessage(
        file,
        'Can you analyze this image?',
        currentConversation?.id
      );
      
      setMessages(prev => [...prev, response.userMessage, response.aiMessage]);
      await loadThreads();
    } catch (error) {
      console.error('Failed to send image:', error);
      Alert.alert('Error', 'Failed to send image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send voice message
  const sendVoiceMessage = async (file: any) => {
    try {
      setIsLoading(true);
      const response = await chatService.sendVoiceMessage(
        file,
        'Voice message',
        currentConversation?.id
      );
      
      setMessages(prev => [...prev, response.userMessage, response.aiMessage]);
      await loadThreads();
    } catch (error) {
      console.error('Failed to send voice message:', error);
      Alert.alert('Error', 'Failed to send voice message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock chat history data
  const chatHistory: ChatHistoryItem[] = [
    {
      id: '1',
      title: 'Recommend pregnancy exercise',
      date: 'June 24, 2025',
      iconColor: '#1997D4',
    },
    {
      id: '2',
      title: 'Recommend pregnancy exercise',
      date: 'June 24, 2025',
      iconColor: '#8B5CF6',
    },
    {
      id: '3',
      title: 'Recommend pregnancy exercise',
      date: 'June 24, 2025',
      iconColor: '#84CC16',
    },
    {
      id: '4',
      title: 'Recommend pregnancy exercise',
      date: 'June 24, 2025',
      iconColor: '#10B981',
    },
  ];

  // Mock chat messages
  const chatMessages: ChatMessage[] = [
    {
      id: '1',
      type: 'ai',
      content: 'Get exercise recommendation',
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'ai',
      content: 'Exercise during pregnancy can be super beneficial! 🏃‍♀️ Here are some safe and recommended exercises for pregnant women:\n\n1. Prenatal yoga: Great for flexibility, balance, and relaxation.\n2. Brisk walking: Excellent cardio exercise that\'s easy on the joints.\n3. Swimming or water aerobics: Low-impact and buoyant, perfect for pregnant bodies.\n4. Pelvic floor exercises (Kegels): Strengthen pelvic muscles for easier delivery and postpartum recovery.\n5. Low-impact aerobics: Dancing, stationary cycling, or using an elliptical machine.\n\nRemember to:\n\n- Consult your healthcare provider before starting any new exercise routine.\n- Listen to your body and stop if you experience discomfort or pain.\n- Stay hydrated and avoid overheating.\n- Modify exercises as your pregnancy progresses.\n\nWhat trimester are you in, or what\'s your specific fitness goal? 🤰 I\'d be happy to provide more tailored advice!',
      timestamp: new Date(),
    },
    {
      id: '3',
      type: 'file',
      content: 'Meal recommendations',
      timestamp: new Date(),
      fileType: 'pdf',
      fileName: 'Meal recommendations',
    },
    {
      id: '4',
      type: 'user',
      content: 'Should I be worried about high fetal heartbeat?\n\nAlso Can you explain my last scan results?',
      timestamp: new Date(),
    },
  ];

  const getRandomGradient = () => {
    const gradients = [
      ['#1997D4', '#1277A8'], // Blue gradient
      ['#8B5CF6', '#6B21A8'], // Purple gradient  
      ['#84CC16', '#65A30D'], // Green gradient
      ['#10B981', '#059669'], // Emerald gradient
      ['#F59E0B', '#D97706'], // Orange gradient
      ['#EF4444', '#DC2626'], // Red gradient
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  const renderChatHistoryItem = ({ item }: { item: ChatThread }) => {
    const gradient = getRandomGradient();
    
    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => {
          loadThreadMessages(item.threadId);
          setMode('chat');
        }}
      >
        <LinearGradient
          colors={gradient}
          style={styles.historyIcon}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <View style={styles.historyIconLines}>
            <View style={styles.historyIconLine} />
            <View style={styles.historyIconLine} />
          </View>
        </LinearGradient>
        <View style={styles.historyContent}>
          <Text style={[Typography.body, styles.historyTitle]}>{item.title}</Text>
                  <Text style={[Typography.body, styles.historyDate]}>
          {formatFriendlyDate(item.lastActivityAt)}
        </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTypingIndicator = () => (
    <View style={styles.aiMessageContainer}>
      <ImagoAIAvatarIcon size={40} />
      <View style={styles.aiMessageBubble}>
        <View style={styles.typingIndicator}>
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
        </View>
      </View>
    </View>
  );

  const renderChatMessage = ({ item }: { item: APIChatMessage }) => {
    if (item.messageType === 'assistant') {
      return (
        <View style={styles.aiMessageContainer}>
          <ImagoAIAvatarIcon size={40} />
          <View style={styles.aiMessageBubble}>
            <Text style={[Typography.body, styles.aiMessageText]}>
              {item.content}
            </Text>
          </View>
        </View>
      );
    }

    if (item.messageType === 'user') {
      return (
        <View style={styles.userMessageContainer}>
          <Text style={[Typography.body, styles.userMessageText]}>
            {item.content}
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <NoChatHistoryIcon size={80} />
      <Text style={[Typography.h2, styles.emptyTitle]}>No chat history!</Text>
      <Text style={[Typography.body, styles.emptySubtitle]}>
        Get recommendations and assistant{'\n'}from Imago AI
      </Text>
      <TouchableOpacity
        style={styles.newChatButtonOutline}
        onPress={() => setMode('newChat')}
      >
        <NewChatIcon size={20} color={Colors.primary[500]} />
        <Text style={[Typography.body, styles.newChatButtonOutlineText]}>
          Chat with Imago AI
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderChatHistory = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[Typography.h2, styles.headerTitle]}>Chat History</Text>
        <TouchableOpacity
          style={styles.newChatButtonOutline}
          onPress={() => {
            // Reset threadId to start a fresh conversation
            setCurrentThreadId(null);
            setCurrentThread(null);
            setCurrentConversation(null);
            setMessages([]);
            setMode('newChat');
            console.log('🆕 Starting new chat - reset threadId');
          }}
        >
          <NewChatIcon size={16} color={Colors.primary[500]} />
          <Text style={[Typography.body, styles.newChatButtonOutlineText]}>
            New chat
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={threads}
        renderItem={renderChatHistoryItem}
        keyExtractor={(item) => item.threadId}
        contentContainerStyle={styles.historyList}
      />
      <TouchableOpacity
        style={styles.floatingNewChatButton}
        onPress={() => {
          // Reset threadId to start a fresh conversation
          setCurrentThreadId(null);
          setCurrentThread(null);
          setCurrentConversation(null);
          setMessages([]);
          setMode('newChat');
          console.log('🆕 Starting new chat - reset threadId');
        }}
      >
        <Text style={[Typography.body, styles.newChatButtonText]}>
          New chat
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderChat = () => (
    <View style={styles.container}>
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => setMode('history')}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={[Typography.h3, styles.chatHeaderTitle]}>Imago AI</Text>
        <TouchableOpacity>
          <Text style={styles.historyButton}>🕒</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderChatMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ListFooterComponent={isTyping ? renderTypingIndicator : undefined}
        onContentSizeChange={() => {
          // Auto-scroll to bottom when content changes (new messages)
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
        onLayout={() => {
          // Auto-scroll to bottom when layout changes
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
      />
      {renderMessageInput()}
    </View>
  );

  const renderNewChat = () => (
    <View style={styles.container}>
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => setMode('history')}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={[Typography.h3, styles.chatHeaderTitle]}>Imago AI</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.newChatContent}>
        <ImagoAIAvatarIcon size={80} />
        <Text style={[Typography.h2, styles.greetingTitle]}>
          Good afternoon, Chioma
        </Text>
        <Text style={[Typography.body, styles.greetingSubtitle]}>
          What will you like to ask?
        </Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.quickAction, isSending && styles.quickActionDisabled]}
            onPress={() => !isSending && sendQuickMessage('I need nutrition tips based on my trimester')}
            disabled={isSending}
          >
            <Text style={styles.quickActionEmoji}>🍽️</Text>
            <Text style={[Typography.body, styles.quickActionText]}>
              I need nutrition tips based on my trimester
            </Text>
            {isSending && (
              <View style={styles.quickActionLoader}>
                <ActivityIndicator size="small" color={Colors.primary[600]} />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickAction, isSending && styles.quickActionDisabled]}
            onPress={() => !isSending && sendQuickMessage('Pre-labour coaching')}
            disabled={isSending}
          >
            <Text style={styles.quickActionEmoji}>🏃‍♀️</Text>
            <Text style={[Typography.body, styles.quickActionText]}>
              Pre-labour coaching
            </Text>
            {isSending && (
              <View style={styles.quickActionLoader}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickAction, isSending && styles.quickActionDisabled]}
            onPress={() => !isSending && sendQuickMessage('Pre-labour coaching')}
            disabled={isSending}
          >
            <Text style={styles.quickActionEmoji}>🏃‍♀️</Text>
            <Text style={[Typography.body, styles.quickActionText]}>
              Pre-labour coaching
            </Text>
            {isSending && (
              <View style={styles.quickActionLoader}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Loading overlay when sending first message */}
        {isSending && (
          <View style={styles.newChatLoadingOverlay}>
            <Animated.View style={{ 
              transform: [{ rotate: thinkingAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg']
              }) }]
            }}>
              <ImagoAIAvatarIcon size={60} />
            </Animated.View>
            <Text style={[Typography.body, styles.loadingText]}>
              {isTyping ? 'AI is thinking...' : 'Sending message...'}
            </Text>
          </View>
        )}
      </ScrollView>
      {renderMessageInput()}
    </View>
  );

  const renderMessageInput = () => (
    <View style={styles.inputContainer}>
      {isRecording ? (
        <View style={styles.recordingContainer}>
          <Text style={[Typography.body, styles.recordingLabel]}>
            Voice recognition
          </Text>
          <Text style={[Typography.body, styles.recordingText]}>
            Should I be worried about high fetal heartbeat?
            {'\n\n'}Also Can you explain my last scan results?
          </Text>
          <Animated.View style={{ 
            transform: [{ scaleY: waveformAnimation }],
            opacity: waveformOpacity 
          }}>
            <WaveformIcon width={300} height={30} />
          </Animated.View>
          <Text style={styles.recordingTime}>00:{recordingTime.toString().padStart(2, '0')}</Text>
          <TouchableOpacity
            style={styles.stopRecordingButton}
            onPress={stopRecording}
          >
            <StopRecordingIcon size={64} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.messageInputRow}>
          <TouchableOpacity style={styles.attachmentButton} onPress={handleFilePicker}>
            <AttachmentIcon size={24} color={Colors.gray[600]} />
          </TouchableOpacity>
          <TextInput
            style={[Typography.body, styles.textInput]}
            placeholder="Write your message"
            placeholderTextColor={Colors.gray[400]}
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          {messageText.trim() ? (
            <TouchableOpacity
              style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={isSending}
            >
              <SendIcon size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.microphoneButton}
              onPress={startRecording}
              disabled={isSending}
            >
              <MicrophoneIcon size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {mode === 'history' && (hasHistory ? renderChatHistory() : renderEmptyState())}
      {mode === 'chat' && renderChat()}
      {mode === 'newChat' && renderNewChat()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing[4],
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
  },
  emptyTitle: {
    marginTop: Spacing[6],
    marginBottom: Spacing[2],
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    color: Colors.gray[600],
    marginBottom: Spacing[8],
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[4],
  },
  headerTitle: {
    color: Colors.text.primary,
  },
  // Chat History
  historyList: {
    paddingVertical: Spacing[2],
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[4],
    gap: Spacing[3],
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 8, // Rounded square, not circle
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyIconText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyIconLines: {
    gap: 3,
  },
  historyIconLine: {
    width: 16,
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    color: Colors.text.primary,
    marginBottom: Spacing[1],
  },
  historyDate: {
    color: Colors.gray[500],
    fontSize: 14,
  },
  // Chat Header
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  chatHeaderTitle: {
    color: Colors.text.primary,
  },
  backButton: {
    fontSize: 24,
    color: Colors.text.primary,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.text.primary,
  },
  historyButton: {
    fontSize: 20,
  },
  // Messages
  messagesList: {
    paddingVertical: Spacing[4],
  },
  aiMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing[4],
    gap: Spacing[3],
  },
  aiMessageBubble: {
    flex: 1,
    backgroundColor: Colors.gray[50],
    borderRadius: 16,
    padding: Spacing[4],
  },
  aiMessageText: {
    color: Colors.text.primary,
    lineHeight: 20,
  },
  fileMessageBubble: {
    backgroundColor: Colors.gray[50],
    borderRadius: 16,
    padding: Spacing[4],
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  fileName: {
    color: Colors.text.primary,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    marginBottom: Spacing[4],
    maxWidth: '80%',
  },
  userMessageText: {
    color: Colors.text.primary,
    backgroundColor: Colors.primary[50],
    borderRadius: 16,
    padding: Spacing[4],
    lineHeight: 20,
  },
  // New Chat
  newChatContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
  },
  greetingTitle: {
    marginTop: Spacing[6],
    marginBottom: Spacing[2],
    textAlign: 'center',
  },
  greetingSubtitle: {
    textAlign: 'center',
    color: Colors.gray[600],
    marginBottom: Spacing[8],
  },
  quickActions: {
    width: '100%',
    gap: Spacing[4],
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  quickActionEmoji: {
    fontSize: 20,
  },
  quickActionText: {
    flex: 1,
    color: Colors.text.primary,
  },
  quickActionDisabled: {
    opacity: 0.5,
  },
  // Typing indicator
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray[400],
  },
  // Input
  inputContainer: {
    paddingVertical: Spacing[4],
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  messageInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing[3],
  },
  attachmentButton: {
    padding: Spacing[2],
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 20,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    maxHeight: 100,
    color: Colors.text.primary,
  },
  microphoneButton: {
    backgroundColor: Colors.primary[500],
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Recording
  recordingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing[6],
    gap: Spacing[4],
  },
  recordingLabel: {
    color: Colors.gray[600],
    alignSelf: 'flex-start',
  },
  recordingText: {
    color: Colors.text.primary,
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginBottom: Spacing[4],
  },
  recordingTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: Spacing[4],
  },
  stopRecordingButton: {
    marginTop: Spacing[4],
  },
  // Buttons
  newChatButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: 20,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
  },
  newChatButtonText: {
    color: 'white',
  },
  newChatButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary[500],
    borderRadius: 20,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    gap: Spacing[2],
  },
  newChatButtonOutlineText: {
    color: Colors.primary[500],
  },
  sendButton: {
    backgroundColor: Colors.primary[500],
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  floatingNewChatButton: {
    position: 'absolute',
    bottom: Spacing[6],
    right: Spacing[4],
    backgroundColor: Colors.primary[500],
    borderRadius: 20,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
  },
  quickActionLoader: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  newChatLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: Spacing[2],
    color: Colors.gray[600],
    textAlign: 'center',
  },
});

export default ChatScreen; 