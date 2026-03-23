import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Update this to your backend server URL
const BASE_URL = 'http://10.0.2.2:5000'; // Change to http://localhost:5000 for iOS

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // Increase to 60 seconds for larger image uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the JWT token to headers
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const registerUser = async (name, email, password, university, department, student_year, batch) => {
  try {
    const response = await api.post('/api/auth/register', { 
      name, 
      email, 
      password, 
      university,
      department,
      student_year,
      batch
    });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error. Please try again.' };
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error. Please try again.' };
  }
};

// ==================== PRODUCTS ====================
export const getProducts = async () => {
  try {
    const response = await api.get('/api/products');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error. Please try again.' };
  }
};

export const getProductById = async (id) => {
  try {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error. Please try again.' };
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await api.post('/api/products', productData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error. Please try again.' };
  }
};

// ==================== USERS & PROFILE ====================
export const getUserProfile = async (userId) => {
  try {
    // Extra safety: ensure the ID is a valid number-like string and not 'undefined' or 'null'
    const cleanId = String(userId).trim();
    const isValidId = cleanId && cleanId !== 'undefined' && cleanId !== 'null' && cleanId !== '[object Object]';
    
    const endpoint = isValidId ? `/api/users/${cleanId}` : '/api/users/profile';
    console.log(`[API] Fetching profile from: ${endpoint}`);
    
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error. Please try again.' };
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/api/users/profile', profileData);
    const currentUser = JSON.parse(await AsyncStorage.getItem('user') || '{}');
    await AsyncStorage.setItem('user', JSON.stringify({ ...currentUser, ...response.data }));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error. Please try again.' };
  }
};

// ==================== MESSAGES ====================
export const getChats = async () => {
  try {
    const response = await api.get('/api/messages/chats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error. Please try again.' };
  }
};

export const getMessages = async (chatId) => {
  try {
    const response = await api.get(`/api/messages/${chatId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error. Please try again.' };
  }
};

export const sendMessage = async (messageData) => {
  try {
    const response = await api.post('/api/messages', messageData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error. Please try again.' };
  }
};


export const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

export default api;
