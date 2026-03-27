import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getMessages, sendMessage, getFullImageUrl } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const MessageDetailScreen = ({ route, navigation }) => {
  const { chat, recipientId, productId } = route.params || {};
  const [currentChat, setCurrentChat] = useState(chat || null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const scrollViewRef = useRef();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (userId) {
      if (currentChat && currentChat.id !== 'new') {
        fetchMessages(currentChat.id);
      } else if (recipientId && productId) {
        // This is a new chat initiation
        setCurrentChat({
          id: 'new',
          product_id: productId,
          seller_id: recipientId,
          buyer_id: userId,
          other_user_name: 'Seller', 
          product_title: 'Item Inquiry',
          isNew: true
        });
        setLoading(false);
      }
    }
  }, [userId, currentChat?.id]);

  const loadUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) setUserId(JSON.parse(userStr).id);
    } catch (e) {
      console.error('Error loading user', e);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      setLoading(true);
      const data = await getMessages(chatId);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !selectedImage) || !currentChat || !userId || sending) return;
    
    try {
      setSending(true);
      const payload = { 
        text: inputText, 
        chatId: currentChat.id === 'new' ? null : currentChat.id,
        productId: currentChat.product_id,
        sellerId: currentChat.seller_id || recipientId,
        image_data: selectedImage ? `data:image/jpeg;base64,${selectedImage.base64}` : null
      };
      
      const response = await sendMessage(payload);
      setInputText('');
      setSelectedImage(null);
      
      if (currentChat.id === 'new') {
        const newChatId = response.chat_id || response.id;
        setCurrentChat({ ...currentChat, id: newChatId, isNew: false });
        fetchMessages(newChatId);
      } else {
        fetchMessages(currentChat.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading && !messages.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4647d3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        {/* Chat Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2c2f31" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {currentChat?.product_title || 'Item Inquiry'}
            </Text>
            <Text style={styles.headerSubtitle}>
              With {currentChat?.other_user_name || 'Seller'}
            </Text>
          </View>

          <TouchableOpacity style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={24} color="#595c5e" />
          </TouchableOpacity>
        </View>

        {currentChat?.isNew && (
          <View style={styles.newChatBanner}>
            <Ionicons name="sparkles" size={16} color="#4647d3" />
            <Text style={styles.newChatText}>Starting a new conversation about this item</Text>
          </View>
        )}

        {/* Messages List */}
        <ScrollView 
          style={styles.messagesContainer} 
          contentContainerStyle={styles.messagesContent}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 && !currentChat?.isNew && (
            <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
          )}

          {messages.map((msg) => {
            const isMe = msg.sender_id === userId;
            return (
              <View key={msg.id} style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowThem]}>
                {!isMe && (
                   <View style={styles.avatarPlaceholder}>
                     <Text style={styles.avatarLetter}>
                       {(currentChat?.other_user_name || 'S').charAt(0)}
                     </Text>
                   </View>
                )}
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                  {msg.image_url && (
                    <Image 
                      source={{ uri: getFullImageUrl(msg.image_url) }} 
                      style={styles.messageImage} 
                      resizeMode="cover"
                    />
                  )}
                  {msg.text && (
                    <Text style={[styles.msgText, isMe ? styles.msgTextMe : styles.msgTextThem]}>
                      {msg.text}
                    </Text>
                  )}
                  <Text style={[styles.time, isMe ? styles.timeMe : styles.timeThem]}>
                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Selected Image Preview */}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}>
              <Ionicons name="close-circle" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Input Area */}
        <View style={styles.inputArea}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor="#abadaf"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            
            <TouchableOpacity 
              style={[styles.sendBtn, (!inputText.trim() && !selectedImage) && styles.sendBtnDisabled]} 
              onPress={handleSendMessage}
              disabled={(!inputText.trim() && !selectedImage) || sending}
            >
              {sending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="send" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
    backgroundColor: '#fff',
  },
  backButton: { padding: 4, marginRight: 12 },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0b0f10' },
  headerSubtitle: { fontSize: 12, color: '#595c5e' },
  infoButton: { padding: 4 },
  newChatBanner: {
    backgroundColor: '#f0f0ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0ff',
  },
  newChatText: { fontSize: 12, color: '#4647d3', fontWeight: '600' },
  messagesContainer: { flex: 1, backgroundColor: '#f9f9fc' },
  messagesContent: { padding: 16, paddingBottom: 30 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 },
  messageRowMe: { justifyContent: 'flex-end' },
  messageRowThem: { justifyContent: 'flex-start' },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eef1f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarLetter: { fontSize: 12, fontWeight: '700', color: '#595c5e' },
  bubble: { maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleMe: { backgroundColor: '#4647d3', borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#f0f2f5' },
  msgText: { fontSize: 14, lineHeight: 20 },
  msgTextMe: { color: '#fff' },
  msgTextThem: { color: '#2c2f31' },
  time: { fontSize: 9, marginTop: 4, alignSelf: 'flex-end' },
  timeMe: { color: 'rgba(255,255,255,0.7)' },
  timeThem: { color: '#9a9d9f' },
  inputArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f2f5',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7f9',
    borderRadius: 25,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4647d3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#2c2f31',
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4647d3',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: { backgroundColor: '#abadaf' },
  messageImage: {
    width: width * 0.6,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  imagePreviewContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f2f5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 5,
    left: 60,
  },
});

export default MessageDetailScreen;
