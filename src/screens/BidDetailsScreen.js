import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  StatusBar,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getProductById, getUserProfile, getProductBids, getFullImageUrl } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const BidDetailsScreen = ({ route, navigation }) => {
  const { productId, bidId, buyerId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [bidder, setBidder] = useState(null);
  const [allBids, setAllBids] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [productId, buyerId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productData, bidderResp, bidsData] = await Promise.all([
        getProductById(productId),
        getUserProfile(buyerId),
        getProductBids(productId)
      ]);
      
      setProduct(productData);
      setBidder(bidderResp.profile); // Fixed: extract profile from response
      setAllBids(bidsData);
    } catch (err) {
      console.error('Error fetching bid details:', err);
      setError('Failed to load details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentBid = allBids.find(b => b.id === bidId) || allBids.find(b => b.buyer_id === buyerId);

  const handleChat = () => {
    if (!bidder || !product) return;
    navigation.navigate('MessageDetail', {
      recipientId: bidder.id,
      productId: product.id,
      chat: {
        id: 'new',
        product_id: product.id,
        seller_id: product.user_id,
        buyer_id: bidder.id,
        other_user_name: bidder.name,
        product_title: product.title,
        isNew: true
      }
    });
  };

  const getAvatarColor = (name) => {
    const colors = ['#4647d3', '#e91e63', '#22c55e', '#f59e0b', '#6366f1'];
    if (!name) return colors[0];
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4647d3" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={60} color="#e91e63" />
        <Text style={styles.errorText}>{error || 'Product not found'}</Text>
        <TouchableOpacity style={styles.backBtnAction} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const avatarBg = getAvatarColor(bidder?.name);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0b0f10" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bid Details</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}>
          <Ionicons name="share-outline" size={22} color="#595c5e" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Item Details Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Item Details</Text>
          <TouchableOpacity 
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
          >
            <Image 
              source={{ uri: getFullImageUrl(product.images?.[0]) }} 
              style={styles.productImage} 
            />
            <View style={styles.productInfo}>
              <Text style={styles.productTitle} numberOfLines={1}>{product.title}</Text>
              <Text style={styles.productPrice}>Listed for: ₹{product.price}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{product.category}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#abadaf" />
          </TouchableOpacity>
        </View>

        {/* Bidder Profile Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Proposed By</Text>
          <View style={styles.premiumCard}>
            <View style={styles.bidderRow}>
              <View style={[styles.largeAvatar, { backgroundColor: avatarBg }]}>
                <Text style={styles.largeAvatarText}>{bidder?.name ? bidder.name[0].toUpperCase() : '?'}</Text>
              </View>
              <View style={styles.bidderMainInfo}>
                <Text style={styles.bidderNameText}>{bidder?.name || 'User'}</Text>
                <Text style={styles.bidderSubText}>
                  {bidder?.department || 'Department'} • {bidder?.student_year ? `${bidder.student_year} Year` : 'Year N/A'}
                </Text>
              </View>
              <TouchableOpacity style={styles.chatActionBtn} onPress={handleChat}>
                <LinearGradient
                  colors={['#4647d3', '#6366f1']}
                  style={styles.chatGradient}
                >
                  <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
                  <Text style={styles.chatActionText}>Chat</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.bidValueContainer}>
              <Text style={styles.bidValueLabel}>OFFERING AMOUNT</Text>
              <Text style={styles.bidValueText}>₹{currentBid?.amount || '0.00'}</Text>
            </View>
          </View>
        </View>

        {/* All Bids List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Bids ({allBids.length})</Text>
            {allBids.length > 1 && <Text style={styles.viewSort}>Highest first</Text>}
          </View>
          
          <View style={styles.bidsListCard}>
            {allBids.map((bid, index) => (
              <View key={bid.id} style={[
                styles.bidListItem, 
                index === allBids.length - 1 && { borderBottomWidth: 0 },
                bid.id === bidId && styles.activeBidItem
              ]}>
                <View style={styles.bidListLeft}>
                  <View style={[styles.smallAvatar, { backgroundColor: getAvatarColor(bid.buyer_name) + '20' }]}>
                    <Text style={[styles.smallAvatarText, { color: getAvatarColor(bid.buyer_name) }]}>
                      {bid.buyer_name ? bid.buyer_name[0].toUpperCase() : '?'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.listBidderName}>{bid.buyer_name}</Text>
                    {bid.id === bidId && (
                      <View style={styles.recentBadge}>
                        <Text style={styles.recentBadgeText}>NEW BID</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={[styles.listBidAmount, bid.id === bidId && { color: '#4647d3' }]}>
                  ₹{bid.amount}
                </Text>
              </View>
            ))}
            {allBids.length === 0 && (
              <View style={styles.emptyBids}>
                <Ionicons name="receipt-outline" size={32} color="#eef1f3" />
                <Text style={styles.emptyBidsText}>No bids yet for this item</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { paddingBottom: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0b0f10' },
  iconBtn: { padding: 8, borderRadius: 12, backgroundColor: '#f9fafb' },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0b0f10' },
  viewSort: { fontSize: 12, color: '#9a9d9f', fontWeight: '600' },
  
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f2f5',
  },
  productImage: { width: 70, height: 70, borderRadius: 14, backgroundColor: '#eef1f3' },
  productInfo: { flex: 1, marginLeft: 16 },
  productTitle: { fontSize: 16, fontWeight: '700', color: '#2c2f31', marginBottom: 2 },
  productPrice: { fontSize: 13, color: '#595c5e', marginBottom: 6 },
  categoryBadge: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#4647d310', 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 6 
  },
  categoryText: { fontSize: 10, color: '#4647d3', fontWeight: '800' },
  
  premiumCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f0f2f5',
    shadowColor: '#4647d3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 3,
  },
  bidderRow: { flexDirection: 'row', alignItems: 'center' },
  largeAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  largeAvatarText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  bidderMainInfo: { flex: 1, marginLeft: 15 },
  bidderNameText: { fontSize: 17, fontWeight: '800', color: '#0b0f10' },
  bidderSubText: { fontSize: 12, color: '#9a9d9f', marginTop: 2, fontWeight: '500' },
  chatActionBtn: { overflow: 'hidden', borderRadius: 14 },
  chatGradient: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 6,
  },
  chatActionText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  
  divider: { height: 1, backgroundColor: '#f0f2f5', marginVertical: 20 },
  
  bidValueContainer: { alignItems: 'center' },
  bidValueLabel: { fontSize: 11, color: '#9a9d9f', fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  bidValueText: { fontSize: 34, fontWeight: '900', color: '#4647d3' },
  
  bidsListCard: {
    backgroundColor: '#f9f9ff',
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: '#eff1ff',
  },
  bidListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  activeBidItem: { backgroundColor: '#ffffff', borderRadius: 16, marginVertical: 2 },
  bidListLeft: { flexDirection: 'row', alignItems: 'center' },
  smallAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  smallAvatarText: { fontSize: 14, fontWeight: '800' },
  listBidderName: { fontSize: 15, fontWeight: '700', color: '#2c2f31' },
  listBidAmount: { fontSize: 15, fontWeight: '800', color: '#0b0f10' },
  recentBadge: { backgroundColor: '#22c55e', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 2, alignSelf: 'flex-start' },
  recentBadgeText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  
  emptyBids: { padding: 30, alignItems: 'center' },
  emptyBidsText: { color: '#abadaf', fontSize: 14, marginTop: 10, fontWeight: '600' },
  
  errorText: { fontSize: 16, color: '#e91e63', marginBottom: 20, textAlign: 'center' },
  backBtnAction: { backgroundColor: '#4647d3', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { color: '#fff', fontWeight: '800' },
});

export default BidDetailsScreen;
