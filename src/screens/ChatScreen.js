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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getChats } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ChatScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchChats();
    }, [])
  );

  const loadUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) setUserId(JSON.parse(userStr).id);
    } catch (e) {
      console.error('Error loading user', e);
    }
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const data = await getChats();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Messages</Text>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#abadaf" style={{ marginRight: 12 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats..."
            placeholderTextColor="#abadaf"
          />
        </View>

        {loading && chats.length === 0 ? (
          <View style={styles.centered}>
            <ActivityIndicator size="small" color="#4647d3" />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.chatList}>
            {chats.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={64} color="#eef1f3" />
                <Text style={styles.emptyText}>No conversations yet</Text>
              </View>
            ) : (
              chats.map((chat) => (
                <TouchableOpacity
                  key={chat.id}
                  style={[styles.chatRow, chat.unread && styles.chatRowUnread]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('MessageDetail', { chat })}
                >
                  {chat.unread && <View style={styles.activeBar} />}

                  <View style={styles.avatarContainer}>
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarLetter}>{(chat.other_user_name || 'S').charAt(0)}</Text>
                    </View>
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
                    <Text style={styles.productTag}>{chat.product_title}</Text>
                    <Text style={[styles.chatLastMessage, chat.unread && styles.chatLastMessageUnread]} numberOfLines={1}>
                      {chat.last_message || 'No messages yet'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
            <View style={{ height: 100 }} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, paddingTop: 20 },
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
    backgroundColor: '#f5f7f9',
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 20,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#2c2f31' },
  chatList: { paddingHorizontal: 10 },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  chatRowUnread: { backgroundColor: '#f4f1ff' },
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
  avatarContainer: { marginRight: 14, marginLeft: 6 },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#eef1f3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: { fontSize: 20, fontWeight: '700', color: '#595c5e' },
  chatInfo: { flex: 1 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  chatName: { fontSize: 16, fontWeight: '600', color: '#2c2f31' },
  chatNameUnread: { fontWeight: '800', color: '#0b0f10' },
  chatTime: { fontSize: 11, color: '#9a9d9f', fontWeight: '500' },
  chatTimeUnread: { color: '#4647d3', fontWeight: '700' },
  productTag: { fontSize: 11, color: '#4647d3', fontWeight: '600', marginBottom: 2 },
  chatLastMessage: { fontSize: 13, color: '#595c5e' },
  chatLastMessageUnread: { fontWeight: '600', color: '#0b0f10' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#abadaf', marginTop: 16, fontSize: 16, fontWeight: '500' },
});

export default ChatScreen;
