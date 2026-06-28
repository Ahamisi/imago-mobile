import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../theme';
import { CloseIcon, MicrophoneIcon } from './icons';
import { ImagoAIAvatarIcon } from './icons/ImagoAIAvatarIcon';
import chatService, { ChatMessage as APIChatMessage } from '../services/chatService';
import Markdown from 'react-native-markdown-display';

interface RecommendationsChatModalProps {
  visible: boolean;
  onClose: () => void;
  scanId: string;
  initialAnalysis?: string;
}

const RecommendationsChatModal: React.FC<RecommendationsChatModalProps> = ({
  visible,
  onClose,
  scanId,
  initialAnalysis,
}) => {
  const [messages, setMessages] = useState<APIChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible && initialAnalysis) {
      // Format initial recommendations message
      // Use the analysis text, but format it nicely for display
      const recommendationsText = initialAnalysis || `Your Scan shows everything is okay. Baby's growth, fluid level and placenta appearance are consistent with this stage of pregnancy. No major concerns detected.\n\n**Here are some recommendations for you:**\n\n• Drink plenty of water today and over the next few days.\n• Pay attention to baby's movements during the day.\n• Schedule your next scan in about 2 weeks.`;
      
      const initialMessage: APIChatMessage = {
        id: 'initial-ai',
        messageType: 'assistant',
        contentType: 'text',
        content: recommendationsText,
        createdAt: new Date().toISOString(),
      };
      setMessages([initialMessage]);
    } else if (!visible) {
      // Reset when modal closes
      setMessages([]);
      setMessageText('');
      setCurrentThreadId(null);
      setCurrentConversationId(null);
    }
  }, [visible, initialAnalysis]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async () => {
    if (!messageText.trim() || isSending) return;

    const messageToSend = messageText.trim();
    setMessageText('');

    try {
      setIsSending(true);

      // Add user message immediately
      const tempUserMessage: APIChatMessage = {
        id: `temp-${Date.now()}`,
        messageType: 'user',
        contentType: 'text',
        content: messageToSend,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempUserMessage]);

      // Send to chat service
      const response = await chatService.sendMessage({
        conversationId: currentConversationId || undefined,
        threadId: currentThreadId || undefined,
        message: messageToSend,
      });

      // Store thread/conversation IDs
      if (response.conversation?.threadId && !currentThreadId) {
        setCurrentThreadId(response.conversation.threadId);
      }
      if (response.conversation?.id && !currentConversationId) {
        setCurrentConversationId(response.conversation.id);
      }

      // Replace temp message with real messages
      setMessages(prev => {
        const withoutTemp = prev.filter(m => !m.id.startsWith('temp-'));
        return [...withoutTemp, response.userMessage, response.aiMessage];
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')));
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: APIChatMessage }) => {
    const isUser = item.messageType === 'user';

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.aiMessageContainer]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <ImagoAIAvatarIcon size={32} />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          {isUser ? (
            <Text style={[Typography.body, styles.messageText]}>{item.content}</Text>
          ) : (
            <Markdown style={markdownStyles}>{item.content}</Markdown>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop with glass effect - ultrasound still visible */}
        <View style={styles.backdrop} />
        
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.dragHandle} />
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <CloseIcon size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          />

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[Typography.body, styles.textInput]}
              placeholder="Write your message"
              placeholderTextColor={Colors.gray[400]}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              editable={!isSending}
            />
            <TouchableOpacity
              style={[styles.micButton, isSending && styles.micButtonDisabled]}
              onPress={sendMessage}
              disabled={!messageText.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <MicrophoneIcon size={20} color={Colors.white} />
              )}
            </TouchableOpacity>
          </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Glass effect - ultrasound still visible
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  safeArea: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '50%', // Half screen
    maxHeight: '50%',
  },
  header: {
    paddingTop: Spacing[2],
    paddingBottom: Spacing[3],
    alignItems: 'center',
    position: 'relative',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray[300],
    borderRadius: 2,
    marginBottom: Spacing[2],
  },
  closeButton: {
    position: 'absolute',
    right: Spacing[4],
    top: Spacing[2],
    padding: Spacing[2],
  },
  messagesContent: {
    padding: Spacing[4],
    paddingBottom: Spacing[2],
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: Spacing[4],
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: Spacing[2],
  },
  messageBubble: {
    maxWidth: '80%',
    padding: Spacing[3],
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: Colors.white,
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: Colors.gray[50],
    alignSelf: 'flex-start',
  },
  messageText: {
    color: Colors.text.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    gap: Spacing[3],
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.gray[50],
    borderRadius: 20,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    maxHeight: 100,
    color: Colors.text.primary,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonDisabled: {
    opacity: 0.5,
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: Colors.text.primary,
    fontSize: 14,
    lineHeight: 20,
  },
  paragraph: {
    marginBottom: Spacing[2],
  },
  list_item: {
    marginBottom: Spacing[1],
  },
  strong: {
    fontWeight: '600' as const,
  },
});

export default RecommendationsChatModal;

