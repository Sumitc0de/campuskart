import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const { width } = Dimensions.get('window');

import api, { getChats, getMessages, sendMessage } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatScreen = ({ navigation }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [inputText, setInputText] = useState('');
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadUser();
    fetchChats();
  }, []);

  const loadUser = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) setUserId(JSON.parse(userStr).id);
  };

  const fetchChats = async () => {
    try {
      const data = await getChats();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const data = await getMessages(chatId);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat.id);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedChat) return;
    try {
      await sendMessage({ text: inputText, chatId: selectedChat.id });
      setInputText('');
      fetchMessages(selectedChat.id); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // ─── Inbox View ───
  if (!selectedChat) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.headerTitle}>Messages</Text>
          
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search chats..."
              placeholderTextColor="#abadaf"
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.chatList}>
            {chats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={[styles.chatRow, chat.unread && styles.chatRowUnread]}
                activeOpacity={0.7}
                onPress={() => handleSelectChat(chat)}
              >
                {/* Active Indicator Bar */}
                {chat.unread && <View style={styles.activeBar} />}

                <View style={styles.avatarContainer}>
                  <Image source={{ uri: chat.other_user_avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                </View>

                <View style={styles.chatInfo}>
                  <View style={styles.chatHeader}>
                    <Text style={[styles.chatName, chat.unread && styles.chatNameUnread]}>
                      {chat.other_user_name}
                    </Text>
                    <Text style={[styles.chatTime, chat.unread && styles.chatTimeUnread]}>
                      {new Date(chat.last_message_time).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[styles.chatLastMessage, chat.unread && styles.chatLastMessageUnread]} numberOfLines={1}>
                    {chat.last_message}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            
            {/* Tab Bar Spacing */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Chat Conversation View ───
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Chat Header */}
        <View style={styles.chatDetailHeader}>
          <TouchableOpacity onPress={() => setSelectedChat(null)} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.chatHeaderCenter}>
            <Text style={styles.chatDetailTitle} numberOfLines={1}>
              {selectedChat.product_title}
            </Text>
            <View style={styles.sellerRow}>
              <Text style={styles.sellerText}>With: {selectedChat.other_user_name}</Text>
              <View style={styles.verifiedBadgeSmall}>
                <Text style={styles.verifiedBadgeSmallText}>✓ Verified</Text>
              </View>
            </View>
          </View>

          <View style={styles.chatHeaderRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.headerRightIcon}>ℹ️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.headerRightIcon}>⋮</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages List */}
        <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>TODAY</Text>
          </View>

          {messages.map((msg) => {
            const isMe = msg.sender_id === userId;
            return (
              <View key={msg.id} style={[styles.messageBubbleRow, isMe ? styles.messageBubbleRowMe : styles.messageBubbleRowThem]}>
                {!isMe && (
                  <Image source={{ uri: selectedChat.other_user_avatar || 'https://via.placeholder.com/150' }} style={styles.messageAvatar} />
                )}
                <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleThem]}>
                  <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
                    {msg.text}
                  </Text>
                  <Text style={[styles.messageTime, isMe ? styles.messageTimeMe : styles.messageTimeThem]}>
                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Bottom Input */}
        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.plusButton}>
              <Text style={styles.plusIcon}>+</Text>
            </TouchableOpacity>
            
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              placeholderTextColor="#abadaf"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            
            <TouchableOpacity style={styles.sendButton} activeOpacity={0.8} onPress={handleSendMessage}>
              <Text style={styles.sendButtonText}>Send ➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    paddingTop: 20,
  },
  
  // ─── Inbox Styles ───
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0b0f10',
    marginHorizontal: 20,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef1f3',
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 20,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2c2f31',
  },
  chatList: {
    paddingHorizontal: 10,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginBottom: 4,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  chatRowUnread: {
    backgroundColor: '#f4f1ff',
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 14,
    bottom: 14,
    width: 4,
    backgroundColor: '#4647d3',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
    marginLeft: 6,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e5e9eb',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c2f31',
  },
  chatNameUnread: {
    fontWeight: '800',
    color: '#0b0f10',
  },
  chatTime: {
    fontSize: 10,
    color: '#9a9d9f',
    fontWeight: '600',
  },
  chatTimeUnread: {
    color: '#4647d3',
  },
  chatLastMessage: {
    fontSize: 14,
    color: '#595c5e',
  },
  chatLastMessageUnread: {
    fontWeight: '600',
    color: '#0b0f10',
  },

  // ─── Chat Detail Header ───
  chatDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eef1f3',
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    marginLeft: -8,
  },
  backIcon: {
    fontSize: 24,
    color: '#2c2f31',
  },
  chatHeaderCenter: {
    flex: 1,
  },
  chatDetailTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0b0f10',
    marginBottom: 2,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sellerText: {
    fontSize: 12,
    color: '#595c5e',
  },
  verifiedBadgeSmall: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedBadgeSmallText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  chatHeaderRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  headerRightIcon: {
    fontSize: 20,
    color: '#595c5e',
  },

  // ─── Messages Area ───
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f9f9fc',
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  dateSeparator: {
    alignItems: 'center',
    marginBottom: 24,
  },
  dateSeparatorText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9a9d9f',
    letterSpacing: 1,
  },
  messageBubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  messageBubbleRowThem: {
    justifyContent: 'flex-start',
  },
  messageBubbleRowMe: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  messageBubbleThem: {
    backgroundColor: '#eef1f3',
    borderBottomLeftRadius: 4,
  },
  messageBubbleMe: {
    backgroundColor: '#4647d3',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextThem: {
    color: '#2c2f31',
  },
  messageTextMe: {
    color: '#ffffff',
  },
  messageTime: {
    fontSize: 9,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  messageTimeThem: {
    color: '#9a9d9f',
  },
  messageTimeMe: {
    color: '#9396ff',
  },

  // ─── Input Area ───
  inputArea: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#eef1f3',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7f9',
    borderRadius: 24,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  plusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4647d3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  plusIcon: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '400',
    marginTop: -2,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#2c2f31',
    maxHeight: 100,
    paddingTop: 10,
    paddingBottom: 10,
  },
  sendButton: {
    backgroundColor: '#4647d3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default ChatScreen;
