import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createProduct } from '../services/api';

const CATEGORIES = ['Books', 'Electronics', 'Hostel', 'Notes', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

const SellItemScreen = ({ navigation, route }) => {
  const existingProduct = route.params?.product;

  const [title, setTitle] = useState(existingProduct?.title || '');
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [price, setPrice] = useState(existingProduct?.price?.toString() || '');
  const [category, setCategory] = useState(existingProduct?.category || 'Books');
  const [condition, setCondition] = useState(existingProduct?.condition || 'Good');
  const [priceType, setPriceType] = useState(existingProduct?.price_type || 'fixed'); // 'fixed' or 'bid'
  const [image, setImage] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(existingProduct?.pickup_location || '');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadUserDefaultPickup();
  }, []);

  const loadUserDefaultPickup = async () => {
    try {
      if (existingProduct?.pickup_location) {
        setPickupLocation(existingProduct.pickup_location);
        return;
      }
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setPickupLocation(user.pickup_location || 'Campus Main Library');
      }
    } catch (e) {
      console.error('Error loading user data', e);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title || !price || !category || (!image && !existingProduct?.image_url)) {
      Alert.alert('Error', 'Please fill in all required fields and add an image.');
      return;
    }

    try {
      setLoading(true);
      const productData = {
        title,
        description,
        price: parseFloat(price),
        price_type: priceType,
        category,
        condition,
        pickup_location: pickupLocation,
      };

      if (image?.base64) {
        productData.image_data = `data:image/jpeg;base64,${image.base64}`;
      } else if (existingProduct?.image_url) {
        productData.image_url = existingProduct.image_url;
      }

      const { createProduct, updateProduct } = require('../services/api');
      
      if (existingProduct) {
        await updateProduct(existingProduct.id, productData);
        Alert.alert('Success', 'Your item has been updated!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await createProduct(productData);
        Alert.alert('Success', 'Your item has been listed!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to process item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#0b0f10" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{existingProduct ? 'Edit Item' : 'Sell Item'}</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Image Picker */}
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.previewImage} />
            ) : existingProduct?.image_url ? (
              <Image source={{ uri: require('../services/api').getFullImageUrl(existingProduct.image_url) }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="camera-outline" size={40} color="#abadaf" />
                <Text style={styles.placeholderText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.form}>
            <Text style={styles.label}>Item Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="What are you selling?"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your item..."
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Price *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="$ 0.00"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Price Type</Text>
                <View style={styles.typeContainer}>
                  <TouchableOpacity
                    style={[styles.typeButton, priceType === 'fixed' && styles.typeActive]}
                    onPress={() => setPriceType('fixed')}
                  >
                    <Text style={[styles.typeText, priceType === 'fixed' && styles.typeTextActive]}>Fixed</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeButton, priceType === 'bid' && styles.typeActive]}
                    onPress={() => setPriceType('bid')}
                  >
                    <Text style={[styles.typeText, priceType === 'bid' && styles.typeTextActive]}>Bid</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.selectorPill, category === cat && styles.selectorActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.selectorText, category === cat && styles.selectorTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Condition</Text>
            <View style={styles.selectorRow}>
              {CONDITIONS.map((cond) => (
                <TouchableOpacity
                  key={cond}
                  style={[styles.selectorPill, condition === cond && styles.selectorActive]}
                  onPress={() => setCondition(cond)}
                >
                  <Text style={[styles.selectorText, condition === cond && styles.selectorTextActive]}>{cond}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Pickup Location *</Text>
            <View style={styles.pickupInputContainer}>
              <Ionicons name="location-outline" size={20} color="#abadaf" style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0, backgroundColor: 'transparent' }]}
                placeholder="Where to meet?"
                value={pickupLocation}
                onChangeText={setPickupLocation}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            <LinearGradient
              colors={['#4647d3', '#9396ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButton}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>{existingProduct ? 'Update Item' : 'List Item'}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    padding: 20,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f7f9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#eef1f3',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: '#abadaf',
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#595c5e',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f7f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0b0f10',
    borderWidth: 1,
    borderColor: '#eef1f3',
  },
  pickupInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#eef1f3',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  typeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f7f9',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#eef1f3',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#abadaf',
  },
  typeTextActive: {
    color: '#4647d3',
  },
  selectorScroll: {
    marginBottom: 8,
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  selectorPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f5f7f9',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eef1f3',
  },
  selectorActive: {
    backgroundColor: '#4647d3',
    borderColor: '#4647d3',
  },
  selectorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#595c5e',
  },
  selectorTextActive: {
    color: '#ffffff',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default SellItemScreen;
