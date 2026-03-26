import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getProducts, getFullImageUrl } from '../services/api';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '⊞' },
  { id: 'books', label: 'Books', icon: '📚' },
  { id: 'electronics', label: 'Electronics', icon: '💻' },
  { id: 'hostel', label: 'Hostel', icon: '🏠' },
  { id: 'notes', label: 'Notes', icon: '📝' },
  { id: 'other', label: 'Other', icon: '📦' },
];

const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userName, setUserName] = useState('Alex');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedItems, setLikedItems] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [university, setUniversity] = useState('Campus Student');

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
      loadUserData();
    }, [])
  );

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching home products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.name?.split(' ')[0] || 'Alex');
        setUniversity(user.university || 'Campus Student');
      }
    } catch (e) {
      // use default name
    }
  };

  const toggleLike = (itemId) => {
    setLikedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const filteredProducts = products.filter(item => {
    const matchesFilter = selectedCategory === 'all' || (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());
    const title = item.title ? item.title.toLowerCase() : '';
    const matchesSearch = title.includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Split products for sections
  const featuredProduct = filteredProducts.length > 0 ? filteredProducts[0] : null;
  const recommendedProducts = filteredProducts.slice(1, 5);
  const recentDrops = [...filteredProducts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7f9" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ─── Top Bar ─── */}
        <View style={styles.topBar}>
          <Text style={styles.logo}>
            Campus<Text style={styles.logoAccent}>Kart</Text>
          </Text>
          <View style={styles.topBarRight}>
            <TouchableOpacity style={styles.notifButton}>
              <Text style={styles.notifIcon}>🔔</Text>
              <View style={styles.notifBadge} />
            </TouchableOpacity>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.verifiedDot} />
            </View>
          </View>
        </View>

        {/* ─── Greeting ─── */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>
            Hey {userName},{'\n'}what's on your radar?
          </Text>
          <Text style={styles.greetingSubtitle}>
            Your campus marketplace at{' '}
            <Text style={styles.universityLink}>{university}</Text>.
          </Text>
        </View>

        {/* ─── Search Bar ─── */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search textbooks, mini-fridges..."
            placeholderTextColor="#abadaf"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* ─── Category Pills ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              activeOpacity={0.7}
            >
              {selectedCategory === cat.id ? (
                <LinearGradient
                  colors={['#4647d3', '#9396ff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.categoryPillActive}
                >
                  <Text style={styles.categoryIconActive}>{cat.icon}</Text>
                  <Text style={styles.categoryLabelActive}>{cat.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ─── Recommended Section ─── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllLink}>View all →</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Product Card */}
        {featuredProduct && (
          <TouchableOpacity 
            activeOpacity={0.9} 
            style={styles.featuredCard}
            onPress={() => navigation.navigate('ProductDetail', { productId: featuredProduct.id })}
          >
            {featuredProduct.image_url ? (
              <Image source={{ uri: getFullImageUrl(featuredProduct.image_url) }} style={styles.featuredImage} />
            ) : (
              <View style={[styles.featuredImage, { backgroundColor: '#4647d3', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 60 }}>📦</Text>
              </View>
            )}
            <LinearGradient
              colors={['transparent', 'rgba(11, 15, 16, 0.85)']}
              style={styles.featuredOverlay}
            >
              <View style={styles.featuredBadges}>
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeText}>✓ VERIFIED STUDENT</Text>
                </View>
              </View>
              <Text style={styles.featuredTitle}>{featuredProduct.title}</Text>
              <View style={styles.featuredBottom}>
                <Text style={styles.featuredPrice}>${featuredProduct.price}</Text>
                <View style={styles.arrowButton}>
                  <Text style={styles.arrowIcon}>→</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Recommended Product Cards Row */}
        <View style={styles.recommendedRow}>
          {recommendedProducts.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.productCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            >
            <View style={styles.productImageContainer}>
                {item.image_url ? (
                  <Image source={{ uri: getFullImageUrl(item.image_url) }} style={styles.productImage} />
                ) : (
                  <View style={[styles.productImage, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 30 }}>📦</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.heartButton}
                  onPress={() => toggleLike(item.id)}
                >
                  <Text style={styles.heartIcon}>
                    {likedItems[item.id] ? '❤️' : '🤍'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.productBadgeContainer}>
                <View style={styles.verifiedBadgeSmall}>
                  <Text style={styles.verifiedBadgeSmallText}>
                    VERIFIED STUDENT
                  </Text>
                </View>
              </View>
              <Text style={styles.productTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.productPriceRow}>
                <Text style={styles.productPrice}>${item.price}</Text>
                <Text style={styles.productCondition}>{item.condition || 'Used - Like New'}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Recent Drops ─── */}
        <View style={styles.recentDropsHeader}>
          <View style={styles.recentDropsBar} />
          <Text style={styles.recentDropsTitle}>Recent drops at Stanford</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentDropsScroll}
        >
          {recentDrops.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.dropCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            >
              <View
                style={[
                  styles.dropImageContainer,
                  { backgroundColor: item.category === 'electronics' ? '#eef1f3' : '#e5e9eb' },
                ]}
              >
                {item.image_url ? (
                  <Image source={{ uri: getFullImageUrl(item.image_url) }} style={styles.dropImage} />
                ) : (
                  <Text style={{ fontSize: 20 }}>📦</Text>
                )}
              </View>
              <View style={styles.dropInfo}>
                <Text style={styles.dropTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.dropTime}>{item.category || 'Just now'}</Text>
              </View>
              <Text style={styles.dropPrice}>${item.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bottom Spacing for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>



      {/* ─── Student Curator Badge ─── */}
      <View style={styles.curatorBadge}>
        <View style={styles.curatorAvatar}>
          <Text style={styles.curatorAvatarText}>
            {userName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.curatorName}>Student Curator</Text>
          <Text style={styles.curatorVerified}>VERIFIED</Text>
        </View>
      </View>

      {/* ─── Sell FAB ─── */}
      <TouchableOpacity 
        activeOpacity={0.85} 
        style={styles.fabWrapper}
        onPress={() => navigation.navigate('SellItem')}
      >
        <LinearGradient
          colors={['#4647d3', '#9396ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.fab}
        >
          <Text style={styles.fabIcon}>+</Text>
          <Text style={styles.fabText}>Sell Item</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7f9',
  },
  scrollContent: {
    paddingTop: 56,
  },

  // ─── Top Bar ───
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4647d3',
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: '#b00d6a',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  notifButton: {
    position: 'relative',
    padding: 4,
  },
  notifIcon: {
    fontSize: 22,
  },
  notifBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#b00d6a',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e9eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4647d3',
  },
  verifiedDot: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#f5f7f9',
  },

  // ─── Greeting ───
  greetingSection: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  greetingTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2c2f31',
    letterSpacing: -1,
    lineHeight: 38,
  },
  greetingSubtitle: {
    fontSize: 15,
    color: '#595c5e',
    marginTop: 8,
  },
  universityLink: {
    color: '#4647d3',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // ─── Search ───
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#2c2f31',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 20,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2c2f31',
  },

  // ─── Categories ───
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 28,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
    shadowColor: '#2c2f31',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryPillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryIconActive: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c2f31',
  },
  categoryLabelActive: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f4f1ff',
  },

  // ─── Section Header ───
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2c2f31',
    letterSpacing: -0.5,
  },
  viewAllLink: {
    fontSize: 13,
    color: '#4647d3',
    fontWeight: '600',
  },

  // ─── Featured Card ───
  featuredCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    height: 280,
    marginBottom: 16,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 60,
  },
  featuredBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  premiumBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  premiumBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  featuredTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 28,
    marginBottom: 8,
  },
  featuredBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPrice: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },

  // ─── Product Cards ───
  recommendedRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2c2f31',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  productImageContainer: {
    height: 140,
    backgroundColor: '#eef1f3',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 16,
  },
  productBadgeContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  verifiedBadgeSmall: {
    alignSelf: 'flex-start',
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  verifiedBadgeSmallText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2c2f31',
    paddingHorizontal: 10,
    marginTop: 6,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 12,
    marginTop: 4,
    gap: 8,
  },
  productPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: '#4647d3',
  },
  productCondition: {
    fontSize: 11,
    color: '#595c5e',
  },

  // ─── Recent Drops ───
  recentDropsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  recentDropsBar: {
    width: 4,
    height: 24,
    borderRadius: 2,
    backgroundColor: '#4647d3',
  },
  recentDropsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2c2f31',
    letterSpacing: -0.3,
  },
  recentDropsScroll: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 12,
  },
  dropCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 10,
    width: 200,
    shadowColor: '#2c2f31',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  dropImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  dropInfo: {
    flex: 1,
  },
  dropTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2c2f31',
  },
  dropTime: {
    fontSize: 10,
    color: '#595c5e',
    marginTop: 2,
  },
  dropPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2c2f31',
  },

  // ─── FAB ───
  fab: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#4647d3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fabIcon: {
    color: '#f4f1ff',
    fontSize: 20,
    fontWeight: '700',
  },
  fabText: {
    color: '#f4f1ff',
    fontSize: 14,
    fontWeight: '700',
  },

  // ─── Curator Badge ───
  curatorBadge: {
    position: 'absolute',
    bottom: 110,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  curatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e5e9eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  curatorAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4647d3',
  },
  curatorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2c2f31',
  },
  curatorVerified: {
    fontSize: 9,
    fontWeight: '800',
    color: '#22C55E',
    letterSpacing: 1,
  },
  // ─── FAB ───
  fabWrapper: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    shadowColor: '#4647d3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  fabIcon: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  fabText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default HomeScreen;
