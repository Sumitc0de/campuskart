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
  Modal,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getUserProfile, updateProfile, getFullImageUrl } from '../services/api';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const [profileData, setProfileData] = useState(null);
  const [activeListings, setActiveListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Edit form states
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [batch, setBatch] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [avatarImage, setAvatarImage] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const data = await getUserProfile(user.id);
        setProfileData(data.profile);
        setActiveListings(data.listings);
        
        // Prep edit states
        setName(data.profile.name || '');
        setUniversity(data.profile.university || '');
        setDepartment(data.profile.department || '');
        setYear(data.profile.student_year || '');
        setBatch(data.profile.batch || '');
        setPickupLocation(data.profile.pickup_location || 'Campus Main Library');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      setAvatarImage(result.assets[0]);
    }
  };

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      const profileUpdates = {
        name,
        university,
        department,
        student_year: year,
        batch,
        pickup_location: pickupLocation,
      };

      if (avatarImage?.base64) {
        profileUpdates.avatar_data = `data:image/jpeg;base64,${avatarImage.base64}`;
      }

      const updated = await updateProfile(profileUpdates);
      setProfileData(prev => ({ ...prev, ...updated }));
      setAvatarImage(null);
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully! ✨');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['token', 'user']);
          navigation.replace('Login');
        }
      }
    ]);
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
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* ─── Profile Header ─── */}
        <View style={styles.header}>
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={fetchProfile}>
              <Ionicons name="refresh-outline" size={22} color="#595c5e" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#eb4d4b" />
            </TouchableOpacity>
          </View>

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
            <Text style={styles.userPickup}>📍 Default Pickup: {profileData.pickup_location || 'Campus Main Library'}</Text>
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

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.manageBtn} onPress={() => navigation.navigate('ManageListings')}>
              <LinearGradient colors={['#4647d3', '#6264f6']} style={styles.gradientBtn}>
                <Text style={styles.manageBtnText}>Manage Listings</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditModalVisible(true)}>
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Listings Feed ─── */}
        <View style={styles.listingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Listings</Text>
          </View>

          {activeListings.length === 0 ? (
            <View style={styles.emptyListings}>
              <Ionicons name="cube-outline" size={48} color="#abadaf" />
              <Text style={styles.emptyText}>You haven't listed anything yet.</Text>
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
                    <View style={styles.catBadge}>
                      <Text style={styles.catText}>{item.category || 'USED'}</Text>
                    </View>
                  </View>
                  <View style={styles.listingInfo}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.itemPrice}>${item.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ─── Edit Profile Modal ─── */}
      <Modal visible={isEditModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#0b0f10" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleUpdateProfile} disabled={updating}>
              <Text style={[styles.saveBtn, updating && { opacity: 0.5 }]}>
                {updating ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
            {/* Avatar Section */}
            <View style={styles.avatarEditContainer}>
              <TouchableOpacity onPress={pickImage} style={styles.avatarEditWrapper}>
                <Image 
                  source={{ uri: avatarImage ? avatarImage.uri : (getFullImageUrl(profileData.avatar) || 'https://i.pravatar.cc/150?u=' + profileData.id) }} 
                  style={styles.avatarEdit} 
                />
                <View style={styles.editBadge}>
                  <Ionicons name="camera" size={16} color="#ffffff" />
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarEditLabel}>Change Profile Photo</Text>
            </View>

            {/* Form Inputs */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>FULL NAME</Text>
              <TextInput style={styles.formInput} value={name} onChangeText={setName} placeholder="Your name" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>COLLEGE / UNIVERSITY</Text>
              <TextInput style={styles.formInput} value={university} onChangeText={setUniversity} placeholder="e.g. VCET" />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.formLabel}>DEPARTMENT</Text>
                <TextInput style={styles.formInput} value={department} onChangeText={setDepartment} placeholder="e.g. CS" />
              </View>
              <View style={[styles.formGroup, { flex: 0.8 }]}>
                <Text style={styles.formLabel}>YEAR</Text>
                <TextInput style={styles.formInput} value={year} onChangeText={setYear} placeholder="e.g. 3rd" />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>BATCH</Text>
              <TextInput style={styles.formInput} value={batch} onChangeText={setBatch} placeholder="e.g. 2021-2025" />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>DEFAULT PICKUP LOCATION</Text>
              <TextInput style={styles.formInput} value={pickupLocation} onChangeText={setPickupLocation} placeholder="e.g. Main Library" />
            </View>

            <View style={styles.tipBox}>
              <Ionicons name="information-circle-outline" size={20} color="#4647d3" />
              <Text style={styles.tipText}>Verification status depends on your college email domain.</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 10, paddingBottom: 30 },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 0,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f7f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrapper: { position: 'relative', marginTop: 10, marginBottom: 16 },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  verifiedBadge: { position: 'absolute', bottom: -5, alignSelf: 'center', backgroundColor: '#22c55e', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 2, borderColor: '#ffffff', gap: 4 },
  verifiedText: { color: '#ffffff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  userName: { fontSize: 26, fontWeight: '800', color: '#0b0f10', marginBottom: 4 },
  userMeta: { fontSize: 13, color: '#4647d3', fontWeight: '600', textAlign: 'center', lineHeight: 18 },
  userBatch: { color: '#595c5e', fontWeight: '500' },
  userPickup: { color: '#abadaf', fontSize: 11, fontWeight: '500' },
  statsBar: { flexDirection: 'row', backgroundColor: '#ffffff', marginTop: 24, borderRadius: 20, paddingVertical: 14, shadowColor: '#2c2f31', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 4, width: '100%', borderWidth: 1, borderColor: '#f5f7f9' },
  statItem: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#f0f0f0' },
  statLabel: { fontSize: 10, color: '#9a9d9f', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#0b0f10' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  actionRow: { flexDirection: 'row', marginTop: 24, width: '100%', gap: 12 },
  manageBtn: { flex: 1.4 },
  gradientBtn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  manageBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  editBtn: { flex: 1, backgroundColor: '#f5f7f9', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  editBtnText: { color: '#0b0f10', fontSize: 14, fontWeight: '700' },
  listingsSection: { backgroundColor: '#ffffff', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: 10, paddingHorizontal: 24, paddingTop: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0b0f10' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  listingCard: { width: (width - 64) / 2, backgroundColor: '#ffffff', borderRadius: 18, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f8f9fb' },
  imageContainer: { height: 120, backgroundColor: '#f5f7f9', position: 'relative' },
  listingImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  catBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  catText: { fontSize: 8, fontWeight: '800', color: '#4647d3' },
  listingInfo: { padding: 10 },
  itemTitle: { fontSize: 13, fontWeight: '700', color: '#0b0f10', marginBottom: 2 },
  itemPrice: { fontSize: 15, fontWeight: '800', color: '#4647d3' },
  emptyListings: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#abadaf', marginTop: 12, fontSize: 14, fontWeight: '500' },
  modalContainer: { flex: 1, backgroundColor: '#ffffff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f5f7f9' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0b0f10' },
  closeBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  saveBtn: { color: '#4647d3', fontSize: 16, fontWeight: '800' },
  modalForm: { padding: 24 },
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 10, fontWeight: '700', color: '#9a9d9f', letterSpacing: 1, marginBottom: 8 },
  formInput: { backgroundColor: '#f5f7f9', height: 52, borderRadius: 12, paddingHorizontal: 16, fontSize: 14, color: '#0b0f10', fontWeight: '600' },
  row: { flexDirection: 'row' },
  tipBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4f1ff', padding: 16, borderRadius: 14, marginTop: 10, gap: 12 },
  tipText: { flex: 1, color: '#4647d3', fontSize: 12, fontWeight: '600', lineHeight: 18 },
  avatarEditContainer: { alignItems: 'center', marginBottom: 30 },
  avatarEditWrapper: { position: 'relative' },
  avatarEdit: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f5f7f9' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4647d3', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#ffffff' },
  avatarEditLabel: { marginTop: 12, fontSize: 13, fontWeight: '700', color: '#4647d3' }
});

export default ProfileScreen;
