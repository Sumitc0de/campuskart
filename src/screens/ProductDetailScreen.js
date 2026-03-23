import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Share,
  StatusBar
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getProductById, getFullImageUrl } from '../services/api';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const data = await getProductById(productId);
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${product.title} on CampusKart! Only $${product.price}`,
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
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={22} 
              color={isFavorite ? "#ef4444" : "#0b0f10"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ─── Product Image ─── */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: getFullImageUrl(product.image_url) }} 
            style={styles.productImage} 
            resizeMode="cover"
          />
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
              <Text style={styles.price}>${product.price}</Text>
            </View>
            {product.condition === 'New' && <Text style={styles.oldPrice}>${(parseFloat(product.price) * 1.2).toFixed(2)}</Text>}
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
            onPress={() => navigation.navigate('You', { userId: product.user_id })}
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
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text style={styles.ratingText}>{product.seller_rating || '4.9'}</Text>
              </View>
            </View>
          </TouchableOpacity>

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
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.chatButtonWrapper}
          onPress={() => navigation.navigate('Chat', { recipientId: product.user_id, productId: product.id })}
        >
          <LinearGradient
            colors={['#4647d3', '#e91e63']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.chatButton}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
            <Text style={styles.chatButtonText}>Chat with Seller</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'transparent',
  },
  chatButtonWrapper: {
    shadowColor: '#4647d3',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  chatButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 64,
    borderRadius: 32,
    gap: 10,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
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
  }
});

export default ProductDetailScreen;
