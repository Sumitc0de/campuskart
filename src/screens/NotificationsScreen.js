import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NOTIFICATIONS = [
  { id: '1', title: 'Price Drop!', message: 'The "Organic Chemistry" book you liked is now $35.', time: '2h ago', icon: 'trending-down', color: '#ef4444' },
  { id: '2', title: 'New Message', message: 'Ananya sent you a message about the mini-fridge.', time: '4h ago', icon: 'chatbubble-ellipses', color: '#4647d3' },
  { id: '3', title: 'Item Sold!', message: 'Your "USB-C Hub" has been purchased.', time: '1d ago', icon: 'checkmark-circle', color: '#22c55e' },
  { id: '4', title: 'Welcome!', message: 'Welcome to CampusKart! Start exploring deals around you.', time: '2d ago', icon: 'sparkles', color: '#f59e0b' },
];

const NotificationsScreen = () => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.notifCard} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: item.color + '10' }]}>
        <Ionicons name={item.icon} size={22} color={item.color} />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.notifHeader}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          <Text style={styles.notifTime}>{item.time}</Text>
        </View>
        <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.clearBtn}>
          <Text style={styles.clearText}>Clear all</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={NOTIFICATIONS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={60} color="#abadaf" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f7f9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0b0f10',
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f5f7f9',
  },
  clearText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4647d3',
  },
  listContent: {
    padding: 24,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f5f7f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0b0f10',
  },
  notifTime: {
    fontSize: 11,
    color: '#9a9d9f',
    fontWeight: '600',
  },
  notifMessage: {
    fontSize: 13,
    color: '#595c5e',
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#abadaf',
    fontWeight: '600',
    marginTop: 20,
  }
});

export default NotificationsScreen;
