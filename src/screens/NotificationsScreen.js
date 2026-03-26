import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getNotifications, markNotificationRead, clearNotifications } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchNotifs();
    }, [])
  );

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifs();
  };

  const handleNotificationPress = async (item) => {
    // 1. Mark as read if needed
    if (!item.is_read) {
      try {
        await markNotificationRead(item.id);
        fetchNotifs();
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }

    // 2. Navigate based on type
    if (item.type === 'BID_RECEIVED' && item.data) {
      try {
        const data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
        if (data.productId) {
          navigation.navigate('BidDetails', {
            productId: data.productId,
            bidId: data.bidId,
            buyerId: data.buyerId
          });
        }
      } catch (e) {
        console.error('Error parsing notification data:', e);
      }
    } else if (item.type === 'MESSAGE_RECEIVED') {
      // Handle message navigation if needed later
    }
  };

  const handleClearAll = async () => {
    Alert.alert('Clear All', 'Are you sure you want to delete all notifications?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Clear', 
        style: 'destructive',
        onPress: async () => {
          try {
            await clearNotifications();
            setNotifications([]);
          } catch (error) {
            console.error('Error clearing:', error);
          }
        }
      }
    ]);
  };

  const getNotifStyle = (type) => {
    switch (type) {
      case 'BID_RECEIVED':
        return { icon: 'megaphone', color: '#4647d3' };
      case 'BID_ACCEPTED':
        return { icon: 'checkmark-circle', color: '#22c55e' };
      case 'MESSAGE_RECEIVED':
        return { icon: 'chatbubble-ellipses', color: '#e91e63' };
      default:
        return { icon: 'notifications', color: '#595c5e' };
    }
  };

  const renderItem = ({ item }) => {
    const style = getNotifStyle(item.type);
    return (
      <TouchableOpacity 
        style={[styles.notifCard, !item.is_read && styles.unreadCard]} 
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: style.color + '15' }]}>
          <Ionicons name={style.icon} size={22} color={style.color} />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.notifHeader}>
            <Text style={[styles.notifTitle, !item.is_read && styles.unreadText]}>{item.title}</Text>
            <Text style={styles.notifTime}>
               {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
          <Text style={styles.clearText}>Clear all</Text>
        </TouchableOpacity>
      </View>
      
      {loading && notifications.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color="#4647d3" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#4647d3" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={60} color="#eef1f3" />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f7f9',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0b0f10' },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#f5f7f9' },
  clearText: { fontSize: 12, fontWeight: '700', color: '#4647d3' },
  listContent: { padding: 20 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f5f7f9',
  },
  unreadCard: { backgroundColor: '#f9f9ff', borderColor: '#eef1ff' },
  unreadText: { fontWeight: '800', color: '#0b0f10' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4647d3', marginLeft: 8 },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: { flex: 1 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontSize: 15, fontWeight: '700', color: '#2c2f31' },
  notifTime: { fontSize: 10, color: '#9a9d9f', fontWeight: '600' },
  notifMessage: { fontSize: 13, color: '#595c5e', lineHeight: 18 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 150 },
  emptyText: { fontSize: 16, color: '#abadaf', fontWeight: '600', marginTop: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default NotificationsScreen;
