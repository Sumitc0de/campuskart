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
  Alert,
  Modal,
  TextInput,
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { getProductById, getFullImageUrl, placeBid, getProductBids } from '../services/api';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBidModalVisible, setBidModalVisible] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [highestBid, setHighestBid] = useState(null);
  const [bids, setBids] = useState([]);
  const [submittingBid, setSubmittingBid] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchProductDetails();
    }, [productId])
  );

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const data = await getProductById(productId);
      setProduct(data);
      if (data.price_type === 'bid') {
        fetchBids();
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const bidData = await getProductBids(productId);
      setBids(bidData);
      if (bidData.length > 0) {
        setHighestBid(bidData[0]);
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  const handlePlaceBid = async () => {
    if (!bidAmount.trim() || isNaN(bidAmount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid number for your bid.');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (highestBid && amount <= parseFloat(highestBid.amount)) {
      Alert.alert('Too Low', `Your bid must be higher than the current highest bid (₹${highestBid.amount})`);
      return;
    }

    if (amount <= parseFloat(product.price)) {
      Alert.alert('Too Low', `Your bid must be at least the starting price (₹${product.price})`);
      return;
    }

    try {
      setSubmittingBid(true);
      await placeBid(product.id, amount);
      Alert.alert('Success', 'Your bid has been placed! 🚀');
      setBidModalVisible(false);
      setBidAmount('');
      fetchBids();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to place bid');
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${product.title} on CampusKart! Only ₹${product.price}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4647d3" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found or has been removed.</Text>
        <TouchableOpacity style={styles.backButtonAction} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0b0f10" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Detail</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color="#0b0f10" />
          </TouchableOpacity>

        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ─── Product Image ─── */}
        <View style={styles.imageContainer}>
          {product.image_url ? (
            <Image 
              source={{ uri: getFullImageUrl(product.image_url) }} 
              style={styles.productImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.productImage, { backgroundColor: '#f5f7f9', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ fontSize: 100 }}>📦</Text>
            </View>
          )}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{product.category ? product.category.toUpperCase() : 'ELECTRONICS'}</Text>
          </View>
        </View>

        {/* ─── Product Info ─── */}
        <View style={styles.infoSection}>
          <Text style={styles.productTitle}>{product.title}</Text>
          
          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.priceLabel}>
                {product.price_type === 'bid' ? 'Current Bid' : 'Fixed Price'}
              </Text>
              <Text style={styles.price}>₹{product.price}</Text>
            </View>
            {product.condition === 'New' && <Text style={styles.oldPrice}>₹{(parseFloat(product.price) * 1.2).toFixed(2)}</Text>}
          </View>

          {/* ─── Status Badges ─── */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, styles.verifiedBadge]}>
              <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
              <Text style={styles.verifiedBadgeText}>VERIFIED STUDENT</Text>
            </View>
            <View style={[styles.badge, styles.collegeBadge]}>
              <Ionicons name="school" size={14} color="#4647d3" />
              <Text style={styles.collegeBadgeText}>SAME COLLEGE</Text>
            </View>
          </View>

          {/* ─── Description ─── */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {product.description || "No description provided for this item."}
            </Text>
          </View>

          {/* ─── Seller Card ─── */}
          <TouchableOpacity 
            style={styles.sellerCard}
            onPress={() => navigation.navigate('SellerProfile', { userId: product.user_id })}
          >
            <View style={styles.sellerInfo}>
              <Image 
                source={product.seller_avatar ? { uri: product.seller_avatar } : { uri: 'https://i.pravatar.cc/150?u=' + product.user_id }} 
                style={styles.sellerAvatar} 
              />
              <View style={styles.sellerTextContainer}>
                <View style={styles.sellerNameRow}>
                  <Text style={styles.sellerName}>{product.seller_name || 'Anonymous'}</Text>
                <View style={styles.miniVerified}>
                   <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                </View>
                <View style={styles.sellerBadgeMini}>
                  <Text style={styles.sellerBadgeMiniText}>VERIFIED</Text>
                </View>
              </View>
              <Text style={styles.sellerMeta}>
                {product.seller_university || 'Campus Student'} • {product.seller_department || 'CS'} • {product.seller_year || 'Senior'}
              </Text>
            </View>
          </View>
          </TouchableOpacity>

          {/* ─── Bidding Details ─── */}
          {product.price_type === 'bid' && (
            <View style={styles.biddingSection}>
              <View style={styles.bidHeader}>
                <View style={styles.bidHeaderTitle}>
                  <MaterialCommunityIcons name="chart-bar" size={20} color="#4647d3" />
                  <Text style={styles.bidSectionTitle}>Bidding Hub</Text>
                </View>
                <View style={styles.bidCountBadge}>
                   <Text style={styles.bidCountText}>{bids.length} BIDS</Text>
                </View>
              </View>

              {highestBid ? (
                <View style={styles.highestBidCard}>
                  <View style={styles.highestBidRow}>
                    <View style={styles.highestBidIcon}>
                      <Ionicons name="trophy" size={20} color="#f59e0b" />
                    </View>
                    <View style={styles.highestBidInfo}>
                      <Text style={styles.highestBidLabel}>Highest Bid by {highestBid.buyer_name}</Text>
                      <Text style={styles.highestBidAmount}>₹{highestBid.amount}</Text>
                    </View>
                    <Text style={styles.highestBidTime}>
                       {new Date(highestBid.created_at).toLocaleDateString()}
                    </Text>
                  </View>

                  {/* All Bids List below highest */}
                  {bids.length > 1 && (
                    <View style={styles.otherBidsContainer}>
                      <Text style={styles.otherBidsHeader}>Recent Bids</Text>
                      {bids.slice(1, 5).map((bid, index) => (
                        <View key={bid.id || index} style={styles.bidListItemMini}>
                          <View style={styles.bidListItemLeft}>
                            <View style={styles.miniAvatar}>
                              <Text style={styles.miniAvatarText}>{bid.buyer_name?.[0].toUpperCase()}</Text>
                            </View>
                            <Text style={styles.bidItemName}>{bid.buyer_name}</Text>
                          </View>
                          <Text style={styles.bidItemAmount}>₹{bid.amount}</Text>
                        </View>
                      ))}
                      {bids.length > 5 && (
                        <TouchableOpacity style={styles.viewMoreBids}>
                          <Text style={styles.viewMoreText}>+ {bids.length - 5} more bids</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.noBidsBox}>
                  <Text style={styles.noBidsText}>No bids yet. Be the first to bid!</Text>
                </View>
              )}
            </View>
          )}

          {/* ─── Pickup Row ─── */}
          <View style={styles.pickupRow}>
            <View style={styles.pickupIconContainer}>
              <Ionicons name="location" size={20} color="#4647d3" />
            </View>
            <View style={styles.pickupTextContainer}>
              <Text style={styles.pickupLabel}>PICKUP AT</Text>
              <Text style={styles.pickupLocation}>{product.pickup_location || 'Main Campus Library, North Wing'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#abadaf" />
          </View>
        </View>

        {/* Spacing for floating button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ─── Bottom CTA ─── */}
      <View style={styles.bottomBar}>
        <View style={styles.ctaRow}>
          {product.price_type === 'bid' && (
            <TouchableOpacity 
              activeOpacity={0.9} 
              style={[styles.bidButton, { marginRight: 10 }]}
              onPress={() => setBidModalVisible(true)}
            >
              <LinearGradient
                colors={['#22c55e', '#10b981']}
                style={styles.ctaGradient}
              >
                <Ionicons name="megaphone-outline" size={20} color="#fff" />
                <Text style={styles.ctaText}>Place Bid</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            activeOpacity={0.9} 
            style={styles.chatButtonContainer}
            onPress={() => navigation.navigate('MessageDetail', { 
              recipientId: product.user_id, 
              productId: product.id 
            })}
          >
            <LinearGradient
              colors={['#4647d3', '#6264f6']}
              style={styles.ctaGradient}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
              <Text style={styles.ctaText}>Message</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Bid Modal ─── */}
      <Modal
        visible={isBidModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setBidModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalCloseOverlay} 
            onPress={() => setBidModalVisible(false)} 
          />
          <View style={styles.bidModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Place Your Bid</Text>
              <TouchableOpacity onPress={() => setBidModalVisible(false)}>
                <Ionicons name="close" size={24} color="#0b0f10" />
              </TouchableOpacity>
            </View>

            <View style={styles.bidInputSection}>
              <Text style={styles.inputLabel}>ENTER AMOUNT</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.bidInput}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={bidAmount}
                  onChangeText={setBidAmount}
                  autoFocus
                />
              </View>
              {highestBid && (
                <Text style={styles.minBidNote}>
                   Min. Bid: <Text style={{fontWeight: '700'}}>₹{(parseFloat(highestBid.amount) + 1).toFixed(2)}+</Text>
                </Text>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.submitBidBtn, submittingBid && { opacity: 0.7 }]}
              onPress={handlePlaceBid}
              disabled={submittingBid}
            >
              {submittingBid ? (
                 <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitBidText}>Confirm Bid</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0b0f10',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    padding: 16,
    position: 'relative',
  },
  productImage: {
    width: width - 32,
    height: width - 32,
    borderRadius: 30,
    backgroundColor: '#f5f7f9',
  },
  categoryBadge: {
    position: 'absolute',
    top: 32,
    left: 32,
    backgroundColor: '#e1e0ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4647d3',
    letterSpacing: 0.5,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0b0f10',
    lineHeight: 32,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
    gap: 10,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#abadaf',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4647d3',
  },
  oldPrice: {
    fontSize: 16,
    color: '#abadaf',
    textDecorationLine: 'line-through',
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  verifiedBadge: {
    backgroundColor: '#ecfdf5',
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  collegeBadge: {
    backgroundColor: '#f4f1ff',
  },
  collegeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4647d3',
  },
  descriptionSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0b0f10',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    color: '#595c5e',
    lineHeight: 24,
  },
  sellerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    marginTop: 30,
    shadowColor: '#2c2f31',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f7f9',
  },
  sellerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0b0f10',
  },
  sellerBadgeMini: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  sellerBadgeMiniText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#059669',
  },
  sellerMeta: {
    fontSize: 13,
    color: '#595c5e',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff8f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f59e0b',
  },
  pickupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fb',
    padding: 16,
    borderRadius: 20,
    marginTop: 20,
  },
  pickupIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  pickupLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#abadaf',
    letterSpacing: 0.5,
  },
  pickupLocation: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0b0f10',
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidButton: {
    flex: 1,
  },
  chatButtonContainer: {
    flex: 1,
  },
  ctaGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    gap: 8,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  biddingSection: {
    marginTop: 30,
    backgroundColor: '#f8f9fb',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  bidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  bidSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0b0f10',
    flex: 1,
  },
  bidCountBadge: {
    backgroundColor: '#4647d3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bidCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  highestBidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  highestBidIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff8f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  highestBidInfo: {
    flex: 1,
  },
  highestBidLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9a9d9f',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  highestBidAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0b0f10',
  },
  highestBidTime: {
    fontSize: 11,
    color: '#abadaf',
    fontWeight: '600',
  },
  noBidsBox: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  noBidsText: {
    fontSize: 14,
    color: '#595c5e',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCloseOverlay: {
    flex: 1,
  },
  bidModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0b0f10',
  },
  bidInputSection: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9a9d9f',
    letterSpacing: 1,
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7f9',
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 72,
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4647d3',
    marginRight: 8,
  },
  bidInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '800',
    color: '#0b0f10',
  },
  minBidNote: {
    fontSize: 13,
    color: '#595c5e',
    marginTop: 12,
    textAlign: 'center',
  },
  submitBidBtn: {
    backgroundColor: '#4647d3',
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4647d3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  submitBidText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  backButtonAction: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#4647d3',
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  bidHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  highestBidCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  otherBidsContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  otherBidsHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9a9d9f',
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  bidListItemMini: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bidListItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4647d3',
  },
  bidItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c2f31',
  },
  bidItemAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0b0f10',
  },
  viewMoreBids: {
    marginTop: 5,
    alignSelf: 'center',
  },
  viewMoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4647d3',
  },
});

export default ProductDetailScreen;
