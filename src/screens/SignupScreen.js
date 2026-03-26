import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser } from '../services/api';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [batch, setBatch] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Campus Main Library');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Oops!', 'Please fill in name, email, and password.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser(
        name.trim(), 
        email.trim(), 
        password, 
        college.trim() || 'VCET',
        department.trim(),
        year.trim(),
        batch.trim(),
        pickupLocation.trim()
      );
      
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      Alert.alert('Account Created! 🎉', `Welcome to CampusKart, ${data.user.name}!`);
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert('Signup Failed', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandName}>Campus<Text style={styles.brandAccent}>Kart</Text></Text>
          <Text style={styles.brandTagline}>Your campus marketplace</Text>
        </View>

        {/* Welcome Section */}
        <View style={styles.headerSection}>
          <Text style={styles.welcomeText}>Create{'\n'}Account</Text>
          <Text style={styles.subtitleText}>Join the campus marketplace</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="What's your name?"
                placeholderTextColor="#abadaf"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="you@college.edu"
                placeholderTextColor="#abadaf"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Min. 6 characters"
                placeholderTextColor="#abadaf"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* College Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>COLLEGE / UNIVERSITY</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🏫</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. VCET"
                placeholderTextColor="#abadaf"
                value={college}
                onChangeText={setCollege}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Dept & Year Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1.2, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>DEPARTMENT</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🏢</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. CS"
                  placeholderTextColor="#abadaf"
                  value={department}
                  onChangeText={setDepartment}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>STUDENT YEAR</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🎓</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 3rd"
                  placeholderTextColor="#abadaf"
                  value={year}
                  onChangeText={setYear}
                />
              </View>
            </View>
          </View>

          {/* Batch Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>BATCH (OPTIONAL)</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🗓️</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2021-2025"
                placeholderTextColor="#abadaf"
                value={batch}
                onChangeText={setBatch}
              />
            </View>
          </View>
          {/* Pickup Location Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>DEFAULT PICKUP LOCATION</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>📍</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Main Library"
                placeholderTextColor="#abadaf"
                value={pickupLocation}
                onChangeText={setPickupLocation}
              />
            </View>
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
            style={styles.signupBtnWrapper}
          >
            <LinearGradient
              colors={['#4647d3', '#9396ff']}
              style={styles.signupButton}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.signupButtonText}>Sign Up</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7f9' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  brandContainer: { alignItems: 'center', marginBottom: 32 },
  brandName: { fontSize: 28, fontWeight: '800', color: '#4647d3' },
  brandAccent: { color: '#b00d6a' },
  brandTagline: { fontSize: 13, color: '#595c5e', marginTop: 4 },
  headerSection: { marginBottom: 28 },
  welcomeText: { fontSize: 40, fontWeight: '800', color: '#2c2f31', lineHeight: 46 },
  subtitleText: { fontSize: 16, color: '#595c5e', marginTop: 8 },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#2c2f31',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 5,
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 10, fontWeight: '700', color: '#595c5e', letterSpacing: 1, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7f9',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#2c2f31', fontWeight: '500' },
  row: { flexDirection: 'row' },
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 16 },
  signupBtnWrapper: { marginTop: 10 },
  signupButton: { height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  signupButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { fontSize: 14, color: '#595c5e' },
  loginLink: { fontSize: 14, color: '#4647d3', fontWeight: '700' },
});

export default SignupScreen;
