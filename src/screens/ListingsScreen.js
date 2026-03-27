import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
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

const ListingsScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userName, setUserName] = useState('Alex');
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      fetchListings();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.name?.split(' ')[0] || 'Alex');
      }
    } catch (e) {
      // use default name
    }
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(item => {
    const matchesFilter = selectedCategory === 'all' || (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());
    const title = item.title ? item.title.toLowerCase() : '';
    const matchesSearch = title.includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* ─── Header Section (GREETING) ─── */}
      <View style={styles.headerContainer}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.greetingTitle}>
              Hey {userName},{'\n'}what's on your radar?
            </Text>
            <Text style={styles.universitySub}>
              Your campus marketplace at{' '}
              <Text style={styles.uniHighlight}>VCET</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={22} color="#595c5e" />
          </TouchableOpacity>
        </View>

        {/* ─── Search Bar ─── */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#abadaf" style={styles.searchIcon} />
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
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              activeOpacity={0.7}
              style={styles.categoryItem}
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
      </View>

      {/* ─── Listings Grid ─── */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Listings</Text>
          <Text style={styles.listingCount}>{filteredListings.length} items</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4647d3" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.grid}>
            {filteredListings.map(item => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.listingCard} 
                activeOpacity={0.9} 
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
              >
                <View style={styles.imageContainer}>
                  {item.image_url ? (
                    <Image 
                      source={{ uri: getFullImageUrl(item.image_url) }} 
                      style={styles.listingImage} 
                    />
                  ) : (
                    <View style={[styles.listingImage, { backgroundColor: '#f5f7f9', justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={{ fontSize: 40 }}>📦</Text>
                    </View>
                  )}
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{item.category || 'OTHER'}</Text>
                  </View>
                  <TouchableOpacity style={styles.heartBtnSmall}>
                     <Ionicons name="heart-outline" size={14} color="#0b0f10" />
                  </TouchableOpacity>
                </View>

                <View style={styles.listingInfo}>
                  <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.listingPrice}>${item.price}</Text>
                    {item.price_type === 'bid' && (
                      <View style={styles.bidBadgeSmall}>
                        <Ionicons name="stats-chart" size={10} color="#fff" />
                        <Text style={styles.bidBadgeTextSmall}>BID</Text>
                      </View>
                    )}
                    <View style={styles.verifiedDotMini}>
                      <Ionicons name="checkmark" size={8} color="#fff" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Padding for tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#2c2f31',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 3,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0b0f10',
    lineHeight: 32,
  },
  universitySub: {
    fontSize: 13,
    color: '#595c5e',
    marginTop: 4,
  },
  uniHighlight: {
    color: '#4647d3',
    fontWeight: '700',
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f7f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7f9',
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#2c2f31',
  },
  categoriesScroll: {
    paddingHorizontal: 24,
    marginTop: 20,
    gap: 12,
  },
  categoryItem: {
    marginRight: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#eef1f3',
    gap: 6,
  },
  categoryPillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
  },
  categoryIcon: { fontSize: 13 },
  categoryIconActive: { fontSize: 13 },
  categoryLabel: { fontSize: 13, fontWeight: '600', color: '#595c5e' },
  categoryLabelActive: { fontSize: 13, fontWeight: '700', color: '#ffffff' },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0b0f10',
  },
  listingCount: {
    fontSize: 12,
    color: '#9a9d9f',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listingCard: {
    width: (width - 64) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#2c2f31',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f8f9fb',
  },
  imageContainer: {
    height: 140,
    backgroundColor: '#f5f7f9',
    position: 'relative',
  },
  listingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#4647d3',
  },
  heartBtnSmall: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingInfo: {
    padding: 12,
  },
  listingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0b0f10',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4647d3',
  },
  verifiedDotMini: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bidBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4647d3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  bidBadgeTextSmall: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
  },
});

export default ListingsScreen;
