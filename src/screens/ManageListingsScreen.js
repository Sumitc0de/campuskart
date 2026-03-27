import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile, updateProductStatus, deleteProduct, getFullImageUrl } from '../services/api';

const { width } = Dimensions.get('window');

const ManageListingsScreen = ({ navigation }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // stores productId of item being processed

  useFocusEffect(
    useCallback(() => {
      fetchListings();
    }, [])
  );

  const fetchListings = async () => {
    try {
      setLoading(true);
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const data = await getUserProfile(user.id);
        setListings(data.listings || []);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      Alert.alert('Error', 'Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    const newStatus = currentStatus === 'AVAILABLE' ? 'SOLD' : 'AVAILABLE';
    const confirmMsg = newStatus === 'SOLD' 
      ? 'Mark this item as sold? It will still be visible in your history.' 
      : 'Mark this item as available again?';

    Alert.alert('Change Status', confirmMsg, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Proceed',
        onPress: async () => {
          try {
            setActionLoading(productId);
            await updateProductStatus(productId, newStatus);
            // Optimistic update or refetch
            setListings(prev => prev.map(item => 
              item.id === productId ? { ...item, status: newStatus } : item
            ));
          } catch (error) {
            Alert.alert('Error', error.message || 'Failed to update status');
          } finally {
            setActionLoading(null);
          }
        }
      }
    ]);
  };

  const handleDelete = (productId) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to permanently delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(productId);
              await deleteProduct(productId);
              setListings(prev => prev.filter(item => item.id !== productId));
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete listing');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const handleEdit = (product) => {
    navigation.navigate('SellItem', { product });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4647d3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#0b0f10" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Listings</Text>
        <TouchableOpacity onPress={fetchListings} style={styles.refreshButton}>
          <Ionicons name="refresh" size={22} color="#4647d3" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {listings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#f5f7f9', '#ffffff']}
              style={styles.emptyIconContainer}
            >
              <Ionicons name="cube-outline" size={80} color="#abadaf" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>No Listings Found</Text>
            <Text style={styles.emptySubtitle}>You haven't listed any items for sale yet.</Text>
            <TouchableOpacity 
              style={styles.createBtn}
              onPress={() => navigation.navigate('SellItem')}
            >
              <LinearGradient colors={['#4647d3', '#6264f6']} style={styles.createBtnGradient}>
                <Text style={styles.createBtnText}>Start Selling</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          listings.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardMain}>
                <View style={styles.imageWrapper}>
                  {item.image_url ? (
                    <Image source={{ uri: getFullImageUrl(item.image_url) }} style={styles.image} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="image-outline" size={30} color="#abadaf" />
                    </View>
                  )}
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: item.status === 'AVAILABLE' ? '#22c55e' : '#64748b' }
                  ]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>

                <View style={styles.infoWrapper}>
                  <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.price}>₹{item.price}</Text>
                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={14} color="#abadaf" />
                    <Text style={styles.metaText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.statusAction]}
                  onPress={() => handleToggleStatus(item.id, item.status)}
                  disabled={actionLoading === item.id}
                >
                  <Ionicons 
                    name={item.status === 'AVAILABLE' ? 'checkmark-circle-outline' : 'reload-outline'} 
                    size={20} 
                    color={item.status === 'AVAILABLE' ? '#22c55e' : '#4647d3'} 
                  />
                  <Text style={[
                    styles.actionText, 
                    { color: item.status === 'AVAILABLE' ? '#22c55e' : '#4647d3' }
                  ]}>
                    {item.status === 'AVAILABLE' ? 'Mark Sold' : 'Make Active'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => handleEdit(item)}
                  disabled={actionLoading === item.id}
                >
                  <Ionicons name="create-outline" size={20} color="#595c5e" />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => handleDelete(item.id)}
                  disabled={actionLoading === item.id}
                >
                  <Ionicons name="trash-outline" size={20} color="#eb4d4b" />
                  <Text style={[styles.actionText, { color: '#eb4d4b' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
              
              {actionLoading === item.id && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator color="#4647d3" />
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 18,
    fontWeight: '800',
    color: '#0b0f10',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f5f7f9',
    overflow: 'hidden',
    position: 'relative',
  },
  cardMain: {
    flexDirection: 'row',
    padding: 12,
  },
  imageWrapper: {
    width: 90,
    height: 90,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f5f7f9',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 2,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  infoWrapper: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0b0f10',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4647d3',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#abadaf',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f5f7f9',
    paddingVertical: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRightWidth: 1,
    borderRightColor: '#f5f7f9',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#595c5e',
  },
  statusAction: {
    flex: 1.2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0b0f10',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#abadaf',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  createBtn: {
    width: '100%',
  },
  createBtnGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  createBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default ManageListingsScreen;
