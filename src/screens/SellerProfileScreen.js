import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { getUserProfile, getFullImageUrl } from '../services/api';

const { width } = Dimensions.get('window');

const SellerProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [profileData, setProfileData] = useState(null);
  const [activeListings, setActiveListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile(userId);
      setProfileData(data.profile);
      setActiveListings(data.listings);
    } catch (error) {
      console.error('Error fetching seller profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4647d3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerNav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0b0f10" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ─── Profile Header ─── */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: getFullImageUrl(profileData.avatar) || 'https://i.pravatar.cc/150?u=' + profileData.id }} 
              style={styles.avatar} 
            />
            {profileData.is_verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={10} color="#fff" />
                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
            )}
          </View>

          <Text style={styles.userName}>{profileData.name}</Text>
          <Text style={styles.userMeta}>
            {profileData.university || 'Campus Student'} • {profileData.department || 'General'}
            {'\n'}
            <Text style={styles.userBatch}>{profileData.student_year || 'Senior'} • {profileData.batch || 'Batch 2024'}</Text>
            {'\n'}
            <Text style={styles.userPickup}>📍 Pickup: {profileData.pickup_location || 'Campus Main Library'}</Text>
          </Text>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Active Items</Text>
              <Text style={styles.statValue}>{profileData.active_listings || 0}</Text>
            </View>
            <View style={[styles.statItem, { borderLeftWidth: 1, borderColor: '#f0f0f0' }]}>
              <Text style={styles.statLabel}>Items Sold</Text>
              <Text style={styles.statValue}>{profileData.items_sold || 0}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.chatBtn}
            onPress={() => navigation.navigate('MessageDetail', {
              recipientId: profileData.id
            })}
          >
            <LinearGradient colors={['#4647d3', '#6264f6']} style={styles.gradientBtn}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
              <Text style={styles.chatBtnText}>Message Seller</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ─── Listings Feed ─── */}
        <View style={styles.listingsSection}>
          <Text style={styles.sectionTitle}>{profileData.name}'s Listings</Text>

          {activeListings.length === 0 ? (
            <View style={styles.emptyListings}>
              <Ionicons name="cube-outline" size={48} color="#abadaf" />
              <Text style={styles.emptyText}>No active listings found.</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {activeListings.map(item => (
                <TouchableOpacity 
                   key={item.id} 
                   style={styles.listingCard}
                   onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                >
                  <View style={styles.imageContainer}>
                    {item.image_url ? (
                      <Image source={{ uri: getFullImageUrl(item.image_url) }} style={styles.listingImage} />
                    ) : (
                      <View style={[styles.listingImage, { backgroundColor: '#f5f7f9', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ fontSize: 30 }}>📦</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.listingInfo}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.itemPrice}>₹{item.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f7f9' },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#0b0f10' },
  header: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 30 },
  avatarWrapper: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  verifiedBadge: { position: 'absolute', bottom: -5, alignSelf: 'center', backgroundColor: '#22c55e', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 2, borderColor: '#ffffff', gap: 4 },
  verifiedText: { color: '#ffffff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  userName: { fontSize: 24, fontWeight: '800', color: '#0b0f10', marginBottom: 4 },
  userMeta: { fontSize: 13, color: '#4647d3', fontWeight: '600', textAlign: 'center', lineHeight: 18 },
  userBatch: { color: '#595c5e', fontWeight: '500' },
  userPickup: { color: '#abadaf', fontSize: 11, fontWeight: '500' },
  statsBar: { flexDirection: 'row', backgroundColor: '#ffffff', marginTop: 24, borderRadius: 20, paddingVertical: 14, shadowColor: '#2c2f31', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 4, width: '100%', borderWidth: 1, borderColor: '#f5f7f9' },
  statItem: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#f0f0f0' },
  statLabel: { fontSize: 10, color: '#9a9d9f', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#0b0f10' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  chatBtn: { width: '100%', marginTop: 24 },
  gradientBtn: { paddingVertical: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  chatBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  listingsSection: { backgroundColor: '#ffffff', paddingHorizontal: 24, paddingTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0b0f10', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  listingCard: { width: (width - 64) / 2, backgroundColor: '#ffffff', borderRadius: 18, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f8f9fb' },
  imageContainer: { height: 120, backgroundColor: '#f5f7f9' },
  listingImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  listingInfo: { padding: 10 },
  itemTitle: { fontSize: 13, fontWeight: '700', color: '#0b0f10', marginBottom: 2 },
  itemPrice: { fontSize: 15, fontWeight: '800', color: '#4647d3' },
  emptyListings: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#abadaf', marginTop: 12, fontSize: 14, fontWeight: '500' },
});

export default SellerProfileScreen;
